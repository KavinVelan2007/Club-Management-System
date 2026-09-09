from django.db import models


class Event(models.Model):
    event_id = models.CharField(
        db_column='Event_ID',
        primary_key=True,
        max_length=20
    )

    club = models.ForeignKey(
        'clubs.Club',
        models.DO_NOTHING,
        db_column='Club_ID'
    )

    event_name = models.CharField(
        db_column='Event_Name',
        max_length=150
    )

    description = models.CharField(
        db_column='Description',
        max_length=500,
        blank=True,
        null=True
    )

    event_date = models.DateTimeField(
        db_column='Event_Date'
    )

    venue = models.CharField(
        db_column='Venue',
        max_length=150
    )

    capacity = models.IntegerField(
        db_column='Capacity'
    )

    status = models.CharField(
        db_column='Status',
        max_length=20
    )

    created_at = models.DateTimeField(
        db_column='Created_At',
        blank=True,
        null=True
    )

    class Meta:
        managed = False
        db_table = 'event'


class EventDepartment(models.Model):
    pk = models.CompositePrimaryKey(
        'event',
        'department'
    )

    event = models.ForeignKey(
        Event,
        models.DO_NOTHING,
        db_column='Event_ID'
    )

    department = models.ForeignKey(
        'memberships.Department',
        models.DO_NOTHING,
        db_column='Department_ID'
    )

    responsibility = models.CharField(
        db_column='Responsibility',
        max_length=255,
        blank=True,
        null=True
    )

    class Meta:
        managed = False
        db_table = 'event_department'


class EventRegistration(models.Model):
    pk = models.CompositePrimaryKey(
        'event',
        'student'
    )

    event = models.ForeignKey(
        Event,
        models.DO_NOTHING,
        db_column='Event_ID'
    )

    student = models.ForeignKey(
        'authentication.Student',
        models.DO_NOTHING,
        db_column='Student_ID'
    )

    registered_at = models.DateTimeField(
        db_column='Registered_At',
        blank=True,
        null=True
    )

    status = models.CharField(
        db_column='Status',
        max_length=20
    )

    class Meta:
        managed = False
        db_table = 'event_registration'

class Attendance(models.Model):
    pk = models.CompositePrimaryKey('event_id', 'student_id')

    event_id = models.CharField(
        db_column='Event_ID',
        max_length=20
    )

    student_id = models.CharField(
        db_column='Student_ID',
        max_length=20
    )

    status = models.CharField(
        db_column='Status',
        max_length=20
    )

    check_in_time = models.DateTimeField(
        db_column='Check_In_Time',
        blank=True,
        null=True
    )

    class Meta:
        managed = False
        db_table = 'attendance'