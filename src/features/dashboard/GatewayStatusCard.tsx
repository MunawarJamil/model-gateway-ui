import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Server,
  CheckCircle2,
  ArrowRightLeft,
  Radio,
  Layers,
  Sparkles,
  Bot,
} from "lucide-react";
import type { HealthResponse } from "./types";

interface GatewayStatusCardProps {
  health?: HealthResponse;
  isLoading?: boolean;
}

function formatUptime(seconds?: number): string {
  if (!seconds || seconds <= 0) return "Starting...";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  return parts.join(" ");
}

export function GatewayStatusCard({ health, isLoading }: GatewayStatusCardProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-72 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </Card>
    );
  }

  const isOnline = health?.status === "ok";

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Server className="h-5 w-5 text-primary" />
              Gateway Infrastructure & Router
            </CardTitle>
            <CardDescription className="mt-1">
              Active LLM provider routing and auto-failover engine.
            </CardDescription>
          </div>
          <Badge
            variant={isOnline ? "default" : "destructive"}
            className="w-fit gap-1.5 px-2.5 py-1 text-xs"
          >
            <Radio className="h-3 w-3 animate-pulse" />
            {isOnline ? "Engine Operational" : "Service Offline"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Failover Pipeline Overview */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Provider Auto-Failover Strategy
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowRightLeft className="h-3.5 w-3.5 text-primary" />
              Automatic Switchover
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Primary Provider */}
            <div className="flex items-start gap-3 rounded-md border bg-card p-3">
              <div className="rounded-md bg-blue-500/10 p-2 text-blue-500">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">Google Gemini</span>
                  <Badge variant="outline" className="text-[10px] py-0 px-1 text-blue-600 border-blue-200">
                    Primary
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Default target for sync completions & SSE streaming tokens.
                </p>
              </div>
            </div>

            {/* Fallback Provider */}
            <div className="flex items-start gap-3 rounded-md border bg-card p-3">
              <div className="rounded-md bg-amber-500/10 p-2 text-amber-500">
                <Bot className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">Groq LPU</span>
                  <Badge variant="outline" className="text-[10px] py-0 px-1 text-amber-600 border-amber-200">
                    Fallback
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ultra-low latency fallback if primary faces rate-limits or downtime.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Runtime Diagnostics & Capabilities */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-center sm:text-left">
          <div>
            <span className="text-xs text-muted-foreground block">System Uptime</span>
            <span className="text-sm font-semibold text-foreground">
              {formatUptime(health?.uptime)}
            </span>
          </div>

          <div>
            <span className="text-xs text-muted-foreground block">Streaming Mode</span>
            <span className="text-sm font-semibold text-emerald-600 flex items-center justify-center sm:justify-start gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              SSE Enabled
            </span>
          </div>

          <div>
            <span className="text-xs text-muted-foreground block">Async Queue</span>
            <span className="text-sm font-semibold text-emerald-600 flex items-center justify-center sm:justify-start gap-1">
              <Layers className="h-3.5 w-3.5" />
              BullMQ + Redis
            </span>
          </div>

          <div>
            <span className="text-xs text-muted-foreground block">Webhook Delivery</span>
            <span className="text-sm font-semibold text-emerald-600 flex items-center justify-center sm:justify-start gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              HMAC-Signed
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
