from rest_framework import serializers
from .models import Company, Department, Employee, Shift,  Roster, Notification, Unavailability

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
    day_of_week = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()  # Add this for backward compatibility
    
    class Meta:
        model = Shift
        fields = '__all__'
    
    def get_day_of_week(self, obj):
        return obj.start_time.strftime('%A').lower()
        
    def get_date(self, obj):
        return obj.start_time.date()  # Extract date from DateTimeField
        
class UnavailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Unavailability
        fields = '__all__'  # Includes all fields
        extra_kwargs = {
            'employee': {'required': True}  # Force employee to be provided
        }

    def validate(self, data):
        if data['end'] <= data['start']:
            raise serializers.ValidationError("End time must be after start time")
        return data


class RosterSerializer(serializers.ModelSerializer):
    shift_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Roster
        fields = '__all__'
    
    def get_shift_details(self, obj):
        return {
            'id': obj.shift.id,
            'date': obj.shift.start_time.date(),  # Changed from date to start_time.date()
            'day_of_week': obj.shift.start_time.strftime('%A').lower(),  # Changed here
            'start_time': obj.shift.start_time.time(),  # Get time component
            'end_time': obj.shift.end_time.time(),     # Get time component
            'department': obj.shift.department_id,
            'shift_type': obj.shift.get_shift_type_display()
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
            'date': obj.shift.start_time.date().strftime('%Y-%m-%d'),  # Changed here
            'shift_type': obj.shift.get_shift_type_display()
        }
