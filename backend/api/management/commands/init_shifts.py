from django.core.management.base import BaseCommand
from api.models import Company, Department, Shift

class Command(BaseCommand):
    help = 'Initialize standard shifts for all companies and departments'
    
    def handle(self, *args, **options):
        shift_config = [
            ('morning', '08:00:00', '16:00:00'),
            ('evening', '16:00:00', '00:00:00'),
            ('night', '00:00:00', '08:00:00')
        ]
        
        created_count = 0
        
        for company in Company.objects.all():
            for department in Department.objects.filter(company=company):
                for day_code, day_name in Shift.WEEKDAYS:
                    for shift_type, start_time, end_time in shift_config:
                        shift, created = Shift.objects.get_or_create(
                            company=company,
                            department=department,
                            day_of_week=day_code,
                            shift_type=shift_type,
                            defaults={
                                'start_time': start_time,
                                'end_time': end_time
                            }
                        )
                        if created:
                            created_count += 1
        
        self.stdout.write(self.style.SUCCESS(
            f'Successfully created {created_count} shift entries '
            f'({len(Shift.WEEKDAYS)} days × 3 shifts × {Company.objects.count()} companies '
            f'× {Department.objects.count()} departments)'
        ))