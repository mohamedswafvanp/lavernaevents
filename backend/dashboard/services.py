from django.db.models import Count, Sum
from guests.models import Guest
from notifications.models import NotificationLog


class DashboardError(Exception):
    """Raised when dashboard data cannot be computed."""

    def __init__(self, message: str, code: str = "dashboard_error"):
        self.message = message
        self.code = code
        super().__init__(message)


def get_event_dashboard_stats(event) -> dict:
    """Compute all dashboard statistics for a single event.

    Expected attendance is calculated as:
        SUM(family_member_count) for guests with response_status = ACCEPTED
    """

    guests = Guest.objects.filter(event=event)

    total_guests = guests.count()

    response_counts = dict(
        guests.values_list("response_status").annotate(count=Count("id"))
    )

    accepted_count = response_counts.get(Guest.ResponseStatus.ACCEPTED, 0)
    rejected_count = response_counts.get(Guest.ResponseStatus.REJECTED, 0)
    maybe_count = response_counts.get(Guest.ResponseStatus.MAYBE, 0)
    pending_count = response_counts.get(Guest.ResponseStatus.PENDING, 0)

    invitation_counts = dict(
        guests.values_list("invitation_status").annotate(count=Count("id"))
    )

    invitations_sent = invitation_counts.get(Guest.InvitationStatus.SENT, 0)
    invitations_not_sent = invitation_counts.get(Guest.InvitationStatus.NOT_SENT, 0)
    invitations_failed = invitation_counts.get(Guest.InvitationStatus.FAILED, 0)

    expected_attendance = (
        guests.filter(response_status=Guest.ResponseStatus.ACCEPTED).aggregate(
            total=Sum("family_member_count")
        )["total"]
        or 0
    )

    notifications_sent = NotificationLog.objects.filter(
        invitation__event=event,
        status=NotificationLog.Status.SENT,
    ).count()

    notifications_by_channel = dict(
        NotificationLog.objects.filter(invitation__event=event)
        .values_list("channel")
        .annotate(count=Count("id"))
    )

    return {
        "total_guests": total_guests,
        "accepted_count": accepted_count,
        "rejected_count": rejected_count,
        "maybe_count": maybe_count,
        "pending_count": pending_count,
        "invitations_sent": invitations_sent,
        "invitations_not_sent": invitations_not_sent,
        "invitations_failed": invitations_failed,
        "notifications_sent": notifications_sent,
        "whatsapp_sent_count": notifications_by_channel.get(
            NotificationLog.Channel.WHATSAPP, 0
        ),
        "email_sent_count": notifications_by_channel.get(
            NotificationLog.Channel.EMAIL, 0
        ),
        "sms_sent_count": notifications_by_channel.get(
            NotificationLog.Channel.SMS, 0
        ),
        "expected_attendance": expected_attendance,
    }


def get_event_response_chart_data(event) -> list:
    """Return guest response counts formatted for a pie/bar chart (Recharts-friendly)."""

    guests = Guest.objects.filter(event=event)

    response_counts = dict(
        guests.values_list("response_status").annotate(count=Count("id"))
    )

    labels = {
        Guest.ResponseStatus.ACCEPTED: "Accepted",
        Guest.ResponseStatus.REJECTED: "Rejected",
        Guest.ResponseStatus.MAYBE: "Maybe",
        Guest.ResponseStatus.PENDING: "Pending",
    }

    return [
        {"name": label, "value": response_counts.get(status_value, 0)}
        for status_value, label in labels.items()
    ]


def get_event_invitation_chart_data(event) -> list:
    """Return invitation send-status counts formatted for a chart."""

    guests = Guest.objects.filter(event=event)

    invitation_counts = dict(
        guests.values_list("invitation_status").annotate(count=Count("id"))
    )

    labels = {
        Guest.InvitationStatus.SENT: "Sent",
        Guest.InvitationStatus.NOT_SENT: "Not Sent",
        Guest.InvitationStatus.FAILED: "Failed",
    }

    return [
        {"name": label, "value": invitation_counts.get(status_value, 0)}
        for status_value, label in labels.items()
    ]


def get_organizer_overview_stats(organizer) -> dict:
    """Compute a high-level summary across ALL of the organizer's events."""

    from events.models import Event

    events = Event.objects.filter(organizer=organizer)

    guests = Guest.objects.filter(event__organizer=organizer)

    total_events = events.count()
    total_guests = guests.count()

    accepted_count = guests.filter(
        response_status=Guest.ResponseStatus.ACCEPTED
    ).count()

    expected_attendance = (
        guests.filter(response_status=Guest.ResponseStatus.ACCEPTED).aggregate(
            total=Sum("family_member_count")
        )["total"]
        or 0
    )

    return {
        "total_events": total_events,
        "total_guests": total_guests,
        "total_accepted": accepted_count,
        "total_expected_attendance": expected_attendance,
    }
