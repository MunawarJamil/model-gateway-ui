import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store'

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

// ─── Response interceptor — handle 401 ───────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired — logout and redirect to login
      const { logout } = useAuthStore.getState()
      logout()
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default api