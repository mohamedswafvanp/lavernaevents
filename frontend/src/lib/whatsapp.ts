import { apiClient, type ApiResponse } from "./api"

export interface WhatsAppSendResult {
	log_id: number
	wa_link: string
	mobile_number: string
	guest_name: string
	status: "SENT" | "NOT_SENT" | "FAILED"
	image_url: string | null
}

export interface WhatsAppLogItem {
	id: number
	guest: number
	guest_name: string
	wa_link: string
	status: "SENT" | "NOT_SENT" | "FAILED"
	retry_count: number
	created_at: string
}

export async function sendWhatsAppInvitation(invitation_pk: number | string) {
	const res = await apiClient.post<ApiResponse<WhatsAppSendResult>>(
		`/invitations/${invitation_pk}/send-whatsapp/`
	)
	return res.data
}

export async function markWhatsAppSent(log_pk: number | string) {
	const res = await apiClient.post<ApiResponse>(`/whatsapp-logs/${log_pk}/mark-sent/`)
	return res.data
}

export async function retryWhatsAppSend(log_pk: number | string) {
	const res = await apiClient.post<ApiResponse<WhatsAppSendResult>>(`/whatsapp-logs/${log_pk}/retry/`)
	return res.data
}

export async function getEventWhatsAppLogs(event_pk: number | string) {
	const res = await apiClient.get<ApiResponse<WhatsAppLogItem[]>>(`/events/${event_pk}/whatsapp-logs/`)
	return res.data
}
