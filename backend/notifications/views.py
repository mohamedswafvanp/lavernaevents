from common.permissions import IsOrganizer
from events.models import Event
from guests.models import Guest
from invitations.services import InvitationError
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import NotificationLog
from .serializers import NotificationLogSerializer, SendInvitationSerializer
from .services import (
    NotificationError,
    mark_whatsapp_as_sent,
    retry_notification,
    send_invitation,
)

ERROR_STATUS_MAP = {
    "template_not_found": status.HTTP_404_NOT_FOUND,
    "template_not_in_plan": status.HTTP_403_FORBIDDEN,
    "no_active_plan": status.HTTP_402_PAYMENT_REQUIRED,
    "render_failed": status.HTTP_500_INTERNAL_SERVER_ERROR,
    "missing_email": status.HTTP_400_BAD_REQUEST,
    "email_send_failed": status.HTTP_502_BAD_GATEWAY,
    "sms_send_failed": status.HTTP_502_BAD_GATEWAY,
    "invalid_channel": status.HTTP_400_BAD_REQUEST,
}


def get_owned_event_or_none(pk: int, user) -> Event | None:
    """Return the event only if it exists and belongs to the requesting user."""

    return Event.objects.filter(pk=pk, organizer=user).first()


class SendInvitationView(APIView):
    """The confirmation popup's send action: pick a template + channel, send now.

    This single endpoint backs the entire 'Send' button + popup flow:
    generates the invitation for the chosen template if needed, then
    dispatches it via WhatsApp (returns a link), Email, or SMS
    (both sent directly by the backend).
    """

    permission_classes = [IsAuthenticated, IsOrganizer]

    def post(self, request, event_pk):
        """Validate the request and dispatch the invitation through the chosen channel."""

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

        serializer = SendInvitationSerializer(data=request.data)

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
            log = send_invitation(
                event=event,
                guest=guest,
                template_id=serializer.validated_data["template_id"],
                channel=serializer.validated_data["channel"],
                organizer=request.user,
            )

        except (InvitationError, NotificationError) as error:
            response_status = ERROR_STATUS_MAP.get(
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

        response_serializer = NotificationLogSerializer(log)

        message = (
            "WhatsApp link generated. Open it to send the invitation."
            if log.channel == NotificationLog.Channel.WHATSAPP
            else f"Invitation sent successfully via {log.channel.title()}."
        )

        return Response(
            {
                "success": True,
                "message": message,
                "data": response_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


class MarkWhatsAppSentView(APIView):
    """Confirm that the organizer sent the WhatsApp message (no delivery webhook available)."""

    permission_classes = [IsAuthenticated, IsOrganizer]

    def post(self, request, log_pk):
        """Mark a WhatsApp notification log as sent."""

        log = NotificationLog.objects.filter(
            pk=log_pk,
            invitation__event__organizer=request.user,
            channel=NotificationLog.Channel.WHATSAPP,
        ).first()

        if log is None:
            return Response(
                {
                    "success": False,
                    "message": "WhatsApp log not found.",
                    "errors": {"log": ["No WhatsApp log found with this ID."]},
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        updated_log = mark_whatsapp_as_sent(log)

        serializer = NotificationLogSerializer(updated_log)

        return Response(
            {
                "success": True,
                "message": "Marked as sent.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class RetryNotificationView(APIView):
    """Retry a failed or unconfirmed notification send."""

    permission_classes = [IsAuthenticated, IsOrganizer]

    def post(self, request, log_pk):
        """Re-run the same channel's send handler for this log."""

        log = NotificationLog.objects.filter(
            pk=log_pk,
            invitation__event__organizer=request.user,
        ).first()

        if log is None:
            return Response(
                {
                    "success": False,
                    "message": "Notification log not found.",
                    "errors": {"log": ["No log found with this ID."]},
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            updated_log = retry_notification(log)

        except NotificationError as error:
            response_status = ERROR_STATUS_MAP.get(
                error.code,
                status.HTTP_400_BAD_REQUEST,
            )

            return Response(
                {
                    "success": False,
                    "message": error.message,
                    "errors": {"notification": [error.message]},
                },
                status=response_status,
            )

        serializer = NotificationLogSerializer(updated_log)

        return Response(
            {
                "success": True,
                "message": "Retry completed.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class EventNotificationLogListView(ListAPIView):
    """List notification send logs for an event (status table for the guest list UI)."""

    serializer_class = NotificationLogSerializer
    permission_classes = [IsAuthenticated, IsOrganizer]

    def get_queryset(self):
        """Return logs scoped to the organizer's own event."""

        return NotificationLog.objects.filter(
            invitation__event__pk=self.kwargs["event_pk"],
            invitation__event__organizer=self.request.user,
        )

    def list(self, request, *args, **kwargs):
        """Return the event's notification send logs, paginated."""

        queryset = self.get_queryset()

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)

        return Response(
            {
                "success": True,
                "message": "Notification logs retrieved successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
