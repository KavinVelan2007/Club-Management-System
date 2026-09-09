from django.db import models


class Task(models.Model):
    task_id = models.CharField(
        db_column='Task_ID',
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

    description = models.CharField(
        db_column='Description',
        max_length=500,
        blank=True,
        null=True
    )

    priority = models.CharField(
        db_column='Priority',
        max_length=20
    )

    deadline = models.DateTimeField(
        db_column='Deadline'
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
        db_table = 'task'


class TaskAssignment(models.Model):
    pk = models.CompositePrimaryKey(
        'task',
        'student'
    )

    task = models.ForeignKey(
        Task,
        models.DO_NOTHING,
        db_column='Task_ID'
    )

    student = models.ForeignKey(
        'authentication.Student',
        models.DO_NOTHING,
        db_column='Student_ID'
    )

    assigned_by = models.ForeignKey(
        'authentication.Student',
        models.DO_NOTHING,
        db_column='Assigned_By',
        related_name='task_assignments_created'
    )

    assigned_at = models.DateTimeField(
        db_column='Assigned_At',
        blank=True,
        null=True
    )

    class Meta:
        managed = False
        db_table = 'task_assignment'


class TaskSubmission(models.Model):
    submission_id = models.CharField(
        db_column='Submission_ID',
        primary_key=True,
        max_length=20
    )

    task = models.ForeignKey(
        Task,
        models.DO_NOTHING,
        db_column='Task_ID'
    )

    student = models.ForeignKey(
        'authentication.Student',
        models.DO_NOTHING,
        db_column='Student_ID'
    )

    submitted_at = models.DateTimeField(
        db_column='Submitted_At',
        blank=True,
        null=True
    )

    file_url = models.CharField(
        db_column='File_URL',
        max_length=500,
        blank=True,
        null=True
    )

    comment = models.CharField(
        db_column='Comment',
        max_length=500,
        blank=True,
        null=True
    )

    review_status = models.CharField(
        db_column='Review_Status',
        max_length=20
    )

    reviewed_by = models.ForeignKey(
        'authentication.Student',
        models.DO_NOTHING,
        db_column='Reviewed_By',
        related_name='task_submissions_reviewed',
        blank=True,
        null=True
    )

    reviewed_at = models.DateTimeField(
        db_column='Reviewed_At',
        blank=True,
        null=True
    )

    class Meta:
        managed = False
        db_table = 'task_submission'