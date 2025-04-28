from rest_framework.views import APIView
from rest_framework.decorators import api_view
from django.db.models import Count

from rest_framework import viewsets
from .models import Company, Department, Employee, Shift, Availability, Roster, Notification
from .serializers import (
    CompanySerializer, DepartmentSerializer, EmployeeSerializer,
    ShiftSerializer, AvailabilitySerializer, RosterSerializer, NotificationSerializer
)
from rest_framework.response import Response
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from django.core.exceptions import ValidationError
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from datetime import datetime, date

from rest_framework.response import Response
from django.db.models import Q

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer


class DepartmentViewSet(viewsets.ModelViewSet):
    # Annotate with the correct related name 'employees'
    queryset = Department.objects.annotate(employee_count=Count('employees')).all()
    serializer_class = DepartmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['company']

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['company']
    
    @action(detail=True, methods=['post'])
    def set_default_availability(self, request, pk=None):
        employee = self.get_object()
        employee.set_default_availability()
        return Response({'status': 'Default availability set'})

class ShiftViewSet(viewsets.ModelViewSet):
    queryset = Shift.objects.all()
    serializer_class = ShiftSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['company']

class AvailabilityViewSet(viewsets.ModelViewSet):
    queryset = Availability.objects.all()
    serializer_class = AvailabilitySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['employee__company', 'employee', 'day_of_week', 'shift_type', 'is_available']
    search_fields = ['employee__name']

    def get_queryset(self):
        date = self.request.query_params.get('date')
        if date:
            try:
                day_of_week = datetime.strptime(date, '%Y-%m-%d').strftime('%a')
                return self.queryset.filter(day_of_week=day_of_week)
            except ValueError:
                return self.queryset.none()
        return self.queryset

    def create(self, request, *args, **kwargs):
        if isinstance(request.data, list):
            serializer = self.get_serializer(data=request.data, many=True)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        return super().create(request, *args, **kwargs)

class EmployeeAvailabilityView(APIView):
    def get(self, request, employee_id):
        employee = get_object_or_404(Employee, pk=employee_id)
        date = request.query_params.get('date')
        shift_type = request.query_params.get('shift_type')
        
        if not date or not shift_type:
            return Response(
                {'error': 'Both date and shift_type parameters are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            target_date = datetime.strptime(date, '%Y-%m-%d').date()
            day_of_week = target_date.strftime('%a')
            
            # Check weekly availability
            is_available = employee.availabilities.filter(
                day_of_week=day_of_week,
                shift_type=shift_type,
                is_available=True
            ).exists()
            
            return Response({
                'employee_id': employee.id,
                'employee_name': employee.name,
                'date': date,
                'day_of_week': day_of_week,
                'shift_type': shift_type,
                'is_available': is_available,
                'reason': None if is_available else "Marked as unavailable"
            })
            
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )

class BulkAvailabilityView(APIView):
    def post(self, request):
        employee_id = request.data.get('employee_id')
        availability_data = request.data.get('availability', [])
        
        if not employee_id or not availability_data:
            return Response(
                {'error': 'employee_id and availability data required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        employee = get_object_or_404(Employee, pk=employee_id)
        created = updated = 0
        
        for item in availability_data:
            avail, created_flag = Availability.objects.update_or_create(
                employee=employee,
                day_of_week=item['day_of_week'],
                shift_type=item['shift_type'],
                defaults={
                    'is_available': item['is_available'],
                    'reason': item.get('reason')
                }
            )
            if created_flag:
                created += 1
            else:
                updated += 1
                
        return Response({
            'status': 'success',
            'employee_id': employee.id,
            'created': created,
            'updated': updated
        })

class UpdateAvailabilityView(APIView):
    def put(self, request, employee_id):
        employee = get_object_or_404(Employee, pk=employee_id)
        day_of_week = request.data.get('day_of_week')
        shift_type = request.data.get('shift_type')
        is_available = request.data.get('is_available', True)
        reason = request.data.get('reason')

        if not day_of_week or not shift_type:
            return Response(
                {'error': 'day_of_week and shift_type are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        employee.update_availability(
            day_of_week=day_of_week,
            shift_type=shift_type,
            is_available=is_available,
            reason=reason
        )

        return Response({
            'status': 'success',
            'employee_id': employee.id,
            'day_of_week': day_of_week,
            'shift_type': shift_type,
            'is_available': is_available,
            'reason': reason
        })

@api_view(['GET'])
def unavailability_list(request):
    # Get all unavailable shifts (is_available=False)
    unavailable = Availability.objects.filter(
        is_available=False
    ).select_related('employee', 'employee__company')
    
    # Filter by company if requested
    company_id = request.query_params.get('company_id')
    if company_id:
        unavailable = unavailable.filter(employee__company_id=company_id)
    
    # Filter by date if requested (convert day of week)
    target_date = request.query_params.get('date')
    if target_date:
        try:
            day_of_week = date.fromisoformat(target_date).strftime('%a')
            unavailable = unavailable.filter(day_of_week=day_of_week)
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Prepare response data
    data = [{
        'employee_id': av.employee.id,
        'employee_name': av.employee.name,
        'company_id': av.employee.company.id,
        'company_name': av.employee.company.name,
        'day_of_week': av.day_of_week,
        'shift_type': av.shift_type,
        'reason': av.reason,
        'last_updated': av.last_updated
    } for av in unavailable]
    
    return Response(data)



class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee__company']

class CompanySignupView(APIView):
    def post(self, request):
        data = request.data
        if Company.objects.filter(email=data['email']).exists():
            return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

        company = Company(name=data['name'], email=data['email'])
        company.set_password(data['password'])
        try:
            company.full_clean()
            company.save()
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'Signup successful'}, status=status.HTTP_201_CREATED)

class CompanyLoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            company = Company.objects.get(email=email)
        except Company.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        if company.check_password(password):
            return Response({'message': 'Login successful', 'company_id': company.id})
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)



############################################################################################################

from django.http import JsonResponse
from django.utils import timezone
from datetime import timedelta
from collections import defaultdict
from .models import Roster, Employee, Shift, Company, Availability, EmployeeDepartment
import random
import logging

# Setting up logger
logger = logging.getLogger(__name__)

def generate_weekly_roster(request):
    # Input validation
    company_id = request.GET.get('company')
    if not company_id:
        return JsonResponse({"error": "Company ID is required"}, status=400)

    try:
        company = Company.objects.get(id=int(company_id))
    except (ValueError, Company.DoesNotExist):
        return JsonResponse({"error": "Invalid or non-existent Company ID"}, status=404)

    # Get all necessary data with optimized queries
    employees = Employee.objects.filter(company=company).prefetch_related(
        'availabilities',
        'departments'
    )
    
    if not employees.exists():
        return JsonResponse({"error": "No employees found for this company"}, status=404)

    # Get all shifts grouped by department and type
    shifts = Shift.objects.filter(department__company=company).select_related('department')
    if not shifts.exists():
        return JsonResponse({"error": "No shifts defined for this company"}, status=404)

    # Prepare date range (next 7 days)
    start_date = timezone.now().date()
    days = [start_date + timedelta(days=i) for i in range(7)]
    day_names = [day.strftime('%a') for day in days]  # ['Mon', 'Tue', ...]

    # Tracking system
    employee_workload = defaultdict(int)  # Total shifts per employee
    last_shift_type = {}  # Last shift type worked by each employee
    last_shift_day = {}   # Last day worked by each employee
    department_assignments = defaultdict(set)  # Tracks which departments each employee was assigned to per day

    roster_entries = []
    unassigned_shifts = []

    # Organize shifts by day and type
    shifts_by_day_type = defaultdict(dict)
    for shift in shifts:
        shifts_by_day_type[shift.day_of_week][shift.shift_type] = shift

    for day, day_name in zip(days, day_names):
        logger.info(f"Processing {day_name} - {day.isoformat()}")

        day_shifts = shifts_by_day_type.get(day_name, {})
        
        for shift_type, shift in day_shifts.items():
            logger.info(f"  Checking shift {shift_type} for department {shift.department.name} on {day_name} - {day.isoformat()}")
            
            # Find available employees for this shift
            available_employees = []
            
            for employee in employees:
                logger.debug(f"    Checking employee {employee.name}, Departments: {[d.name for d in employee.departments.all()]}")
                
                # Check if employee belongs to this department
                if not employee.departments.filter(id=shift.department.id).exists():
                    logger.debug(f"    Employee {employee.name} does not belong to department {shift.department.name}, skipping.")
                    continue
                
                # Check daily limit (1 shift per day)
                if last_shift_day.get(employee.id) == day:
                    logger.debug(f"    Employee {employee.name} already assigned to a shift on {day.isoformat()}, skipping.")
                    continue
                
                # Check consecutive shift restriction
                if last_shift_type.get(employee.id) == 'night' and shift_type == 'morning' and last_shift_day.get(employee.id) == day - timedelta(days=1):
                    logger.debug(f"    Employee {employee.name} worked night shift yesterday, cannot work morning shift today.")
                    continue
                
                # Check department assignment (can't work in same department twice in one day)
                if shift.department.id in department_assignments[(employee.id, day)]:
                    logger.debug(f"    Employee {employee.name} already assigned to department {shift.department.name} on {day.isoformat()}, skipping.")
                    continue
                
                # Check availability
                availability = next(
                    (a for a in employee.availabilities.all() 
                     if a.shift_type == shift_type and a.day_of_week == day_name),
                    None
                )
                
                if not availability or not availability.is_available:
                    logger.debug(f"    Employee {employee.name} is not available for {shift_type} shift on {day.isoformat()}, skipping.")
                    continue
                
                available_employees.append(employee)
            
            # Log available employees for debugging
            if available_employees:
                logger.info(f"    Available employees for {shift_type} on {day_name}: {[e.name for e in available_employees]}")
            else:
                logger.info(f"    No available employees for {shift_type} on {day_name}.")
            
            # Sort by who has worked the least (fair distribution)
            available_employees.sort(key=lambda e: (
                employee_workload[e.id],
                -len(department_assignments[(e.id, day)])  # Prefer employees not yet assigned today
            ))
            
            if not available_employees:
                unassigned_shifts.append({
                    'date': day.isoformat(),
                    'day': day_name,
                    'shift_type': shift_type,
                    'department': shift.department.name,
                    'reason': "No available employees"
                })
                continue
            
            # Assign employee(s) - adjust number based on your needs
            num_needed = 1  # Default to 1 employee per shift
            assigned = 0
            
            for employee in available_employees:
                if assigned >= num_needed:
                    break
                
                # Create roster entry
                roster = Roster.objects.create(
                    date=day,
                    shift=shift,
                    employee=employee,
                    company=company,
                    assigned_manually=False,
                    is_conflict=False
                )
                roster_entries.append(roster)
                
                # Update tracking
                employee_workload[employee.id] += 1
                last_shift_type[employee.id] = shift_type
                last_shift_day[employee.id] = day
                department_assignments[(employee.id, day)].add(shift.department.id)
                assigned += 1

    # Prepare response
    response_data = {
        'status': 'success',
        'generated_for': {
            'company': company.name,
            'start_date': start_date.isoformat(),
            'end_date': (start_date + timedelta(days=6)).isoformat()
        },
        'assignments': len(roster_entries),
        'unassigned_shifts': unassigned_shifts,
        'employee_distribution': [
            {
                'employee_id': e.id,
                'name': e.name,
                'total_shifts': employee_workload[e.id],
                'departments': list({d.name for d in e.departments.all()})
            }
            for e in employees
        ]
    }
    
    return JsonResponse(response_data, status=200)






class RosterViewSet(viewsets.ModelViewSet):
    queryset = Roster.objects.all()
    serializer_class = RosterSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['company', 'employee', 'shift', 'date', 'is_conflict']
    search_fields = ['employee__name', 'shift__department__name']

    def get_queryset(self):
        queryset = super().get_queryset()
        company_id = self.request.query_params.get('company', None)
        if company_id:
            queryset = queryset.filter(company_id=company_id)
        return queryset

    @action(detail=False, methods=['get'])
    def conflicts(self, request):
        # Get company filter parameter if provided
        company_id = request.query_params.get('company', None)
        if company_id:
            conflicts = self.get_queryset().filter(is_conflict=True, company_id=company_id)
        else:
            conflicts = self.get_queryset().filter(is_conflict=True)
        
        # Serialize the data
        serializer = self.get_serializer(conflicts, many=True)
        return Response(serializer.data)



#############################################
from django.http import JsonResponse
from .models import Employee, Availability, Shift
from datetime import timedelta
from django.utils import timezone

def check_employee_availability(request):
    # Get the shift_type and day_of_week from query parameters
    shift_type = request.GET.get('shift_type')
    day_of_week = request.GET.get('day_of_week')

    if not shift_type or not day_of_week:
        return JsonResponse({"error": "shift_type and day_of_week are required"}, status=400)

    # Validate shift type
    shift_types = ['morning', 'evening', 'night']
    if shift_type not in shift_types:
        return JsonResponse({"error": "Invalid shift_type. Valid options are 'morning', 'evening', 'night'."}, status=400)

    # Get the current date and the day of the week (e.g., 'Mon', 'Tue')
    day_of_week = day_of_week.lower()

    # Get the employees who are available for the specified shift and day
    available_employees = []
    
    employees = Employee.objects.all()
    for employee in employees:
        # Fetch the availability for each employee
        availability = Availability.objects.filter(
            employee=employee, 
            shift_type=shift_type, 
            day_of_week=day_of_week
        ).first()  # Get the availability for this employee, shift, and day
        
        if availability and availability.is_available:
            available_employees.append({
                'id': employee.id,
                'name': employee.name,
                'shift_type': shift_type,
                'day_of_week': day_of_week,
                'reason': availability.reason if not availability.is_available else None
            })
    
    if available_employees:
        return JsonResponse({"available_employees": available_employees}, status=200)
    else:
        return JsonResponse({"message": "No employees available for this shift on this day."}, status=404)
