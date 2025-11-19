import axios from "axios";

const baseURL = (import.meta?.env?.VITE_BACKEND_URL || "").replace(/\/$/, "");

const api = axios.create({
  baseURL: baseURL ? `${baseURL}/api` : "/api",
  withCredentials: true, // allow cookies for refresh routes when needed
});

// Access token management (in-memory)
let ACCESS_TOKEN = null;
export function setAccessToken(token) {
  ACCESS_TOKEN = token || null;
  if (ACCESS_TOKEN) {
    api.defaults.headers.common["Authorization"] = `Bearer ${ACCESS_TOKEN}`;
    try {
      // persist for page reloads
      window?.localStorage?.setItem("access_token", ACCESS_TOKEN);
    } catch {}
    try {
      window?.dispatchEvent(
        new CustomEvent("auth:token", { detail: { token: ACCESS_TOKEN } })
      );
    } catch {}
  } else {
    delete api.defaults.headers.common["Authorization"];
    try {
      window?.localStorage?.removeItem("access_token");
    } catch {}
    try {
      window?.dispatchEvent(
        new CustomEvent("auth:token", { detail: { token: null } })
      );
    } catch {}
  }
}

// CSRF bootstrap: fetch CSRF token once and set it as a default header
let csrfInitialized = false;
export async function ensureCsrf() {
  if (csrfInitialized) return;
  try {
    const res = await api.get(`/auth/csrf-token`);
    const token = res.data?.csrfToken;
    if (token) {
      api.defaults.headers.common["x-csrf-token"] = token;
      csrfInitialized = true;
    }
  } catch (e) {
    // noop; server might not require it for GETs
  }
}

// Auto-init on import for convenience; callers can await ensureCsrf() explicitly as well
ensureCsrf();

// Load persisted access token on startup (if present)
try {
  const saved = window?.localStorage?.getItem("access_token");
  if (saved) setAccessToken(saved);
} catch {}

// Response interceptor: handle 401 by refreshing access token once, then retry original request.
let refreshPromise = null;
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const response = error?.response;
    const originalRequest = error?.config || {};
    const url = originalRequest?.url || "";

    // If CSRF missing/invalid, fetch it once and retry the request
    if (
      response?.status === 403 &&
      !originalRequest._csrfRetry &&
      /csrf/i.test(response?.data?.message || "")
    ) {
      try {
        await ensureCsrf();
        originalRequest._csrfRetry = true;
        return api(originalRequest);
      } catch (e) {
        return Promise.reject(error);
      }
    }

    // Attempt token refresh on 401 once per request
    if (
      response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.skipAuthRefresh &&
      !/\/auth\/(login|signup)/.test(url) && // don't refresh for explicit auth endpoints
      !/\/auth\/token\/refresh/.test(url) // avoid recursive refresh
    ) {
      originalRequest._retry = true;
      try {
        await ensureCsrf();
        if (!refreshPromise) {
          refreshPromise = api.post("/auth/token/refresh");
        }
        const refreshRes = await refreshPromise.finally(() => {
          refreshPromise = null;
        });
        const newToken = refreshRes?.data?.accessToken;
        if (newToken) {
          setAccessToken(newToken);
          // Retry original request with new token
          return api(originalRequest);
        }
      } catch (e) {
        // Clear token so callers can detect auth state
        setAccessToken(null);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
