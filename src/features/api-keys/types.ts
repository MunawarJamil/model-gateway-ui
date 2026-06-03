import { z } from "zod";

// ─── Form input schema (create) ───────────────────────────────────────────────
export const createKeySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  requestsPerMin: z.number({ message: "Enter a number" }).int().min(1),
  monthlyTokenLimit: z.number({ message: "Enter a number" }).int().min(1),
});

// Manually define — no optional fields, no defaults in schema
export type CreateKeyPayload = {
  name: string;
  requestsPerMin: number;
  monthlyTokenLimit: number;
};

// ─── Response schemas (validated at the API boundary) ──────────────────────────
// Parsed in keysApi so backend contract drift surfaces as a clear runtime error
// rather than silently flowing through as the wrong shape.

// What GET /v1/keys returns per item.
export const apiKeySchema = z.object({
  id: z.string(),
  name: z.string(),
  prefix: z.string(),
  maskedKey: z.string(),
  isActive: z.boolean(),
  requestsPerMin: z.number(),
  monthlyTokenLimit: z.number(),
  lastUsedAt: z.string().nullable(),
  createdAt: z.string(),
});

export const apiKeyListSchema = z.array(apiKeySchema);

// What POST /v1/keys returns (raw key — shown once only).
export const createdApiKeySchema = z.object({
  id: z.string(),
  name: z.string(),
  prefix: z.string(),
  key: z.string(),
  requestsPerMin: z.number(),
  monthlyTokenLimit: z.number(),
  createdAt: z.string(),
});

export const revokeKeyResponseSchema = z.object({
  message: z.string(),
});

// ─── Derived TS types ──────────────────────────────────────────────────────────
export type ApiKey = z.infer<typeof apiKeySchema>;
export type CreatedApiKey = z.infer<typeof createdApiKeySchema>;
