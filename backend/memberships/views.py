from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import (
    Membership,
    Department,
    DepartmentMembership
)

from .serializers import (
    MembershipSerializer,
    DepartmentSerializer,
    DepartmentMembershipSerializer
)


@api_view(['GET'])
def membership_list(request):

    data = Membership.objects.all()

    club_id = request.GET.get('club')
    student_id = request.GET.get('student')

    if club_id:
        data = data.filter(club_id=club_id)

    if student_id:
        data = data.filter(student_id=student_id)

    serializer = MembershipSerializer(data, many=True)

    return Response(serializer.data)


@api_view(['GET'])
def department_list(request):

    data = Department.objects.all()

    club_id = request.GET.get('club')

    if club_id:
        data = data.filter(club_id=club_id)

    serializer = DepartmentSerializer(data, many=True)

    return Response(serializer.data)


@api_view(['GET'])
def department_membership_list(request):

    data = DepartmentMembership.objects.all()

    department_id = request.GET.get('department')
    student_id = request.GET.get('student')

    if department_id:
        data = data.filter(department_id=department_id)

    if student_id:
        data = data.filter(student_id=student_id)

    serializer = DepartmentMembershipSerializer(data, many=True)

    return Response(serializer.data)