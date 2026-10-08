from django.db import transaction
from django.utils import timezone

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from authorization import (
    MANAGE_CLUB,
    get_actor,
    get_managed_club,
    next_identifier,
    president_student_id,
    require_club_permission,
    visible_club_ids,
)
from .models import Announcement
from .serializers import AnnouncementSerializer


@api_view(['GET'])
def announcement_list(request):
    actor = get_actor(request)

    data = Announcement.objects.select_related('club', 'department', 'event', 'created_by').filter(
        club_id__in=visible_club_ids(actor)
    )

    club_id = request.GET.get('club')
    department_id = request.GET.get('department')
    event_id = request.GET.get('event')

    if club_id:
        data = data.filter(club_id=club_id)

    if department_id:
        data = data.filter(department_id=department_id)

    if event_id:
        data = data.filter(event_id=event_id)

    serializer = AnnouncementSerializer(data, many=True)

    return Response(serializer.data)


def _clean_announcement_payload(data, partial=False):
    cleaned = {}
    errors = {}

    if 'title' in data:
        title = str(data.get('title') or '').strip()
        if not title:
            errors['title'] = 'This field is required.'
        elif len(title) > 150:
            errors['title'] = 'Maximum length is 150 characters.'
        else:
            cleaned['title'] = title
    elif not partial:
        errors['title'] = 'This field is required.'

    if 'content' in data:
        content = str(data.get('content') or '').strip()
        if not content:
            errors['content'] = 'This field is required.'
        elif len(content) > 1000:
            errors['content'] = 'Maximum length is 1000 characters.'
        else:
            cleaned['content'] = content
    elif not partial:
        errors['content'] = 'This field is required.'

    if 'event_id' in data:
        cleaned['event_id'] = data.get('event_id') or None

    return cleaned, errors


@api_view(['POST'])
@transaction.atomic
def announcement_create(request):
    """Post an announcement to a managed club — requires MANAGE_CLUB (president/faculty)."""
    actor = get_actor(request)

    club_id = request.data.get('club_id')
    if not club_id:
        return Response(
            {'error': 'club_id is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    club = get_managed_club(actor, club_id, MANAGE_CLUB)

    cleaned, errors = _clean_announcement_payload(request.data)
    if errors:
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)

    event_id = cleaned.pop('event_id', None)
    if event_id:
        from events.models import Event
        if not Event.objects.filter(event_id=event_id, club_id=club.pk).exists():
            return Response(
                {'event_id': 'The event does not belong to this club.'},
                status=status.HTTP_400_BAD_REQUEST
            )

    if actor.kind == 'student':
        created_by = actor.id
    else:
        created_by = president_student_id(club.pk)
        if created_by is None:
            return Response(
                {'error': 'This club has no active president to own the announcement.'},
                status=status.HTTP_400_BAD_REQUEST
            )

    announcement = Announcement(
        announcement_id=next_identifier(Announcement, 'announcement_id', 'A'),
        club_id=club.pk,
        created_by_id=created_by,
        event_id=event_id,
        created_at=timezone.now(),
        **cleaned,
    )
    announcement.save()

    return Response(
        AnnouncementSerializer(announcement).data,
        status=status.HTTP_201_CREATED
    )


@api_view(['PATCH', 'DELETE'])
@transaction.atomic
def announcement_detail(request, announcement_id):
    """Edit or delete a club announcement — requires MANAGE_CLUB (president/faculty)."""
    actor = get_actor(request)

    try:
        announcement = Announcement.objects.get(pk=announcement_id)
    except Announcement.DoesNotExist:
        return Response(
            {'error': 'Announcement not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    require_club_permission(actor, announcement.club, MANAGE_CLUB)

    if request.method == 'DELETE':
        announcement.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    cleaned, errors = _clean_announcement_payload(request.data, partial=True)
    if errors:
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)
    if not cleaned:
        return Response(
            {'error': 'No updatable fields were provided.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    event_id = cleaned.pop('event_id', None)
    if 'event_id' in request.data:
        if event_id:
            from events.models import Event
            if not Event.objects.filter(event_id=event_id, club_id=announcement.club_id).exists():
                return Response(
                    {'event_id': 'The event does not belong to this club.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        announcement.event_id = event_id

    for field, value in cleaned.items():
        setattr(announcement, field, value)
    announcement.save()

    return Response(AnnouncementSerializer(announcement).data)