import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse, PaginationMeta } from "@/types/api.types";
import type { Invitation, InvitationTemplate } from "@/types/invitation.types";

// NOTE: same URL-mounting pattern as guests.api.ts - invitations.urls is
// mounted at bare "api/" in config/urls.py (path("api/",
// include("invitations.urls"))), NOT "api/invitations/". Confirmed by
// reading invitations/urls.py + config/urls.py directly: the real paths
// are /api/invitation-templates/ and /api/events/<id>/invitations/.
//
// Every function here uses the shared apiClient from ./client
// (withCredentials: true baked in) - never a separate axios instance or
// bare fetch. A different api file skipping this is exactly what caused
// the 401-after-login bug in an earlier phase.

export async function getInvitationTemplates(): Promise<InvitationTemplate[]> {
  const { data } = await apiClient.get<ApiResponse<InvitationTemplate[]>>(
    "/invitation-templates/"
  );

  return data.data;
}

export interface EventInvitationsPage {
  invitations: Invitation[];
  pagination: PaginationMeta;
}

export async function getEventInvitations(
  eventId: number,
  page = 1
): Promise<EventInvitationsPage> {
  const { data } = await apiClient.get<PaginatedResponse<Invitation>>(
    `/events/${eventId}/invitations/`,
    { params: { page } }
  );

  return { invitations: data.data, pagination: data.pagination };
}
