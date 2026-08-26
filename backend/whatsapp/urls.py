from django.urls import path

from .views import (
    EventWhatsAppLogListView,
    MarkWhatsAppSentView,
    RetryWhatsAppSendView,
    SendWhatsAppInvitationView,
)


urlpatterns = [
    path(
        "invitations/<int:invitation_pk>/send-whatsapp/",
        SendWhatsAppInvitationView.as_view(),
        name="send-whatsapp",
    ),
    path(
        "whatsapp-logs/<int:log_pk>/mark-sent/",
        MarkWhatsAppSentView.as_view(),
        name="mark-whatsapp-sent",
    ),
    path(
        "whatsapp-logs/<int:log_pk>/retry/",
        RetryWhatsAppSendView.as_view(),
        name="retry-whatsapp-send",
    ),
    path(
        "events/<int:event_pk>/whatsapp-logs/",
        EventWhatsAppLogListView.as_view(),
        name="event-whatsapp-logs",
    ),
]
