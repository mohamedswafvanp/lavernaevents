import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createGuest,
  deleteGuest,
  getGuestById,
  getGuests,
  importGuestsCsv,
  updateGuest,
  type GuestsQueryParams,
} from "@/api/guests.api";
import type { CreateGuestPayload, UpdateGuestPayload } from "@/types/guest.types";

export const guestKeys = {
  lists: (eventId: number) => ["guests", eventId, "list"] as const,
  list: (eventId: number, params: GuestsQueryParams) =>
    ["guests", eventId, "list", params] as const,
  detail: (eventId: number, guestId: number) => ["guests", eventId, "detail", guestId] as const,
};

export function useGuests(eventId: number, params: GuestsQueryParams = {}) {
  return useQuery({
    queryKey: guestKeys.list(eventId, params),
    queryFn: () => getGuests(eventId, params),
    placeholderData: keepPreviousData,
  });
}

export function useGuest(eventId: number, guestId: number | undefined) {
  return useQuery({
    queryKey: guestKeys.detail(eventId, guestId ?? 0),
    queryFn: () => getGuestById(eventId, guestId as number),
    enabled: !!guestId,
  });
}

export function useCreateGuestMutation(eventId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateGuestPayload) => createGuest(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guestKeys.lists(eventId) });
    },
  });
}

export function useUpdateGuestMutation(eventId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ guestId, payload }: { guestId: number; payload: UpdateGuestPayload }) =>
      updateGuest(eventId, guestId, payload),
    onSuccess: (guest) => {
      queryClient.invalidateQueries({ queryKey: guestKeys.lists(eventId) });
      queryClient.setQueryData(guestKeys.detail(eventId, guest.id), guest);
    },
  });
}

export function useDeleteGuestMutation(eventId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (guestId: number) => deleteGuest(eventId, guestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guestKeys.lists(eventId) });
    },
  });
}

export function useImportGuestsCsvMutation(eventId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => importGuestsCsv(eventId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guestKeys.lists(eventId) });
    },
  });
}
