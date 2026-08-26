from common.permissions import IsOrganizer
from events.models import Event
from guests.models import Guest
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Invitation, InvitationTemplate
from .serializers import (
    GenerateInvitationSerializer,
    InvitationSerializer,
    InvitationTemplateSerializer,
)
from .services import InvitationError, generate_invitation

INVITATION_ERROR_STATUS_MAP = {
    "template_not_found": status.HTTP_404_NOT_FOUND,
    "template_limit_exceeded": status.HTTP_409_CONFLICT,
    "no_active_plan": status.HTTP_402_PAYMENT_REQUIRED,
    "duplicate_invitation": status.HTTP_409_CONFLICT,
    "render_failed": status.HTTP_500_INTERNAL_SERVER_ERROR,
}


class InvitationTemplateListView(ListAPIView):
    """List all active invitation templates available to browse.

    All active templates are shown to every organizer; the plan's
    template_limit is enforced at GENERATION time (how many distinct
    templates they may actually USE), not at browse time.
    """

    serializer_class = InvitationTemplateSerializer
    permission_classes = [IsAuthenticated, IsOrganizer]
    pagination_class = None

    def get_queryset(self):
        """Return active templates ordered for display."""

        return InvitationTemplate.objects.filter(
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


class GenerateInvitationView(APIView):
    """Generate a personalized invitation for a guest on the organizer's event."""

    permission_classes = [IsAuthenticated, IsOrganizer]

    def post(self, request, event_pk):
        """Create and render an invitation for the given guest and template."""

        event = get_owned_event_or_none(event_pk, request.user)

        if event is None:
            return Response(
                {
                    "success": False,
                    "message": "Event not found.",
                    "errors": {"event": ["No event found with this ID."]},
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = GenerateInvitationSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "message": "Invalid request.",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        guest = Guest.objects.filter(
            pk=serializer.validated_data["guest_id"],
            event=event,
        ).first()

        if guest is None:
            return Response(
                {
                    "success": False,
                    "message": "Guest not found on this event.",
                    "errors": {"guest_id": ["No guest found with this ID on this event."]},
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            invitation = generate_invitation(
                event=event,
                guest=guest,
                template_slug_or_id=serializer.validated_data["template_id"],
                organizer=request.user,
            )

        except InvitationError as error:
            response_status = INVITATION_ERROR_STATUS_MAP.get(
                error.code,
                status.HTTP_400_BAD_REQUEST,
            )

            return Response(
                {
                    "success": False,
                    "message": error.message,
                    "errors": {"invitation": [error.message]},
                },
                status=response_status,
            )

        response_serializer = InvitationSerializer(
            invitation,
            context={"request": request},
        )

        return Response(
            {
                "success": True,
                "message": "Invitation generated successfully.",
                "data": response_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


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
