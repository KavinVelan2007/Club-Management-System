from django.urls import path

from .views import club_list, club_detail


urlpatterns = [
    path('', club_list),
    path('<str:club_id>/', club_detail),
]