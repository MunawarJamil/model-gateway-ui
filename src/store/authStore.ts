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

        setAuth: (user, token) =>
          set(
            { user, accessToken: token, isAuthenticated: true },
            false,
            "auth/setAuth",
          ),

        setToken: (token) =>
          set({ accessToken: token }, false, "auth/setToken"),

        logout: () => set({ ...initialState }, false, "auth/logout"),
      }),
      {
        name: "auth-storage",
        // Sirf ye teen fields persist karo — actions nahi
        partialize: (state) => ({
          user: state.user,
          accessToken: state.accessToken,
          isAuthenticated: state.isAuthenticated,
        }),
      },
    ),
    { name: "AuthStore" },
  ),
);
