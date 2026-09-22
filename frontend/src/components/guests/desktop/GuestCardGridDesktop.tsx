import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  MailCheck,
  Pencil,
  Phone,
  Search,
  Send,
  Trash2,
  UserPlus,
  XCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import GuestFormDesktop from "./GuestFormDesktop";
import SendInvitationDialog from "../SendInvitationDialog";
import { useDeleteGuestMutation, useGuests } from "@/queries/useGuestQueries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getInitials } from "@/lib/format";
import {
  INVITATION_STATUS_LABEL,
  RESPONSE_STATUS_BADGE_CLASS,
  RESPONSE_STATUS_LABEL,
} from "@/lib/guestDisplay";
import { cn } from "@/lib/utils";
import type { GuestsQueryParams } from "@/api/guests.api";
import type { Guest, InvitationStatus, ResponseStatus } from "@/types/guest.types";

interface GuestCardGridDesktopProps {
  eventId: number;
}

const RESPONSE_FILTER_OPTIONS: { value: ResponseStatus | ""; label: string }[] = [
  { value: "", label: "All responses" },
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Declined" },
  { value: "MAYBE", label: "Maybe" },
];

const INVITATION_FILTER_OPTIONS: { value: InvitationStatus | ""; label: string }[] = [
  { value: "", label: "All invitations" },
  { value: "NOT_SENT", label: "Not sent" },
  { value: "SENT", label: "Sent" },
  { value: "FAILED", label: "Failed" },
];

export default function GuestCardGridDesktop({ eventId }: GuestCardGridDesktopProps) {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const [responseFilter, setResponseFilter] = useState<ResponseStatus | "">("");
  const [invitationFilter, setInvitationFilter] = useState<InvitationStatus | "">("");

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, responseFilter, invitationFilter]);

  const params: GuestsQueryParams = {
    page,
    search: debouncedSearch || undefined,
    response_status: responseFilter || undefined,
    invitation_status: invitationFilter || undefined,
  };

  const { data, isLoading, isError } = useGuests(eventId, params);
  const deleteMutation = useDeleteGuestMutation(eventId);

  const [formOpen, setFormOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Guest | null>(null);
  const [invitationGuest, setInvitationGuest] = useState<Guest | null>(null);

  const guests = data?.guests ?? [];
  const pagination = data?.pagination;

  const openCreate = () => {
    setEditingGuest(undefined);
    setFormOpen(true);
  };

  const openEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  };

  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--brand-navy)]">Guests</h1>
            <p className="mt-1 text-sm text-slate-500">
              {pagination ? `${pagination.count} guest${pagination.count === 1 ? "" : "s"}` : "Manage your guest list."}
            </p>
          </div>
          <Button onClick={openCreate}>
            <UserPlus className="h-4 w-4" />
            Add guest
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or mobile number"
              className="h-11 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-sm text-[var(--brand-navy)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-pink)]/40 focus:border-[var(--brand-pink)]"
            />
          </div>
          <Select
            value={responseFilter}
            onChange={(e) => setResponseFilter(e.target.value as ResponseStatus | "")}
            className="w-44"
          >
            {RESPONSE_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select
            value={invitationFilter}
            onChange={(e) => setInvitationFilter(e.target.value as InvitationStatus | "")}
            className="w-44"
          >
            {INVITATION_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        {isError && (
          <p className="mt-10 text-center text-sm text-rose-600">
            Couldn't load guests right now. Please refresh the page.
          </p>
        )}

        {isLoading && (
          <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="premium-card p-5">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="mt-4 h-4 w-28" />
                <Skeleton className="mt-2 h-3 w-24" />
                <Skeleton className="mt-6 h-9 w-full rounded-full" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && !isError && guests.length === 0 && (
          <div className="mt-10 flex flex-col items-center px-6 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-pink)]/10 text-[var(--brand-pink)]">
              <UserPlus className="h-6 w-6" />
            </span>
            <p className="mt-4 font-semibold text-[var(--brand-navy)]">No guests yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Add your first guest, or import a list from a CSV file.
            </p>
            <Button className="mt-6" onClick={openCreate}>
              Add your first guest
            </Button>
          </div>
        )}

        {!isLoading && !isError && guests.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {guests.map((guest) => (
              <div key={guest.id} className="premium-card card-hover-lift flex flex-col p-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--brand-pink)]/10 text-sm font-semibold text-[var(--brand-pink)]">
                    {getInitials(guest.name)}
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold",
                      RESPONSE_STATUS_BADGE_CLASS[guest.response_status]
                    )}
                  >
                    {RESPONSE_STATUS_LABEL[guest.response_status]}
                  </span>
                </div>

                <p className="mt-4 truncate font-semibold text-[var(--brand-navy)]">{guest.name}</p>

                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{guest.mobile_number}</span>
                  </div>
                  {guest.email && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{guest.email}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    Party of {guest.family_member_count}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    {guest.invitation_status === "SENT" && (
                      <MailCheck className="h-3.5 w-3.5 text-emerald-500" />
                    )}
                    {guest.invitation_status === "FAILED" && (
                      <XCircle className="h-3.5 w-3.5 text-rose-500" />
                    )}
                    {guest.invitation_status === "NOT_SENT" && <Send className="h-3.5 w-3.5" />}
                    {INVITATION_STATUS_LABEL[guest.invitation_status]}
                  </div>
                </div>

                <Button
                  className="mt-4 w-full"
                  size="sm"
                  onClick={() => setInvitationGuest(guest)}
                >
                  <Send className="h-3.5 w-3.5" />
                  {guest.invitation_status === "SENT" ? "Resend" : "Send Invitation"}
                </Button>

                <div className="mt-2 flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(guest)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-[var(--brand-navy)]"
                    aria-label="Edit guest"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(guest)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Remove guest"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination && pagination.total_pages > 1 && (
          <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
            <span>
              Page {pagination.current_page} of {pagination.total_pages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={!pagination.previous}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={!pagination.next}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <GuestFormDesktop
        eventId={eventId}
        open={formOpen}
        existingGuest={editingGuest}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove this guest?"
        description={
          deleteTarget ? `"${deleteTarget.name}" will be permanently removed from this event.` : ""
        }
        confirmLabel="Remove guest"
        destructive
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {invitationGuest && (
        <SendInvitationDialog
          eventId={eventId}
          guest={invitationGuest}
          open={!!invitationGuest}
          onClose={() => setInvitationGuest(null)}
        />
      )}
    </div>
  );
}
