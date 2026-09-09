from django.db import models


class Announcement(models.Model):
    announcement_id = models.CharField(
        db_column='Announcement_ID',
        primary_key=True,
        max_length=20
    )

    club = models.ForeignKey(
        'clubs.Club',
        models.DO_NOTHING,
        db_column='Club_ID'
    )

    department = models.ForeignKey(
        'memberships.Department',
        models.DO_NOTHING,
        db_column='Department_ID',
        blank=True,
        null=True
    )

    event = models.ForeignKey(
        'events.Event',
        models.DO_NOTHING,
        db_column='Event_ID',
        blank=True,
        null=True
    )

    created_by = models.ForeignKey(
        'authentication.Student',
        models.DO_NOTHING,
        db_column='Created_By'
    )

    title = models.CharField(
        db_column='Title',
        max_length=150
    )

    content = models.CharField(
        db_column='Content',
        max_length=1000
    )

    created_at = models.DateTimeField(
        db_column='Created_At',
        blank=True,
        null=True
    )

    class Meta:
        managed = False
        db_table = 'announcement'