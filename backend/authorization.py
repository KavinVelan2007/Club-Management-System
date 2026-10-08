"""Shared, server-side authorization for ClubHub's existing role tables."""

from dataclasses import dataclass

from rest_framework.exceptions import PermissionDenied

from authentication.models import Faculty, Student
from memberships.models import Membership
from clubs.models import Club


# Permission codes from the existing `permission` table.
MANAGE_CLUB = "P010"
ADD_MEMBER = "P001"
REMOVE_MEMBER = "P002"
APPROVE_MEMBER = "P003"
ASSIGN_ROLE = "P004"
CREATE_EVENT = "P005"
MANAGE_EVENT = "P006"
CREATE_TASK = "P007"
ASSIGN_TASK = "P008"
UPDATE_TASK = "P015"


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


def visible_club_ids(actor):
    """Every club the actor may *view* (memberships for students, coordination for faculty)."""
    if actor.kind == "faculty":
        return set(Club.objects.filter(faculty_id=actor.id).values_list("club_id", flat=True))
    return set(
        Membership.objects.filter(student_id=actor.id)
        .exclude(status="REMOVED")
        .values_list("club_id", flat=True)
    )


def managed_club_ids(actor, *permissions):
    """Every club the actor may *manage* (students need MANAGE_CLUB by default)."""
    permissions = permissions or (MANAGE_CLUB,)
    if actor.kind == "faculty":
        return set(Club.objects.filter(faculty_id=actor.id).values_list("club_id", flat=True))
    club_ids = set(
        Membership.objects.filter(student_id=actor.id, status="ACTIVE")
        .values_list("club_id", flat=True)
    )
    return {
        club_id
        for club_id in club_ids
        if can_manage_club(actor, Club(pk=club_id), *permissions)
    }


def require_club_view(actor, club):
    """Raise 403 unless the actor belongs to (or coordinates) the club."""
    if club.pk not in visible_club_ids(actor):
        raise PermissionDenied("You do not have access to this club.")


def get_visible_club(actor, club_id):
    club = Club.objects.filter(pk=club_id).first()
    if club is None:
        raise PermissionDenied("Club not found.")
    require_club_view(actor, club)
    return club


def get_managed_club(actor, club_id, *permissions):
    club = Club.objects.filter(pk=club_id).first()
    if club is None:
        raise PermissionDenied("Club not found.")
    require_club_permission(actor, club, *permissions)
    return club


def club_role(actor, club):
    """Human-readable role label for the actor inside a club."""
    if actor.kind == "faculty":
        return "Faculty coordinator" if club.faculty_id == actor.id else None
    membership = (
        Membership.objects.filter(student_id=actor.id, club_id=club.pk)
        .select_related("role")
        .first()
    )
    if membership is None:
        return None
    if membership.role_id:
        return membership.role.role_name
    return "Member"


def actor_role_label(actor):
    """Top-level role label used by the UI."""
    if actor.kind == "faculty":
        return "Faculty coordinator"
    if managed_club_ids(actor):
        return "Club president"
    roles = set(
        Membership.objects.filter(student_id=actor.id, status="ACTIVE")
        .exclude(role_id=None)
        .values_list("role__role_name", flat=True)
    )
    if "President" in roles:
        return "Club president"
    if "Coordinator" in roles:
        return "Club coordinator"
    return "Club member"


def president_student_id(club_id):
    """The club's ACTIVE president, needed because tasks/announcements are owned by a Student row.

    The existing schema stores `Created_By` / `Assigned_By` as NOT NULL student
    references, so faculty-authored records are attributed to the club president.
    """
    president = (
        Membership.objects.filter(club_id=club_id, status="ACTIVE", role_id="R001")
        .values_list("student_id", flat=True)
        .first()
    )
    return president


def next_identifier(model, field_name, prefix):
    """Continue the database's existing PREFIX001 identifier convention."""
    values = model.objects.values_list(field_name, flat=True)
    numbers = [int(value[len(prefix):]) for value in values if value.startswith(prefix) and value[len(prefix):].isdigit()]
    return f"{prefix}{max(numbers, default=0) + 1:03d}"
