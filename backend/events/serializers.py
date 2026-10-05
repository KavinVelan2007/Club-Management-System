from rest_framework import serializers

from .models import (
    Event,
    EventDepartment,
    EventRegistration,
    Attendance
)


class EventSerializer(serializers.ModelSerializer):
    club_name = serializers.CharField(source='club.club_name', read_only=True)
    class Meta:
        model = Event
        fields = [
            'event_id',
            'club_id',
            'club_name',
            'event_name',
            'description',
            'event_date',
            'venue',
            'capacity',
            'status',
            'created_at',
        ]


class EventDepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventDepartment
        fields = [
            'event_id',
            'department_id',
            'responsibility',
        ]


class EventRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventRegistration
        fields = [
            'event_id',
            'student_id',
            'registered_at',
            'status',
        ]


class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = [
            'event_id',
            'student_id',
            'status',
            'check_in_time',
        ]
