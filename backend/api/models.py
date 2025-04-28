from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from datetime import date

class Company(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password_hash = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def set_password(self, raw_password):
        self.password_hash = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password_hash)

    def __str__(self):
        return self.name


class Department(models.Model):
    company = models.ForeignKey('Company', related_name='departments', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField()

    def __str__(self):
        return self.name

    @property
    def num_employees(self):
        return self.employees.count()  


class Employee(models.Model):
    EMPLOYMENT_TYPES = [
        ('permanent', 'Permanent'),
        ('casual', 'Casual'),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='employees')
    name = models.CharField(max_length=255)
    contact_info = models.CharField(max_length=255)
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)
    departments = models.ManyToManyField('Department', through='EmployeeDepartment', related_name='employees')

    def __str__(self):
        return self.name

    def set_default_availability(self):
        """Default: Available Mon-Sat, Unavailable Sun"""
        for day_code, _ in Shift.WEEKDAYS:
            for shift_type, _ in Shift.SHIFT_CHOICES:
                default_available = (day_code != 'Sun')
                Availability.objects.update_or_create(
                    employee=self,
                    day_of_week=day_code,
                    shift_type=shift_type,
                    defaults={
                        'is_available': default_available,
                        'reason': None if default_available else "Sunday default unavailable"
                    }
                )

    def update_availability(self, day_of_week, shift_type, is_available, reason=None):
        """
        Update availability for any day including Sunday
        Args:
            day_of_week: 'Mon', 'Tue', etc.
            shift_type: 'morning', 'evening', 'night'
            is_available: Boolean
            reason: Optional string explaining the change
        """
        Availability.objects.update_or_create(
            employee=self,
            day_of_week=day_of_week,
            shift_type=shift_type,
            defaults={
                'is_available': is_available,
                'reason': reason
            }
        )

    def get_availability(self, day_of_week, shift_type):
        """Get availability status and reason for a specific shift"""
        try:
            availability = self.availabilities.get(
                day_of_week=day_of_week,
                shift_type=shift_type
            )
            return {
                'is_available': availability.is_available,
                'reason': availability.reason
            }
        except Availability.DoesNotExist:
            # Return default if not explicitly set
            default_available = (day_of_week != 'Sun')
            return {
                'is_available': default_available,
                'reason': None if default_available else "Sunday default unavailable"
    
            }

    def get_unavailable_shifts(self):
        """Get all shifts where this employee is unavailable"""
        return self.availabilities.filter(is_available=False)

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new:
            self.set_default_availability()


class EmployeeDepartment(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.employee.name} - {self.department.name}"


class Shift(models.Model):
    SHIFT_CHOICES = [
        ('morning', 'Morning Shift (8AM-4PM)'),
        ('evening', 'Evening Shift (4PM-12AM)'),
        ('night', 'Night Shift (12AM-8AM)'),
    ]
    WEEKDAYS = [
        ('Mon', 'Monday'),
        ('Tue', 'Tuesday'),
        ('Wed', 'Wednesday'),
        ('Thu', 'Thursday'),
        ('Fri', 'Friday'),
        ('Sat', 'Saturday'),
        ('Sun', 'Sunday'),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='shifts')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='shifts')
    day_of_week = models.CharField(max_length=3, choices=WEEKDAYS)
    shift_type = models.CharField(max_length=10, choices=SHIFT_CHOICES, default='morning')
    start_time = models.TimeField(editable=False)
    end_time = models.TimeField(editable=False)

    class Meta:
        unique_together = ('company', 'department', 'shift_type', 'day_of_week')

    def save(self, *args, **kwargs):
        # Automatically set times based on shift type
        if self.shift_type == 'morning':
            self.start_time = '08:00:00'
            self.end_time = '16:00:00'
        elif self.shift_type == 'evening':
            self.start_time = '16:00:00'
            self.end_time = '00:00:00'
        elif self.shift_type == 'night':
            self.start_time = '00:00:00'
            self.end_time = '08:00:00'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.department.name} - {self.day_of_week} {self.get_shift_type_display()}"


class Availability(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='availabilities')
    shift_type = models.CharField(max_length=10, choices=Shift.SHIFT_CHOICES)
    day_of_week = models.CharField(max_length=3, choices=Shift.WEEKDAYS)
    is_available = models.BooleanField(default=True)
    reason = models.CharField(max_length=255, blank=True, null=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('employee', 'shift_type', 'day_of_week')
        verbose_name_plural = 'Availabilities'

    def __str__(self):
        status = "Available" if self.is_available else "Unavailable"
        return f"{self.employee.name} - {self.day_of_week} {self.shift_type} ({status})"


class Roster(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='rosters')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='rosters')
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='rosters')
    date = models.DateField()
    is_conflict = models.BooleanField(default=False)
    assigned_manually = models.BooleanField(default=False)

    class Meta:
        ordering = ['date', 'shift__start_time']
        unique_together = ('employee', 'shift', 'date')

    def __str__(self):
        return f"{self.date} - {self.employee.name} ({'Manual' if self.assigned_manually else 'Auto'})"


class Notification(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='notifications')
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    email_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification to {self.employee.name} - {'Sent' if self.email_sent else 'Pending'}"