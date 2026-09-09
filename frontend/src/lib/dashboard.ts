import { apiClient, type ApiResponse } from "./api"

export interface OrganizerOverviewStats {
	total_events: number
	total_guests: number
	total_accepted: number
	total_expected_attendance: number
}

export interface EventDashboardStats {
	total_guests: number
	accepted_count: number
	rejected_count: number
	maybe_count: number
	pending_count: number
	invitations_sent: number
	invitations_not_sent: number
	invitations_failed: number
	expected_attendance: number
}

export interface ChartDataPoint {
	name: string
	value: number
}

export interface EventChartsData {
	response_breakdown: ChartDataPoint[]
	invitation_breakdown: ChartDataPoint[]
}

export async function getOrganizerOverview() {
	const res = await apiClient.get<ApiResponse<OrganizerOverviewStats>>("/dashboard/overview/")
	return res.data
}

export async function getEventDashboardStats(event_pk: number | string) {
	const res = await apiClient.get<ApiResponse<EventDashboardStats>>(
		`/dashboard/events/${event_pk}/dashboard/`
	)
	return res.data
}

export async function getEventDashboardCharts(event_pk: number | string) {
	const res = await apiClient.get<ApiResponse<EventChartsData>>(
		`/dashboard/events/${event_pk}/dashboard/charts/`
	)
	return res.data
}
