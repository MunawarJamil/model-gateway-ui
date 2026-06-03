import { api } from "@/lib"; // shared axios instance (envelope already unwrapped)
import {
  apiKeyListSchema,
  createdApiKeySchema,
  revokeKeyResponseSchema,
  type ApiKey,
  type CreatedApiKey,
  type CreateKeyPayload,
} from "./types";

export const keysApi = {
  // GET /v1/keys — list all active keys
  list: async (): Promise<ApiKey[]> => {
    const { data } = await api.get("/v1/keys");
    return apiKeyListSchema.parse(data);
  },

  // POST /v1/keys — create new key (raw key returned once)
  create: async (payload: CreateKeyPayload): Promise<CreatedApiKey> => {
    const { data } = await api.post("/v1/keys", payload);
    return createdApiKeySchema.parse(data);
  },

  // DELETE /v1/keys/:id — revoke a key
  revoke: async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/v1/keys/${id}`);
    return revokeKeyResponseSchema.parse(data);
  },
};
