from django.urls import path

from .views import (
    EventInvitationListView,
    GenerateInvitationView,
    InvitationTemplateListView,
)


urlpatterns = [
    path(
        "invitation-templates/",
        InvitationTemplateListView.as_view(),
        name="invitation-template-list",
    ),
    path(
        "events/<int:event_pk>/invitations/",
        EventInvitationListView.as_view(),
        name="event-invitation-list",
    ),
    path(
        "events/<int:event_pk>/invitations/generate/",
        GenerateInvitationView.as_view(),
        name="generate-invitation",
    ),
]
