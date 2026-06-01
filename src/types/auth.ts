import { z } from "zod";

// ─── Domain model — Zod se infer ─────────────────────────────────────────────
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  // Login's user payload omits createdAt; only register returns it.
  createdAt: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;

// ─── Store types — plain TS ───────────────────────────────────────────────────
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

export interface AuthActions {
  setAuth: (user: User, token: string) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export type AuthStore = AuthState & AuthActions;
