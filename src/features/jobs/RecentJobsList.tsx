import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, Trash2, Clock, ChevronRight } from "lucide-react";
import type { TrackedJob } from "./types";

interface RecentJobsListProps {
  jobs: TrackedJob[];
  activeJobId: string | null;
  onSelectJob: (jobId: string) => void;
  onClear: () => void;
}

function formatRelativeTime(dateStr: string): string {
  try {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  } catch {
    return "";
  }
}

export function RecentJobsList({
  jobs,
  activeJobId,
  onSelectJob,
  onClear,
}: RecentJobsListProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4 text-primary" />
            Recent Job Queue
          </CardTitle>
          {jobs.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1 px-2"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
        <CardDescription className="text-xs">
          Select a job to poll its status and inspect output.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        {jobs.length === 0 ? (
          <div className="rounded-lg border border-dashed py-8 text-center text-xs text-muted-foreground">
            No recently dispatched jobs.
          </div>
        ) : (
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {jobs.map((job) => {
              const isSelected = job.jobId === activeJobId;
              return (
                <button
                  key={job.jobId}
                  type="button"
                  onClick={() => onSelectJob(job.jobId)}
                  className={`w-full text-left rounded-lg border p-3 text-xs transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-border bg-card hover:bg-muted/50"
                  }`}
                >
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        Job #{job.jobId}
                      </span>
                      <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono uppercase">
                        {job.provider}
                      </Badge>
                    </div>
                    <p className="truncate text-muted-foreground text-[11px]">
                      {job.prompt}
                    </p>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />
                      {formatRelativeTime(job.createdAt)}
                    </span>
                  </div>

                  <ChevronRight
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      isSelected ? "text-primary translate-x-0.5" : "text-muted-foreground"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
