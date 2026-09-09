from rest_framework import serializers
from .models import Club


class ClubSerializer(serializers.ModelSerializer):
    class Meta:
        model = Club
        fields = [
            'club_id',
            'club_name',
            'description',
            'category',
            'faculty_id',
            'status',
        ]