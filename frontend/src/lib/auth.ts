import { apiClient, parseApiError, type ApiResponse } from "./api"

export function getApiErrorMessage(error: unknown): string {
	return parseApiError(error)
}

export type AuthUser = {
	id: number
	full_name: string
	email: string
	mobile_number: string
	role: string
	is_verified: boolean
	is_active: boolean
}

export function getAccessToken(): string | null {
	return localStorage.getItem("laverna_access_token")
}

export function getCurrentUser(): AuthUser | null {
	const user = localStorage.getItem("laverna_user")
	return user ? (JSON.parse(user) as AuthUser) : null
}

// ----------------- Auth Endpoints -----------------

export async function registerUser(body: {
	full_name: string
	email: string
	mobile_number: string
	password: string
	password_confirm: string
}) {
	const res = await apiClient.post<ApiResponse<AuthUser>>("/auth/register/", body)
	return res.data
}

export async function verifyMobile(body: { mobile_number: string; code: string }) {
	const res = await apiClient.post<ApiResponse>("/auth/verify-mobile/", body)
	return res.data
}

// Alias for backwards compatibility
export async function verifyEmail(body: { email?: string; mobile_number?: string; code: string }) {
	const mobile_number = body.mobile_number || body.email || ""
	const res = await apiClient.post<ApiResponse>("/auth/verify-mobile/", {
		mobile_number,
		code: body.code,
	})
	return res.data
}

export async function resendOtp(mobile_number: string) {
	const res = await apiClient.post<ApiResponse>("/auth/resend-otp/", { mobile_number })
	return res.data
}

export async function loginUser(body: { mobile_number: string; password: string }) {
	const res = await apiClient.post<ApiResponse<{ access: string; refresh: string; user: AuthUser }>>(
		"/auth/login/",
		body
	)
	if (res.data.data?.access) {
		localStorage.setItem("laverna_access_token", res.data.data.access)
	}
	if (res.data.data?.refresh) {
		localStorage.setItem("laverna_refresh_token", res.data.data.refresh)
	}
	if (res.data.data?.user) {
		localStorage.setItem("laverna_user", JSON.stringify(res.data.data.user))
	}
	window.dispatchEvent(new Event("laverna-auth-change"))
	return res.data
}

export async function logoutUser() {
	const refresh = localStorage.getItem("laverna_refresh_token")
	try {
		if (refresh) {
			await apiClient.post("/auth/logout/", { refresh })
		}
	} finally {
		localStorage.removeItem("laverna_access_token")
		localStorage.removeItem("laverna_refresh_token")
		localStorage.removeItem("laverna_user")
		window.dispatchEvent(new Event("laverna-auth-change"))
	}
}

export async function requestPasswordReset(email: string) {
	const res = await apiClient.post<ApiResponse>("/auth/forgot-password/", { email })
	return res.data
}

export async function confirmPasswordReset(body: {
	uid: string
	token: string
	new_password: string
	new_password_confirm: string
}) {
	const res = await apiClient.post<ApiResponse>("/auth/reset-password/", body)
	return res.data
}

// ----------------- Membership & Payments Endpoints -----------------

export type MembershipPlan = {
	id: number
	name: string
	slug: string
	description: string
	price: string
	duration_days: number
	guest_limit: number
	event_limit: number
	template_names: string[]
	storage_limit_mb: number
	gallery_enabled: boolean
	qr_code_enabled: boolean
	photographer_access_enabled: boolean
}

export type Subscription = {
	id: number
	plan: MembershipPlan
	status: string
	started_at: string
	expires_at: string
	cancelled_at: string | null
}

export type UsageSummary = {
	plan_name: string
	has_active_plan: boolean
	guest_limit: number | null
	event_limit: number | null
	template_count: number | null
	storage_limit_mb: number | null
	gallery_enabled: boolean
	qr_code_enabled: boolean
	photographer_access_enabled: boolean
}

export type PortalAccessData = {
	can_access_portal: boolean
	next_step: "verify_mobile" | "verify_email" | "select_plan" | null
}

export async function getMembershipPlans() {
	const res = await apiClient.get<ApiResponse<MembershipPlan[]>>("/memberships/plans/")
	return res.data
}

export async function getMembershipPlanDetails(slug: string) {
	const res = await apiClient.get<ApiResponse<MembershipPlan>>(`/memberships/plans/${slug}/`)
	return res.data
}

export async function getMySubscription() {
	const res = await apiClient.get<ApiResponse<Subscription | null>>("/memberships/my-subscription/")
	return res.data
}

export async function getMyUsage() {
	const res = await apiClient.get<ApiResponse<UsageSummary>>("/memberships/my-usage/")
	return res.data
}

export async function getPortalAccess() {
	const res = await apiClient.get<ApiResponse<PortalAccessData>>("/memberships/portal-access/")
	return res.data
}

export async function subscribeToPlan(plan_slug: string) {
	const res = await apiClient.post<ApiResponse<Subscription>>("/memberships/subscribe/", { plan_slug })
	return res.data
}

export async function changePlan(plan_slug: string) {
	const res = await apiClient.post<ApiResponse<{ change_type: string; subscription: Subscription }>>(
		"/memberships/change-plan/",
		{ plan_slug }
	)
	return res.data
}

export async function createPaymentOrder(plan_slug: string) {
	const res = await apiClient.post<
		ApiResponse<{
			razorpay_order_id: string
			razorpay_key_id: string
			amount: string
			currency: string
			plan_slug: string
		}>
	>("/payments/create-order/", { plan_slug })
	return res.data
}

export async function verifyPayment(body: {
	razorpay_order_id: string
	razorpay_payment_id: string
	razorpay_signature: string
}) {
	const res = await apiClient.post<ApiResponse>("/payments/verify/", body)
	return res.data
}