from django.shortcuts import render

# Create your views here.
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Count, Q
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from rest_framework_simplejwt.tokens import RefreshToken

from announcements.models import Announcement
from authentication.models import Student, Faculty
from clubs.models import Club
from events.models import Event
from authorization import (
    actor_role_label,
    club_role,
    get_actor,
    managed_club_ids,
    membership_permissions,
    visible_club_ids,
)
from memberships.models import Membership
from tasks.models import Task, TaskAssignment


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        identifier = request.data.get("identifier")
        password = request.data.get("password")
        role = request.data.get("role")

        if not identifier or not password or not role:
            return Response(
                {"error": "Identifier, password and role are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ---------------- STUDENT ----------------

        if role == "student":

            try:
                student = Student.objects.get(
                    student_id=identifier
                )
            except Student.DoesNotExist:
                try:
                    student = Student.objects.get(
                        email=identifier
                    )
                except Student.DoesNotExist:
                    return Response(
                        {"error": "Student not found."},
                        status=status.HTTP_401_UNAUTHORIZED
                    )

            username = f"student_{student.student_id}"
            profile = student

        # ---------------- FACULTY ----------------

        elif role == "faculty":

            try:
                faculty = Faculty.objects.get(
                    faculty_id=identifier
                )
            except Faculty.DoesNotExist:
                try:
                    faculty = Faculty.objects.get(
                        email=identifier
                    )
                except Faculty.DoesNotExist:
                    return Response(
                        {"error": "Faculty not found."},
                        status=status.HTTP_401_UNAUTHORIZED
                    )

            username = f"faculty_{faculty.faculty_id}"
            profile = faculty

        else:
            return Response(
                {"error": "Invalid role."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find Django user
        user = authenticate(
            username=username,
            password=password
        )

        if user is None:
            return Response(
                {"error": "Invalid password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Generate JWT
        refresh = RefreshToken.for_user(user)

        if role == "faculty":
            managed_club_ids = list(Club.objects.filter(faculty_id=profile.pk).values_list("club_id", flat=True))
        else:
            managed_club_ids = [
                membership.club_id
                for membership in profile.membership_set.filter(status="ACTIVE").select_related("role")
                if "P010" in membership_permissions(profile.pk, membership.club_id)
            ]

        return Response({
            "message": "Login successful",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "role": role,
            "user_id": profile.pk,
            "name": profile.name,
            "email": profile.email,
            "managed_club_ids": managed_club_ids,
        })


class MeView(APIView):
    """Role/permission snapshot for the signed-in user, derived from the DB."""

    def get(self, request):
        actor = get_actor(request)
        managed = managed_club_ids(actor)
        visible = visible_club_ids(actor)

        clubs = []
        for club in Club.objects.filter(club_id__in=visible).order_by('club_id'):
            membership = None
            if actor.kind == 'student':
                membership = (
                    Membership.objects.filter(student_id=actor.id, club_id=club.pk)
                    .select_related('role')
                    .first()
                )
            clubs.append({
                'club_id': club.pk,
                'club_name': club.club_name,
                'category': club.category,
                'faculty_id': club.faculty_id,
                'faculty_name': club.faculty.name,
                'role_id': membership.role_id if membership else None,
                'role_name': club_role(actor, club),
                'membership_status': membership.status if membership else None,
                'is_manager': club.pk in managed,
                'permissions': sorted(membership_permissions(actor.id, club.pk))
                if actor.kind == 'student' else [],
            })

        return Response({
            'role': actor.kind,
            'user_id': actor.id,
            'name': actor.profile.name,
            'email': actor.profile.email,
            'role_label': actor_role_label(actor),
            'managed_club_ids': sorted(managed),
            'coordinated_club_ids': sorted(visible) if actor.kind == 'faculty' else [],
            'clubs': clubs,
        })


class ProfileUpdateView(APIView):
    """Update the signed-in user's name and email on their ClubHub profile row."""

    def patch(self, request):
        actor = get_actor(request)
        profile = actor.profile

        name = request.data.get('name')
        email = request.data.get('email')

        if name is None and email is None:
            return Response(
                {'error': 'Provide name or email to update.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        errors = {}
        if name is not None:
            name = str(name).strip()
            if not name or len(name) > 100:
                errors['name'] = 'Name must be between 1 and 100 characters.'
        if email is not None:
            email = str(email).strip().lower()
            if '@' not in email or len(email) > 100:
                errors['email'] = 'Enter a valid email address.'
            else:
                clash = (
                    Student.objects.filter(email=email).exclude(pk=profile.pk)
                    if actor.kind == 'student'
                    else Faculty.objects.filter(email=email).exclude(pk=profile.pk)
                )
                if clash.exists():
                    errors['email'] = 'This email is already in use.'
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        if name is not None:
            profile.name = name
        if email is not None:
            profile.email = email
        profile.save()

        return Response({
            'user_id': profile.pk,
            'name': profile.name,
            'email': profile.email,
        })


class ChangePasswordView(APIView):
    """Change the password of the linked Django auth account."""

    def post(self, request):
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response(
                {'error': 'old_password and new_password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=request.user.username, password=old_password)
        if user is None:
            return Response(
                {'old_password': 'Current password is incorrect.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            validate_password(new_password, user=user)
        except DjangoValidationError as error:
            return Response(
                {'new_password': ' '.join(error.messages)},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()

        return Response({'message': 'Password updated successfully.'})


class DashboardSummaryView(APIView):
    """Role-aware dashboard data, scoped to what this user may see."""

    def get(self, request):
        from tasks.serializers import TaskSerializer

        actor = get_actor(request)
        visible = visible_club_ids(actor)
        managed = managed_club_ids(actor)
        now = timezone.now()

        clubs = list(Club.objects.filter(club_id__in=visible).order_by('club_id'))

        member_counts = {
            row['club_id']: row['total']
            for row in Membership.objects.filter(club_id__in=visible)
            .exclude(status='REMOVED')
            .values('club_id')
            .annotate(total=Count('student_id'))
        }

        if actor.kind == 'faculty':
            task_scope = Task.objects.filter(club_id__in=managed)
        else:
            task_scope = Task.objects.filter(
                Q(club_id__in=managed) | Q(taskassignment__student_id=actor.id)
            )
        task_scope = task_scope.distinct()

        events = Event.objects.filter(
            club_id__in=visible, event_date__gte=now
        ).select_related('club').order_by('event_date')
        announcements = Announcement.objects.filter(
            club_id__in=visible
        ).select_related('club').order_by('-created_at')

        total_tasks = task_scope.count()
        completed_tasks = task_scope.filter(status='COMPLETED').count()
        open_tasks = total_tasks - completed_tasks

        pending_members = 0
        if managed:
            pending_members = Membership.objects.filter(
                club_id__in=managed, status='PENDING'
            ).count()

        focus_tasks = (
            task_scope.exclude(status='COMPLETED')
            .select_related('club', 'department', 'event', 'created_by')
            .order_by('deadline')[:6]
        )

        return Response({
            'role': actor.kind,
            'role_label': actor_role_label(actor),
            'stats': {
                'clubs': len(clubs),
                'members': sum(member_counts.values()),
                'upcoming_events': events.count(),
                'open_tasks': open_tasks,
                'completed_tasks': completed_tasks,
                'total_tasks': total_tasks,
                'announcements': announcements.count(),
                'pending_members': pending_members,
            },
            'progress': {
                'completed': completed_tasks,
                'total': total_tasks,
                'percent': round((completed_tasks / total_tasks) * 100) if total_tasks else 0,
            },
            'clubs_summary': [
                {
                    'club_id': club.pk,
                    'club_name': club.club_name,
                    'category': club.category,
                    'role_name': club_role(actor, club),
                    'member_count': member_counts.get(club.pk, 0),
                    'is_manager': club.pk in managed,
                }
                for club in clubs
            ],
            'upcoming_events': [
                {
                    'event_id': event.pk,
                    'event_name': event.event_name,
                    'event_date': event.event_date,
                    'venue': event.venue,
                    'status': event.status,
                    'club_id': event.club_id,
                    'club_name': event.club.club_name,
                }
                for event in events[:6]
            ],
            'focus_tasks': TaskSerializer(focus_tasks, many=True).data,
            'recent_announcements': [
                {
                    'announcement_id': announcement.pk,
                    'title': announcement.title,
                    'content': announcement.content,
                    'created_at': announcement.created_at,
                    'club_id': announcement.club_id,
                    'club_name': announcement.club.club_name,
                }
                for announcement in announcements[:5]
            ],
        })
