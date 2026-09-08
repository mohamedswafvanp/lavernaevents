import { apiClient, type ApiResponse } from "./api"

export interface InvitationTemplateItem {
	id: number
	name: string
	description: string
	preview_image: string | null
	is_active: boolean
	display_order: number
}

export interface EventInvitationItem {
	id: number
	event: number
	guest: {
		id: number
		name: string
		mobile_number: string
		response_status: string
		invitation_status: string
	}
	template: {
		id: number
		name: string
	} | null
	image_file: string | null
	response_token: string
	render_status: "PENDING" | "SUCCESS" | "FAILED"
	created_at: string
}

export interface GenerateInvitationResult {
	invitation_id: number
	image_url: string
	image_file: string
	guest_id: number
	guest_name: string
	template_id: number
	template_name: string
	render_status: string
	response_token?: string
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
