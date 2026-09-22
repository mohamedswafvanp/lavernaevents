import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

// Match whatever host the page itself is being viewed from, rather than
// hardcoding one. The backend's auth cookies are SameSite=Lax, and browsers
// treat "localhost" and "127.0.0.1" as different sites even though both
// resolve to the loopback interface - a page at http://localhost:5173
// calling a hardcoded http://127.0.0.1:8000 is a cross-site request, so
// SameSite=Lax cookies never get attached to it (fetch/XHR only sends
// SameSite=Lax cookies on same-site requests; cross-site top-level
// navigation is the only cross-site case Lax allows, which doesn't apply
// here). Deriving the API host from window.location.hostname keeps every
// request same-site as the page, whichever of the two hosts - or a LAN IP,
// for on-device testing - it's opened from. Both "localhost" and
// "127.0.0.1" are already covered on the backend (CORS_ALLOWED_ORIGINS and
// DJANGO_ALLOWED_HOSTS both list both), so this only changes which one a
// given page load consistently uses.
const API_HOST =
  typeof window !== "undefined" && window.location.hostname
    ? window.location.hostname
    : "127.0.0.1";

// The bare origin (no /api suffix) - needed to resolve relative media URLs
// (e.g. event cover images) returned by endpoints that don't build an
// absolute URL themselves. See lib/media.ts.
export const API_ORIGIN = `http://${API_HOST}:8000`;

export const API_BASE_URL = `${API_ORIGIN}/api`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// /auth/login/ and /auth/register/ never carry a session to refresh.
// /auth/refresh/ is the hard safety check: without it, a 401 from the
// refresh call itself would re-enter this same retry flow and loop.
// /auth/me/ is intentionally NOT in this list - a 401 there is exactly the
// "access token expired, refresh cookie might still be valid" case this
// interceptor exists to handle, so it must stay eligible for one refresh
// attempt like any other authenticated request.
const NO_REFRESH_PATHS = ["/auth/login/", "/auth/register/", "/auth/refresh/"];

function shouldSkipRefresh(url?: string): boolean {
  if (!url) return false;
  return NO_REFRESH_PATHS.some((path) => url.includes(path));
}

let isRefreshing = false;
let refreshWaiters: Array<(success: boolean) => void> = [];

function notifyWaiters(success: boolean) {
  refreshWaiters.forEach((resolve) => resolve(success));
  refreshWaiters = [];
}

async function refreshSession(): Promise<boolean> {
  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshWaiters.push(resolve);
    });
  }

  isRefreshing = true;

  try {
    await axios.post(
      `${API_BASE_URL}/auth/refresh/`,
      {},
      { withCredentials: true }
    );
    notifyWaiters(true);
    return true;
  } catch {
    notifyWaiters(false);
    return false;
  } finally {
    isRefreshing = false;
  }
}

let sessionExpiredHandler: (() => void) | null = null;

export function setSessionExpiredHandler(handler: () => void) {
  sessionExpiredHandler = handler;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !shouldSkipRefresh(originalRequest.url)
    ) {
      originalRequest._retry = true;

      const refreshed = await refreshSession();

      if (refreshed) {
        return apiClient(originalRequest);
      }

      sessionExpiredHandler?.();
    }

    return Promise.reject(error);
  }
);
