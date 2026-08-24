const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api"

type ApiResponse = {
	message?: string
	errors?: Record<string, string[]>
	data?: {
		access?: string
		refresh?: string
	}
}

export function getApiErrorMessage(error: unknown) {
	if (error instanceof Error) return error.message
	return "Something went wrong. Please try again."
}

async function request(path: string, body: Record<string, string>) {
	const response = await fetch(`${API_BASE_URL}${path}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	})

	const result = (await response.json().catch(() => ({}))) as ApiResponse
	if (!response.ok) {
		const fieldError = result.errors && Object.values(result.errors).flat()[0]
		throw new Error(fieldError ?? result.message ?? "Request failed. Please try again.")
	}

	return result
}

export async function loginUser(body: { mobile_number: string; password: string }) {
	const result = await request("/auth/login/", body)
	if (result.data?.access) localStorage.setItem("laverna_access_token", result.data.access)
	if (result.data?.refresh) localStorage.setItem("laverna_refresh_token", result.data.refresh)
	return result
}

export function registerUser(body: {
	full_name: string
	email: string
	mobile_number: string
	password: string
	password_confirm: string
}) {
	return request("/auth/register/", body)
}