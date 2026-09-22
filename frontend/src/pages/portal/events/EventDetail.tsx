import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  FileText,
  Image as ImageIcon,
  Mail,
  MapPin,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDeleteEventMutation, useEvent } from "@/queries/useEventQueries";
import { useGuests } from "@/queries/useGuestQueries";
import {
  eventStatusBadgeClass,
  eventTypeLabel,
  formatEventDate,
  formatEventTime,
} from "@/lib/eventDisplay";
import { resolveMediaUrl } from "@/lib/media";
import { getApiErrorMessage } from "@/lib/apiError";
import { cn } from "@/lib/utils";

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const eventId = id ? Number(id) : undefined;
  const navigate = useNavigate();

  const { data: event, isLoading, isError } = useEvent(eventId);
  const deleteMutation = useDeleteEventMutation();
  const { data: guestsPage } = useGuests(eventId ?? 0, { page: 1 });
  const guestCount = guestsPage?.pagination.count;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = () => {
    if (!eventId) return;

    deleteMutation.mutate(eventId, {
      onSuccess: () => navigate("/portal/events", { replace: true }),
      onError: (error) => {
        setDeleteError(getApiErrorMessage(error, "Couldn't delete this event."));
        setConfirmOpen(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
        <Skeleton className="h-4 w-32" />
        <Card className="mt-6 overflow-hidden">
          <Skeleton className="h-48 w-full rounded-none" />
          <div className="p-8">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="mt-3 h-4 w-48" />
          </div>
        </Card>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <Card className="p-8">
          <p className="text-sm text-slate-500">
            This event couldn't be found, or you don't have access to it.
          </p>
          <Link
            to="/portal/events"
            className={buttonVariants({ variant: "outline", className: "mt-6" })}
          >
            Back to events
          </Link>
        </Card>
      </div>
    );
  }

  const coverUrl = resolveMediaUrl(event.cover_image);

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/portal/events"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[var(--brand-navy)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to events
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="mt-4 overflow-hidden">
            <div className="flex h-48 items-center justify-center bg-slate-100 sm:h-56">
              {coverUrl ? (
                <img src={coverUrl} alt={event.name} className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-10 w-10 text-slate-300" />
              )}
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                      eventStatusBadgeClass(event.status)
                    )}
                  >
                    {event.status}
                  </span>
                  <h1 className="mt-3 text-2xl font-bold text-[var(--brand-navy)]">
                    {event.name}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    {eventTypeLabel(event.event_type, event.custom_event_type_label)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/portal/events/${event.id}/edit`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-rose-200 text-rose-600 hover:bg-rose-50"
                    onClick={() => setConfirmOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>

              {deleteError && <p className="mt-4 text-sm text-rose-600">{deleteError}</p>}

              {event.description && (
                <p className="mt-6 text-sm text-slate-600">{event.description}</p>
              )}

              <div className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-2">
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
                  {formatEventDate(event.event_date)}
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                  {formatEventTime(event.event_time)}
                </div>
                {event.venue_name && (
                  <div className="flex items-center gap-2.5 text-sm text-slate-600 sm:col-span-2">
                    <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                    {event.venue_name}
                    {event.address && ` - ${event.address}`}
                  </div>
                )}
                {event.host_name && (
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                    Hosted by {event.host_name}
                  </div>
                )}
                {event.google_maps_link && (
                  <a
                    href={event.google_maps_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 text-sm font-medium text-[var(--brand-pink)]"
                  >
                    <MapPin className="h-4 w-4 shrink-0" />
                    View on Google Maps
                  </a>
                )}
              </div>
            </div>
          </Card>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Link to={`/portal/events/${event.id}/guests`}>
              <Card className="card-hover-lift h-full p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)]">
                      <Users className="h-5 w-5" />
                    </span>
                    <h2 className="font-semibold text-[var(--brand-navy)]">Guests</h2>
                  </div>
                  {typeof guestCount === "number" && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {guestCount}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  Manage your guest list and track RSVPs.
                </p>
                <p className="mt-4 text-sm font-semibold text-[var(--brand-pink)]">
                  Manage guests →
                </p>
              </Card>
            </Link>

            <Link to={`/portal/events/${event.id}/invitations`}>
              <Card className="card-hover-lift h-full p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-navy)]/10 text-[var(--brand-navy)]">
                    <Mail className="h-5 w-5" />
                  </span>
                  <h2 className="font-semibold text-[var(--brand-navy)]">Invitations</h2>
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  View invitation history for this event. Sending is coming in an
                  upcoming update.
                </p>
                <p className="mt-4 text-sm font-semibold text-[var(--brand-pink)]">
                  View history →
                </p>
              </Card>
            </Link>
          </div>
        </motion.div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this event?"
        description={`"${event.name}" will be permanently deleted. This can't be undone.`}
        confirmLabel="Delete event"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
