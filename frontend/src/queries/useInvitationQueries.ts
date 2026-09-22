import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getEventInvitations, getInvitationTemplates } from "@/api/invitations.api";

export const invitationKeys = {
  templates: ["invitations", "templates"] as const,
  eventList: (eventId: number, page: number) =>
    ["invitations", "event", eventId, "list", page] as const,
};

export function useInvitationTemplates() {
  return useQuery({
    queryKey: invitationKeys.templates,
    queryFn: getInvitationTemplates,
    // Admin-curated, changes rarely - no need to refetch aggressively.
    staleTime: 5 * 60 * 1000,
  });
}

export function useEventInvitations(eventId: number, page: number) {
  return useQuery({
    queryKey: invitationKeys.eventList(eventId, page),
    queryFn: () => getEventInvitations(eventId, page),
    placeholderData: keepPreviousData,
  });
}
