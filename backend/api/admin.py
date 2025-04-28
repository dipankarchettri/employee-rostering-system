from django.contrib import admin
from .models import (
    Company, Department, Employee, EmployeeDepartment,
    Shift, Availability, Roster, Notification
)

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

@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ('department', 'company', 'day_of_week', 'shift_type_display', 'time_range')
    list_filter = ('day_of_week', 'department__company', 'shift_type')
    readonly_fields = ('start_time', 'end_time')
    search_fields = ('department__name',)
    
    def shift_type_display(self, obj):
        return obj.get_shift_type_display()
    shift_type_display.short_description = 'Shift Type'
    
    def time_range(self, obj):
        return f"{obj.start_time} - {obj.end_time}"
    time_range.short_description = 'Hours'
    
    def company(self, obj):
        return obj.department.company
    company.short_description = 'Company'

@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ('employee', 'employee_company', 'day_of_week', 'shift_type', 
                   'is_available', 'reason_short', 'last_updated')  # Added is_available here
    list_filter = ('employee__company', 'day_of_week', 'shift_type', 'is_available')
    search_fields = ('employee__name',)
    list_editable = ('is_available',)  # This must be in list_display
    readonly_fields = ('employee_company', 'last_updated')
    date_hierarchy = 'last_updated'
    
    def employee_company(self, obj):
        return obj.employee.company
    employee_company.short_description = 'Company'
    
    def reason_short(self, obj):
        return obj.reason[:50] + '...' if obj.reason else ''
    reason_short.short_description = 'Reason'
    
    actions = ['mark_available', 'mark_unavailable']
    
    @admin.action(description='Mark selected as available')
    def mark_available(self, request, queryset):
        queryset.update(is_available=True)
        
    @admin.action(description='Mark selected as unavailable')
    def mark_unavailable(self, request, queryset):
        queryset.update(is_available=False)

    def get_queryset(self, request):
        # Default to showing only unavailable shifts
        qs = super().get_queryset(request)
        if request.GET.get('unavailable_only'):
            qs = qs.filter(is_available=False)
        return qs
    
    def changelist_view(self, request, extra_context=None):
        if not request.GET.get('is_available'):
            # Default to showing unavailable if no explicit filter
            request.GET = request.GET.copy()
            request.GET['is_available'] = 'false'
        return super().changelist_view(request, extra_context)

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