from django.urls import path

from .views import announcement_list, announcement_create, announcement_detail


urlpatterns = [
    path('', announcement_list),
    path('create/', announcement_create),
    path('<str:announcement_id>/update/', announcement_detail),
    path('<str:announcement_id>/delete/', announcement_detail),
]