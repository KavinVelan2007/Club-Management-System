from django.db import models


class Student(models.Model):
    student_id = models.CharField(
        db_column='Student_ID',
        primary_key=True,
        max_length=20
    )
    name = models.CharField(
        db_column='Name',
        max_length=100
    )
    email = models.CharField(
        db_column='Email',
        unique=True,
        max_length=100
    )

    class Meta:
        managed = False
        db_table = 'student'


class Faculty(models.Model):
    faculty_id = models.CharField(
        db_column='Faculty_ID',
        primary_key=True,
        max_length=20
    )
    name = models.CharField(
        db_column='Name',
        max_length=100
    )
    email = models.CharField(
        db_column='Email',
        unique=True,
        max_length=100
    )

    class Meta:
        managed = False
        db_table = 'faculty'