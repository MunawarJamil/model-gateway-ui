import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { dashboardApi } from "./api";
import type { DashboardSummary } from "./types";
import type { ApiKey } from "@/features/api-keys/types";

export function useDashboardMetrics() {
  // Query 1: Fetch user API keys (shares cache with ApiKeysPage)
  const {
    data: keys,
    isLoading: isKeysLoading,
    isError: isKeysError,
    refetch: refetchKeys,
  } = useQuery({
    queryKey: ["api-keys"],
    queryFn: dashboardApi.getKeys,
  });

  // Query 2: Liveness probe with background polling
  const {
    data: health,
    isLoading: isHealthLoading,
    isError: isHealthError,
    refetch: refetchHealth,
  } = useQuery({
    queryKey: ["gateway-health"],
    queryFn: dashboardApi.getHealth,
    refetchInterval: 30000, // 30s heartbeat
    retry: 1,
  });

  // Compute derived business metrics
  const summary: DashboardSummary = useMemo(() => {
    const keyList = keys ?? [];
    const active = keyList.filter((k) => k.isActive);

    const providerCounts = {
      gemini: 0,
      groq: 0,
      other: 0,
    };

    let totalTokens = 0;

    for (const key of active) {
      totalTokens += key.monthlyTokenLimit;

      // Safe type intersection without using `any`
      const provider =
        (key as ApiKey & { defaultProvider?: string }).defaultProvider?.toLowerCase() ??
        "gemini";

      if (provider.includes("gemini")) {
        providerCounts.gemini += 1;
      } else if (provider.includes("groq")) {
        providerCounts.groq += 1;
      } else {
        providerCounts.other += 1;
      }
    }

    const isOnline = !isHealthError && health?.status === "ok";

    return {
      totalKeys: keyList.length,
      activeKeys: active.length,
      totalMonthlyTokenQuota: totalTokens,
      providerDistribution: providerCounts,
      health: {
        isOnline,
        status: isOnline ? "Operational" : "Offline / Degraded",
      },
    };
  }, [keys, health, isHealthError]);

  const refetchAll = async () => {
    await Promise.all([refetchKeys(), refetchHealth()]);
  };

  return {
    summary,
    keys: keys ?? [],
    health,
    isLoading: isKeysLoading || isHealthLoading,
    isError: isKeysError,
    refetch: refetchAll,
  };
}
