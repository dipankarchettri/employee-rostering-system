from django.core.management.base import BaseCommand
from faker import Faker
import random
from datetime import datetime, timedelta
from api.models import Company, Department, Employee, EmployeeDepartment, Shift, Availability, Unavailability, Roster, Notification

fake = Faker()

class Command(BaseCommand):
    help = 'Seed the database with sample data'

    def handle(self, *args, **kwargs):
        # Clear existing data
        Roster.objects.all().delete()
        Notification.objects.all().delete()
        Unavailability.objects.all().delete()
        Availability.objects.all().delete()
        Shift.objects.all().delete()
        EmployeeDepartment.objects.all().delete()
        Employee.objects.all().delete()
        Department.objects.all().delete()
        Company.objects.all().delete()

        # Create companies
        for _ in range(2):
            company = Company.objects.create(
                name=fake.company(),
                email=fake.unique.company_email(),
                password_hash=fake.sha256()
            )

            # Departments
            departments = [
                Department.objects.create(
                    company=company,
                    name=fake.bs().title()
                ) for _ in range(2)
            ]

            # Employees
            employees = [
                Employee.objects.create(
                    company=company,
                    name=fake.name(),
                    contact_info=fake.phone_number(),
                    employment_type=random.choice(['permanent', 'casual'])
                ) for _ in range(5)
            ]

            # Assign departments to employees
            for emp in employees:
                assigned = random.sample(departments, k=random.randint(1, len(departments)))
                for dept in assigned:
                    EmployeeDepartment.objects.create(employee=emp, department=dept)

            # Shifts (static days/times for simplicity)
            for dept in departments:
                for day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']:
                    Shift.objects.create(
                        company=company,
                        department=dept,
                        day_of_week=day,
                        start_time=fake.time_object(end_datetime=None),
                        end_time=fake.time_object(end_datetime=None)
                    )

            # Availability
            for emp in employees:
                for _ in range(random.randint(2, 4)):
                    Availability.objects.create(
                        employee=emp,
                        day_of_week=random.choice(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']),
                        start_time=fake.time_object(),
                        end_time=fake.time_object()
                    )

            # Unavailability
            for emp in employees:
                for _ in range(random.randint(1, 2)):
                    Unavailability.objects.create(
                        employee=emp,
                        date=fake.date_between(start_date='-10d', end_date='+10d'),
                        reason=random.choice(["Vacation", "Medical Leave", "Personal"])
                    )

            # Roster
            shifts = Shift.objects.filter(company=company)
            for emp in employees:
                for _ in range(3):
                    shift = random.choice(shifts)
                    date = fake.date_between(start_date='-5d', end_date='+5d')
                    Roster.objects.create(
                        company=company,
                        employee=emp,
                        shift=shift,
                        date=date,
                        is_conflict=random.choice([True, False]),
                        assigned_manually=random.choice([True, False])
                    )

            # Notifications
            for emp in employees:
                shift = random.choice(shifts)
                Notification.objects.create(
                    employee=emp,
                    shift=shift,
                    message=fake.sentence(),
                    email_sent=random.choice([True, False])
                )

        self.stdout.write(self.style.SUCCESS('✅ Successfully seeded the database.'))
