import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { AuthState, AuthStore } from '@/types'

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set) => ({
      // ─── Initial state ────────────────────────────────────────────────
      ...initialState,

      // ─── Actions ──────────────────────────────────────────────────────

      setAuth: (user, token) =>
        set(
          { user, accessToken: token, isAuthenticated: true },
          false,
          'auth/setAuth'
        ),

      setToken: (token) =>
        set(
          { accessToken: token },
          false,
          'auth/setToken'
        ),

      logout: () =>
        set(
          { ...initialState },
          false,
          'auth/logout'
        ),
    }),
    { name: 'AuthStore' }
  )
)