from django.db import models

from django.db import models

class Company(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password_hash = models.TextField()  # You might switch to Django's auth system for better security
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Department(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.name} ({self.company.name})"


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


class EmployeeDepartment(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.employee.name} - {self.department.name}"


class Shift(models.Model):
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
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.department.name} - {self.day_of_week} {self.start_time}-{self.end_time}"


class Availability(models.Model):
    WEEKDAYS = Shift.WEEKDAYS

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='availabilities')
    day_of_week = models.CharField(max_length=3, choices=WEEKDAYS)
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.employee.name} - {self.day_of_week} {self.start_time}-{self.end_time}"


class Unavailability(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='unavailabilities')
    date = models.DateField()
    reason = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.employee.name} - {self.date}"


class Roster(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='rosters')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='rosters')
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='rosters')
    date = models.DateField()
    is_conflict = models.BooleanField(default=False)
    assigned_manually = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.date} - {self.employee.name} ({'Manual' if self.assigned_manually else 'Auto'})"


class Notification(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='notifications')
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    email_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification to {self.employee.name} - {'Sent' if self.email_sent else 'Pending'}"
