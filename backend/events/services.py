from memberships.utils import LimitExceededError, check_event_limit

from .models import Event


class EventError(Exception):
    """Raised when an event action cannot be completed."""

    def __init__(self, message: str, code: str = "event_error"):
        self.message = message
        self.code = code
        super().__init__(message)


def get_organizer_event_count(organizer) -> int:
    """Return the number of non-cancelled events owned by this organizer."""

    return Event.objects.filter(
        organizer=organizer
    ).exclude(
        status=Event.Status.CANCELLED
    ).count()


def create_event(organizer, validated_data: dict) -> Event:
    """Create a new event for the organizer, enforcing their plan's event limit.

    Raises EventError if the organizer's plan does not allow another event.
    """

    current_count = get_organizer_event_count(organizer)

    try:
        check_event_limit(organizer, current_count)

    except LimitExceededError as error:
        raise EventError(error.message, code=error.code)

    event = Event.objects.create(
        organizer=organizer,
        **validated_data,
    )

    return event


def update_event(event: Event, validated_data: dict) -> Event:
    """Apply partial updates to an existing event."""

    for field, value in validated_data.items():
        setattr(event, field, value)

    event.save()

    return event


def delete_event(event: Event) -> None:
    """Permanently delete an event."""

    event.delete()
