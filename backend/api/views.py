from datetime import datetime, date, time, timedelta
from collections import defaultdict
from io import BytesIO

from django.core.exceptions import ValidationError
from django.db.models import Count, Q
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status, filters, viewsets
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.views import APIView

from django_filters.rest_framework import DjangoFilterBackend

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import Table, TableStyle, Paragraph
from reportlab.pdfgen import canvas

from .models import Company, Department, Employee, Shift, Roster, Notification, Unavailability
from .serializers import (
    CompanySerializer, DepartmentSerializer, EmployeeSerializer,
    ShiftSerializer, RosterSerializer, NotificationSerializer, UnavailabilitySerializer
)



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
                    'name': emp.name,
                    'employment_type': emp.employment_type
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
                        x['employment_type'] != 'permanent',  
                        employee_shift_counts[x['id']],       
                        -max(department_needs[dept_id] for dept_id in employee_departments[x['id']])  # higher dept need
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

    @action(detail=False, methods=['get'], url_path='export-pdf')
    def export_pdf(self, request):
        company_id = request.query_params.get('company')
        if not company_id:
            return Response(
                {'error': 'Company ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            company = Company.objects.get(id=company_id)
        except Company.DoesNotExist:
            return Response(
                {'error': 'Company not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        rosters = Roster.objects.filter(
            company_id=company_id
        ).select_related('employee', 'shift', 'shift__department').order_by('date', 'shift__start_time')

        if not rosters.exists():
            return Response(
                {'error': 'No roster data found'},
                status=status.HTTP_404_NOT_FOUND
            )

        buffer = BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=landscape(letter))
        width, height = landscape(letter)

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'Title',
            parent=styles['Title'],
            fontSize=20,
            alignment=TA_CENTER,
            spaceAfter=12
        )
        subtitle_style = ParagraphStyle(
            'Subtitle',
            parent=styles['Normal'],
            fontSize=12,
            alignment=TA_CENTER,
            textColor=colors.darkgray
        )

        top_margin = 300  # Increased top margin

        # === Heading ===
        heading = Paragraph("📄 Roster Report", title_style)
        heading.wrapOn(pdf, width - 100, 40)
        heading.drawOn(pdf, 50, height - top_margin)

        # === Subtitle / Company Info ===
        subtitle = Paragraph(f"{company.name} - Complete Roster Schedule", subtitle_style)
        subtitle.wrapOn(pdf, width - 100, 30)
        subtitle.drawOn(pdf, 50, height - top_margin - 30)

        # === Generated Date ===
        pdf.setFont("Helvetica", 10)
        pdf.drawString(50, height - top_margin - 60, f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        # === Total Count ===
        pdf.drawString(50, height - top_margin - 75, f"Total Rosters: {rosters.count()}")

        # === Table Data ===
        data = [[
            "Employee", "Date", "Day", "Shift Type", "Department",
            "Start Time", "End Time", "Status"
        ]]

        for roster in rosters:
            data.append([
                roster.employee.name if roster.employee else "Unassigned",
                roster.date.strftime('%Y-%m-%d'),
                roster.shift.day_of_week.capitalize() if roster.shift else "",
                roster.shift.shift_type if roster.shift else "",
                roster.shift.department.name if roster.shift and roster.shift.department else "",
                roster.shift.start_time.strftime('%H:%M') if roster.shift else "",
                roster.shift.end_time.strftime('%H:%M') if roster.shift else "",
                "Conflict" if roster.is_conflict else "OK"
            ])

        table = Table(data, repeatRows=1, colWidths=[100, 70, 50, 80, 100, 60, 60, 50])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3A5FCD')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F0F8FF')),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#D3D3D3')),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ]))

        table.wrapOn(pdf, width - 100, height - top_margin - 200)
        table.drawOn(pdf, 50, height - top_margin - 250)

        # === Page number ===
        pdf.setFont("Helvetica", 8)
        pdf.drawRightString(width - 50, 30, f"Page {pdf.getPageNumber()}")

        pdf.showPage()
        pdf.save()
        buffer.seek(0)

        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{company.name}_complete_roster.pdf"'
        return response




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
            assigned = len([r for r in dept_shifts if r.employee is not None])
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
            assigned = len([r for r in day_rosters if r.employee is not None])
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





class ReportView(APIView):
    def get(self, request, company_id):
        try:
            company = Company.objects.get(pk=company_id)
        except Company.DoesNotExist:
            return Response(
                {"error": "Company not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Get query parameters
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        department_id = request.query_params.get('department', 'all')
        report_type = request.query_params.get('type', 'summary')

        # Validate and parse dates
        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date() if start_date else None
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date() if end_date else None
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Set default date range (current week) if not provided
        if not start_date or not end_date:
            today = datetime.now().date()
            start_date = today - timedelta(days=today.weekday())
            end_date = start_date + timedelta(days=6)

        # Base queryset filtered by company and date range
        shifts = Shift.objects.filter(
            company=company,
            start_time__date__gte=start_date,
            end_time__date__lte=end_date
        )

        # Apply department filter if specified
        if department_id != 'all':
            shifts = shifts.filter(department_id=department_id)

        # Get all departments for filter dropdown
        departments = Department.objects.filter(company=company)
        department_serializer = DepartmentSerializer(departments, many=True)

        # Prepare report data based on report type
        if report_type == 'summary':
            report_data = self._generate_summary_report(shifts)
        elif report_type == 'employee':
            report_data = self._generate_employee_report(shifts)
        elif report_type == 'coverage':
            report_data = self._generate_coverage_report(company, start_date, end_date, department_id)
        else:
            return Response(
                {"error": "Invalid report type"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate summary statistics
        total_shifts = shifts.count()
        assigned_shifts = Roster.objects.filter(
            shift__in=shifts
        ).values('employee').distinct().count()
        coverage_conflicts = Unavailability.objects.filter(
            employee__company=company,
            start__date__lte=end_date,
            end__date__gte=start_date
        ).count()

        response_data = {
            "company": company.name,
            "start_date": start_date,
            "end_date": end_date,
            "selected_department": department_id,
            "report_type": report_type,
            "departments": department_serializer.data,
            "summary_stats": {
                "total_shifts": total_shifts,
                "employees_assigned": assigned_shifts,
                "coverage_conflicts": coverage_conflicts
            },
            "report_data": report_data
        }

        return Response(response_data)

    def _generate_summary_report(self, shifts):
        # Group shifts by date and department
        report_data = []
        
        # Get all rosters for these shifts
        rosters = Roster.objects.filter(
            shift__in=shifts
        ).select_related('shift', 'employee', 'shift__department')
        
        # Organize by date and department
        date_groups = {}
        for roster in rosters:
            date_str = roster.date.strftime('%Y-%m-%d')
            if date_str not in date_groups:
                date_groups[date_str] = {}
            
            dept_name = roster.shift.department.name
            if dept_name not in date_groups[date_str]:
                date_groups[date_str][dept_name] = {
                    'shifts': [],
                    'employee_count': 0
                }
            
            shift_data = {
                'id': roster.shift.id,
                'name': roster.shift.get_shift_type_display(),
                'start_time': roster.shift.start_time.time(),
                'end_time': roster.shift.end_time.time(),
                'employees': [roster.employee.name]
            }
            
            # Check if shift already exists in the group
            existing_shift = next(
                (s for s in date_groups[date_str][dept_name]['shifts'] 
                if s['id'] == roster.shift.id
            ), None)
            
            if existing_shift:
                existing_shift['employees'].append(roster.employee.name)
            else:
                date_groups[date_str][dept_name]['shifts'].append(shift_data)
            
            date_groups[date_str][dept_name]['employee_count'] += 1
        
        # Convert to the format expected by frontend
        for date_str, depts in date_groups.items():
            for dept_name, dept_data in depts.items():
                for shift in dept_data['shifts']:
                    report_data.append({
                        'date': date_str,
                        'department': dept_name,
                        'shift_name': shift['name'],
                        'employee_count': len(shift['employees']),
                        'status': 'Complete' if len(shift['employees']) > 0 else 'Pending'
                    })
        
        return report_data

    def _generate_employee_report(self, shifts):
        # Get all rosters for these shifts
        rosters = Roster.objects.filter(
            shift__in=shifts
        ).select_related('employee', 'shift', 'shift__department')
        
        # Group by employee
        employee_data = {}
        for roster in rosters:
            if roster.employee.id not in employee_data:
                employee_data[roster.employee.id] = {
                    'name': roster.employee.name,
                    'shifts': [],
                    'total_hours': 0
                }
            
            shift_duration = (roster.shift.end_time - roster.shift.start_time).total_seconds() / 3600
            employee_data[roster.employee.id]['shifts'].append({
                'date': roster.date.strftime('%Y-%m-%d'),
                'department': roster.shift.department.name,
                'shift_name': roster.shift.get_shift_type_display(),
                'start_time': roster.shift.start_time.time(),
                'end_time': roster.shift.end_time.time(),
                'duration': shift_duration
            })
            employee_data[roster.employee.id]['total_hours'] += shift_duration
        
        # Convert to frontend format
        report_data = []
        for emp_id, emp_data in employee_data.items():
            for shift in emp_data['shifts']:
                report_data.append({
                    'employee': emp_data['name'],
                    'date': shift['date'],
                    'department': shift['department'],
                    'shift_name': shift['shift_name'],
                    'hours': shift['duration'],
                    'status': 'Scheduled'
                })
        
        return report_data

    def _generate_coverage_report(self, company, start_date, end_date, department_id):
        # Get all shifts in date range
        shifts = Shift.objects.filter(
            company=company,
            start_time__date__gte=start_date,
            end_time__date__lte=end_date
        )
        
        if department_id != 'all':
            shifts = shifts.filter(department_id=department_id)
        
        # Get all rosters for these shifts
        rosters = Roster.objects.filter(
            shift__in=shifts
        ).select_related('shift', 'employee', 'shift__department')
        
        # Get all unavailabilities in this period
        unavailabilities = Unavailability.objects.filter(
            employee__company=company,
            start__date__lte=end_date,
            end__date__gte=start_date
        )
        
        # Calculate coverage gaps
        report_data = []
        for shift in shifts:
            assigned_count = rosters.filter(shift=shift).count()
            department = shift.department
            
            # Find employees in this department
            dept_employees = department.employees.all()
            
            # Find unavailable employees
            unavailable_employees = unavailabilities.filter(
                employee__in=dept_employees,
                start__lte=shift.end_time,
                end__gte=shift.start_time
            ).values_list('employee_id', flat=True)
            
            available_employees = dept_employees.exclude(
                id__in=unavailable_employees
            ).exclude(
                id__in=rosters.filter(shift=shift).values_list('employee_id', flat=True)
            )
            
            report_data.append({
                'date': shift.start_time.date().strftime('%Y-%m-%d'),
                'department': department.name,
                'shift_name': shift.get_shift_type_display(),
                'assigned': assigned_count,
                'required': 1,  # Assuming 1 employee per shift
                'available': available_employees.count(),
                'status': 'Understaffed' if assigned_count < 1 else 'Fully Staffed'
            })
        
        return report_data