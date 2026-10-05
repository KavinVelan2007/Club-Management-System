from rest_framework import serializers

from .models import Task, TaskAssignment, TaskSubmission


class TaskSerializer(serializers.ModelSerializer):
    club_name = serializers.CharField(source='club.club_name', read_only=True)
    department_name = serializers.CharField(source='department.department_name', read_only=True)
    event_name = serializers.CharField(source='event.event_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    class Meta:
        model = Task
        fields = [
            'task_id',
            'club_id',
            'club_name',
            'department_id',
            'department_name',
            'event_id',
            'event_name',
            'created_by_id',
            'created_by_name',
            'title',
            'description',
            'priority',
            'deadline',
            'status',
            'created_at',
        ]


class TaskAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskAssignment
        fields = [
            'task_id',
            'student_id',
            'assigned_by_id',
            'assigned_at',
        ]


class TaskSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskSubmission
        fields = [
            'submission_id',
            'task_id',
            'student_id',
            'submitted_at',
            'file_url',
            'comment',
            'review_status',
            'reviewed_by_id',
            'reviewed_at',
        ]
