import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getEventNotificationLogs,
  markWhatsAppSent,
  retryNotification,
  sendInvitation,
} from "@/api/notifications.api";
import { guestKeys } from "@/queries/useGuestQueries";
import type { SendInvitationPayload } from "@/types/notification.types";

export const notificationLogKeys = {
  lists: (eventId: number) => ["notification-logs", eventId, "list"] as const,
  list: (eventId: number, page: number) =>
    ["notification-logs", eventId, "list", page] as const,
};

export function useEventNotificationLogs(eventId: number, page: number) {
  return useQuery({
    queryKey: notificationLogKeys.list(eventId, page),
    queryFn: () => getEventNotificationLogs(eventId, page),
    placeholderData: keepPreviousData,
  });
}

export function useSendInvitationMutation(eventId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendInvitationPayload) => sendInvitation(eventId, payload),
    onSuccess: () => {
      // Guest list re-fetches so invitation_status (NOT_SENT -> SENT) shows
      // up on the card without a manual page refresh. Notification logs
      // re-fetch so the history/table page (and any WhatsApp
      // LINK_GENERATED row) reflects the new send immediately too.
      queryClient.invalidateQueries({ queryKey: guestKeys.lists(eventId) });
      queryClient.invalidateQueries({ queryKey: notificationLogKeys.lists(eventId) });
    },
  });
}

// These two take a bare logId, not an eventId, so they can't invalidate a
// specific event's query keys directly the way useSendInvitationMutation
// does - callers pass eventId explicitly since they already have it in
// context (the dialog/page is always rendered for a specific event).
export function useMarkWhatsAppSentMutation(eventId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logId: number) => markWhatsAppSent(logId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guestKeys.lists(eventId) });
      queryClient.invalidateQueries({ queryKey: notificationLogKeys.lists(eventId) });
    },
  });
}

export function useRetryNotificationMutation(eventId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logId: number) => retryNotification(logId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guestKeys.lists(eventId) });
      queryClient.invalidateQueries({ queryKey: notificationLogKeys.lists(eventId) });
    },
  });
}
