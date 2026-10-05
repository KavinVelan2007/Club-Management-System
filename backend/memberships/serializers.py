from rest_framework import serializers
from .models import Membership, Department, DepartmentMembership


class MembershipSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    role_name = serializers.CharField(source='role.role_name', read_only=True)

    class Meta:
        model = Membership
        fields = [
            'student_id',
            'student_name',
            'club_id',
            'role_id',
            'role_name',
            'joined_at',
            'status',
        ]


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = [
            'department_id',
            'club_id',
            'department_name',
            'description',
            'created_at',
            'status',
        ]


class DepartmentMembershipSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    role_name = serializers.CharField(source='role.role_name', read_only=True)

    class Meta:
        model = DepartmentMembership
        fields = [
            'student_id',
            'student_name',
            'department_id',
            'role_id',
            'role_name',
            'joined_at',
            'status',
        ]
