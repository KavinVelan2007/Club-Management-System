from django.urls import path

from .views import (
    task_list,
    task_create,
    task_detail,
    task_update,
    task_delete,
    task_status,
    task_assignment_list,
    task_assignment_create,
    task_assignment_delete,
    task_submission_list
)


urlpatterns = [
    path('', task_list),
    path('create/', task_create),
    path('assignments/', task_assignment_list),
    path('submissions/', task_submission_list),
    path('<str:task_id>/', task_detail),
    path('<str:task_id>/update/', task_update),
    path('<str:task_id>/delete/', task_delete),
    path('<str:task_id>/status/', task_status),
    path('<str:task_id>/assignments/', task_assignment_create),
    path('<str:task_id>/assignments/<str:student_id>/', task_assignment_delete),
]
