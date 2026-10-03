import { z } from "zod";

// ─── Health check schema ──────────────────────────────────────────────────────
export const healthResponseSchema = z.object({
  status: z.string(),
  uptime: z.number().optional(),
  timestamp: z.string().optional(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

// ─── Usage breakdown schemas (matching backend UsageRecord / aggregate) ───────
export const usageStatsSchema = z.object({
  daily: z.object({
    requests: z.number(),
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number(),
  }),
  monthly: z.object({
    requests: z.number(),
    totalTokens: z.number(),
  }),
});

export type UsageStats = z.infer<typeof usageStatsSchema>;

// ─── Aggregated dashboard summary model ───────────────────────────────────────
// Synthesized in the custom hook to feed KPI metric cards and charts.
export interface DashboardSummary {
  totalKeys: number;
  activeKeys: number;
  totalMonthlyTokenQuota: number;
  providerDistribution: {
    gemini: number;
    groq: number;
    other: number;
  };
  health: {
    isOnline: boolean;
    status: string;
  };
}
