from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CompanyViewSet, DepartmentViewSet, EmployeeViewSet, ShiftViewSet,
    AvailabilityViewSet, UnavailabilityViewSet, RosterViewSet, NotificationViewSet,
    CompanySignupView, CompanyLoginView
)

router = DefaultRouter()
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'shifts', ShiftViewSet, basename='shift')
router.register(r'availabilities', AvailabilityViewSet, basename='availability')
router.register(r'unavailabilities', UnavailabilityViewSet, basename='unavailability')
router.register(r'rosters', RosterViewSet, basename='roster')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
    path('signup/', CompanySignupView.as_view(), name='company-signup'),
    path('login/', CompanyLoginView.as_view(), name='company-login'),
]
