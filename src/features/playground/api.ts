import { api } from "@/lib";
import {
  syncCompletionResponseSchema,
  type CompletionRequestPayload,
  type SyncCompletionResponse,
  type StreamChunk,
} from "./types";

export interface StreamCompletionOptions {
  onChunk: (chunk: StreamChunk) => void;
  signal?: AbortSignal;
}

export const playgroundApi = {
  /**
   * POST /v1/complete — executes a blocking synchronous completion.
   */
  completeSync: async (
    apiKey: string,
    payload: CompletionRequestPayload,
    signal?: AbortSignal
  ): Promise<SyncCompletionResponse> => {
    const { data } = await api.post("/v1/complete", payload, {
      headers: { "x-api-key": apiKey },
      signal,
    });
    return syncCompletionResponseSchema.parse(data);
  },

  /**
   * POST /v1/complete/stream — establishes an SSE connection and streams tokens in real-time.
   */
  streamCompletion: async (
    apiKey: string,
    payload: CompletionRequestPayload,
    options: StreamCompletionOptions
  ): Promise<{ promptTokens?: number; completionTokens?: number; model?: string }> => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const endpoint = `${baseUrl}/v1/complete/stream`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
      signal: options.signal,
    });

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}`;
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    if (!response.body) {
      throw new Error("Readable stream is not supported in this browser response.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let finalModel: string | undefined;
    let finalPromptTokens: number | undefined;
    let finalCompletionTokens: number | undefined;

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE messages are delimited by double newlines (\n\n)
        const parts = buffer.split("\n\n");
        // Keep the last partial line in the buffer
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const trimmed = part.trim();
          if (!trimmed) continue;

          // Process all lines in the block that start with "data: "
          const lines = trimmed.split("\n");
          for (const line of lines) {
            const dataPrefix = "data:";
            if (line.startsWith(dataPrefix)) {
              const jsonStr = line.slice(dataPrefix.length).trim();
              if (!jsonStr) continue;

              try {
                const chunk = JSON.parse(jsonStr) as StreamChunk;
                if (chunk.error) {
                  throw new Error(chunk.error);
                }

                if (chunk.model) finalModel = chunk.model;
                if (typeof chunk.promptTokens === "number") {
                  finalPromptTokens = chunk.promptTokens;
                }
                if (typeof chunk.completionTokens === "number") {
                  finalCompletionTokens = chunk.completionTokens;
                }

                options.onChunk(chunk);

                if (chunk.done) {
                  return {
                    model: finalModel,
                    promptTokens: finalPromptTokens,
                    completionTokens: finalCompletionTokens,
                  };
                }
              } catch (e) {
                // If it was our explicitly thrown chunk.error, rethrow
                if (e instanceof Error && e.message !== "Unexpected end of JSON input") {
                  throw e;
                }
              }
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return {
      model: finalModel,
      promptTokens: finalPromptTokens,
      completionTokens: finalCompletionTokens,
    };
  },
};
