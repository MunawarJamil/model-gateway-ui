import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JobDispatchCard } from "./JobDispatchCard";
import { JobStatusCard } from "./JobStatusCard";
import { RecentJobsList } from "./RecentJobsList";
import { useJobTracker } from "./useJobTracker";
import { Key, ArrowRight, ShieldCheck } from "lucide-react";

export function JobsPage() {
  // Session-persisted API key for gateway completions
  const [apiKey, setApiKey] = useState<string>(() => {
    return sessionStorage.getItem("mg_webhooks_key") ?? "";
  });
  const [inputKey, setInputKey] = useState<string>(apiKey);

  useEffect(() => {
    if (apiKey) {
      sessionStorage.setItem("mg_webhooks_key", apiKey);
    }
  }, [apiKey]);

  const {
    jobStatus,
    activeJobId,
    setActiveJobId,
    trackedJobs,
    clearHistory,
    isLoading,
    error,
    enqueueJob,
    isEnqueuing,
    refetchJob,
  } = useJobTracker(apiKey);

  const handleApplyKey = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(inputKey.trim());
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Async Jobs & Queue Tracker</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Enqueue non-blocking completions on BullMQ and observe real-time background execution.
        </p>
      </div>

      {/* Scoping API Key Bar */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <form
          onSubmit={handleApplyKey}
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <Key className="h-4 w-4 text-primary shrink-0" />
            <span className="text-muted-foreground">Gateway API Key:</span>
          </div>

          <div className="flex flex-1 items-center gap-2 max-w-lg">
            <Input
              type="password"
              placeholder="Paste raw key (mgk_live_...) to dispatch and track jobs"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="font-mono text-xs"
            />
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              disabled={!inputKey.trim() || inputKey === apiKey}
            >
              Apply
            </Button>
          </div>
        </form>

        {!apiKey && (
          <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
            <span>
              An API key is required to authenticate completions with the gateway.
            </span>
            <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs gap-1">
              <Link to="/api-keys">
                Manage Keys <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      {!apiKey ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <div className="rounded-full bg-primary/10 p-4 text-primary mb-4">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-semibold">Enter an API Key to Access Queue</h2>
          <p className="text-muted-foreground text-sm mt-1 max-w-md">
            Enter your raw API key above to dispatch async jobs and poll execution results from Redis.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Main Action & Inspector Column (8 cols) */}
          <div className="space-y-6 lg:col-span-8">
            <JobDispatchCard
              onEnqueue={enqueueJob}
              isEnqueuing={isEnqueuing}
              disabled={!apiKey}
            />

            <JobStatusCard
              jobStatus={jobStatus}
              jobId={activeJobId}
              isLoading={isLoading}
              error={error}
              onRefresh={refetchJob}
            />
          </div>

          {/* Recent Queue History Column (4 cols) */}
          <div className="lg:col-span-4">
            <RecentJobsList
              jobs={trackedJobs}
              activeJobId={activeJobId}
              onSelectJob={(id) => setActiveJobId(id)}
              onClear={clearHistory}
            />
          </div>
        </div>
      )}
    </div>
  );
}
