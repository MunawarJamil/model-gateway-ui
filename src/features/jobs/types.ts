import { z } from "zod";

// ─── Enqueue Payload Schema ───────────────────────────────────────────────────
export const asyncCompletePayloadSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
  provider: z.enum(["gemini", "groq"]),
  model: z.string().optional(),
});


export type AsyncCompletePayload = z.infer<typeof asyncCompletePayloadSchema>;

// What POST /v1/complete/async returns
export const jobSubmissionResponseSchema = z.object({
  jobId: z.string(),
});

export type JobSubmissionResponse = z.infer<typeof jobSubmissionResponseSchema>;

// ─── BullMQ Job Status & Result Schemas ───────────────────────────────────────
export const jobResultSchema = z.object({
  text: z.string().optional(),
  provider: z.string().optional(),
  model: z.string().optional(),
  promptTokens: z.number().optional(),
  completionTokens: z.number().optional(),
});

export type JobResult = z.infer<typeof jobResultSchema>;

export const jobStatusSchema = z.object({
  jobId: z.string(),
  state: z.string(), // "waiting" | "active" | "completed" | "failed"
  result: jobResultSchema.nullable().optional(),
  failedReason: z.string().nullable().optional(),
});

export type JobStatus = z.infer<typeof jobStatusSchema>;

// Local session model for tracking recently enqueued jobs
export interface TrackedJob {
  jobId: string;
  prompt: string;
  provider: string;
  createdAt: string;
}
