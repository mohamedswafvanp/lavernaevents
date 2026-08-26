const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api"

type ApiResponse = {
	message?: string
	errors?: Record<string, string[]>
	data?: unknown
}

export function getApiErrorMessage(error: unknown) {
	if (error instanceof Error) return error.message
	return "Something went wrong. Please try again."
}


async function request<T>(path: string, options: RequestInit = {}) {
	const accessToken = localStorage.getItem("laverna_access_token")
	let response: Response
	try {
		response = await fetch(`${API_BASE_URL}${path}`, {
			...options,
			headers: {
				"Content-Type": "application/json",
				...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
				...options.headers,
			},
		})
	} catch {
		throw new Error("Unable to connect to the server. Start Django at http://127.0.0.1:8000 and try again.")
	}

	const result = (await response.json().catch(() => ({}))) as ApiResponse
	if (!response.ok) {
		if (response.status === 401) {
			localStorage.removeItem("laverna_access_token")
			throw new Error("Your session has expired. Please log in again.")
		}
		const fieldError = result.errors && Object.values(result.errors).flat()[0]
		throw new Error(fieldError ?? result.message ?? "Request failed. Please try again.")
	}

	return result as ApiResponse & { data: T }
}

export async function loginUser(body: { mobile_number: string; password: string }) {
	const result = await request<{ access?: string; refresh?: string; user?: { email?: string } }>("/auth/login/", {
		method: "POST",
		body: JSON.stringify(body),
	})
	if (result.data?.access) localStorage.setItem("laverna_access_token", result.data.access)
	if (result.data?.refresh) localStorage.setItem("laverna_refresh_token", result.data.refresh)
	window.dispatchEvent(new Event("laverna-auth-change"))
	return result
}

export function registerUser(body: {
	full_name: string
	email: string
	mobile_number: string
	password: string
	password_confirm: string
}) {
	return request("/auth/register/", { method: "POST", body: JSON.stringify(body) })
}

export async function logoutUser() {
	const refresh = localStorage.getItem("laverna_refresh_token")
	try {
		if (refresh) await request("/auth/logout/", { method: "POST", body: JSON.stringify({ refresh }) })
	} finally {
		localStorage.removeItem("laverna_access_token")
		localStorage.removeItem("laverna_refresh_token")
		window.dispatchEvent(new Event("laverna-auth-change"))
	}
}

export function getAccessToken() {
	return localStorage.getItem("laverna_access_token")
}

export function getMembershipPlans() {
	return request<MembershipPlan[]>("/memberships/plans/", { method: "GET" })
}

export function getMySubscription() {
	return request<Subscription | null>("/memberships/my-subscription/", { method: "GET" })
}

export function getMyUsage() {
	return request<UsageSummary>("/memberships/my-usage/", { method: "GET" })
}

export function subscribeToPlan(planSlug: string) {
	return request<Subscription>("/memberships/subscribe/", {
		method: "POST",
		body: JSON.stringify({ plan_slug: planSlug }),
	})
}

export function changePlan(planSlug: string) {
	return request<{ change_type: string; subscription: Subscription }>("/memberships/change-plan/", {
		method: "POST",
		body: JSON.stringify({ plan_slug: planSlug }),
	})
}

export type MembershipPlan = {
	id: number
	name: string
	slug: string
	description: string
	price: string
	duration_days: number
	guest_limit: number
	event_limit: number
	template_limit: number
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
	template_limit: number | null
	storage_limit_mb: number | null
	gallery_enabled: boolean
	qr_code_enabled: boolean
	photographer_access_enabled: boolean
}

export function verifyEmail(body: { email: string; code: string }) {
	return request("/auth/verify-email/", { method: "POST", body: JSON.stringify(body) })
}

export function resendOtp(email: string) {
	return request("/auth/resend-otp/", { method: "POST", body: JSON.stringify({ email }) })
}

export function requestPasswordReset(email: string) {
	return request("/auth/forgot-password/", { method: "POST", body: JSON.stringify({ email }) })
}

export function getPortalAccess() {
	return request<{ can_access_portal: boolean; next_step: "verify_email" | "select_plan" | null }>("/memberships/portal-access/", { method: "GET" })
}

export function createPaymentOrder(planSlug: string) {
	return request<{ razorpay_order_id: string; razorpay_key_id: string; amount: string; currency: string; plan_slug: string }>("/payments/create-order/", {
		method: "POST",
		body: JSON.stringify({ plan_slug: planSlug }),
	})
}

export function verifyPayment(body: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
	return request("/payments/verify/", { method: "POST", body: JSON.stringify(body) })
}