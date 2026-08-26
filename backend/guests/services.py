import csv
import io

from django.db import IntegrityError
from memberships.utils import LimitExceededError, check_guest_limit

from .models import Guest


class GuestError(Exception):
    """Raised when a guest action cannot be completed."""

    def __init__(self, message: str, code: str = "guest_error"):
        self.message = message
        self.code = code
        super().__init__(message)


def get_event_guest_count(event) -> int:
    """Return the number of guests currently on this event."""

    return Guest.objects.filter(event=event).count()


def create_guest(event, organizer, validated_data: dict) -> Guest:
    """Create a single guest on an event, enforcing the organizer's plan guest limit.

    Raises GuestError if the plan limit would be exceeded or the mobile
    number is already on this event's guest list.
    """

    current_count = get_event_guest_count(event)

    try:
        check_guest_limit(organizer, current_count)

    except LimitExceededError as error:
        raise GuestError(error.message, code=error.code)

    try:
        guest = Guest.objects.create(event=event, **validated_data)

    except IntegrityError:
        raise GuestError(
            "This mobile number is already on the guest list for this event.",
            code="duplicate_guest",
        )

    return guest


def update_guest(guest: Guest, validated_data: dict) -> Guest:
    """Apply partial updates to an existing guest."""

    try:
        for field, value in validated_data.items():
            setattr(guest, field, value)

        guest.save()

    except IntegrityError:
        raise GuestError(
            "This mobile number is already on the guest list for this event.",
            code="duplicate_guest",
        )

    return guest


def delete_guest(guest: Guest) -> None:
    """Permanently delete a guest."""

    guest.delete()


REQUIRED_CSV_COLUMNS = {"name", "mobile_number"}


def import_guests_from_csv(event, organizer, csv_file) -> dict:
    """Import guests from an uploaded CSV file.

    Expected columns: name, mobile_number, family_member_count (optional).
    Returns a summary dict of created/skipped rows with reasons.
    Stops importing (but keeps prior successful rows) once the plan's
    guest limit is reached.
    """

    try:
        decoded = csv_file.read().decode("utf-8-sig")

    except UnicodeDecodeError:
        raise GuestError(
            "Could not read the CSV file. Please ensure it is UTF-8 encoded.",
            code="invalid_encoding",
        )

    reader = csv.DictReader(io.StringIO(decoded))

    if reader.fieldnames is None or not REQUIRED_CSV_COLUMNS.issubset(
        {field.strip().lower() for field in reader.fieldnames}
    ):
        raise GuestError(
            "CSV must contain at least 'name' and 'mobile_number' columns.",
            code="invalid_columns",
        )

    created = []
    skipped = []

    current_count = get_event_guest_count(event)

    for row_number, row in enumerate(reader, start=2):
        name = (row.get("name") or "").strip()
        mobile_number = (row.get("mobile_number") or "").strip()
        family_raw = (row.get("family_member_count") or "").strip()

        if not name or not mobile_number:
            skipped.append(
                {"row": row_number, "reason": "Missing name or mobile_number."}
            )
            continue

        try:
            check_guest_limit(organizer, current_count)

        except LimitExceededError as error:
            skipped.append(
                {"row": row_number, "reason": error.message}
            )
            break

        family_member_count = 3

        if family_raw:
            try:
                family_member_count = int(family_raw)

            except ValueError:
                skipped.append(
                    {
                        "row": row_number,
                        "reason": "family_member_count must be a whole number.",
                    }
                )
                continue

        try:
            guest = Guest.objects.create(
                event=event,
                name=name,
                mobile_number=mobile_number,
                family_member_count=family_member_count,
            )

        except IntegrityError:
            skipped.append(
                {
                    "row": row_number,
                    "reason": "Duplicate mobile number for this event.",
                }
            )
            continue

        created.append(guest)
        current_count += 1

    return {
        "created_count": len(created),
        "skipped_count": len(skipped),
        "skipped_rows": skipped,
    }


def export_guests_to_csv(event) -> str:
    """Return a CSV string of all guests on the given event."""

    output = io.StringIO()

    writer = csv.writer(output)

    writer.writerow(
        [
            "name",
            "mobile_number",
            "family_member_count",
            "invitation_status",
            "response_status",
        ]
    )

    for guest in Guest.objects.filter(event=event).order_by("name"):
        writer.writerow(
            [
                guest.name,
                guest.mobile_number,
                guest.family_member_count,
                guest.invitation_status,
                guest.response_status,
            ]
        )

    return output.getvalue()
