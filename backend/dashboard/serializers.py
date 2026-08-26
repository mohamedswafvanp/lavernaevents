from rest_framework import serializers


class EventDashboardSerializer(serializers.Serializer):
    """Serializer for a single event's dashboard statistics."""

    total_guests = serializers.IntegerField()
    accepted_count = serializers.IntegerField()
    rejected_count = serializers.IntegerField()
    maybe_count = serializers.IntegerField()
    pending_count = serializers.IntegerField()
    invitations_sent = serializers.IntegerField()
    invitations_not_sent = serializers.IntegerField()
    invitations_failed = serializers.IntegerField()
    whatsapp_marked_sent = serializers.IntegerField()
    expected_attendance = serializers.IntegerField()


class ChartDataPointSerializer(serializers.Serializer):
    """Serializer for a single chart data point (Recharts-friendly)."""

    name = serializers.CharField()
    value = serializers.IntegerField()


class OrganizerOverviewSerializer(serializers.Serializer):
    """Serializer for the organizer's overview across all their events."""

    total_events = serializers.IntegerField()
    total_guests = serializers.IntegerField()
    total_accepted = serializers.IntegerField()
    total_expected_attendance = serializers.IntegerField()
