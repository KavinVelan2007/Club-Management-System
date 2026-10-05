from django.urls import path

from .views import (
    task_list,
    task_detail,
    task_assignment_list,
    task_submission_list
)


urlpatterns = [
    path('', task_list),
    path('assignments/', task_assignment_list),
    path('submissions/', task_submission_list),
    path('<str:task_id>/', task_detail),
]
