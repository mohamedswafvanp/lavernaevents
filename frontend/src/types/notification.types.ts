export type NotificationChannel = "WHATSAPP" | "EMAIL" | "SMS";
export type NotificationStatus = "LINK_GENERATED" | "SENT" | "FAILED";

export interface NotificationLog {
  id: number;
  guest: number;
  guest_name: string;
  template_name: string;
  channel: NotificationChannel;
  wa_link: string;
  status: NotificationStatus;
  failure_reason: string;
  retry_count: number;
  created_at: string;
}

export interface SendInvitationPayload {
  guest_id: number;
  template_id: number;
  channel: NotificationChannel;
}
