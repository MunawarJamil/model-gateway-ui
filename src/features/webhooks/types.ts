import { z } from "zod";

// ─── Registration Payload Schema ──────────────────────────────────────────────
export const registerWebhookSchema = z.object({
  url: z
    .string()
    .min(1, "Webhook URL is required")
    .url("Must be a valid HTTP or HTTPS URL"),
});

export type RegisterWebhookPayload = z.infer<typeof registerWebhookSchema>;

// ─── Webhook Endpoint Schemas ─────────────────────────────────────────────────
export const webhookEndpointSchema = z.object({
  id: z.string(),
  url: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
});

export const webhookEndpointListSchema = z.array(webhookEndpointSchema);
export type WebhookEndpoint = z.infer<typeof webhookEndpointSchema>;

// What POST /v1/webhooks returns (secret shown once only)
export const registeredWebhookSchema = z.object({
  id: z.string(),
  url: z.string(),
  secret: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
});

export type RegisteredWebhook = z.infer<typeof registeredWebhookSchema>;

// ─── Dead-Letter / Failed Delivery Schema ─────────────────────────────────────
export const failedDeliverySchema = z.object({
  id: z.string(),
  url: z.string(),
  event: z.string(),
  bullJobId: z.string(),
  attemptCount: z.number(),
  lastStatusCode: z.number().nullable().optional(),
  lastError: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const failedDeliveryListSchema = z.array(failedDeliverySchema);
export type FailedDelivery = z.infer<typeof failedDeliverySchema>;
