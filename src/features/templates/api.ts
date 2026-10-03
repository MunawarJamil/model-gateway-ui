import { api } from "@/lib";
import {
  promptTemplateSchema,
  promptTemplatesListSchema,
  type PromptTemplate,
  type CreateTemplatePayload,
} from "./types";

export const templatesApi = {
  /**
   * GET /v1/templates — lists all prompt templates owned by the current API key's user.
   */
  list: async (apiKey: string): Promise<PromptTemplate[]> => {
    const { data } = await api.get("/v1/templates", {
      headers: { "x-api-key": apiKey },
    });
    return promptTemplatesListSchema.parse(data);
  },

  /**
   * GET /v1/templates/:id — fetches a single template by ID.
   */
  getById: async (apiKey: string, id: string): Promise<PromptTemplate> => {
    const { data } = await api.get(`/v1/templates/${id}`, {
      headers: { "x-api-key": apiKey },
    });
    return promptTemplateSchema.parse(data);
  },

  /**
   * POST /v1/templates — creates a new prompt template.
   */
  create: async (
    apiKey: string,
    payload: CreateTemplatePayload
  ): Promise<PromptTemplate> => {
    const { data } = await api.post("/v1/templates", payload, {
      headers: { "x-api-key": apiKey },
    });
    return promptTemplateSchema.parse(data);
  },
};
