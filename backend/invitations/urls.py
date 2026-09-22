from django.urls import path

from .views import EventInvitationListView, InvitationTemplateListView


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
]
