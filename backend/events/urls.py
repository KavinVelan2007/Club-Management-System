from django.urls import path

from .views import (
    event_list,
    event_create,
    event_detail,
    event_department_list,
    registration_list,
    registration_detail,
    attendance_list
)


urlpatterns = [
    path('', event_list),
    path('departments/', event_department_list),
    path('registrations/', registration_list),
    path('attendance/', attendance_list),
    path('<str:event_id>/register/', registration_detail),
    path('create/', event_create),
    path('<str:event_id>/', event_detail),
]
