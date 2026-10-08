from django.urls import path

from .views import club_list, club_detail, club_update


urlpatterns = [
    path('', club_list),
    path('<str:club_id>/', club_detail),
    path('<str:club_id>/update/', club_update),
]