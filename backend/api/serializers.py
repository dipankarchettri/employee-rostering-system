from rest_framework import serializers
from .models import Company, Department, Employee, Shift, Availability, Roster, Notification

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name', 'email', 'created_at']
        extra_kwargs = {
            'password_hash': {'write_only': True},
            'email': {'required': True}
        }

class DepartmentSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    num_employees = serializers.IntegerField
    class Meta:
        model = Department
        fields = ['id', 'company', 'company_name', 'name', 'description','num_employees']
        extra_kwargs = {
            'company': {'required': True}
        }

class EmployeeSerializer(serializers.ModelSerializer):
    departments = serializers.StringRelatedField(many=True, read_only=True)
    
    class Meta:
        model = Employee
        fields = [
            'id', 'company', 'name', 'contact_info', 
            'employment_type', 'created_at', 'departments'
        ]
        extra_kwargs = {
            'company': {'required': True}
        }

class ShiftSerializer(serializers.ModelSerializer):
    shift_type_display = serializers.CharField(source='get_shift_type_display', read_only=True)
    day_of_week_display = serializers.CharField(source='get_day_of_week_display', read_only=True)
    
    class Meta:
        model = Shift
        fields = [
            'id', 'company', 'department', 'day_of_week', 
            'day_of_week_display', 'shift_type', 'shift_type_display',
            'start_time', 'end_time'
        ]
        extra_kwargs = {
            'start_time': {'read_only': True},
            'end_time': {'read_only': True}
        }

class AvailabilitySerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    company = serializers.PrimaryKeyRelatedField(source='employee.company', read_only=True)
    
    class Meta:
        model = Availability
        fields = [
            'id', 'employee', 'employee_name', 'company',
            'shift_type', 'day_of_week', 'is_available', 'reason'
        ]
        extra_kwargs = {
            'employee': {'required': True}
        }

class RosterSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    shift_details = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Roster
        fields = [
            'id', 'company', 'employee', 'employee_name',
            'shift', 'shift_details', 'date',
            'is_conflict', 'assigned_manually'
        ]
    
    def get_shift_details(self, obj):
        return {
            'department': obj.shift.department.name,
            'day_of_week': obj.shift.get_day_of_week_display(),
            'shift_type': obj.shift.get_shift_type_display(),
            'start_time': obj.shift.start_time,
            'end_time': obj.shift.end_time
        }

class NotificationSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    shift_details = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'employee', 'employee_name', 'shift',
            'shift_details', 'message', 'email_sent', 'created_at'
        ]
    
    def get_shift_details(self, obj):
        return {
            'department': obj.shift.department.name,
            'day_of_week': obj.shift.get_day_of_week_display(),
            'shift_type': obj.shift.get_shift_type_display()
        }