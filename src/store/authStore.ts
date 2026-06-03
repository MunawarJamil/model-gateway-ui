import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { AuthState, AuthStore } from "@/types";

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setAuth: (user, token) => {
          // Never enter an authenticated-but-tokenless state: a bad login that
          // yields no token must not mark the user as authenticated, or every
          // subsequent request would 401 and bounce them to /login.
          if (!token) {
            set({ ...initialState }, false, "auth/setAuth:invalid");
            return;
          }
          set(
            { user, accessToken: token, isAuthenticated: !!user && !!token },
            false,
            "auth/setAuth",
          );
        },

        setToken: (token) =>
          set(
            (state) => ({
              accessToken: token,
              isAuthenticated: !!token && !!state.user,
            }),
            false,
            "auth/setToken",
          ),

        logout: () => set({ ...initialState }, false, "auth/logout"),
      }),
      {
        name: "auth-storage",
        // Persist ONLY the token. `user` and `isAuthenticated` are derived: on
        // reload we re-fetch the user via me() and recompute the flag. Persisting
        // `isAuthenticated` would let route guards trust a stale value before
        // bootstrap resolves, causing a flash / redirect race.
        partialize: (state) => ({
          accessToken: state.accessToken,
        }),
      },
    ),
    { name: "AuthStore" },
  ),
);
