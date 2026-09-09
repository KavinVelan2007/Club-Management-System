from rest_framework import serializers
from .models import Membership, Department, DepartmentMembership


class MembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Membership
        fields = [
            'student_id',
            'club_id',
            'role_id',
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
    class Meta:
        model = DepartmentMembership
        fields = [
            'student_id',
            'department_id',
            'role_id',
            'joined_at',
            'status',
        ]