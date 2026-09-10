import { apiClient, type ApiResponse } from "./api"

export interface InvitationTemplateItem {
	id: number
	name: string
	description: string
	preview_image: string | null
	display_order: number
}

export interface EventInvitationItem {
	id: number
	guest: number
	guest_name: string
	template: number
	template_name: string
	response_token: string
	image_file: string | null
	pdf_file: string | null
	status: "PENDING" | "SUCCESS" | "FAILED"
	created_at: string
}

export interface GenerateInvitationResult {
	id: number
	guest: number
	guest_name: string
	template: number
	template_name: string
	response_token: string
	image_file: string | null
	pdf_file: string | null
	status: "PENDING" | "SUCCESS" | "FAILED"
	created_at: string
}

export async function getPlanTemplates() {
	const res = await apiClient.get<ApiResponse<InvitationTemplateItem[]>>("/invitation-templates/")
	return res.data
}

export async function getEventInvitations(event_pk: number | string) {
	const res = await apiClient.get<ApiResponse<EventInvitationItem[]>>(`/events/${event_pk}/invitations/`)
	return res.data
}

export async function generateInvitation(
	event_pk: number | string,
	data: { guest_id: number; template_id: number }
) {
	const res = await apiClient.post<ApiResponse<GenerateInvitationResult>>(
		`/events/${event_pk}/invitations/generate/`,
		data
	)
	return res.data
}
