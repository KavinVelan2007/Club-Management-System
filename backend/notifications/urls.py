from django.urls import path

from .views import notification_list, notification_mark_read, notification_mark_all_read

urlpatterns = [
    path('', notification_list),
    path('mark-read/', notification_mark_read),
    path('mark-all-read/', notification_mark_all_read),
]