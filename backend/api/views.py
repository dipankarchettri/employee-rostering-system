from rest_framework.views import APIView
from rest_framework.decorators import api_view
from django.db.models import Count

from rest_framework import viewsets
from .models import Company, Department, Employee, Shift, Roster, Notification, Unavailability
from .serializers import (
    CompanySerializer, DepartmentSerializer, EmployeeSerializer,
    ShiftSerializer,  RosterSerializer, NotificationSerializer, UnavailabilitySerializer
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

from datetime import timedelta
from django.db.models import Count
from rest_framework.decorators import action
from django.utils import timezone
from collections import defaultdict
from datetime import datetime
from datetime import time


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

class UnavailabilityViewSet(viewsets.ModelViewSet):
    queryset = Unavailability.objects.all()
    serializer_class = UnavailabilitySerializer






class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee__company', 'shift__date', 'shift__department']


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






class RosterViewSet(viewsets.ModelViewSet):
    queryset = Roster.objects.all()
    serializer_class = RosterSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['company', 'employee', 'shift']
    
    @action(detail=False, methods=['get'], url_path='generate-weekly-roster')
    def generate_weekly_roster(self, request):
        # validate company id exists
        company_id = request.query_params.get('company')
        if not company_id:
            return Response(
                {'error': 'Company ID is required as a query parameter'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # get company or return error
        try:
            company = Company.objects.get(id=company_id)
        except Company.DoesNotExist:
            return Response(
                {'error': 'Company not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # set date range (today to today + 6 days)
        start_date = timezone.now().date()
        end_date = start_date + timedelta(days=6)

        # Delete all existing rosters in this date range first
        Roster.objects.filter(
            company=company,
            date__range=[start_date, end_date]
        ).delete()

        # Reset all shifts in this date range to unassigned
        Shift.objects.filter(
            company=company,
            start_time__date__range=[start_date, end_date]
        ).update(assigned=False)

        # get all shifts for the date range (using DateTimeField)
        shifts = Shift.objects.filter(
            company=company,
            start_time__date__range=[start_date, end_date]
        ).order_by('start_time')

        # get all employees for the company
        employees = Employee.objects.filter(company=company).prefetch_related(
            'departments',
            'unavailabilities'
        )

        # find all unavailabilities in date range
        unavailabilities = Unavailability.objects.filter(
            employee__in=employees,
            end__gte=timezone.make_aware(datetime.combine(start_date, time.min)),
            start__lte=timezone.make_aware(datetime.combine(end_date, time.max))
        )

        # initialize tracking dictionaries
        employee_unavailabilities = defaultdict(list)
        department_employees = defaultdict(list)
        employee_departments = defaultdict(list)
        department_needs = defaultdict(int)
        employee_shift_counts = defaultdict(int)

        # map unavailabilities to employees
        for unav in unavailabilities:
            employee_unavailabilities[unav.employee_id].append(unav)

        # map employees to departments and vice versa
        for emp in employees:
            for dept in emp.departments.all():
                department_employees[dept.id].append({
                    'id': emp.id,
                    'name': emp.name
                })
                employee_departments[emp.id].append(dept.id)

        # count unassigned shifts per department
        for shift in shifts:
            department_needs[shift.department_id] += 1

        # prepare lists for results
        assigned_rosters = []
        unassigned_rosters = []

        # process each shift
        for shift in shifts:
            shift_date = shift.start_time.date()
            shift_start = shift.start_time
            shift_end = shift.end_time

            # find employees in this department
            potential_employees = department_employees.get(shift.department_id, [])
            available_employees = []

            # check each employee's availability
            for emp_data in potential_employees:
                emp_id = emp_data['id']
                
                # check against unavailabilities
                is_available = True
                for unav in employee_unavailabilities.get(emp_id, []):
                    if (unav.start < shift_end and unav.end > shift_start):
                        is_available = False
                        break

                if is_available:
                    available_employees.append(emp_data)

            # assign shift if employees available
            if available_employees:
                # sort by fewest shifts and department needs
                available_employees.sort(
                    key=lambda x: (
                        employee_shift_counts[x['id']],
                        -max(department_needs[dept_id] for dept_id in employee_departments[x['id']])
                    )
                )
                assigned_emp = available_employees[0]
                employee_shift_counts[assigned_emp['id']] += 1
                department_needs[shift.department_id] -= 1

                # create roster entry and mark shift as assigned
                roster = Roster.objects.create(
                    company=company,
                    shift=shift,
                    employee_id=assigned_emp['id'],
                    date=shift_date,
                    is_conflict=False,
                    assigned_manually=False
                )
                shift.assigned = True
                shift.save()

                assigned_rosters.append({
                    'id': roster.id,
                    'employee': assigned_emp,
                    'shift': {
                        'id': shift.id,
                        'date': shift_date,
                        'start_time': shift_start.time(),
                        'end_time': shift_end.time(),
                        'department': shift.department_id
                    },
                    'date': shift_date,
                    'is_conflict': False
                })
            else:
                unassigned_rosters.append({
                    'id': None,
                    'employee': None,
                    'shift': {
                        'id': shift.id,
                        'date': shift_date,
                        'start_time': shift_start.time(),
                        'end_time': shift_end.time(),
                        'department': shift.department_id
                    },
                    'date': shift_date,
                    'is_conflict': True
                })

        return Response({
            'assigned': assigned_rosters,
            'unassigned': unassigned_rosters,
            'department_needs': dict(department_needs),
            'employee_assignments': dict(employee_shift_counts)
        })

    @action(detail=False, methods=['get'])
    def weekly_roster(self, request):
        company_id = request.query_params.get('company')
        if not company_id:
            return Response(
                {'error': 'Company ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Verify company exists
            Company.objects.get(id=company_id)
        except Company.DoesNotExist:
            return Response(
                {'error': 'Company not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        start_date = timezone.now().date()
        end_date = start_date + timedelta(days=6)

        rosters = Roster.objects.filter(
            company_id=company_id,
            date__range=[start_date, end_date]
        ).select_related('employee', 'shift', 'shift__department')

        if not rosters.exists():
            return Response({
                'message': 'No rosters found for this week',
                'date_range': {
                    'start_date': start_date,
                    'end_date': end_date
                }
            }, status=status.HTTP_200_OK)

        serializer = self.get_serializer(rosters, many=True)
        return Response({
            'rosters': serializer.data,
            'date_range': {
                'start_date': start_date,
                'end_date': end_date
            }
        })

    @action(detail=True, methods=['post'])
    def assign_manually(self, request, pk=None):
        roster = self.get_object()
        employee_id = request.data.get('employee_id')

        if not employee_id:
            return Response(
                {'error': 'employee_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            employee = Employee.objects.get(id=employee_id, company=roster.company)
        except Employee.DoesNotExist:
            return Response(
                {'error': 'Employee not found or not in same company'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not employee.is_available(roster.shift.start_time, roster.shift.end_time):
            return Response(
                {'error': 'Employee is not available during this shift'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # update both roster and shift assignment status
        roster.employee = employee
        roster.assigned_manually = True
        roster.is_conflict = False
        roster.save()
        
        roster.shift.assigned = True
        roster.shift.save()

        return Response(self.get_serializer(roster).data)


class CompanyDashboardView(APIView):
    def get(self, request, company_id):
        try:
            company = Company.objects.get(id=company_id)
        except Company.DoesNotExist:
            return Response(
                {'error': 'Company not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get date range for current week
        today = timezone.now().date()
        start_date = today
        end_date = today + timedelta(days=6)

        # Get all necessary data in optimized queries
        employees = Employee.objects.filter(company=company)
        departments = Department.objects.filter(company=company).annotate(employee_count=Count('employees'))
        rosters = Roster.objects.filter(
            company=company,
            date__range=[start_date, end_date]
        ).select_related('employee', 'shift', 'shift__department')
        shifts = Shift.objects.filter(
            company=company,
            start_time__date__range=[start_date, end_date]
        )
        notifications = Notification.objects.filter(
            company=company,
            created_at__gte=timezone.now() - timedelta(days=7)
        )
        unavailabilities = Unavailability.objects.filter(
            company=company,
            end__gte=timezone.now()
        ).select_related('employee')

        # Calculate statistics
        total_employees = employees.count()
        shifts_this_week = shifts.count()
        pending_assignments = shifts.filter(assigned=False).count()
        shift_coverage = 0 if shifts_this_week == 0 else \
            round((shifts_this_week - pending_assignments) / shifts_this_week * 100)

        # Process departments with coverage
        department_data = []
        for dept in departments:
            dept_shifts = [r for r in rosters if r.shift.department_id == dept.id]
            assigned = len([r for r in dept_shifts if r.employee_id])
            coverage = 0 if len(dept_shifts) == 0 else \
                round(assigned / len(dept_shifts) * 100)
            
            department_data.append({
                'id': dept.id,
                'name': dept.name,
                'employee_count': dept.employee_count,
                'shift_count': len(dept_shifts),
                'coverage': coverage
            })

        # Process week summary
        week_summary = []
        for i in range(7):
            day_date = start_date + timedelta(days=i)
            day_name = day_date.strftime('%a')
            day_rosters = [r for r in rosters if r.date == day_date]
            assigned = len([r for r in day_rosters if r.employee_id])
            coverage = 0 if len(day_rosters) == 0 else \
                round(assigned / len(day_rosters) * 100)
            
            week_summary.append({
                'day': day_name,
                'date': day_date,
                'coverage': coverage
            })

        # Process unavailabilities
        unavailabilities_data = []
        for unav in unavailabilities:
            unavailabilities_data.append({
                'id': unav.id,
                'employee': {
                    'id': unav.employee.id,
                    'name': unav.employee.name,
                    'avatar': f"assets/avatars/user{unav.employee.id % 3 + 1}.jpg"
                },
                'start': unav.start,
                'end': unav.end,
                'type': unav.get_type_display(),
                'reason': unav.reason
            })

        # Prepare response
        response_data = {
            'company': {
                'id': company.id,
                'name': company.name
            },
            'stats': {
                'total_employees': total_employees,
                'shifts_this_week': shifts_this_week,
                'pending_assignments': pending_assignments,
                'shift_coverage': shift_coverage
            },
            'departments': department_data,
            'week_summary': week_summary,
            'notifications': NotificationSerializer(notifications, many=True).data,
            'unavailabilities': unavailabilities_data,
            'date_range': {
                'start_date': start_date,
                'end_date': end_date
            }
        }

        return Response(response_data)