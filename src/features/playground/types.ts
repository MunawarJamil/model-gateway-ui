import { z } from "zod";

export type CompletionMode = "stream" | "sync";

export type ProviderOption = "auto" | "gemini" | "groq";

export interface ModelOption {
  id: string;
  name: string;
  provider: "gemini" | "groq";
  description?: string;
  isDefault?: boolean;
}

export const AVAILABLE_MODELS: Record<"gemini" | "groq", ModelOption[]> = {
  gemini: [
    {
      id: "gemini-3.8-flash",
      name: "Gemini 3.8 Flash",
      provider: "gemini",
      description: "Fast, cost-efficient multimodal reasoning (default)",
      isDefault: true,
    },
    {
      id: "gemini-1.5-flash",
      name: "Gemini 1.5 Flash",
      provider: "gemini",
      description: "High speed, lightweight inference",
    },
    {
      id: "gemini-1.5-pro",
      name: "Gemini 1.5 Pro",
      provider: "gemini",
      description: "Deep reasoning and extensive context window",
    },
  ],
  groq: [
    {
      id: "openai/gpt-oss-20b",
      name: "GPT OSS 20B",
      provider: "groq",
      description: "Open source 20B architecture on ultra-fast Groq LPU (default)",
      isDefault: true,
    },
    {
      id: "llama-3.1-8b-instant",
      name: "Llama 3.1 8B Instant",
      provider: "groq",
      description: "Sub-second response speed, ultra-low latency",
    },
    {
      id: "llama-3.3-70b-versatile",
      name: "Llama 3.3 70B Versatile",
      provider: "groq",
      description: "High intelligence general-purpose reasoning",
    },
    {
      id: "mixtral-8x7b-32768",
      name: "Mixtral 8x7B (32k context)",
      provider: "groq",
      description: "MoE architecture for large context windows",
    },
  ],
};

// Request payload for POST /v1/complete and POST /v1/complete/stream
export interface CompletionRequestPayload {
  prompt: string;
  provider?: "gemini" | "groq";
  model?: string;
  templateId?: string;
  variables?: Record<string, string>;
}

// Response schema for Sync POST /v1/complete
export const syncCompletionResponseSchema = z.object({
  text: z.string(),
  provider: z.string(),
  model: z.string(),
  fallbackUsed: z.boolean().optional().default(false),
  usage: z.object({
    promptTokens: z.number().nonnegative(),
    completionTokens: z.number().nonnegative(),
    totalTokens: z.number().nonnegative(),
  }),
  latencyMs: z.number().nonnegative(),
});

export type SyncCompletionResponse = z.infer<typeof syncCompletionResponseSchema>;

// SSE Stream chunk yielded by POST /v1/complete/stream
export interface StreamChunk {
  token: string;
  done: boolean;
  model?: string;
  promptTokens?: number;
  completionTokens?: number;
  error?: string;
}

// Metrics captured from completion execution
export interface CompletionMetrics {
  latencyMs?: number;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  provider?: string;
  model?: string;
  fallbackUsed?: boolean;
}

// Local history entry in the playground
export interface PlaygroundHistoryItem {
  id: string;
  prompt: string;
  response: string;
  mode: CompletionMode;
  provider: ProviderOption;
  model?: string;
  metrics?: CompletionMetrics;
  timestamp: number;
  status: "success" | "error" | "aborted";
  error?: string;
}
