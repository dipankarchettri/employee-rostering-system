from django.contrib import admin
from .models import (
    Company, Department, Employee, EmployeeDepartment, Shift,
    Availability, Unavailability, Roster, Notification
)


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'created_at')
    search_fields = ('name', 'email')


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'company')
    list_filter = ('company',)
    search_fields = ('name',)


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact_info', 'employment_type', 'company')
    list_filter = ('employment_type', 'company')
    search_fields = ('name', 'contact_info')
    # filter_horizontal = ('departments',)


@admin.register(EmployeeDepartment)
class EmployeeDepartmentAdmin(admin.ModelAdmin):
    list_display = ('employee', 'department')


@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ('department', 'day_of_week', 'start_time', 'end_time')
    list_filter = ('day_of_week', 'department')


@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ('employee', 'day_of_week', 'start_time', 'end_time')
    list_filter = ('day_of_week',)


@admin.register(Unavailability)
class UnavailabilityAdmin(admin.ModelAdmin):
    list_display = ('employee', 'date', 'reason')
    list_filter = ('date',)


@admin.register(Roster)
class RosterAdmin(admin.ModelAdmin):
    list_display = ('date', 'employee', 'shift', 'is_conflict', 'assigned_manually')
    list_filter = ('is_conflict', 'assigned_manually', 'date')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('employee', 'shift', 'email_sent', 'created_at')
    list_filter = ('email_sent', 'created_at')
