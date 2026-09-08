import { apiClient, type ApiPagination, type ApiResponse } from "./api"

export type EventType = "WEDDING" | "BIRTHDAY" | "CORPORATE" | "ANNIVERSARY" | "COMMUNITY" | "CUSTOM"

export interface EventItem {
	id: number
	name: string
	event_type: EventType
	custom_event_type_label?: string
	host_name?: string
	description?: string
	event_date: string
	event_time: string
	venue_name: string
	address: string
	google_maps_link?: string
	cover_image?: string | null
	status: "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED"
	created_at: string
	updated_at: string
}

export interface EventListParams {
	page?: number
	page_size?: number
	search?: string
	status?: string
}

export async function getEvents(params?: EventListParams) {
	const res = await apiClient.get<ApiResponse<EventItem[]> & { pagination: ApiPagination }>("/events/", {
		params,
	})
	return res.data
}

export async function getEventDetails(id: number | string) {
	const res = await apiClient.get<ApiResponse<EventItem>>(`/events/${id}/`)
	return res.data
}

export async function createEvent(data: Partial<EventItem> | FormData) {
	const headers = data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {}
	const res = await apiClient.post<ApiResponse<EventItem>>("/events/", data, { headers })
	return res.data
}

export async function updateEvent(id: number | string, data: Partial<EventItem> | FormData) {
	const headers = data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {}
	const res = await apiClient.patch<ApiResponse<EventItem>>(`/events/${id}/`, data, { headers })
	return res.data
}

export async function deleteEvent(id: number | string) {
	const res = await apiClient.delete<ApiResponse>(`/events/${id}/`)
	return res.data
}
