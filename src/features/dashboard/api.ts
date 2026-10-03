import { api } from "@/lib";
import { keysApi } from "@/features/api-keys/api";
import { healthResponseSchema, type HealthResponse } from "./types";
import type { ApiKey } from "@/features/api-keys/types";

export const dashboardApi = {
  // GET /health — verify Gateway engine health, uptime, and connectivity
  getHealth: async (): Promise<HealthResponse> => {
    const { data } = await api.get("/health");
    return healthResponseSchema.parse(data);
  },

  // GET /v1/keys — reuse authenticated keys endpoint to compute user metrics
  getKeys: async (): Promise<ApiKey[]> => {
    return keysApi.list();
  },
};
