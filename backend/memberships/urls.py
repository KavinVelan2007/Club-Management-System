from django.urls import path

from .views import (
    membership_list,
    department_list,
    department_membership_list
)


urlpatterns = [
    path('memberships/', membership_list),
    path('departments/', department_list),
    path('department-memberships/', department_membership_list),
]