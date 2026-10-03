import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { jobsApi } from "./api";
import { getApiErrorMessage } from "@/lib";
import type { AsyncCompletePayload, TrackedJob } from "./types";

const TRACKED_JOBS_KEY = "mg_tracked_jobs";

export function useJobTracker(apiKey: string) {
  // 1. History of recently submitted jobs
  const [trackedJobs, setTrackedJobs] = useState<TrackedJob[]>(() => {
    try {
      const stored = localStorage.getItem(TRACKED_JOBS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [activeJobId, setActiveJobId] = useState<string | null>(() => {
    return trackedJobs[0]?.jobId ?? null;
  });

  // Save history on change
  useEffect(() => {
    try {
      localStorage.setItem(TRACKED_JOBS_KEY, JSON.stringify(trackedJobs));
    } catch {
      // ignore storage quota issues
    }
  }, [trackedJobs]);

  // 2. Query with smart adaptive polling
  const {
    data: jobStatus,
    isLoading: isJobLoading,
    isError: isJobError,
    refetch: refetchJob,
  } = useQuery({
    queryKey: ["job-status", apiKey, activeJobId],
    queryFn: () => {
      if (!apiKey || !activeJobId) throw new Error("Missing key or job ID");
      return jobsApi.getStatus(apiKey, activeJobId);
    },
    enabled: Boolean(apiKey && activeJobId),
    refetchInterval: (query) => {
      const state = query.state.data?.state;
      // Stop polling once job is finished
      if (state === "completed" || state === "failed") {
        return false;
      }
      return 1500; // 1.5s while waiting or active
    },
  });

  // 3. Mutation: Enqueue async completion
  const enqueueMutation = useMutation({
    mutationFn: (payload: AsyncCompletePayload) =>
      jobsApi.enqueue(apiKey, payload),
    onSuccess: (data, variables) => {
      const newJob: TrackedJob = {
        jobId: data.jobId,
        prompt: variables.prompt,
        provider: variables.provider ?? "gemini",
        createdAt: new Date().toISOString(),
      };

      setTrackedJobs((prev) => [newJob, ...prev.slice(0, 19)]); // Keep last 20
      setActiveJobId(data.jobId);
      toast.success(`Job #${data.jobId} enqueued onto BullMQ`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to enqueue async job"));
    },
  });

  const clearHistory = () => {
    setTrackedJobs([]);
    setActiveJobId(null);
    localStorage.removeItem(TRACKED_JOBS_KEY);
    toast.info("Job history cleared");
  };

  return {
    jobStatus,
    activeJobId,
    setActiveJobId,
    trackedJobs,
    clearHistory,
    isLoading: isJobLoading,
    isError: isJobError,
    enqueueJob: enqueueMutation.mutateAsync,
    isEnqueuing: enqueueMutation.isPending,
    refetchJob,
  };
}
