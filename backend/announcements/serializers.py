from rest_framework import serializers

from .models import Announcement


class AnnouncementSerializer(serializers.ModelSerializer):
    club_name = serializers.CharField(source='club.club_name', read_only=True)
    department_name = serializers.CharField(source='department.department_name', read_only=True)
    event_name = serializers.CharField(source='event.event_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    class Meta:
        model = Announcement
        fields = [
            'announcement_id',
            'club_id',
            'club_name',
            'department_id',
            'department_name',
            'event_id',
            'event_name',
            'created_by_id',
            'created_by_name',
            'title',
            'content',
            'created_at',
        ]
