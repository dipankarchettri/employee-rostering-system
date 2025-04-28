from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Department, Shift
from .models import Employee, Department

@receiver(post_save, sender=Department)
def create_default_shifts(sender, instance, created, **kwargs):
    if created:
        shift_config = [
            ('morning', '08:00:00', '16:00:00'),
            ('evening', '16:00:00', '00:00:00'),
            ('night', '00:00:00', '08:00:00')
        ]
        
        for day_code, _ in Shift.WEEKDAYS:
            for shift_type, start_time, end_time in shift_config:
                Shift.objects.create(
                    company=instance.company,
                    department=instance,
                    day_of_week=day_code,
                    shift_type=shift_type,
                    # These will be auto-set by save() but we set them explicitly too
                    start_time=start_time,
                    end_time=end_time
                )

@receiver(post_save, sender=Employee)
def update_employee_count_on_create(sender, instance, created, **kwargs):
    """
    Updates the employee count in the Department model when an Employee is added.
    """
    if created:
        # Check if department is assigned to the employee
        if hasattr(instance, 'department') and instance.department:
            department = instance.department
            department.num_employees = department.employees.count()
            department.save()

def update_employee_count_on_delete(sender, instance, **kwargs):
    """
    Updates the employee count in the Department model when an Employee is removed.
    """
    department = instance.department
    department.num_employees = department.employees.count()
    department.save()