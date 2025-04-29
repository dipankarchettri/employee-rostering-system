from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from datetime import date
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.utils import timezone

from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import date, time
from datetime import datetime



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

    @property
    def current_unavailabilities(self):
        """Helper property to get current/future unavailabilities"""
        return self.unavailabilities.filter(end__gte=timezone.now())

    def is_available(self, start_datetime, end_datetime):
        """
        Check if employee is available during a specific time period
        Returns bool (True = available, False = unavailable)
        """
        return not self.unavailabilities.filter(
            start__lt=end_datetime,
            end__gt=start_datetime
        ).exists()

class EmployeeDepartment(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.employee.name} - {self.department.name}"

class Shift(models.Model):
    SHIFT_CHOICES = [
        ('morning', 'Morning Shift'),
        ('afternoon', 'Afternoon Shift'),
        ('evening', 'Evening Shift'),
        ('night', 'Night Shift'),
        ('custom', 'Custom Shift'),
    ]

    company = models.ForeignKey('Company', on_delete=models.CASCADE, related_name='shifts')
    department = models.ForeignKey('Department', on_delete=models.CASCADE, related_name='shifts')
    shift_type = models.CharField(max_length=20, choices=SHIFT_CHOICES, default='morning')
    start_time = models.DateTimeField()  # Changed from TimeField to DateTimeField
    end_time = models.DateTimeField()    # Changed from TimeField to DateTimeField
    assigned = models.BooleanField(default=False)

    class Meta:
        unique_together = ('company', 'department', 'start_time', 'end_time')
        ordering = ['start_time']

    def clean(self):
        from django.core.exceptions import ValidationError

        if self.start_time and self.end_time:
            if self.start_time >= self.end_time:
                raise ValidationError("Shift start time must be before end time.")
        else:
            raise ValidationError("Both start time and end time must be set.")

    def save(self, *args, **kwargs):
        self.full_clean()  # run validation before saving
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.department.name} - {self.start_time.date()} {self.get_shift_type_display()} ({self.start_time.time()}-{self.end_time.time()})"

    @property
    def date(self):
        """get date from start_time for backward compatibility"""
        return self.start_time.date()

    @property
    def day_of_week(self):
        """get weekday name"""
        return self.start_time.strftime('%A').lower()

    @property
    def start_datetime(self):
        """alias for start_time (maintaining compatibility)"""
        return self.start_time

    @property
    def end_datetime(self):
        """alias for end_time (maintaining compatibility)"""
        return self.end_time

    @property
    def duration(self):
        """calculate shift duration in hours"""
        delta = self.end_time - self.start_time
        return delta.total_seconds() / 3600

    @property
    def calculated_day_of_week(self):
        """get weekday name (alias for day_of_week)"""
        return self.day_of_week

class Unavailability(models.Model):
    class UnavailabilityType(models.TextChoices):
        VACATION = 'vacation', 'Vacation'
        SICK = 'sick', 'Sick Leave'
        OTHER = 'other', 'Other'

    company = models.ForeignKey('Company', on_delete=models.CASCADE, related_name='unavailabilities')
    employee = models.ForeignKey('Employee', on_delete=models.CASCADE, related_name='unavailabilities')
    start = models.DateTimeField()
    end = models.DateTimeField()
    type = models.CharField(max_length=20, choices=UnavailabilityType.choices)
    reason = models.TextField(blank=True)

    class Meta:
        ordering = ['-start']
        verbose_name_plural = 'Unavailabilities'

    def __str__(self):
        return f"{self.employee} unavailable {self.start}-{self.end}"

    def save(self, *args, **kwargs):
        """Automatically set company from employee if not provided"""
        if not self.company_id and self.employee_id:
            self.company = self.employee.company
        super().save(*args, **kwargs)

    def clean(self):
        """Validate the unavailability period"""
        if self.end <= self.start:
            raise ValidationError("End datetime must be after start datetime")
        
        # Ensure employee belongs to the company
        if hasattr(self, 'company') and hasattr(self, 'employee'):
            if self.employee.company != self.company:
                raise ValidationError("Employee does not belong to the specified company")




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
    company = models.ForeignKey('Company', on_delete=models.CASCADE, related_name='notifications')
    employee = models.ForeignKey('Employee', on_delete=models.CASCADE, related_name='notifications')
    shift = models.ForeignKey('Shift', on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    email_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Notifications'

    def __str__(self):
        return f"Notification to {self.employee.name} - {'Sent' if self.email_sent else 'Pending'}"

    def save(self, *args, **kwargs):
        """Automatically set company from employee if not provided"""
        if not self.company_id and self.employee_id:
            self.company = self.employee.company
        super().save(*args, **kwargs)

    def clean(self):
        """Validate relationships"""
        if hasattr(self, 'company') and hasattr(self, 'employee'):
            if self.employee.company != self.company:
                raise ValidationError("Employee does not belong to the specified company")
        
        if hasattr(self, 'company') and hasattr(self, 'shift'):
            if self.shift.company != self.company:
                raise ValidationError("Shift does not belong to the specified company")