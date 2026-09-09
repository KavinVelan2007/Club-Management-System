from rest_framework import serializers

from .models import Announcement


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = [
            'announcement_id',
            'club_id',
            'department_id',
            'event_id',
            'created_by_id',
            'title',
            'content',
            'created_at',
        ]