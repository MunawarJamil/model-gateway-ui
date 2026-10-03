import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Copy,
  Check,
  RotateCw,
  Code2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib";
import type { JobStatus } from "./types";

interface JobStatusCardProps {
  jobStatus?: JobStatus;
  jobId: string | null;
  isLoading: boolean;
  error?: unknown;
  onRefresh: () => void;
}

export function JobStatusCard({
  jobStatus,
  jobId,
  isLoading,
  error,
  onRefresh,
}: JobStatusCardProps) {
  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Response copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy text");
    }
  };

  if (!jobId) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <div className="rounded-full bg-muted p-3 text-muted-foreground mb-3">
          <Activity className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold">No Job Selected</h3>
        <p className="text-muted-foreground text-xs mt-1 max-w-xs">
          Submit an asynchronous completion or click an existing job ID from the history list to inspect its execution.
        </p>
      </Card>
    );
  }

  if (isLoading && !jobStatus) {
    return (
      <Card className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-28 w-full" />
      </Card>
    );
  }

  if (error && !jobStatus) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="rounded-full bg-destructive/10 p-3 text-destructive mb-3">
            <XCircle className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold">Unable to Load Job #{jobId}</h3>
          <p className="text-muted-foreground text-xs mt-1 max-w-sm">
            {getApiErrorMessage(
              error,
              "The job could not be retrieved. Ensure your API key is valid and active."
            )}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="mt-4 gap-1.5 text-xs"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const state = jobStatus?.state ?? "waiting";
  const result = jobStatus?.result;
  const isFinished = state === "completed" || state === "failed";

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Job #{jobId}</CardTitle>
              {/* Dynamic Status Badge */}
              {state === "completed" && (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 text-xs gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Completed
                </Badge>
              )}
              {state === "failed" && (
                <Badge variant="destructive" className="text-xs gap-1">
                  <XCircle className="h-3 w-3" /> Failed
                </Badge>
              )}
              {state === "active" && (
                <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 text-xs gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Processing
                </Badge>
              )}
              {state === "waiting" && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Clock className="h-3 w-3" /> Queued (Waiting)
                </Badge>
              )}
            </div>
            <CardDescription className="mt-1">
              Live status from Redis BullMQ queue. Polling updates automatically.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="gap-1.5 text-xs"
            >
              <RotateCw className={`h-3.5 w-3.5 ${!isFinished ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowJson(!showJson)}
              className="gap-1.5 text-xs text-muted-foreground"
            >
              <Code2 className="h-3.5 w-3.5" />
              {showJson ? "Hide JSON" : "Raw JSON"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Output section for Completed state */}
        {state === "completed" && result && (
          <div className="space-y-3">
            {/* Token & Metadata banner */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="outline" className="gap-1 py-0.5">
                <Zap className="h-3 w-3 text-amber-500" />
                Prompt: {result.promptTokens ?? 0} tokens
              </Badge>
              <Badge variant="outline" className="gap-1 py-0.5">
                <Zap className="h-3 w-3 text-amber-500" />
                Completion: {result.completionTokens ?? 0} tokens
              </Badge>
              <Badge variant="secondary" className="py-0.5">
                Provider: {result.provider ?? "ai"}
              </Badge>
              {result.model && (
                <Badge variant="secondary" className="py-0.5 font-mono text-[10px]">
                  {result.model}
                </Badge>
              )}
            </div>

            {/* Generated Text Response */}
            <div className="relative rounded-lg border bg-muted/40 p-4">
              <div className="absolute top-3 right-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => handleCopyText(result.text ?? "")}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
              <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed pr-8">
                {result.text}
              </p>
            </div>
          </div>
        )}

        {/* Failed Reason section */}
        {state === "failed" && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-xs text-destructive space-y-1">
            <p className="font-semibold">Worker Error Trace:</p>
            <p className="font-mono text-muted-foreground">
              {jobStatus?.failedReason ?? "Unknown job execution error."}
            </p>
          </div>
        )}

        {/* In-progress Queue state */}
        {!isFinished && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
            <Loader2 className="h-6 w-6 text-primary animate-spin mb-2" />
            <p className="text-sm font-semibold">Job is processing in BullMQ worker...</p>
            <p className="text-xs text-muted-foreground mt-1">
              Result will appear automatically upon completion.
            </p>
          </div>
        )}

        {/* Raw JSON Debug Inspector */}
        {showJson && (
          <div className="rounded-md border bg-muted p-3">
            <pre className="text-[11px] font-mono overflow-x-auto text-muted-foreground">
              {JSON.stringify(jobStatus, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
