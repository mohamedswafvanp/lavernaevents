from django.urls import path

from .views import (
    GuestCSVExportView,
    GuestCSVImportView,
    GuestDetailView,
    GuestListCreateView,
)


urlpatterns = [
    path(
        "events/<int:event_pk>/guests/",
        GuestListCreateView.as_view(),
        name="guest-list-create",
    ),
    path(
        "events/<int:event_pk>/guests/<int:guest_pk>/",
        GuestDetailView.as_view(),
        name="guest-detail",
    ),
    path(
        "events/<int:event_pk>/guests/import-csv/",
        GuestCSVImportView.as_view(),
        name="guest-import-csv",
    ),
    path(
        "events/<int:event_pk>/guests/export-csv/",
        GuestCSVExportView.as_view(),
        name="guest-export-csv",
    ),
]
