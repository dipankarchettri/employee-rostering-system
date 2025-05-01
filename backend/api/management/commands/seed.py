# api/management/commands/unavailabilities.py
from django.core.management.base import BaseCommand
from datetime import datetime, time, timedelta
import random
from faker import Faker
from api.models import Employee, Unavailability

fake = Faker()

class Command(BaseCommand):
    help = 'Create only unavailabilities for next 7 days'

    def handle(self, *args, **options):
        self.stdout.write("Creating unavailabilities for next 7 days...")
        employees = Employee.objects.all()
        self._create_unavailabilities(employees)
        self.stdout.write(self.style.SUCCESS("✅ Successfully created unavailabilities!"))

    def _create_unavailabilities(self, employees):
        """Same method as before"""
        base_date = datetime(2025, 4, 29).date()
        unavailability_types = ['vacation', 'sick', 'other']
        
        for emp in employees:
            if random.random() < 0.25:
                days_ahead = random.randint(0, 6)
                start_date = base_date + timedelta(days=days_ahead)
                duration = 1 if random.random() < 0.8 else 2
                start_hour = random.randint(8, 14)
                end_hour = min(start_hour + random.randint(2, 8), 20)
                
                Unavailability.objects.create(
                    employee=emp,
                    start=datetime.combine(start_date, time(start_hour, 0)),
                    end=datetime.combine(
                        start_date + timedelta(days=duration-1),
                        time(end_hour, 0)
                    ),
                    type=random.choice(unavailability_types),
                    reason=fake.sentence() if random.random() > 0.3 else None
                )