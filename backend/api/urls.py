from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CompanyViewSet, DepartmentViewSet, EmployeeViewSet,
    ShiftViewSet, AvailabilityViewSet, RosterViewSet,
    NotificationViewSet, CompanySignupView, CompanyLoginView,
    EmployeeAvailabilityView, BulkAvailabilityView, UpdateAvailabilityView, unavailability_list,
    generate_weekly_roster
)

from .views import check_employee_availability

router = DefaultRouter()
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'shifts', ShiftViewSet, basename='shift')
router.register(r'availabilities', AvailabilityViewSet, basename='availability')
router.register(r'rosters', RosterViewSet, basename='roster')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
    path('signup/', CompanySignupView.as_view(), name='company-signup'),
    path('login/', CompanyLoginView.as_view(), name='company-login'),
    
    # Availability endpoints
    path('employees/<int:employee_id>/availability/', 
        EmployeeAvailabilityView.as_view(), 
        name='employee-availability'),
    path('employees/bulk-availability/', 
        BulkAvailabilityView.as_view(), 
        name='bulk-availability'),
    
    # Employee actions
    path('employees/<int:pk>/set_default_availability/', 
        EmployeeViewSet.as_view({'post': 'set_default_availability'}),
        name='set-default-availability'),
    
    path('unavailability/', unavailability_list, name='unavailability-list'),

    path('generate-weekly-roster/', generate_weekly_roster, name='generate-weekly-roster'),
    path('check-availability/', check_employee_availability, name='check-availability'),

    

]