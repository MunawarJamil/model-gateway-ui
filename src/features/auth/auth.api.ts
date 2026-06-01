import api from "@/lib/axios";
import type { User } from "@/types";

// ─── Raw backend response shapes ──────────────────────────────────────────────
// Login returns the JWT under `token` (not `accessToken`) and a user without
// `createdAt`.
interface LoginApiResponse {
  token: string;
  user: User;
}

// ─── Normalised shape the store/pages consume ─────────────────────────────────
interface AuthResult {
  accessToken: string;
  user: User;
}

export const authApi = {
  // Backend: { token, user } → normalise `token` to `accessToken`.
  login: async (email: string, password: string): Promise<AuthResult> => {
    const { data } = await api.post<LoginApiResponse>("/v1/auth/login", {
      email,
      password,
    });
    return { accessToken: data.token, user: data.user };
  },

  // Backend register returns ONLY the created user (no token), so the caller
  // must log in afterwards to obtain a session.
  register: async (
    name: string,
    email: string,
    password: string,
  ): Promise<User> => {
    const { data } = await api.post<User>("/v1/auth/register", {
      name,
      email,
      password,
    });
    return data;
  },

  me: async (): Promise<User> => {
    const { data } = await api.get<User>("/v1/auth/me");
    return data;
  },
};
