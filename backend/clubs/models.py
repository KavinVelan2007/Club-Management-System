from django.db import models

# Create your models here.
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
    pk = models.CompositePrimaryKey('role', 'permission')
    role = models.ForeignKey(Role, models.DO_NOTHING, db_column='Role_ID')  # Field name made lowercase.
    permission = models.ForeignKey(Permission, models.DO_NOTHING, db_column='Permission_ID')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'role_permission'

