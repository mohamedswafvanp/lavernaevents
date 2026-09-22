import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse, PaginationMeta } from "@/types/api.types";

// NOTE: guests.urls is mounted at bare "api/" in config/urls.py
// (path("api/", include("guests.urls"))), NOT "api/guests/" - the
// "/guests" segment only exists inside guests/urls.py's own path()
// patterns (e.g. "events/<event_pk>/guests/"). Confirmed live: a request
// to /api/guests/events/<id>/guests/ 404s; the real path is
// /api/events/<id>/guests/. Every URL below reflects that.
import type {
  CreateGuestPayload,
  CSVImportResult,
  Guest,
  InvitationStatus,
  ResponseStatus,
  UpdateGuestPayload,
} from "@/types/guest.types";

export interface GuestsQueryParams {
  page?: number;
  search?: string;
  response_status?: ResponseStatus;
  invitation_status?: InvitationStatus;
}

export interface GuestsPage {
  guests: Guest[];
  pagination: PaginationMeta;
}

export async function getGuests(
  eventId: number,
  params: GuestsQueryParams = {}
): Promise<GuestsPage> {
  const { data } = await apiClient.get<PaginatedResponse<Guest>>(
    `/events/${eventId}/guests/`,
    { params }
  );

  return { guests: data.data, pagination: data.pagination };
}

export async function getGuestById(eventId: number, guestId: number): Promise<Guest> {
  const { data } = await apiClient.get<ApiResponse<Guest>>(
    `/events/${eventId}/guests/${guestId}/`
  );

  return data.data;
}

export async function createGuest(
  eventId: number,
  payload: CreateGuestPayload
): Promise<Guest> {
  const { data } = await apiClient.post<ApiResponse<Guest>>(
    `/events/${eventId}/guests/`,
    payload
  );

  return data.data;
}

export async function updateGuest(
  eventId: number,
  guestId: number,
  payload: UpdateGuestPayload
): Promise<Guest> {
  const { data } = await apiClient.patch<ApiResponse<Guest>>(
    `/events/${eventId}/guests/${guestId}/`,
    payload
  );

  return data.data;
}

export async function deleteGuest(eventId: number, guestId: number): Promise<void> {
  await apiClient.delete<ApiResponse<Record<string, never>>>(
    `/events/${eventId}/guests/${guestId}/`
  );
}

export async function importGuestsCsv(eventId: number, file: File): Promise<CSVImportResult> {
  const formData = new FormData();
  formData.append("file", file);

  // See api/events.api.ts's MULTIPART_CONFIG comment: apiClient's instance
  // default Content-Type must be explicitly cleared per-request, or axios
  // will JSON.stringify() this FormData instead of sending it as multipart.
  const { data } = await apiClient.post<ApiResponse<CSVImportResult>>(
    `/events/${eventId}/guests/import-csv/`,
    formData,
    { headers: { "Content-Type": undefined } }
  );

  return data.data;
}

// The export endpoint returns raw CSV (Content-Disposition: attachment),
// not the standard {success, message, data} envelope - so this isn't a
// typed JSON call, it's a blob download triggered as a side effect.
export async function exportGuestsCsv(eventId: number): Promise<void> {
  const response = await apiClient.get(`/events/${eventId}/guests/export-csv/`, {
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `guests-event-${eventId}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
