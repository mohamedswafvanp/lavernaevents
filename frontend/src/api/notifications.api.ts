import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse, PaginationMeta } from "@/types/api.types";
import type { NotificationLog, SendInvitationPayload } from "@/types/notification.types";

// NOTE: same URL-mounting pattern found in every prior phase - notifications
// urls.py is mounted at bare "api/" in config/urls.py, NOT "api/notifications/".
// Confirmed by reading config/urls.py + notifications/urls.py directly: the
// real paths are /api/events/<id>/send-invitation/,
// /api/notification-logs/<id>/mark-whatsapp-sent/,
// /api/notification-logs/<id>/retry/, and
// /api/events/<id>/notification-logs/.
//
// Every function uses the shared apiClient (withCredentials: true baked
// into the instance) - never a separate axios instance or bare fetch.

export async function sendInvitation(
  eventId: number,
  payload: SendInvitationPayload
): Promise<NotificationLog> {
  const { data } = await apiClient.post<ApiResponse<NotificationLog>>(
    `/events/${eventId}/send-invitation/`,
    payload
  );

  return data.data;
}

export async function markWhatsAppSent(logId: number): Promise<NotificationLog> {
  const { data } = await apiClient.post<ApiResponse<NotificationLog>>(
    `/notification-logs/${logId}/mark-whatsapp-sent/`
  );

  return data.data;
}

export async function retryNotification(logId: number): Promise<NotificationLog> {
  const { data } = await apiClient.post<ApiResponse<NotificationLog>>(
    `/notification-logs/${logId}/retry/`
  );

  return data.data;
}

export interface NotificationLogsPage {
  logs: NotificationLog[];
  pagination: PaginationMeta;
}

export async function getEventNotificationLogs(
  eventId: number,
  page = 1
): Promise<NotificationLogsPage> {
  const { data } = await apiClient.get<PaginatedResponse<NotificationLog>>(
    `/events/${eventId}/notification-logs/`,
    { params: { page } }
  );

  return { logs: data.data, pagination: data.pagination };
}
