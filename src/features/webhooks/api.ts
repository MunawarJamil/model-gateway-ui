import { api } from "@/lib";
import {
  webhookEndpointListSchema,
  registeredWebhookSchema,
  failedDeliveryListSchema,
  type WebhookEndpoint,
  type RegisteredWebhook,
  type RegisterWebhookPayload,
  type FailedDelivery,
} from "./types";

export const webhooksApi = {
  // GET /v1/webhooks — list all active webhook endpoints for the API key
  list: async (apiKey: string): Promise<WebhookEndpoint[]> => {
    const { data } = await api.get("/v1/webhooks", {
      headers: { "x-api-key": apiKey },
    });
    return webhookEndpointListSchema.parse(data);
  },

  // POST /v1/webhooks — register new URL (raw HMAC secret returned only once)
  register: async (
    apiKey: string,
    payload: RegisterWebhookPayload
  ): Promise<RegisteredWebhook> => {
    const { data } = await api.post("/v1/webhooks", payload, {
      headers: { "x-api-key": apiKey },
    });
    return registeredWebhookSchema.parse(data);
  },

  // DELETE /v1/webhooks/:id — revoke an endpoint
  revoke: async (apiKey: string, id: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/v1/webhooks/${id}`, {
      headers: { "x-api-key": apiKey },
    });
    return data as { message: string };
  },

  // GET /v1/webhooks/failed — list dead-letter delivery logs
  listFailed: async (apiKey: string): Promise<FailedDelivery[]> => {
    const { data } = await api.get("/v1/webhooks/failed", {
      headers: { "x-api-key": apiKey },
    });
    return failedDeliveryListSchema.parse(data);
  },
};
