import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MetricCards } from "./MetricCards";
import { GatewayStatusCard } from "./GatewayStatusCard";
import { KeyUsageTable } from "./KeyUsageTable";
import { useDashboardMetrics } from "./useDashboardMetrics";
import { RotateCw, Plus, AlertCircle } from "lucide-react";

export function DashboardPage() {
  const { summary, keys, health, isLoading, isError, refetch } =
    useDashboardMetrics();

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gateway Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time status of your LLM completions pipeline, provider routing, and quotas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="gap-2"
          >
            <RotateCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button size="sm" asChild className="gap-1.5">
            <Link to="/api-keys">
              <Plus className="h-4 w-4" />
              <span>Create Key</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Network or Engine Error Banner */}
      {isError && (
        <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">Failed to fetch gateway metrics</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ensure the backend server is running at http://localhost:3000.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs shrink-0"
          >
            Retry
          </Button>
        </div>
      )}

      {/* 1. Top KPI Metric Cards */}
      <MetricCards summary={summary} isLoading={isLoading} />

      {/* 2. Gateway Status & Routing Pipeline */}
      <GatewayStatusCard health={health} isLoading={isLoading} />

      {/* 3. API Keys Allocation & Activity */}
      <KeyUsageTable keys={keys} isLoading={isLoading} />
    </div>
  );
}
