import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Key, Zap, Cpu } from "lucide-react";
import type { DashboardSummary } from "./types";

interface MetricCardsProps {
  summary: DashboardSummary;
  isLoading?: boolean;
}

export function MetricCards({ summary, isLoading }: MetricCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx} className="p-4">
            <div className="flex items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton className="mt-2 h-7 w-16" />
            <Skeleton className="mt-1 h-3 w-32" />
          </Card>
        ))}
      </div>
    );
  }

  // Format large numbers cleanly (e.g., 100,000 -> 100k or formatted string)
  const formatTokens = (tokens: number): string => {
    if (tokens >= 1_000_000) {
      return `${(tokens / 1_000_000).toFixed(1)}M`;
    }
    if (tokens >= 1_000) {
      return `${(tokens / 1_000).toFixed(0)}k`;
    }
    return tokens.toLocaleString();
  };

  const dominantProvider =
    summary.providerDistribution.gemini >= summary.providerDistribution.groq
      ? "Google Gemini"
      : "Groq LPU";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Gateway Engine Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Gateway Engine
          </CardTitle>
          <Activity
            className={`h-4 w-4 ${
              summary.health.isOnline ? "text-emerald-500" : "text-rose-500"
            }`}
          />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                summary.health.isOnline
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-rose-500"
              }`}
            />
            <div className="text-2xl font-bold">{summary.health.status}</div>
          </div>
          <p className="text-muted-foreground text-xs mt-1">
            {summary.health.isOnline
              ? "All completions healthy"
              : "Gateway unreachable"}
          </p>
        </CardContent>
      </Card>

      {/* 2. Active API Keys */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Active Keys
          </CardTitle>
          <Key className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.activeKeys}
            <span className="text-muted-foreground text-sm font-normal">
              {" "}
              / {summary.totalKeys}
            </span>
          </div>
          <p className="text-muted-foreground text-xs mt-1">
            Keys authorized for completions
          </p>
        </CardContent>
      </Card>

      {/* 3. Total Monthly Token Quota */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Token Quota
          </CardTitle>
          <Zap className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatTokens(summary.totalMonthlyTokenQuota)}
          </div>
          <p className="text-muted-foreground text-xs mt-1">
            Monthly aggregate limit
          </p>
        </CardContent>
      </Card>

      {/* 4. Default Provider */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Primary Routing
          </CardTitle>
          <Cpu className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-xl font-bold truncate">
              {dominantProvider}
            </div>
          </div>
          <div className="flex gap-1.5 mt-2">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              Gemini: {summary.providerDistribution.gemini}
            </Badge>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              Groq: {summary.providerDistribution.groq}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
