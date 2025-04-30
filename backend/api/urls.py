from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CompanyViewSet, DepartmentViewSet, EmployeeViewSet,
    ShiftViewSet, RosterViewSet,
    NotificationViewSet, CompanySignupView, CompanyLoginView, UnavailabilityViewSet, CompanyDashboardView
)

router = DefaultRouter()
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'shifts', ShiftViewSet, basename='shift')
router.register(r'rosters', RosterViewSet, basename='roster')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'unavailabilities', UnavailabilityViewSet, basename='unavailability')

urlpatterns = [
    path('', include(router.urls)),
    
    # Authentication
    path('signup/', CompanySignupView.as_view(), name='company-signup'),
    path('login/', CompanyLoginView.as_view(), name='company-login'),
     path('dashboard/<int:company_id>/', CompanyDashboardView.as_view(), name='company-dashboard'),
]