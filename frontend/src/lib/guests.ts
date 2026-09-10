import { apiClient, type ApiPagination, type ApiResponse } from "./api"

export type ResponseStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "MAYBE"
export type InvitationStatus = "NOT_SENT" | "SENT" | "FAILED"

export interface GuestItem {
	id: number
	event: number
	name: string
	mobile_number: string
	email?: string
	family_member_count: number
	notes?: string
	response_status: ResponseStatus
	invitation_status: InvitationStatus
	created_at: string
	updated_at: string
}

export interface GuestListParams {
	page?: number
	page_size?: number
	search?: string
	response_status?: ResponseStatus | ""
	invitation_status?: InvitationStatus | ""
}

export interface CSVImportResult {
	created_count: number
	skipped_count: number
	skipped_rows: Array<{ row_number: number; name: string; reason: string }>
}

export async function getEventGuests(event_pk: number | string, params?: GuestListParams) {
	const res = await apiClient.get<ApiResponse<GuestItem[]> & { pagination: ApiPagination }>(
		`/events/${event_pk}/guests/`,
		{ params }
	)
	return res.data
}

export async function addGuest(event_pk: number | string, data: Partial<GuestItem>) {
	const res = await apiClient.post<ApiResponse<GuestItem>>(`/events/${event_pk}/guests/`, data)
	return res.data
}

export async function updateGuest(
	event_pk: number | string,
	guest_pk: number | string,
	data: Partial<GuestItem>
) {
	const res = await apiClient.patch<ApiResponse<GuestItem>>(
		`/events/${event_pk}/guests/${guest_pk}/`,
		data
	)
	return res.data
}

export async function deleteGuest(event_pk: number | string, guest_pk: number | string) {
	const res = await apiClient.delete<ApiResponse>(`/events/${event_pk}/guests/${guest_pk}/`)
	return res.data
}

export async function importGuestsCSV(event_pk: number | string, file: File) {
	const formData = new FormData()
	formData.append("file", file)
	const res = await apiClient.post<ApiResponse<CSVImportResult>>(
		`/events/${event_pk}/guests/import-csv/`,
		formData,
		{ headers: { "Content-Type": "multipart/form-data" } }
	)
	return res.data
}

export async function exportGuestsCSV(event_pk: number | string) {
	const res = await apiClient.get(`/events/${event_pk}/guests/export-csv/`, {
		responseType: "blob",
	})
	// Trigger browser download
	const url = window.URL.createObjectURL(new Blob([res.data]))
	const link = document.createElement("a")
	link.href = url
	link.setAttribute("download", `event_${event_pk}_guests.csv`)
	document.body.appendChild(link)
	link.click()
	link.remove()
}
