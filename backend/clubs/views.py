from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Club
from .serializers import ClubSerializer


@api_view(['GET'])
def club_list(request):
    clubs = Club.objects.all()

    serializer = ClubSerializer(clubs, many=True)

    return Response(serializer.data)


@api_view(['GET'])
def club_detail(request, club_id):
    try:
        club = Club.objects.get(pk=club_id)
    except Club.DoesNotExist:
        return Response(
            {'error': 'Club not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = ClubSerializer(club)

    return Response(serializer.data)