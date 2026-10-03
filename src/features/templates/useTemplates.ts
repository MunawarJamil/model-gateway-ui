import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib";
import { templatesApi } from "./api";
import type { CreateTemplatePayload } from "./types";

export function useTemplates(apiKey: string) {
  const queryClient = useQueryClient();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const queryKey = ["templates", apiKey];

  const templatesQuery = useQuery({
    queryKey,
    queryFn: () => templatesApi.list(apiKey),
    enabled: Boolean(apiKey),
    retry: false,
    staleTime: 10_000,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateTemplatePayload) =>
      templatesApi.create(apiKey, payload),
    onSuccess: (newTemplate) => {
      queryClient.invalidateQueries({ queryKey });
      setSelectedTemplateId(newTemplate.id);
      toast.success(`Template "${newTemplate.name}" created successfully`);
    },
    onError: (err: unknown) => {
      const msg = getApiErrorMessage(err);
      toast.error(`Failed to create template: ${msg}`);
    },
  });

  const selectedTemplate = templatesQuery.data?.find(
    (t) => t.id === selectedTemplateId
  );

  return {
    templates: templatesQuery.data ?? [],
    isLoading: templatesQuery.isLoading,
    isRefetching: templatesQuery.isRefetching,
    error: templatesQuery.error,
    refetch: templatesQuery.refetch,
    selectedTemplateId,
    setSelectedTemplateId,
    selectedTemplate,
    createTemplate: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
