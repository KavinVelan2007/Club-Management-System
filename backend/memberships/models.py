from django.db import models


class Membership(models.Model):
    pk = models.CompositePrimaryKey('student', 'club')

    student = models.ForeignKey(
        'authentication.Student',
        on_delete=models.DO_NOTHING,
        db_column='Student_ID'
    )

    club = models.ForeignKey(
        'clubs.Club',
        on_delete=models.DO_NOTHING,
        db_column='Club_ID'
    )

    role = models.ForeignKey(
        'clubs.Role',
        on_delete=models.DO_NOTHING,
        db_column='Role_ID',
        blank=True,
        null=True
    )

    joined_at = models.DateTimeField(
        db_column='Joined_At',
        blank=True,
        null=True
    )

    status = models.CharField(
        db_column='Status',
        max_length=20
    )

    class Meta:
        managed = False
        db_table = 'membership'


class Department(models.Model):
    department_id = models.CharField(
        db_column='Department_ID',
        primary_key=True,
        max_length=20
    )

    club = models.ForeignKey(
        'clubs.Club',
        models.DO_NOTHING,
        db_column='Club_ID'
    )

    department_name = models.CharField(
        db_column='Department_Name',
        max_length=100
    )

    description = models.CharField(
        db_column='Description',
        max_length=255,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        db_column='Created_At',
        blank=True,
        null=True
    )

    status = models.CharField(
        db_column='Status',
        max_length=20
    )

    class Meta:
        managed = False
        db_table = 'department'
        unique_together = (
            ('club', 'department_name'),
        )


class DepartmentMembership(models.Model):
    pk = models.CompositePrimaryKey('student', 'department')
    student = models.ForeignKey(
        'authentication.Student',
        on_delete=models.DO_NOTHING,
        db_column='Student_ID'
    )

    club = models.ForeignKey(
        'clubs.Club',
        on_delete=models.DO_NOTHING,
        db_column='Club_ID',
        blank=True,
        null=True
    )

    department = models.ForeignKey(
        'Department',
        on_delete=models.DO_NOTHING,
        db_column='Department_ID'
    )

    role = models.ForeignKey(
        'clubs.Role',
        on_delete=models.DO_NOTHING,
        db_column='Role_ID',
        blank=True,
        null=True
    )

    joined_at = models.DateTimeField(
        db_column='Joined_At',
        blank=True,
        null=True
    )

    status = models.CharField(
        db_column='Status',
        max_length=20
    )

    class Meta:
        managed = False
        db_table = 'department_membership'