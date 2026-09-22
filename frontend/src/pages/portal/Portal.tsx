import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarPlus, Image as ImageIcon, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth.store";
import { useEvents } from "@/queries/useEventQueries";
import { eventStatusBadgeClass, eventTypeLabel, formatEventDate } from "@/lib/eventDisplay";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

export default function Portal() {
  const { user } = useAuthStore();
  const firstName = user?.full_name?.split(" ")[0] ?? "there";

  const { data, isLoading } = useEvents(1);
  const recentEvents = (data?.events ?? []).slice(0, 3);

  return (
    <div className="px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--brand-pink)]">
            Dashboard
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--brand-navy)] sm:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Here's where your events and quick actions live.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)]">
                    <CalendarPlus className="h-5 w-5" />
                  </span>
                  <h2 className="font-semibold text-[var(--brand-navy)]">Your events</h2>
                </div>
                {recentEvents.length > 0 && (
                  <Link
                    to="/portal/events"
                    className="text-sm font-semibold text-[var(--brand-pink)]"
                  >
                    View all
                  </Link>
                )}
              </div>

              {isLoading && (
                <div className="mt-4 space-y-2.5">
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              )}

              {!isLoading && recentEvents.length === 0 && (
                <>
                  <p className="mt-4 text-sm text-slate-500">
                    You haven't created any events yet. Once you do, they'll show up here.
                  </p>
                  <Link
                    to="/portal/events/new"
                    className={buttonVariants({ variant: "outline", className: "mt-6 w-full" })}
                  >
                    <CalendarPlus className="h-4 w-4" />
                    Create an event
                  </Link>
                </>
              )}

              {!isLoading && recentEvents.length > 0 && (
                <div className="mt-4 space-y-2.5">
                  {recentEvents.map((event) => {
                    const coverUrl = resolveMediaUrl(event.cover_image);

                    return (
                      <Link
                        key={event.id}
                        to={`/portal/events/${event.id}`}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 p-2.5 transition-colors hover:bg-slate-50"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                          {coverUrl ? (
                            <img src={coverUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-slate-300" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[var(--brand-navy)]">
                            {event.name}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {eventTypeLabel(event.event_type)} · {formatEventDate(event.event_date)}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
                            eventStatusBadgeClass(event.status)
                          )}
                        >
                          {event.status}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-navy)]/10 text-[var(--brand-navy)]">
                  <Sparkles className="h-5 w-5" />
                </span>
                <h2 className="font-semibold text-[var(--brand-navy)]">Quick actions</h2>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Send invitations, manage guests, and track RSVPs from here.
              </p>
              <div className="mt-6 space-y-2">
                <Button className="w-full" variant="outline" disabled>
                  Send invitations
                </Button>
                <Button className="w-full" variant="outline" disabled>
                  Manage guests
                </Button>
              </div>
              <p className="mt-2 text-center text-xs text-slate-400">
                Coming in the next update
              </p>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
