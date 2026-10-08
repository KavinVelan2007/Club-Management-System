from django.urls import path

from .views import (
    membership_list,
    membership_detail,
    department_list,
    department_membership_list,
    role_list,
    student_directory
)


urlpatterns = [
    path('memberships/', membership_list),
    path('memberships/<str:club_id>/<str:student_id>/', membership_detail),
    path('departments/', department_list),
    path('department-memberships/', department_membership_list),
    path('roles/', role_list),
    path('students/', student_directory),
]