from common.permissions import IsOrganizer
from events.models import Event
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Guest
from .serializers import CSVImportResultSerializer, GuestSerializer
from .services import (
    GuestError,
    create_guest,
    delete_guest,
    export_guests_to_csv,
    import_guests_from_csv,
    update_guest,
)

GUEST_ERROR_STATUS_MAP = {
    "guest_limit_exceeded": status.HTTP_409_CONFLICT,
    "no_active_plan": status.HTTP_402_PAYMENT_REQUIRED,
    "duplicate_guest": status.HTTP_409_CONFLICT,
}


def get_owned_event_or_none(pk: int, user) -> Event | None:
    """Return the event only if it exists and belongs to the requesting user."""

    return Event.objects.filter(pk=pk, organizer=user).first()


class GuestListCreateView(ListAPIView):
    """List guests for an event, or add a new guest to it."""

    serializer_class = GuestSerializer
    permission_classes = [IsAuthenticated, IsOrganizer]
    filterset_fields = ["response_status", "invitation_status"]
    search_fields = ["name", "mobile_number"]

    def get_queryset(self):
        """Return guests for the event, scoped to the requesting organizer."""

        return Guest.objects.filter(
            event__pk=self.kwargs["event_pk"],
            event__organizer=self.request.user,
        )

    def list(self, request, *args, **kwargs):
        """Return the event's guests, paginated, with optional search/filter."""

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

        queryset = self.filter_queryset(self.get_queryset())

        search = request.query_params.get("search")

        if search:
            queryset = queryset.filter(name__icontains=search) | queryset.filter(
                mobile_number__icontains=search
            )

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)

        return Response(
            {
                "success": True,
                "message": "Guests retrieved successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request, event_pk):
        """Add a new guest to the event."""

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

        serializer = GuestSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "message": "Guest creation failed.",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            guest = create_guest(
                event=event,
                organizer=request.user,
                validated_data=serializer.validated_data,
            )

        except GuestError as error:
            response_status = GUEST_ERROR_STATUS_MAP.get(
                error.code,
                status.HTTP_400_BAD_REQUEST,
            )

            return Response(
                {
                    "success": False,
                    "message": error.message,
                    "errors": {"guest": [error.message]},
                },
                status=response_status,
            )

        response_serializer = GuestSerializer(guest)

        return Response(
            {
                "success": True,
                "message": "Guest added successfully.",
                "data": response_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


class GuestDetailView(APIView):
    """Retrieve, update, or delete a single guest belonging to the organizer's event."""

    permission_classes = [IsAuthenticated, IsOrganizer]

    def get_object(self, event_pk, guest_pk, user) -> Guest | None:
        """Fetch the guest, scoped to the organizer's own event."""

        return Guest.objects.filter(
            pk=guest_pk,
            event__pk=event_pk,
            event__organizer=user,
        ).first()

    def get(self, request, event_pk, guest_pk):
        """Return a single guest's details."""

        guest = self.get_object(event_pk, guest_pk, request.user)

        if guest is None:
            return Response(
                {
                    "success": False,
                    "message": "Guest not found.",
                    "errors": {"guest": ["No guest found with this ID."]},
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = GuestSerializer(guest)

        return Response(
            {
                "success": True,
                "message": "Guest retrieved successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def patch(self, request, event_pk, guest_pk):
        """Partially update a guest."""

        guest = self.get_object(event_pk, guest_pk, request.user)

        if guest is None:
            return Response(
                {
                    "success": False,
                    "message": "Guest not found.",
                    "errors": {"guest": ["No guest found with this ID."]},
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = GuestSerializer(
            guest,
            data=request.data,
            partial=True,
        )

        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "message": "Guest update failed.",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            updated_guest = update_guest(
                guest,
                serializer.validated_data,
            )

        except GuestError as error:
            response_status = GUEST_ERROR_STATUS_MAP.get(
                error.code,
                status.HTTP_400_BAD_REQUEST,
            )

            return Response(
                {
                    "success": False,
                    "message": error.message,
                    "errors": {"guest": [error.message]},
                },
                status=response_status,
            )

        response_serializer = GuestSerializer(updated_guest)

        return Response(
            {
                "success": True,
                "message": "Guest updated successfully.",
                "data": response_serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request, event_pk, guest_pk):
        """Delete a guest."""

        guest = self.get_object(event_pk, guest_pk, request.user)

        if guest is None:
            return Response(
                {
                    "success": False,
                    "message": "Guest not found.",
                    "errors": {"guest": ["No guest found with this ID."]},
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        delete_guest(guest)

        return Response(
            {
                "success": True,
                "message": "Guest deleted successfully.",
                "data": {},
            },
            status=status.HTTP_200_OK,
        )


class GuestCSVImportView(APIView):
    """Import guests for an event from an uploaded CSV file."""

    permission_classes = [IsAuthenticated, IsOrganizer]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, event_pk):
        """Parse and import guests from the uploaded CSV file."""

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

        csv_file = request.FILES.get("file")

        if csv_file is None:
            return Response(
                {
                    "success": False,
                    "message": "No file uploaded.",
                    "errors": {"file": ["This field is required."]},
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = import_guests_from_csv(
                event=event,
                organizer=request.user,
                csv_file=csv_file,
            )

        except GuestError as error:
            response_status = GUEST_ERROR_STATUS_MAP.get(
                error.code,
                status.HTTP_400_BAD_REQUEST,
            )

            return Response(
                {
                    "success": False,
                    "message": error.message,
                    "errors": {"file": [error.message]},
                },
                status=response_status,
            )

        serializer = CSVImportResultSerializer(result)

        return Response(
            {
                "success": True,
                "message": (
                    f"Import complete: {result['created_count']} added, "
                    f"{result['skipped_count']} skipped."
                ),
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class GuestCSVExportView(APIView):
    """Export an event's guest list as a downloadable CSV file."""

    permission_classes = [IsAuthenticated, IsOrganizer]

    def get(self, request, event_pk):
        """Return a CSV file of the event's guests."""

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

        csv_content = export_guests_to_csv(event)

        from django.http import HttpResponse

        response = HttpResponse(csv_content, content_type="text/csv")
        response["Content-Disposition"] = (
            f'attachment; filename="guests-event-{event_pk}.csv"'
        )

        return response
