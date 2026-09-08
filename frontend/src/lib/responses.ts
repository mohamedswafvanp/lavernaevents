import { apiClient, type ApiResponse } from "./api"

export interface InvitationResponseDetails {
	guest_name: string
	event_name: string
	event_type: string
	event_date: string
	event_time: string
	venue_name: string
	address: string
	google_maps_link?: string
	invitation_image?: string | null
	response_status: "PENDING" | "ACCEPTED" | "REJECTED" | "MAYBE"
	already_responded: boolean
}

export async function getInvitationResponseDetails(token: string) {
	const res = await apiClient.get<ApiResponse<InvitationResponseDetails>>(`/respond/${token}/`)
	return res.data
}

export async function submitInvitationResponse(
	token: string,
	response: "ACCEPTED" | "REJECTED" | "MAYBE"
) {
	const res = await apiClient.post<ApiResponse<{ response_status: string }>>(`/respond/${token}/`, {
		response,
	})
	return res.data
}
