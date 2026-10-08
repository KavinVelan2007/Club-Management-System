from django.contrib import admin

from .models import NotificationRead


@admin.register(NotificationRead)
class NotificationReadAdmin(admin.ModelAdmin):
    list_display = ('user', 'key', 'read_at')
    search_fields = ('key',)
