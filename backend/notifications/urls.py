from django.urls import path

from .views import (
    EventNotificationLogListView,
    MarkWhatsAppSentView,
    RetryNotificationView,
    SendInvitationView,
)


urlpatterns = [
    path(
        "events/<int:event_pk>/send-invitation/",
        SendInvitationView.as_view(),
        name="send-invitation",
    ),
    path(
        "notification-logs/<int:log_pk>/mark-whatsapp-sent/",
        MarkWhatsAppSentView.as_view(),
        name="mark-whatsapp-sent",
    ),
    path(
        "notification-logs/<int:log_pk>/retry/",
        RetryNotificationView.as_view(),
        name="retry-notification",
    ),
    path(
        "events/<int:event_pk>/notification-logs/",
        EventNotificationLogListView.as_view(),
        name="event-notification-logs",
    ),
]
