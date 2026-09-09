# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models



class Announcement(models.Model):
    announcement_id = models.CharField(db_column='Announcement_ID', primary_key=True, max_length=20)  # Field name made lowercase.
    club = models.ForeignKey('Club', models.DO_NOTHING, db_column='Club_ID')  # Field name made lowercase.
    department = models.ForeignKey('Department', models.DO_NOTHING, db_column='Department_ID', blank=True, null=True)  # Field name made lowercase.
    event = models.ForeignKey('Event', models.DO_NOTHING, db_column='Event_ID', blank=True, null=True)  # Field name made lowercase.
    created_by = models.ForeignKey('Student', models.DO_NOTHING, db_column='Created_By')  # Field name made lowercase.
    title = models.CharField(db_column='Title', max_length=150)  # Field name made lowercase.
    content = models.CharField(db_column='Content', max_length=1000)  # Field name made lowercase.
    created_at = models.DateTimeField(db_column='Created_At', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'announcement'


class Attendance(models.Model):
    pk = models.CompositePrimaryKey('Event_ID', 'Student_ID')
    event = models.ForeignKey('EventRegistration', models.DO_NOTHING, db_column='Event_ID')  # Field name made lowercase.
    student = models.ForeignKey('EventRegistration', models.DO_NOTHING, db_column='Student_ID', to_field='Student_ID', related_name='attendance_student_set')  # Field name made lowercase.
    status = models.CharField(db_column='Status', max_length=20)  # Field name made lowercase.
    check_in_time = models.DateTimeField(db_column='Check_In_Time', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'attendance'


class Club(models.Model):
    club_id = models.CharField(db_column='Club_ID', primary_key=True, max_length=20)  # Field name made lowercase.
    club_name = models.CharField(db_column='Club_Name', unique=True, max_length=100)  # Field name made lowercase.
    description = models.CharField(db_column='Description', max_length=500, blank=True, null=True)  # Field name made lowercase.
    category = models.CharField(db_column='Category', max_length=50)  # Field name made lowercase.
    faculty = models.ForeignKey('Faculty', models.DO_NOTHING, db_column='Faculty_ID')  # Field name made lowercase.
    created_at = models.DateTimeField(db_column='Created_At', blank=True, null=True)  # Field name made lowercase.
    status = models.CharField(db_column='Status', max_length=20)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'club'


class Department(models.Model):
    department_id = models.CharField(db_column='Department_ID', primary_key=True, max_length=20)  # Field name made lowercase.
    club = models.ForeignKey(Club, models.DO_NOTHING, db_column='Club_ID')  # Field name made lowercase.
    department_name = models.CharField(db_column='Department_Name', max_length=100)  # Field name made lowercase.
    description = models.CharField(db_column='Description', max_length=255, blank=True, null=True)  # Field name made lowercase.
    created_at = models.DateTimeField(db_column='Created_At', blank=True, null=True)  # Field name made lowercase.
    status = models.CharField(db_column='Status', max_length=20)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'department'
        unique_together = (('club', 'department_name'), ('department_id', 'club'), ('department_id', 'club'),)


class DepartmentMembership(models.Model):
    pk = models.CompositePrimaryKey('Student_ID', 'Department_ID')
    student = models.ForeignKey('Membership', models.DO_NOTHING, db_column='Student_ID')  # Field name made lowercase.
    club = models.ForeignKey(Department, models.DO_NOTHING, db_column='Club_ID', to_field='Club_ID', blank=True, null=True)  # Field name made lowercase.
    department = models.ForeignKey(Department, models.DO_NOTHING, db_column='Department_ID', related_name='departmentmembership_department_set')  # Field name made lowercase.
    role = models.ForeignKey('Role', models.DO_NOTHING, db_column='Role_ID', blank=True, null=True)  # Field name made lowercase.
    joined_at = models.DateTimeField(db_column='Joined_At', blank=True, null=True)  # Field name made lowercase.
    status = models.CharField(db_column='Status', max_length=20)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'department_membership'


class Event(models.Model):
    event_id = models.CharField(db_column='Event_ID', primary_key=True, max_length=20)  # Field name made lowercase.
    club = models.ForeignKey(Club, models.DO_NOTHING, db_column='Club_ID')  # Field name made lowercase.
    event_name = models.CharField(db_column='Event_Name', max_length=150)  # Field name made lowercase.
    description = models.CharField(db_column='Description', max_length=500, blank=True, null=True)  # Field name made lowercase.
    event_date = models.DateTimeField(db_column='Event_Date')  # Field name made lowercase.
    venue = models.CharField(db_column='Venue', max_length=150)  # Field name made lowercase.
    capacity = models.IntegerField(db_column='Capacity')  # Field name made lowercase.
    status = models.CharField(db_column='Status', max_length=20)  # Field name made lowercase.
    created_at = models.DateTimeField(db_column='Created_At', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'event'


class EventDepartment(models.Model):
    pk = models.CompositePrimaryKey('Event_ID', 'Department_ID')
    event = models.ForeignKey(Event, models.DO_NOTHING, db_column='Event_ID')  # Field name made lowercase.
    department = models.ForeignKey(Department, models.DO_NOTHING, db_column='Department_ID')  # Field name made lowercase.
    responsibility = models.CharField(db_column='Responsibility', max_length=255, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'event_department'


class EventRegistration(models.Model):
    pk = models.CompositePrimaryKey('Event_ID', 'Student_ID')
    event = models.ForeignKey(Event, models.DO_NOTHING, db_column='Event_ID')  # Field name made lowercase.
    student = models.ForeignKey('Student', models.DO_NOTHING, db_column='Student_ID')  # Field name made lowercase.
    registered_at = models.DateTimeField(db_column='Registered_At', blank=True, null=True)  # Field name made lowercase.
    status = models.CharField(db_column='Status', max_length=20)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'event_registration'


class Faculty(models.Model):
    faculty_id = models.CharField(db_column='Faculty_ID', primary_key=True, max_length=20)  # Field name made lowercase.
    name = models.CharField(db_column='Name', max_length=100)  # Field name made lowercase.
    email = models.CharField(db_column='Email', unique=True, max_length=100)  # Field name made lowercase.
    phone = models.CharField(db_column='Phone', max_length=15, blank=True, null=True)  # Field name made lowercase.
    school = models.CharField(db_column='School', max_length=50)  # Field name made lowercase.
    department = models.CharField(db_column='Department', max_length=100)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'faculty'


class Membership(models.Model):
    pk = models.CompositePrimaryKey('Student_ID', 'Club_ID')
    student = models.ForeignKey('Student', models.DO_NOTHING, db_column='Student_ID')  # Field name made lowercase.
    club = models.ForeignKey(Club, models.DO_NOTHING, db_column='Club_ID')  # Field name made lowercase.
    role = models.ForeignKey('Role', models.DO_NOTHING, db_column='Role_ID', blank=True, null=True)  # Field name made lowercase.
    joined_at = models.DateTimeField(db_column='Joined_At', blank=True, null=True)  # Field name made lowercase.
    status = models.CharField(db_column='Status', max_length=20)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'membership'


class Permission(models.Model):
    permission_id = models.CharField(db_column='Permission_ID', primary_key=True, max_length=30)  # Field name made lowercase.
    permission_name = models.CharField(db_column='Permission_Name', unique=True, max_length=100)  # Field name made lowercase.
    description = models.CharField(db_column='Description', max_length=255, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'permission'


class Role(models.Model):
    role_id = models.CharField(db_column='Role_ID', primary_key=True, max_length=20)  # Field name made lowercase.
    role_name = models.CharField(db_column='Role_Name', unique=True, max_length=50)  # Field name made lowercase.
    description = models.CharField(db_column='Description', max_length=255, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'role'


class RolePermission(models.Model):
    pk = models.CompositePrimaryKey('Role_ID', 'Permission_ID')
    role = models.ForeignKey(Role, models.DO_NOTHING, db_column='Role_ID')  # Field name made lowercase.
    permission = models.ForeignKey(Permission, models.DO_NOTHING, db_column='Permission_ID')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'role_permission'


class Student(models.Model):
    student_id = models.CharField(db_column='Student_ID', primary_key=True, max_length=20)  # Field name made lowercase.
    name = models.CharField(db_column='Name', max_length=100)  # Field name made lowercase.
    email = models.CharField(db_column='Email', unique=True, max_length=100)  # Field name made lowercase.
    phone = models.CharField(db_column='Phone', max_length=15, blank=True, null=True)  # Field name made lowercase.
    school = models.CharField(db_column='School', max_length=50)  # Field name made lowercase.
    program = models.CharField(db_column='Program', max_length=100)  # Field name made lowercase.
    year = models.IntegerField(db_column='Year')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'student'


class Task(models.Model):
    task_id = models.CharField(db_column='Task_ID', primary_key=True, max_length=20)  # Field name made lowercase.
    club = models.ForeignKey(Club, models.DO_NOTHING, db_column='Club_ID')  # Field name made lowercase.
    department = models.ForeignKey(Department, models.DO_NOTHING, db_column='Department_ID', blank=True, null=True)  # Field name made lowercase.
    event = models.ForeignKey(Event, models.DO_NOTHING, db_column='Event_ID', blank=True, null=True)  # Field name made lowercase.
    created_by = models.ForeignKey(Student, models.DO_NOTHING, db_column='Created_By')  # Field name made lowercase.
    title = models.CharField(db_column='Title', max_length=150)  # Field name made lowercase.
    description = models.CharField(db_column='Description', max_length=500, blank=True, null=True)  # Field name made lowercase.
    priority = models.CharField(db_column='Priority', max_length=20)  # Field name made lowercase.
    deadline = models.DateTimeField(db_column='Deadline')  # Field name made lowercase.
    status = models.CharField(db_column='Status', max_length=20)  # Field name made lowercase.
    created_at = models.DateTimeField(db_column='Created_At', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'task'


class TaskAssignment(models.Model):
    pk = models.CompositePrimaryKey('Task_ID', 'Student_ID')
    task = models.ForeignKey(Task, models.DO_NOTHING, db_column='Task_ID')  # Field name made lowercase.
    student = models.ForeignKey(Student, models.DO_NOTHING, db_column='Student_ID')  # Field name made lowercase.
    assigned_by = models.ForeignKey(Student, models.DO_NOTHING, db_column='Assigned_By', related_name='taskassignment_assigned_by_set')  # Field name made lowercase.
    assigned_at = models.DateTimeField(db_column='Assigned_At', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'task_assignment'


class TaskSubmission(models.Model):
    submission_id = models.CharField(db_column='Submission_ID', primary_key=True, max_length=20)  # Field name made lowercase.
    task = models.ForeignKey(Task, models.DO_NOTHING, db_column='Task_ID')  # Field name made lowercase.
    student = models.ForeignKey(Student, models.DO_NOTHING, db_column='Student_ID')  # Field name made lowercase.
    submitted_at = models.DateTimeField(db_column='Submitted_At', blank=True, null=True)  # Field name made lowercase.
    file_url = models.CharField(db_column='File_URL', max_length=500, blank=True, null=True)  # Field name made lowercase.
    comment = models.CharField(db_column='Comment', max_length=500, blank=True, null=True)  # Field name made lowercase.
    review_status = models.CharField(db_column='Review_Status', max_length=20)  # Field name made lowercase.
    reviewed_by = models.ForeignKey(Student, models.DO_NOTHING, db_column='Reviewed_By', related_name='tasksubmission_reviewed_by_set', blank=True, null=True)  # Field name made lowercase.
    reviewed_at = models.DateTimeField(db_column='Reviewed_At', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'task_submission'
