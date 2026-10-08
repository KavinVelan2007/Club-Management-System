from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from authorization import (
    MANAGE_CLUB,
    get_actor,
    require_club_permission,
    visible_club_ids,
)
from .models import Club
from .serializers import ClubSerializer


@api_view(['GET'])
def club_list(request):
    actor = get_actor(request)
    clubs = Club.objects.filter(club_id__in=visible_club_ids(actor))

    serializer = ClubSerializer(clubs, many=True)

    return Response(serializer.data)


@api_view(['GET'])
def club_detail(request, club_id):
    actor = get_actor(request)
    try:
        club = Club.objects.get(pk=club_id)
    except Club.DoesNotExist:
        return Response(
            {'error': 'Club not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if club.club_id not in visible_club_ids(actor):
        return Response(
            {'detail': 'You do not have access to this club.'},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = ClubSerializer(club)

    return Response(serializer.data)


@api_view(['PATCH'])
def club_update(request, club_id):
    """Edit club information — requires MANAGE_CLUB (president) or faculty coordination."""
    actor = get_actor(request)
    try:
        club = Club.objects.get(pk=club_id)
    except Club.DoesNotExist:
        return Response(
            {'error': 'Club not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    require_club_permission(actor, club, MANAGE_CLUB)

    allowed_fields = ('club_name', 'description', 'category', 'status')
    updated = False
    for field in allowed_fields:
        if field in request.data:
            value = request.data.get(field)
            if value is None or not str(value).strip():
                return Response(
                    {field: 'This field cannot be empty.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            setattr(club, field, str(value).strip())
            updated = True

    if not updated:
        return Response(
            {'error': 'No updatable fields were provided.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        club.full_clean(exclude=['created_at'])
    except Exception as error:
        return Response(
            {'error': str(error)},
            status=status.HTTP_400_BAD_REQUEST
        )

    club.save()

    return Response(ClubSerializer(club).data)