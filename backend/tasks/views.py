from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Task, TaskAssignment, TaskSubmission

from .serializers import (
    TaskSerializer,
    TaskAssignmentSerializer,
    TaskSubmissionSerializer
)


@api_view(['GET'])
def task_list(request):

    tasks = Task.objects.all()

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

    try:
        task = Task.objects.get(pk=task_id)
    except Task.DoesNotExist:
        return Response(
            {'error': 'Task not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = TaskSerializer(task)

    return Response(serializer.data)


@api_view(['GET'])
def task_assignment_list(request):

    data = TaskAssignment.objects.all()

    task_id = request.GET.get('task')
    student_id = request.GET.get('student')

    if task_id:
        data = data.filter(task_id=task_id)

    if student_id:
        data = data.filter(student_id=student_id)

    serializer = TaskAssignmentSerializer(data, many=True)

    return Response(serializer.data)


@api_view(['GET'])
def task_submission_list(request):

    data = TaskSubmission.objects.all()

    task_id = request.GET.get('task')
    student_id = request.GET.get('student')

    if task_id:
        data = data.filter(task_id=task_id)

    if student_id:
        data = data.filter(student_id=student_id)

    serializer = TaskSubmissionSerializer(data, many=True)

    return Response(serializer.data)