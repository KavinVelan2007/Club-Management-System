from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Announcement
from .serializers import AnnouncementSerializer


@api_view(['GET'])
def announcement_list(request):

    data = Announcement.objects.all()

    club_id = request.GET.get('club')
    department_id = request.GET.get('department')
    event_id = request.GET.get('event')

    if club_id:
        data = data.filter(club_id=club_id)

    if department_id:
        data = data.filter(department_id=department_id)

    if event_id:
        data = data.filter(event_id=event_id)

    serializer = AnnouncementSerializer(data, many=True)

    return Response(serializer.data)