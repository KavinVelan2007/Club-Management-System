from django.conf import settings
from django.db import models


class NotificationRead(models.Model):
    """Persistent read/unread state for derived ClubHub notifications.

    Notifications themselves are derived from real ClubHub data (tasks,
    announcements, events, membership requests) at request time; this table
    only records which ones the user has already seen. It is the single new
    table added by ClubHub — the existing schema has no read-state storage.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='clubhub_notification_reads',
    )
    key = models.CharField(max_length=120)
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notification_read'
        unique_together = ('user', 'key')

    def __str__(self):
        return f'{self.user_id} · {self.key}'
