import { api } from "@/lib";
import {
  jobSubmissionResponseSchema,
  jobStatusSchema,
  type AsyncCompletePayload,
  type JobSubmissionResponse,
  type JobStatus,
} from "./types";

export const jobsApi = {
  // POST /v1/complete/async — enqueue background completion on BullMQ
  enqueue: async (
    apiKey: string,
    payload: AsyncCompletePayload
  ): Promise<JobSubmissionResponse> => {
    const { data } = await api.post("/v1/complete/async", payload, {
      headers: { "x-api-key": apiKey },
    });
    return jobSubmissionResponseSchema.parse(data);
  },

  // GET /v1/jobs/:id — poll BullMQ job state and result
  getStatus: async (apiKey: string, jobId: string): Promise<JobStatus> => {
    const { data } = await api.get(`/v1/jobs/${jobId}`, {
      headers: { "x-api-key": apiKey },
    });
    return jobStatusSchema.parse(data);
  },
};
