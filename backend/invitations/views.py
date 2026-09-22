from common.permissions import IsOrganizer
from events.models import Event
from memberships.utils import get_effective_plan
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Invitation, InvitationTemplate
from .serializers import InvitationSerializer, InvitationTemplateSerializer


class InvitationTemplateListView(ListAPIView):
    """List invitation templates available to the requesting organizer's plan.

    Only templates assigned to the organizer's current active plan are
    shown, since access is admin-curated per plan. Organizers with no
    active plan see an empty list. This is the "Invitation Card View"
    section the organizer browses before picking one to send.
    """

    serializer_class = InvitationTemplateSerializer
    permission_classes = [IsAuthenticated, IsOrganizer]
    pagination_class = None

    def get_queryset(self):
        """Return active templates assigned to the organizer's current plan."""

        plan = get_effective_plan(self.request.user)

        if plan is None:
            return InvitationTemplate.objects.none()

        return plan.templates.filter(
            is_active=True
        ).order_by("display_order", "name")

    def list(self, request, *args, **kwargs):
        """Return templates wrapped in the project's consistent response format."""

        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)

        return Response(
            {
                "success": True,
                "message": "Invitation templates retrieved successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


def get_owned_event_or_none(pk: int, user) -> Event | None:
    """Return the event only if it exists and belongs to the requesting user."""

    return Event.objects.filter(pk=pk, organizer=user).first()


class EventInvitationListView(ListAPIView):
    """List all invitations generated for a specific event (invitation history)."""

    serializer_class = InvitationSerializer
    permission_classes = [IsAuthenticated, IsOrganizer]

    def get_queryset(self):
        """Return invitations scoped to the organizer's own event."""

        return Invitation.objects.filter(
            event__pk=self.kwargs["event_pk"],
            event__organizer=self.request.user,
        )

    def list(self, request, *args, **kwargs):
        """Return the event's invitation history, paginated."""

        event = get_owned_event_or_none(kwargs["event_pk"], request.user)

        if event is None:
            return Response(
                {
                    "success": False,
                    "message": "Event not found.",
                    "errors": {"event": ["No event found with this ID."]},
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        queryset = self.get_queryset()

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)

        return Response(
            {
                "success": True,
                "message": "Invitation history retrieved successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
