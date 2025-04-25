from rest_framework import viewsets
from .models import Company, Department, Employee, Shift, Availability, Unavailability, Roster, Notification
from .serializers import CompanySerializer, DepartmentSerializer, EmployeeSerializer, ShiftSerializer, AvailabilitySerializer, UnavailabilitySerializer, RosterSerializer, NotificationSerializer

from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['company']

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['company']

class ShiftViewSet(viewsets.ModelViewSet):
    queryset = Shift.objects.all()
    serializer_class = ShiftSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['company']

class AvailabilityViewSet(viewsets.ModelViewSet):
    queryset = Availability.objects.all()
    serializer_class = AvailabilitySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee__company']

class UnavailabilityViewSet(viewsets.ModelViewSet):
    queryset = Unavailability.objects.all()
    serializer_class = UnavailabilitySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee__company']

class RosterViewSet(viewsets.ModelViewSet):
    queryset = Roster.objects.all()
    serializer_class = RosterSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['company']

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee__company']
