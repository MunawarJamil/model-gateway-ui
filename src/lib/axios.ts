import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store'
import { navigate } from './navigation'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
})

// ─── Request interceptor — attach JWT token ───────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // getState() — the correct way to access store state outside of components
    // const token = useAuthStore.getState().accessToken
    const { accessToken: token } = useAuthStore.getState()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// Backend wraps every successful response as `{ success: true, data: <payload> }`.
// Narrow that envelope so we can unwrap it centrally. We require `success` to be
// a boolean (not just present) so a legitimate resource that merely happens to
// carry `success`/`data` fields isn't silently unwrapped.
function isEnvelope(body: unknown): body is { success: boolean; data: unknown } {
  return (
    typeof body === 'object' &&
    body !== null &&
    'success' in body &&
    typeof (body as { success: unknown }).success === 'boolean' &&
    'data' in body
  )
}

// Guards against multiple concurrent 401s each firing a redirect.
let isRedirecting = false

// ─── Response interceptor — unwrap envelope + handle 401 ──────────────────────
api.interceptors.response.use(
  (response) => {
    // Unwrap `{ success, data }` so every caller receives the inner payload via
    // `response.data`. Responses without the envelope pass through untouched.
    if (isEnvelope(response.data)) {
      response.data = response.data.data
    }
    return response
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired — logout and redirect to login.
      // Skip the forced redirect during auth bootstrap (GET /v1/auth/me): an
      // expected 401 there should just resolve to a logged-out state, not bounce
      // the user mid-load and risk a redirect loop.
      const isAuthBootstrap = error.config?.url?.includes('/v1/auth/me')
      const { logout } = useAuthStore.getState()
      logout()
      if (!isAuthBootstrap && !isRedirecting) {
        isRedirecting = true
        // Router-based navigation — avoids a full-page reload (and the loss of
        // SPA state / re-download of the bundle) on session expiry.
        navigate('/login', { replace: true })
        // Allow a future redirect once this navigation settles.
        setTimeout(() => {
          isRedirecting = false
        }, 1000)
      }
    }

    return Promise.reject(error)
  }
)

export default api