"""Shared, server-side authorization for ClubHub's existing role tables."""

from dataclasses import dataclass

from rest_framework.exceptions import PermissionDenied

from authentication.models import Faculty, Student
from memberships.models import Membership


@dataclass(frozen=True)
class Actor:
    kind: str
    profile: object

    @property
    def id(self):
        return self.profile.pk


def get_actor(request):
    """Resolve the authenticated Django account back to its ClubHub profile."""
    username = request.user.username
    if username.startswith("student_"):
        return Actor("student", Student.objects.get(pk=username.removeprefix("student_")))
    if username.startswith("faculty_"):
        return Actor("faculty", Faculty.objects.get(pk=username.removeprefix("faculty_")))
    raise PermissionDenied("This account is not linked to a ClubHub profile.")


def membership_permissions(student_id, club_id):
    membership = Membership.objects.filter(
        student_id=student_id,
        club_id=club_id,
        status="ACTIVE",
    ).select_related("role").first()
    if not membership or not membership.role_id:
        return set()
    return set(membership.role.rolepermission_set.values_list("permission_id", flat=True))


def can_manage_club(actor, club, *permissions):
    """Faculty manage only their coordinated club; students use DB role permissions."""
    if actor.kind == "faculty":
        return club.faculty_id == actor.id
    granted = membership_permissions(actor.id, club.pk)
    return all(permission in granted for permission in permissions)


def require_club_permission(actor, club, *permissions):
    if not can_manage_club(actor, club, *permissions):
        raise PermissionDenied("You do not have permission to manage this club.")


def active_member(student_id, club_id):
    return Membership.objects.filter(student_id=student_id, club_id=club_id, status="ACTIVE").exists()


def next_identifier(model, field_name, prefix):
    """Continue the database's existing PREFIX001 identifier convention."""
    values = model.objects.values_list(field_name, flat=True)
    numbers = [int(value[len(prefix):]) for value in values if value.startswith(prefix) and value[len(prefix):].isdigit()]
    return f"{prefix}{max(numbers, default=0) + 1:03d}"
