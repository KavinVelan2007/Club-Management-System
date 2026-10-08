from django.db import transaction
from django.utils import timezone

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from authorization import (
    ADD_MEMBER,
    APPROVE_MEMBER,
    ASSIGN_ROLE,
    REMOVE_MEMBER,
    get_actor,
    get_managed_club,
    managed_club_ids,
    require_club_permission,
    visible_club_ids,
)
from authentication.models import Student
from clubs.models import Role

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

VALID_MEMBERSHIP_STATUSES = {'ACTIVE', 'PENDING'}


def _active_president_exists(club_id, exclude_student_id=None):
    queryset = Membership.objects.filter(
        club_id=club_id,
        role_id='R001',
        status='ACTIVE',
    )
    if exclude_student_id:
        queryset = queryset.exclude(student_id=exclude_student_id)
    return queryset.exists()


@api_view(['GET', 'POST'])
def membership_list(request):
    if request.method == 'POST':
        return _membership_create(request)

    actor = get_actor(request)

    data = Membership.objects.select_related('student', 'role').filter(
        club_id__in=visible_club_ids(actor)
    ).exclude(status='REMOVED')

    club_id = request.GET.get('club')
    student_id = request.GET.get('student')

    if club_id:
        data = data.filter(club_id=club_id)

    if student_id:
        data = data.filter(student_id=student_id)

    serializer = MembershipSerializer(data, many=True)

    return Response(serializer.data)


def _membership_create(request):
    """Add a member to a managed club — requires ADD_MEMBER (president/faculty)."""
    actor = get_actor(request)

    club_id = request.data.get('club_id')
    student_id = request.data.get('student_id')

    if not club_id or not student_id:
        return Response(
            {'error': 'club_id and student_id are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    club = get_managed_club(actor, club_id, ADD_MEMBER)

    if not Student.objects.filter(pk=student_id).exists():
        return Response(
            {'error': 'Student not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    existing = Membership.objects.filter(club_id=club_id, student_id=student_id).first()
    if existing is not None and existing.status != 'REMOVED':
        return Response(
            {'error': 'This student already has a membership record for the club.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    role_id = request.data.get('role_id') or 'R003'
    if not Role.objects.filter(pk=role_id).exists():
        return Response(
            {'error': 'Role not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    if role_id != 'R003':
        require_club_permission(actor, club, ASSIGN_ROLE)

    member_status = str(request.data.get('status') or 'ACTIVE').upper()
    if member_status not in VALID_MEMBERSHIP_STATUSES:
        return Response(
            {'error': 'Status must be ACTIVE or PENDING.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if existing is not None:
        # Re-join: reactivate the previously removed membership row.
        membership = existing
        membership.role_id = role_id
        membership.status = member_status
        membership.joined_at = timezone.now()
    else:
        membership = Membership(
            club_id=club_id,
            student_id=student_id,
            role_id=role_id,
            status=member_status,
            joined_at=timezone.now(),
        )
    membership.save()

    return Response(
        MembershipSerializer(membership).data,
        status=status.HTTP_201_CREATED
    )


@api_view(['PATCH', 'DELETE'])
@transaction.atomic
def membership_detail(request, club_id, student_id):
    """Approve / re-role / remove a member of a managed club."""
    actor = get_actor(request)

    membership = Membership.objects.filter(
        club_id=club_id,
        student_id=student_id
    ).select_related('role').first()

    if membership is None:
        return Response(
            {'error': 'Membership not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'DELETE':
        require_club_permission(actor, membership.club, REMOVE_MEMBER)
        if membership.role_id == 'R001' and not _active_president_exists(club_id, exclude_student_id=student_id):
            return Response(
                {'error': 'Assign another president before removing the current one.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        # Soft-remove: the schema's FK from department_membership restricts hard
        # deletes, and the membership table supports a REMOVED status.
        membership.status = 'REMOVED'
        membership.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    new_status = request.data.get('status')
    new_role = request.data.get('role_id')

    if new_status is None and new_role is None:
        return Response(
            {'error': 'Provide status or role_id to update.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if new_status is not None:
        require_club_permission(actor, membership.club, APPROVE_MEMBER)
        new_status = str(new_status).upper()
        if new_status not in VALID_MEMBERSHIP_STATUSES:
            return Response(
                {'error': 'Status must be ACTIVE or PENDING.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        membership.status = new_status

    if new_role is not None:
        require_club_permission(actor, membership.club, ASSIGN_ROLE)
        if not Role.objects.filter(pk=new_role).exists():
            return Response(
                {'error': 'Role not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        if membership.role_id == 'R001' and new_role != 'R001' and not _active_president_exists(club_id, exclude_student_id=student_id):
            return Response(
                {'error': 'Assign another president before changing the current one.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        membership.role_id = new_role

    membership.save()
    membership.refresh_from_db()

    return Response(MembershipSerializer(membership).data)


@api_view(['GET'])
def role_list(request):
    """Role catalogue for member management UIs."""
    get_actor(request)
    return Response(
        list(Role.objects.order_by('role_id').values('role_id', 'role_name', 'description'))
    )


@api_view(['GET'])
def student_directory(request):
    """Searchable student directory — only for users who can add members somewhere."""
    actor = get_actor(request)

    if not managed_club_ids(actor, ADD_MEMBER):
        return Response(
            {'detail': 'You do not have permission to browse the student directory.'},
            status=status.HTTP_403_FORBIDDEN
        )

    students = Student.objects.all().order_by('student_id')
    search = request.GET.get('search')
    if search:
        students = students.filter(name__icontains=search) | students.filter(student_id__icontains=search)

    return Response(
        list(students.values('student_id', 'name', 'email')[:50])
    )


@api_view(['GET'])
def department_list(request):
    actor = get_actor(request)

    data = Department.objects.filter(club_id__in=visible_club_ids(actor))

    club_id = request.GET.get('club')

    if club_id:
        data = data.filter(club_id=club_id)

    serializer = DepartmentSerializer(data, many=True)

    return Response(serializer.data)


@api_view(['GET'])
def department_membership_list(request):
    actor = get_actor(request)

    data = DepartmentMembership.objects.filter(club_id__in=visible_club_ids(actor))

    department_id = request.GET.get('department')
    student_id = request.GET.get('student')

    if department_id:
        data = data.filter(department_id=department_id)

    if student_id:
        data = data.filter(student_id=student_id)

    serializer = DepartmentMembershipSerializer(data, many=True)

    return Response(serializer.data)