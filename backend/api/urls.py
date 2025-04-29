from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CompanyViewSet, DepartmentViewSet, EmployeeViewSet,
    ShiftViewSet, RosterViewSet,
    NotificationViewSet, CompanySignupView, CompanyLoginView, UnavailabilityViewSet
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
    
    # Custom roster endpoints (added even though RosterViewSet is registered)
    path('rosters/generate-weekly-roster/', 
         RosterViewSet.as_view({'get': 'generate_weekly_roster'}), 
         name='generate-weekly-roster'),
    path('rosters/weekly-roster/', 
         RosterViewSet.as_view({'get': 'weekly_roster'}), 
         name='weekly-roster'),
    path('rosters/<int:pk>/assign_manually/', 
         RosterViewSet.as_view({'post': 'assign_manually'}), 
         name='assign-manually'),
]