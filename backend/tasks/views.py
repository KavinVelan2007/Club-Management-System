from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from authorization import (
    ASSIGN_TASK,
    CREATE_TASK,
    UPDATE_TASK,
    can_manage_club,
    get_actor,
    get_managed_club,
    managed_club_ids,
    membership_permissions,
    next_identifier,
    president_student_id,
    require_club_permission,
)
from authentication.models import Student
from memberships.models import Membership

from .models import Task, TaskAssignment, TaskSubmission

from .serializers import (
    TaskSerializer,
    TaskAssignmentSerializer,
    TaskSubmissionSerializer
)

VALID_TASK_STATUSES = {'TODO', 'IN_PROGRESS', 'COMPLETED'}
VALID_TASK_PRIORITIES = {'LOW', 'MEDIUM', 'HIGH'}


def _scoped_tasks(actor):
    """Tasks the actor may see: managed clubs (presidents/faculty) plus own assignments."""
    managed = managed_club_ids(actor)
    assigned = TaskAssignment.objects.filter(student_id=actor.id).values_list('task_id', flat=True)
    return Task.objects.filter(Q(club_id__in=managed) | Q(task_id__in=assigned))


def _clean_task_payload(data, partial=False):
    """Validate shared create/edit payload fields for tasks."""
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

    if 'description' in data:
        description = str(data.get('description') or '').strip()
        if len(description) > 500:
            errors['description'] = 'Maximum length is 500 characters.'
        else:
            cleaned['description'] = description or None

    if 'priority' in data:
        priority = str(data.get('priority') or '').upper()
        if priority not in VALID_TASK_PRIORITIES:
            errors['priority'] = 'Priority must be LOW, MEDIUM or HIGH.'
        else:
            cleaned['priority'] = priority
    elif not partial:
        errors['priority'] = 'This field is required.'

    if 'deadline' in data:
        deadline = parse_datetime(str(data.get('deadline') or ''))
        if deadline is None:
            errors['deadline'] = 'A valid date/time is required.'
        else:
            if timezone.is_naive(deadline):
                deadline = timezone.make_aware(deadline)
            cleaned['deadline'] = deadline
    elif not partial:
        errors['deadline'] = 'This field is required.'

    if 'status' in data:
        task_status = str(data.get('status') or '').upper()
        if task_status not in VALID_TASK_STATUSES:
            errors['status'] = 'Status must be TODO, IN_PROGRESS or COMPLETED.'
        else:
            cleaned['status'] = task_status
    elif not partial:
        cleaned['status'] = 'TODO'

    for field in ('department_id', 'event_id'):
        if field in data:
            cleaned[field] = data.get(field) or None

    return cleaned, errors


@api_view(['GET'])
def task_list(request):
    actor = get_actor(request)

    tasks = _scoped_tasks(actor)

    club_id = request.GET.get('club')
    department_id = request.GET.get('department')
    event_id = request.GET.get('event')
    student_id = request.GET.get('student')

    if club_id:
        tasks = tasks.filter(club_id=club_id)

    if department_id:
        tasks = tasks.filter(department_id=department_id)

    if event_id:
        tasks = tasks.filter(event_id=event_id)

    if student_id:
        tasks = tasks.filter(
            taskassignment__student_id=student_id
        )

    serializer = TaskSerializer(tasks, many=True)

    return Response(serializer.data)


@api_view(['GET'])
def task_detail(request, task_id):
    actor = get_actor(request)

    try:
        task = Task.objects.get(pk=task_id)
    except Task.DoesNotExist:
        return Response(
            {'error': 'Task not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if task.task_id not in _scoped_tasks(actor).values_list('task_id', flat=True):
        return Response(
            {'detail': 'You do not have access to this task.'},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = TaskSerializer(task)

    return Response(serializer.data)


@api_view(['POST'])
@transaction.atomic
def task_create(request):
    """Create a task in a managed club and optionally assign members."""
    actor = get_actor(request)

    club_id = request.data.get('club_id')
    if not club_id:
        return Response(
            {'error': 'club_id is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    club = get_managed_club(actor, club_id, CREATE_TASK)

    cleaned, errors = _clean_task_payload(request.data)
    if errors:
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)

    if actor.kind == 'student':
        created_by = actor.id
    else:
        created_by = president_student_id(club.pk)
        if created_by is None:
            return Response(
                {'error': 'This club has no active president to own the task.'},
                status=status.HTTP_400_BAD_REQUEST
            )

    assignee_ids = request.data.get('assignee_ids') or []
    if assignee_ids and not can_manage_club(actor, club, ASSIGN_TASK):
        return Response(
            {'detail': 'You do not have permission to assign tasks.'},
            status=status.HTTP_403_FORBIDDEN
        )

    valid_assignees = []
    for student_id in assignee_ids:
        is_member = Membership.objects.filter(
            student_id=student_id,
            club_id=club.pk,
            status='ACTIVE',
        ).exists()
        if not is_member:
            return Response(
                {'error': f'{student_id} is not an active member of this club.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        valid_assignees.append(student_id)

    task = Task(
        task_id=next_identifier(Task, 'task_id', 'T'),
        club_id=club.pk,
        created_by_id=created_by,
        created_at=timezone.now(),
        **cleaned,
    )
    task.save()

    for student_id in valid_assignees:
        TaskAssignment.objects.create(
            task_id=task.task_id,
            student_id=student_id,
            assigned_by_id=created_by,
            assigned_at=timezone.now(),
        )

    return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)


@api_view(['PATCH'])
@transaction.atomic
def task_update(request, task_id):
    """Edit a task in a managed club — requires CREATE_TASK permission."""
    actor = get_actor(request)

    try:
        task = Task.objects.get(pk=task_id)
    except Task.DoesNotExist:
        return Response(
            {'error': 'Task not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    require_club_permission(actor, task.club, CREATE_TASK)

    cleaned, errors = _clean_task_payload(request.data, partial=True)
    if errors:
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)
    if not cleaned:
        return Response(
            {'error': 'No updatable fields were provided.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    for field, value in cleaned.items():
        setattr(task, field, value)
    task.save()

    return Response(TaskSerializer(task).data)


@api_view(['DELETE'])
@transaction.atomic
def task_delete(request, task_id):
    """Delete a task (and its assignments) from a managed club."""
    actor = get_actor(request)

    try:
        task = Task.objects.get(pk=task_id)
    except Task.DoesNotExist:
        return Response(
            {'error': 'Task not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    require_club_permission(actor, task.club, CREATE_TASK)

    if TaskSubmission.objects.filter(task_id=task.task_id).exists():
        return Response(
            {'error': 'This task has submissions and can only be archived by an administrator.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    TaskAssignment.objects.filter(task_id=task.task_id).delete()
    task.delete()

    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@transaction.atomic
def task_status(request, task_id):
    """Update a task's status — assignees with UPDATE_TASK, or club managers."""
    actor = get_actor(request)

    try:
        task = Task.objects.get(pk=task_id)
    except Task.DoesNotExist:
        return Response(
            {'error': 'Task not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    new_status = str(request.data.get('status') or '').upper()
    if new_status not in VALID_TASK_STATUSES:
        return Response(
            {'error': 'Status must be TODO, IN_PROGRESS or COMPLETED.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    is_assignee = TaskAssignment.objects.filter(
        task_id=task.task_id,
        student_id=actor.id,
    ).exists() if actor.kind == 'student' else False

    if can_manage_club(actor, task.club, CREATE_TASK):
        pass  # Club managers (president/faculty) may update any of their club's tasks.
    elif is_assignee and UPDATE_TASK in membership_permissions(actor.id, task.club_id):
        pass
    else:
        return Response(
            {'detail': 'You can only update the status of tasks assigned to you.'},
            status=status.HTTP_403_FORBIDDEN
        )

    task.status = new_status
    task.save()

    return Response(TaskSerializer(task).data)


@api_view(['GET'])
def task_assignment_list(request):
    actor = get_actor(request)

    data = TaskAssignment.objects.filter(
        task_id__in=_scoped_tasks(actor).values_list('task_id', flat=True)
    )

    task_id = request.GET.get('task')
    student_id = request.GET.get('student')

    if task_id:
        data = data.filter(task_id=task_id)

    if student_id:
        data = data.filter(student_id=student_id)

    serializer = TaskAssignmentSerializer(data, many=True)

    return Response(serializer.data)


@api_view(['POST'])
@transaction.atomic
def task_assignment_create(request, task_id):
    """Assign members to a task — requires ASSIGN_TASK on the task's club."""
    actor = get_actor(request)

    try:
        task = Task.objects.get(pk=task_id)
    except Task.DoesNotExist:
        return Response(
            {'error': 'Task not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    require_club_permission(actor, task.club, ASSIGN_TASK)

    if actor.kind == 'student':
        assigned_by = actor.id
    else:
        assigned_by = president_student_id(task.club_id)
        if assigned_by is None:
            return Response(
                {'error': 'This club has no active president to attribute the assignment to.'},
                status=status.HTTP_400_BAD_REQUEST
            )

    student_ids = request.data.get('student_ids') or []
    if not student_ids:
        return Response(
            {'error': 'student_ids is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    created = []
    for student_id in student_ids:
        is_member = Membership.objects.filter(
            student_id=student_id,
            club_id=task.club_id,
            status='ACTIVE',
        ).exists()
        if not is_member:
            return Response(
                {'error': f'{student_id} is not an active member of this club.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        assignment, was_created = TaskAssignment.objects.get_or_create(
            task_id=task.task_id,
            student_id=student_id,
            defaults={'assigned_by_id': assigned_by, 'assigned_at': timezone.now()},
        )
        if was_created:
            created.append(assignment)

    return Response(
        TaskAssignmentSerializer(created, many=True).data,
        status=status.HTTP_201_CREATED
    )


@api_view(['DELETE'])
@transaction.atomic
def task_assignment_delete(request, task_id, student_id):
    """Unassign a member from a task — requires ASSIGN_TASK on the task's club."""
    actor = get_actor(request)

    try:
        task = Task.objects.get(pk=task_id)
    except Task.DoesNotExist:
        return Response(
            {'error': 'Task not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    require_club_permission(actor, task.club, ASSIGN_TASK)

    assignment = TaskAssignment.objects.filter(
        task_id=task.task_id,
        student_id=student_id,
    ).first()

    if assignment is None:
        return Response(
            {'error': 'Assignment not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    assignment.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def task_submission_list(request):
    actor = get_actor(request)

    data = TaskSubmission.objects.filter(
        task_id__in=_scoped_tasks(actor).values_list('task_id', flat=True)
    )

    task_id = request.GET.get('task')
    student_id = request.GET.get('student')

    if task_id:
        data = data.filter(task_id=task_id)

    if student_id:
        data = data.filter(student_id=student_id)

    serializer = TaskSubmissionSerializer(data, many=True)

    return Response(serializer.data)