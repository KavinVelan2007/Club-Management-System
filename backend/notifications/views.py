from datetime import timedelta

from django.utils import timezone

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from announcements.models import Announcement
from authorization import get_actor, managed_club_ids, visible_club_ids
from clubs.models import Club
from events.models import Event
from memberships.models import Membership
from tasks.models import Task, TaskAssignment

from .models import NotificationRead

MAX_RESULTS = 30
ANNOUNCEMENT_WINDOW_DAYS = 30
EVENT_WINDOW_DAYS = 60
COMPLETED_WINDOW_DAYS = 14


def _build_notifications(actor):
    """Derive notifications from real data inside the user's clubs only."""
    now = timezone.now()
    visible = visible_club_ids(actor)
    managed = managed_club_ids(actor)
    club_names = dict(
        Club.objects.filter(club_id__in=visible).values_list('club_id', 'club_name')
    )

    items = []

    def add(key, kind, message, club_id, occurred_at, link):
        items.append({
            'key': key,
            'type': kind,
            'message': message,
            'club_id': club_id,
            'club_name': club_names.get(club_id),
            'occurred_at': occurred_at,
            'link': link,
        })

    # ---- Tasks assigned to me (students) ----------------------------------
    if actor.kind == 'student':
        assignments = (
            TaskAssignment.objects.filter(student_id=actor.id)
            .select_related('task', 'task__club')
        )
        for assignment in assignments:
            task = assignment.task
            if task.club_id not in visible:
                continue
            if task.status == 'COMPLETED':
                if task.deadline < now - timedelta(days=COMPLETED_WINDOW_DAYS):
                    continue
                add(
                    f'task-completed:{task.task_id}',
                    'task_completed',
                    f'Task “{task.title}” was marked completed in {task.club.club_name}.',
                    task.club_id,
                    task.deadline,
                    '/tasks',
                )
            elif task.deadline < now:
                add(
                    f'task:{task.task_id}',
                    'task_overdue',
                    f'Task “{task.title}” is overdue in {task.club.club_name}.',
                    task.club_id,
                    task.deadline,
                    '/tasks',
                )
            else:
                add(
                    f'task:{task.task_id}',
                    'task_assigned',
                    f'You were assigned “{task.title}” in {task.club.club_name}.',
                    task.club_id,
                    assignment.assigned_at or task.created_at or now,
                    '/tasks',
                )

    # ---- Managers: recently completed club tasks --------------------------
    if managed:
        recent_completed = (
            Task.objects.filter(club_id__in=managed, status='COMPLETED')
            .filter(deadline__gte=now - timedelta(days=COMPLETED_WINDOW_DAYS))
            .select_related('club')
        )
        for task in recent_completed:
            add(
                f'task-completed:{task.task_id}',
                'task_completed',
                f'Task “{task.title}” was completed in {task.club.club_name}.',
                task.club_id,
                task.deadline,
                '/tasks',
            )

        # ---- Membership requests waiting for approval ---------------------
        pending = (
            Membership.objects.filter(club_id__in=managed, status='PENDING')
            .select_related('student', 'club')
        )
        for membership in pending:
            add(
                f'membership:{membership.club_id}:{membership.student_id}',
                'member_pending',
                f'{membership.student.name} requested to join {membership.club.club_name}.',
                membership.club_id,
                membership.joined_at or now,
                '/members',
            )

    # ---- New announcements in my clubs ------------------------------------
    announcements = (
        Announcement.objects.filter(
            club_id__in=visible,
            created_at__gte=now - timedelta(days=ANNOUNCEMENT_WINDOW_DAYS),
        )
        .select_related('club')
        .order_by('-created_at')
    )
    for announcement in announcements:
        add(
            f'announcement:{announcement.announcement_id}',
            'announcement',
            f'New announcement “{announcement.title}” in {announcement.club.club_name}.',
            announcement.club_id,
            announcement.created_at or now,
            '/announcements',
        )

    # ---- Upcoming events in my clubs --------------------------------------
    events = (
        Event.objects.filter(
            club_id__in=visible,
            event_date__gte=now,
            event_date__lte=now + timedelta(days=EVENT_WINDOW_DAYS),
        )
        .select_related('club')
        .order_by('event_date')
    )
    for event in events:
        add(
            f'event:{event.event_id}',
            'event',
            f'Upcoming event “{event.event_name}” at {event.venue}.',
            event.club_id,
            event.event_date,
            '/events',
        )

    items.sort(key=lambda item: item['occurred_at'] or now, reverse=True)
    return items[:MAX_RESULTS]


@api_view(['GET'])
def notification_list(request):
    actor = get_actor(request)
    items = _build_notifications(actor)

    read_keys = set(
        NotificationRead.objects.filter(user=request.user).values_list('key', flat=True)
    )
    for item in items:
        item['read'] = item['key'] in read_keys

    return Response({
        'results': items,
        'unread_count': sum(1 for item in items if not item['read']),
    })


@api_view(['POST'])
def notification_mark_read(request):
    """Persist read state for the given notification keys."""
    actor = get_actor(request)

    keys = request.data.get('keys')
    if keys is None and request.data.get('key'):
        keys = [request.data.get('key')]
    if not isinstance(keys, list) or not keys:
        return Response(
            {'error': 'Provide key or a non-empty keys list.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    current_keys = {item['key'] for item in _build_notifications(actor)}
    valid_keys = [str(key) for key in keys if str(key) in current_keys][:100]

    for key in valid_keys:
        NotificationRead.objects.get_or_create(user=request.user, key=key)

    return Response({'marked': valid_keys})


@api_view(['POST'])
def notification_mark_all_read(request):
    actor = get_actor(request)
    current_keys = [item['key'] for item in _build_notifications(actor)]

    for key in current_keys:
        NotificationRead.objects.get_or_create(user=request.user, key=key)

    return Response({'marked': current_keys})