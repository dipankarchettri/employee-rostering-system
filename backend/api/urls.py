from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, DepartmentViewSet, EmployeeViewSet, ShiftViewSet, AvailabilityViewSet, UnavailabilityViewSet, RosterViewSet, NotificationViewSet

router = DefaultRouter()
router.register(r'companies', CompanyViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'employees', EmployeeViewSet)
router.register(r'shifts', ShiftViewSet)
router.register(r'availabilities', AvailabilityViewSet)
router.register(r'unavailabilities', UnavailabilityViewSet)
router.register(r'rosters', RosterViewSet)
router.register(r'notifications', NotificationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
