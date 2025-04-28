from django.core.management.base import BaseCommand
from faker import Faker
import random
from datetime import datetime, timedelta, time
from api.models import (
    Company, Department, Employee, EmployeeDepartment,
    Shift, Availability, Roster, Notification
)

fake = Faker()

class Command(BaseCommand):
    help = 'Seed the database with sample data'

    def handle(self, *args, **kwargs):
        self.stdout.write("🧹 Clearing existing data...")
        # Clear existing data in reverse dependency order
        Roster.objects.all().delete()
        Notification.objects.all().delete()
        Availability.objects.all().delete()
        Shift.objects.all().delete()
        EmployeeDepartment.objects.all().delete()
        Employee.objects.all().delete()
        Department.objects.all().delete()
        Company.objects.all().delete()

        # Create companies
        self.stdout.write("🏢 Creating companies...")
        companies = []
        for _ in range(2):
            company = Company.objects.create(
                name=fake.company(),
                email=fake.unique.company_email(),
                password_hash=fake.sha256()
            )
            companies.append(company)

        # Departments
        self.stdout.write("🏛️ Creating departments...")
        departments = []
        for company in companies:
            for _ in range(2):
                dept = Department.objects.create(
                    company=company,
                    name=fake.bs().title(),
                    description=fake.catch_phrase()
                )
                departments.append(dept)

        # Employees
        self.stdout.write("👥 Creating employees...")
        employees = []
        for company in companies:
            for _ in range(5):
                emp = Employee.objects.create(
                    company=company,
                    name=fake.name(),
                    contact_info=fake.phone_number(),
                    employment_type=random.choice(['permanent', 'casual'])
                )
                employees.append(emp)

        # Assign departments to employees
        self.stdout.write("🔗 Assigning departments to employees...")
        for emp in employees:
            assigned = random.sample(
                [d for d in departments if d.company == emp.company],
                k=random.randint(1, 2)
            )
            for dept in assigned:
                EmployeeDepartment.objects.create(employee=emp, department=dept)

        # Shifts (using your static shift types)
        self.stdout.write("⏰ Creating shifts...")
        shift_types = ['morning', 'evening', 'night']
        for dept in departments:
            for day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']:
                for shift_type in shift_types:
                    Shift.objects.create(
                        company=dept.company,
                        department=dept,
                        day_of_week=day,
                        shift_type=shift_type
                    )  # Times will be auto-set by save()

        # Set default availability (Mon-Sat available, Sun unavailable)
        self.stdout.write("📅 Setting default availability...")
        for emp in employees:
            emp.set_default_availability()

            # Mark some random shifts as unavailable
            for _ in range(random.randint(1, 3)):
                day = random.choice(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
                shift_type = random.choice(shift_types)
                emp.mark_unavailable(
                    day_of_week=day,
                    shift_type=shift_type,
                    reason=random.choice(["Doctor appointment", "Personal day", "Training"])
                )

        # Create rosters
        self.stdout.write("📝 Generating rosters...")
        for emp in employees:
            shifts = Shift.objects.filter(department__in=emp.departments.all())
            for _ in range(3):
                shift = random.choice(shifts)
                date = fake.date_between(start_date='-5d', end_date='+5d')
                
                # Check if employee is available
                day_of_week = date.strftime('%a')
                is_available = emp.availabilities.filter(
                    day_of_week=day_of_week,
                    shift_type=shift.shift_type,
                    is_available=True
                ).exists()
                
                Roster.objects.create(
                    company=emp.company,
                    employee=emp,
                    shift=shift,
                    date=date,
                    is_conflict=not is_available,
                    assigned_manually=random.choice([True, False])
                )

        # Create notifications
        self.stdout.write("📨 Creating notifications...")
        for emp in employees:
            shifts = Shift.objects.filter(department__in=emp.departments.all())
            shift = random.choice(shifts)
            Notification.objects.create(
                employee=emp,
                shift=shift,
                message=f"Your shift on {shift.day_of_week} {shift.get_shift_type_display()} has been scheduled",
                email_sent=random.choice([True, False])
            )

        self.stdout.write(self.style.SUCCESS('✅ Successfully seeded the database with:'))
        self.stdout.write(f"🏢 Companies: {Company.objects.count()}")
        self.stdout.write(f"🏛️ Departments: {Department.objects.count()}")
        self.stdout.write(f"👥 Employees: {Employee.objects.count()}")
        self.stdout.write(f"⏰ Shifts: {Shift.objects.count()}")
        self.stdout.write(f"📅 Availabilities: {Availability.objects.count()}")
        self.stdout.write(f"📝 Rosters: {Roster.objects.count()}")
        self.stdout.write(f"📨 Notifications: {Notification.objects.count()}")