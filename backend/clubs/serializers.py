from rest_framework import serializers
from .models import Club


class ClubSerializer(serializers.ModelSerializer):
    faculty_name = serializers.CharField(source='faculty.name', read_only=True)

    class Meta:
        model = Club
        fields = [
            'club_id',
            'club_name',
            'description',
            'category',
            'faculty_id',
            'faculty_name',
            'status',
        ]
