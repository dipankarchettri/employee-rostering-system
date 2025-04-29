from django.contrib import admin
from django import forms
from .models import (
    Company, Department, Employee, EmployeeDepartment,
    Shift,  Roster, Notification, Unavailability
)

from django.utils import timezone
from datetime import timedelta

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'created_at')
    search_fields = ('name', 'email')
    list_per_page = 20

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'company', 'employee_count')
    list_filter = ('company',)
    search_fields = ('name',)
    
    def employee_count(self, obj):
        return obj.employees.count()
    employee_count.short_description = 'Employees'

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact_info', 'employment_type', 'company', 'department_list')
    list_filter = ('employment_type', 'company')
    search_fields = ('name', 'contact_info')
    list_select_related = ('company',)
    actions = ['set_default_availability', 'enable_sunday_shifts']
    
    def department_list(self, obj):
        return ", ".join([d.name for d in obj.departments.all()])
    department_list.short_description = 'Departments'

    @admin.action(description='Set default availability (Mon-Sat)')
    def set_default_availability(self, request, queryset):
        for employee in queryset:
            employee.set_default_availability()
        self.message_user(request, f"Default availability set for {queryset.count()} employees")

    @admin.action(description='Enable Sunday shifts')
    def enable_sunday_shifts(self, request, queryset):
        for employee in queryset:
            for shift_type, _ in Shift.SHIFT_CHOICES:
                employee.update_availability(
                    day_of_week='Sun',
                    shift_type=shift_type,
                    is_available=True,
                    reason="Admin override"
                )
        self.message_user(request, f"Sunday availability enabled for {queryset.count()} employees")

@admin.register(EmployeeDepartment)
class EmployeeDepartmentAdmin(admin.ModelAdmin):
    list_display = ('employee', 'department', 'company')
    list_filter = ('department__company',)
    
    def company(self, obj):
        return obj.employee.company
    company.short_description = 'Company'


class ShiftForm(forms.ModelForm):
    class Meta:
        model = Shift
        fields = ['company', 'department', 'shift_type', 'start_time', 'end_time']
        widgets = {
            'start_time': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
            'end_time': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Set initial time to reasonable defaults if creating new shift
        if not self.instance.pk:
            now = timezone.now()
            start_time = now.replace(hour=9, minute=0, second=0, microsecond=0)
            end_time = start_time + timedelta(hours=8)
            self.initial['start_time'] = start_time
            self.initial['end_time'] = end_time

    def clean(self):
        cleaned_data = super().clean()
        start_time = cleaned_data.get('start_time')
        end_time = cleaned_data.get('end_time')

        if start_time and end_time:
            if end_time <= start_time:
                raise forms.ValidationError("End time must be after start time")
            if start_time < timezone.now():
                raise forms.ValidationError("Cannot create shift in the past")
        
        return cleaned_data
@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ('department', 'get_company', 'display_date', 'day_of_week', 'shift_type_display', 'time_range', 'assigned')
    list_filter = ('start_time', 'department__company', 'shift_type', 'assigned')
    list_editable = ('assigned',)
    readonly_fields = ()
    search_fields = ('department__name',)
    actions = ['mark_as_assigned', 'mark_as_unassigned']
    form = ShiftForm  # Use the custom form we're defining below

    def shift_type_display(self, obj):
        return obj.get_shift_type_display()
    shift_type_display.short_description = 'Shift Type'

    def time_range(self, obj):
        return f"{obj.start_time.time()} - {obj.end_time.time()}"
    time_range.short_description = 'Hours'

    def display_date(self, obj):
        return obj.start_time.date()
    display_date.short_description = 'Date'
    display_date.admin_order_field = 'start_time'

    def get_company(self, obj):
        return obj.department.company
    get_company.short_description = 'Company'

    def day_of_week(self, obj):
        return obj.start_time.strftime('%A')
    day_of_week.short_description = 'Day of Week'
    day_of_week.admin_order_field = 'start_time'

    def mark_as_assigned(self, request, queryset):
        queryset.update(assigned=True)
    mark_as_assigned.short_description = "Mark selected shifts as assigned"
    
    def mark_as_unassigned(self, request, queryset):
        queryset.update(assigned=False)
    mark_as_unassigned.short_description = "Mark selected shifts as unassigned"


@admin.register(Unavailability)
class UnavailabilityAdmin(admin.ModelAdmin):
    list_display = ('employee', 'time_range', 'type', 'reason_short')
    list_filter = ('type', 'start', 'employee')
    search_fields = ('employee__name', 'reason')
    date_hierarchy = 'start'
    fields = ('employee', 'start', 'end', 'type', 'reason')
    list_select_related = ('employee',)

    def time_range(self, obj):
        return f"{obj.start.strftime('%Y-%m-%d %H:%M')} to {obj.end.strftime('%H:%M')}"
    time_range.short_description = 'Time Period'
    time_range.admin_order_field = 'start'

    def reason_short(self, obj):
        return obj.reason[:50] + '...' if obj.reason and len(obj.reason) > 50 else obj.reason
    reason_short.short_description = 'Reason'

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('employee')

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "employee":
            kwargs["queryset"] = Employee.objects.order_by('name')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


@admin.register(Roster)
class RosterAdmin(admin.ModelAdmin):
    list_display = ('date', 'employee', 'company', 'shift_details', 
                   'conflict_status', 'assignment_type')
    list_filter = ('is_conflict', 'assigned_manually', 'date', 'employee__company')
    search_fields = ('employee__name', 'shift__department__name')
    date_hierarchy = 'date'
    raw_id_fields = ('employee', 'shift')
    
    def company(self, obj):
        return obj.employee.company
    company.short_description = 'Company'
    
    def shift_details(self, obj):
        return (f"{obj.shift.department.name} - {obj.shift.day_of_week} "
                f"{obj.shift.get_shift_type_display()} ({obj.shift.start_time}-{obj.shift.end_time})")
    shift_details.short_description = 'Shift'
    
    def conflict_status(self, obj):
        return "⚠️ Conflict" if obj.is_conflict else "✅ Clear"
    conflict_status.short_description = 'Status'
    
    def assignment_type(self, obj):
        return "Manual" if obj.assigned_manually else "Auto"
    assignment_type.short_description = 'Type'

    def shift_details(self, obj):
        return (f"{obj.shift.department.name} - {obj.shift.day_of_week} "
                f"{obj.shift.get_shift_type_display()} "
                f"({obj.shift.start_time.time()}-{obj.shift.end_time.time()})")  # Changed to use .time()



@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('employee', 'company', 'shift_info', 'message_short', 
                   'delivery_status', 'created_at')
    list_filter = ('email_sent', 'created_at', 'employee__company')
    search_fields = ('employee__name', 'message')
    date_hierarchy = 'created_at'
    
    def company(self, obj):
        return obj.employee.company
    company.short_description = 'Company'
    
    def shift_info(self, obj):
        return f"{obj.shift.day_of_week} {obj.shift.get_shift_type_display()}"
    shift_info.short_description = 'Shift'
    
    def message_short(self, obj):
        return obj.message[:75] + '...' if len(obj.message) > 75 else obj.message
    message_short.short_description = 'Message'
    
    def delivery_status(self, obj):
        return "📧 Sent" if obj.email_sent else "📭 Pending"
    delivery_status.short_description = 'Status'

    def shift_info(self, obj):
        return f"{obj.shift.start_time.strftime('%A')} {obj.shift.get_shift_type_display()}"  # Changed to use start_time