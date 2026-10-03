import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { webhooksApi } from "./api";
import { getApiErrorMessage } from "@/lib";
import type { RegisterWebhookPayload, RegisteredWebhook } from "./types";

export function useWebhooks(apiKey: string) {
  const queryClient = useQueryClient();

  // Query 1: Active webhook endpoints
  const {
    data: endpoints,
    isLoading: isEndpointsLoading,
    isError: isEndpointsError,
    refetch: refetchEndpoints,
  } = useQuery({
    queryKey: ["webhooks", apiKey],
    queryFn: () => webhooksApi.list(apiKey),
    enabled: Boolean(apiKey),
  });

  // Query 2: Dead-letter failed deliveries
  const {
    data: failedDeliveries,
    isLoading: isFailedLoading,
    isError: isFailedError,
    refetch: refetchFailed,
  } = useQuery({
    queryKey: ["webhooks-failed", apiKey],
    queryFn: () => webhooksApi.listFailed(apiKey),
    enabled: Boolean(apiKey),
    refetchInterval: 20000, // 20s heartbeat for delivery tracking
  });

  // Mutation 1: Register endpoint
  const registerMutation = useMutation({
    mutationFn: (payload: RegisterWebhookPayload) =>
      webhooksApi.register(apiKey, payload),
    onSuccess: (data: RegisteredWebhook) => {
      queryClient.invalidateQueries({ queryKey: ["webhooks", apiKey] });
      toast.success("Webhook endpoint registered successfully");
      return data;
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to register webhook"));
    },
  });

  // Mutation 2: Revoke endpoint
  const revokeMutation = useMutation({
    mutationFn: (id: string) => webhooksApi.revoke(apiKey, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks", apiKey] });
      toast.success("Webhook endpoint revoked");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to revoke webhook"));
    },
  });

  const refetchAll = async () => {
    if (!apiKey) return;
    await Promise.all([refetchEndpoints(), refetchFailed()]);
  };

  return {
    endpoints: endpoints ?? [],
    failedDeliveries: failedDeliveries ?? [],
    isLoading: isEndpointsLoading || isFailedLoading,
    isEndpointsLoading,
    isFailedLoading,
    isEndpointsError,
    isFailedError,
    registerWebhook: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    revokeWebhook: revokeMutation.mutateAsync,
    isRevoking: revokeMutation.isPending,
    refetch: refetchAll,
  };
}
