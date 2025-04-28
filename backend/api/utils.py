from .models import Roster
from datetime import timedelta


def check_previous_shifts(employee, single_date, shift):
    # Check if the employee already has a shift on the given date
    existing_shifts = Roster.objects.filter(employee=employee, date=single_date)
    
    if existing_shifts.exists():
        return True  # Employee already has a shift on this day
    
    # Check if the employee worked a consecutive shift the previous day
    prev_date = single_date - timedelta(days=1)
    prev_shift = Roster.objects.filter(employee=employee, date=prev_date).first()
    
    if prev_shift:
        # If the employee has a shift on the previous day and it's a different shift type, return True
        if prev_shift.shift != shift:
            return True  # Employee worked a different shift on the previous day
        else:
            return False  # Employee worked the same shift type, so no conflict
    
    # If there's no shift on the previous day, it's fine to assign the shift
    return False
