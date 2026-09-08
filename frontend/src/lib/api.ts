import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api"

export interface ApiPagination {
	count: number
	total_pages: number
	current_page: number
	next: string | null
	previous: string | null
}

export interface ApiResponse<T = unknown> {
	success: boolean
	message?: string
	errors?: Record<string, string[]>
	data: T
	pagination?: ApiPagination
}

export const apiClient = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
})

// Attach access token to every outgoing request
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
	const token = localStorage.getItem("laverna_access_token")
	if (token && config.headers) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

// Auto refresh token on 401 response
let isRefreshing = false
let failedQueue: Array<{
	resolve: (token: string) => void
	reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
	failedQueue.forEach((promise) => {
		if (token) {
			promise.resolve(token)
		} else {
			promise.reject(error)
		}
	})
	failedQueue = []
}

apiClient.interceptors.response.use(
	(response) => response,
	async (error: AxiosError<ApiResponse>) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

		if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/auth/login/")) {
			const refreshToken = localStorage.getItem("laverna_refresh_token")
			if (!refreshToken) {
				localStorage.removeItem("laverna_access_token")
				localStorage.removeItem("laverna_user")
				window.dispatchEvent(new Event("laverna-auth-change"))
				return Promise.reject(error)
			}

			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({
						resolve: (token: string) => {
							if (originalRequest.headers) {
								originalRequest.headers.Authorization = `Bearer ${token}`
							}
							resolve(apiClient(originalRequest))
						},
						reject: (err: unknown) => reject(err),
					})
				})
			}

			originalRequest._retry = true
			isRefreshing = true

			try {
				const res = await axios.post<ApiResponse<{ access: string }>>(`${API_BASE_URL}/auth/refresh/`, {
					refresh: refreshToken,
				})
				const newAccess = res.data.data.access
				localStorage.setItem("laverna_access_token", newAccess)
				if (originalRequest.headers) {
					originalRequest.headers.Authorization = `Bearer ${newAccess}`
				}
				processQueue(null, newAccess)
				return apiClient(originalRequest)
			} catch (refreshErr) {
				processQueue(refreshErr, null)
				localStorage.removeItem("laverna_access_token")
				localStorage.removeItem("laverna_refresh_token")
				localStorage.removeItem("laverna_user")
				window.dispatchEvent(new Event("laverna-auth-change"))
				return Promise.reject(refreshErr)
			} finally {
				isRefreshing = false
			}
		}

		return Promise.reject(error)
	}
)

export function parseApiError(error: unknown): string {
	if (axios.isAxiosError(error) && error.response?.data) {
		const data = error.response.data as ApiResponse
		if (data.errors) {
			const firstError = Object.values(data.errors).flat()[0]
			if (firstError) return firstError
		}
		if (data.message) return data.message
	}
	if (error instanceof Error) return error.message
	return "An unexpected error occurred. Please try again."
}
