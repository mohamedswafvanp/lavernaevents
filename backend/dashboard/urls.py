from django.urls import path

from .views import EventChartsView, EventDashboardView, OrganizerOverviewView


urlpatterns = [
    path(
        "overview/",
        OrganizerOverviewView.as_view(),
        name="organizer-overview",
    ),
    path(
        "events/<int:event_pk>/dashboard/",
        EventDashboardView.as_view(),
        name="event-dashboard",
    ),
    path(
        "events/<int:event_pk>/dashboard/charts/",
        EventChartsView.as_view(),
        name="event-dashboard-charts",
    ),
]
