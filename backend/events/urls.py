from django.urls import path

from .views import (
    event_list,
    event_detail,
    event_department_list,
    registration_list,
    attendance_list
)


urlpatterns = [
    path('', event_list),
    path('departments/', event_department_list),
    path('registrations/', registration_list),
    path('attendance/', attendance_list),
    path('<str:event_id>/', event_detail),
]
