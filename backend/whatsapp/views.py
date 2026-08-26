from common.permissions import IsOrganizer
from invitations.models import Invitation
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import WhatsAppLog
from .serializers import WhatsAppLogSerializer
from .services import (
    WhatsAppError,
    create_whatsapp_send,
    mark_as_sent,
    retry_send,
)

WHATSAPP_ERROR_STATUS_MAP = {
    "no_image": status.HTTP_400_BAD_REQUEST,
}


def get_owned_invitation_or_none(invitation_pk: int, user) -> Invitation | None:
    """Return the invitation only if it belongs to the requesting organizer."""

    return Invitation.objects.filter(
        pk=invitation_pk,
        event__organizer=user,
    ).first()


class SendWhatsAppInvitationView(APIView):
    """Generate a wa.me link for a single guest's invitation (one-click send)."""

    permission_classes = [IsAuthenticated, IsOrganizer]

    def post(self, request, invitation_pk):
        """Build the WhatsApp deep link for this invitation and log the attempt."""

        invitation = get_owned_invitation_or_none(invitation_pk, request.user)

        if invitation is None:
            return Response(
                {
                    "success": False,
                    "message": "Invitation not found.",
                    "errors": {"invitation": ["No invitation found with this ID."]},
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            log = create_whatsapp_send(invitation)

        except WhatsAppError as error:
            response_status = WHATSAPP_ERROR_STATUS_MAP.get(
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

        serializer = WhatsAppLogSerializer(log)

        return Response(
            {
                "success": True,
                "message": "WhatsApp link generated. Open it to send the invitation.",
                "data": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


class MarkWhatsAppSentView(APIView):
    """Confirm that the organizer sent the WhatsApp message (no delivery webhook available)."""

    permission_classes = [IsAuthenticated, IsOrganizer]

    def post(self, request, log_pk):
        """Mark a WhatsApp log as sent and update the guest's invitation status."""

        log = WhatsAppLog.objects.filter(
            pk=log_pk,
            invitation__event__organizer=request.user,
        ).first()

        if log is None:
            return Response(
                {
                    "success": False,
                    "message": "WhatsApp log not found.",
                    "errors": {"log": ["No log found with this ID."]},
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        updated_log = mark_as_sent(log)

        serializer = WhatsAppLogSerializer(updated_log)

        return Response(
            {
                "success": True,
                "message": "Marked as sent.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class RetryWhatsAppSendView(APIView):
    """Retry generating the WhatsApp link for a guest whose invitation wasn't confirmed sent."""

    permission_classes = [IsAuthenticated, IsOrganizer]

    def post(self, request, log_pk):
        """Increment the retry count and reset the log for another send attempt."""

        log = WhatsAppLog.objects.filter(
            pk=log_pk,
            invitation__event__organizer=request.user,
        ).first()

        if log is None:
            return Response(
                {
                    "success": False,
                    "message": "WhatsApp log not found.",
                    "errors": {"log": ["No log found with this ID."]},
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        updated_log = retry_send(log)

        serializer = WhatsAppLogSerializer(updated_log)

        return Response(
            {
                "success": True,
                "message": "Ready to retry. Open the link to resend.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class EventWhatsAppLogListView(ListAPIView):
    """List WhatsApp send logs for an event (delivery status table for the guest list UI)."""

    serializer_class = WhatsAppLogSerializer
    permission_classes = [IsAuthenticated, IsOrganizer]

    def get_queryset(self):
        """Return logs scoped to the organizer's own event."""

        return WhatsAppLog.objects.filter(
            invitation__event__pk=self.kwargs["event_pk"],
            invitation__event__organizer=self.request.user,
        )

    def list(self, request, *args, **kwargs):
        """Return the event's WhatsApp send logs, paginated."""

        queryset = self.get_queryset()

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)

        return Response(
            {
                "success": True,
                "message": "WhatsApp logs retrieved successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
