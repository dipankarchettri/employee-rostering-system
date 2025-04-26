from rest_framework.views import APIView
from rest_framework import viewsets
from .models import Company, Department, Employee, Shift, Availability, Unavailability, Roster, Notification
from .serializers import CompanySerializer, DepartmentSerializer, EmployeeSerializer, ShiftSerializer, AvailabilitySerializer, UnavailabilitySerializer, RosterSerializer, NotificationSerializer
from rest_framework.response import Response
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from django.core.exceptions import ValidationError



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
    
#signup view 
class CompanySignupView(APIView):
    def post(self, request):
        data = request.data
        if Company.objects.filter(email=data['email']).exists():
            return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

        company = Company(name=data['name'], email=data['email'])
        company.set_password(data['password'])
        try:
            company.full_clean()
            company.save()
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'Signup successful'}, status=status.HTTP_201_CREATED)

#login view 

class CompanyLoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            company = Company.objects.get(email=email)
        except Company.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        if company.check_password(password):
            return Response({'message': 'Login successful', 'company_id': company.id})
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)