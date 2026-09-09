from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

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


@api_view(['GET'])
def event_list(request):

    events = Event.objects.all()

    club_id = request.GET.get('club')

    if club_id:
        events = events.filter(club_id=club_id)

    serializer = EventSerializer(events, many=True)

    return Response(serializer.data)


@api_view(['GET'])
def event_detail(request, event_id):

    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response(
            {'error': 'Event not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = EventSerializer(event)

    return Response(serializer.data)


@api_view(['GET'])
def event_department_list(request):

    data = EventDepartment.objects.all()

    serializer = EventDepartmentSerializer(data, many=True)

    return Response(serializer.data)


@api_view(['GET'])
def registration_list(request):

    data = EventRegistration.objects.all()

    event_id = request.GET.get('event')
    student_id = request.GET.get('student')

    if event_id:
        data = data.filter(event_id=event_id)

    if student_id:
        data = data.filter(student_id=student_id)

    serializer = EventRegistrationSerializer(data, many=True)

    return Response(serializer.data)


@api_view(['GET'])
def attendance_list(request):

    data = Attendance.objects.all()

    event_id = request.GET.get('event')
    student_id = request.GET.get('student')

    if event_id:
        data = data.filter(event_id=event_id)

    if student_id:
        data = data.filter(student_id=student_id)

    serializer = AttendanceSerializer(data, many=True)

    return Response(serializer.data)