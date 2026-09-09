from rest_framework import serializers

from .models import Task, TaskAssignment, TaskSubmission


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'task_id',
            'club_id',
            'department_id',
            'event_id',
            'created_by_id',
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