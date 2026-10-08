from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from authorization import (
    CREATE_EVENT,
    MANAGE_EVENT,
    get_actor,
    get_managed_club,
    managed_club_ids,
    next_identifier,
    require_club_permission,
    visible_club_ids,
)

from .models import (
    Event,
    EventDepartment,
    EventRegistration,
    Attendance
)

from .serializers import (
    EventSerializer,
    EventDepartmentSerializer,
    EventRegistrationSerializer,
    AttendanceSerializer
)

VALID_EVENT_STATUSES = {'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'}


def _clean_event_payload(data, partial=False):
    """Validate the shared create/edit payload for events."""
    cleaned = {}
    errors = {}

    for field, max_length in (('event_name', 150), ('venue', 150), ('description', 500)):
        if field in data:
            value = str(data.get(field) or '').strip()
            if not value and field != 'description':
                errors[field] = 'This field is required.'
            elif len(value) > max_length:
                errors[field] = f'Maximum length is {max_length} characters.'
            else:
                cleaned[field] = value
        elif field in ('event_name', 'venue') and not partial:
            errors[field] = 'This field is required.'

    if 'event_date' in data:
        event_date = parse_datetime(str(data.get('event_date') or ''))
        if event_date is None:
            errors['event_date'] = 'A valid date/time is required.'
        else:
            if timezone.is_naive(event_date):
                event_date = timezone.make_aware(event_date)
            cleaned['event_date'] = event_date
    elif not partial:
        errors['event_date'] = 'This field is required.'

    if 'capacity' in data:
        try:
            capacity = int(data.get('capacity'))
            if capacity < 1:
                raise ValueError
            cleaned['capacity'] = capacity
        except (TypeError, ValueError):
            errors['capacity'] = 'Capacity must be a positive whole number.'
    elif not partial:
        errors['capacity'] = 'This field is required.'

    if 'status' in data:
        event_status = str(data.get('status') or '').upper()
        if event_status not in VALID_EVENT_STATUSES:
            errors['status'] = f'Status must be one of {", ".join(sorted(VALID_EVENT_STATUSES))}.'
        else:
            cleaned['status'] = event_status
    elif not partial:
        cleaned['status'] = 'UPCOMING'

    return cleaned, errors


@api_view(['GET'])
def event_list(request):
    actor = get_actor(request)

    events = Event.objects.filter(club_id__in=visible_club_ids(actor))

    club_id = request.GET.get('club')

    if club_id:
        events = events.filter(club_id=club_id)

    serializer = EventSerializer(events, many=True)

    return Response(serializer.data)


@api_view(['GET', 'PATCH', 'DELETE'])
def event_detail(request, event_id):
    actor = get_actor(request)

    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response(
            {'error': 'Event not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        if event.club_id not in visible_club_ids(actor):
            return Response(
                {'detail': 'You do not have access to this event.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return Response(EventSerializer(event).data)

    require_club_permission(actor, event.club, MANAGE_EVENT)

    if request.method == 'DELETE':
        event.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    cleaned, errors = _clean_event_payload(request.data, partial=True)
    if errors:
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)

    for field, value in cleaned.items():
        setattr(event, field, value)
    event.save()

    return Response(EventSerializer(event).data)


@api_view(['POST'])
@transaction.atomic
def event_create(request):
    """Create an event for a managed club — requires CREATE_EVENT (president/faculty)."""
    actor = get_actor(request)

    club_id = request.data.get('club_id')
    if not club_id:
        return Response(
            {'error': 'club_id is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    club = get_managed_club(actor, club_id, CREATE_EVENT)

    cleaned, errors = _clean_event_payload(request.data)
    if errors:
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)

    event = Event(
        event_id=next_identifier(Event, 'event_id', 'E'),
        club_id=club.pk,
        created_at=timezone.now(),
        **cleaned,
    )
    event.save()

    return Response(EventSerializer(event).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def event_department_list(request):

    data = EventDepartment.objects.all()

    serializer = EventDepartmentSerializer(data, many=True)

    return Response(serializer.data)


@api_view(['GET'])
def registration_list(request):
    actor = get_actor(request)

    if actor.kind == 'faculty':
        scope = Q(event__club_id__in=visible_club_ids(actor))
    else:
        # Members see their own registrations; presidents also see their club's.
        scope = Q(student_id=actor.id) | Q(event__club_id__in=managed_club_ids(actor))

    data = EventRegistration.objects.filter(scope)

    event_id = request.GET.get('event')
    student_id = request.GET.get('student')

    if event_id:
        data = data.filter(event_id=event_id)

    if student_id:
        data = data.filter(student_id=student_id)

    serializer = EventRegistrationSerializer(data, many=True)

    return Response(serializer.data)


@api_view(['POST', 'DELETE'])
@transaction.atomic
def registration_detail(request, event_id):
    """Register yourself for an event, or cancel your own registration."""
    actor = get_actor(request)

    if actor.kind != 'student':
        return Response(
            {'detail': 'Only students can register for events.'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response(
            {'error': 'Event not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if event.club_id not in visible_club_ids(actor):
        return Response(
            {'detail': 'You do not have access to this event.'},
            status=status.HTTP_403_FORBIDDEN
        )

    from memberships.models import Membership
    is_member = Membership.objects.filter(
        student_id=actor.id,
        club_id=event.club_id,
        status='ACTIVE',
    ).exists()
    if not is_member:
        return Response(
            {'detail': 'You can only register for events hosted by your clubs.'},
            status=status.HTTP_403_FORBIDDEN
        )

    registration = EventRegistration.objects.filter(
        event_id=event_id,
        student_id=actor.id,
    ).first()

    if request.method == 'DELETE':
        if registration is None or registration.status != 'REGISTERED':
            return Response(
                {'error': 'You are not registered for this event.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        registration.status = 'CANCELLED'
        registration.save()
        return Response(EventRegistrationSerializer(registration).data)

    if registration is not None and registration.status == 'REGISTERED':
        return Response(
            {'error': 'You are already registered for this event.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    confirmed = EventRegistration.objects.filter(
        event_id=event_id,
        status='REGISTERED',
    ).count()
    if confirmed >= event.capacity:
        return Response(
            {'error': 'This event has reached its registration capacity.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if registration is None:
        registration = EventRegistration(
            event_id=event_id,
            student_id=actor.id,
            registered_at=timezone.now(),
            status='REGISTERED',
        )
    else:
        registration.status = 'REGISTERED'
        registration.registered_at = timezone.now()
    registration.save()

    return Response(
        EventRegistrationSerializer(registration).data,
        status=status.HTTP_201_CREATED
    )


@api_view(['GET'])
def attendance_list(request):
    actor = get_actor(request)

    if actor.kind == 'faculty':
        scope = Q(event_id__in=Event.objects.filter(
            club_id__in=visible_club_ids(actor)
        ).values_list('event_id', flat=True))
    else:
        scope = Q(student_id=actor.id)

    data = Attendance.objects.filter(scope)

    event_id = request.GET.get('event')
    student_id = request.GET.get('student')

    if event_id:
        data = data.filter(event_id=event_id)

    if student_id:
        data = data.filter(student_id=student_id)

    serializer = AttendanceSerializer(data, many=True)

    return Response(serializer.data)