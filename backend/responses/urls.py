from django.urls import path

from .views import InvitationResponsePageView


urlpatterns = [
    path(
        "respond/<str:response_token>/",
        InvitationResponsePageView.as_view(),
        name="invitation-response",
    ),
]
