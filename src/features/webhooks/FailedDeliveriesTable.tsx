import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertOctagon, RotateCw, CheckCircle2, Clock } from "lucide-react";
import type { FailedDelivery } from "./types";

interface FailedDeliveriesTableProps {
  deliveries: FailedDelivery[];
  isLoading: boolean;
  onRefresh: () => void;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid date";
  }
}

export function FailedDeliveriesTable({
  deliveries,
  isLoading,
  onRefresh,
}: FailedDeliveriesTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg text-destructive">
              <AlertOctagon className="h-5 w-5" />
              Dead-Letter Queue (Failed Deliveries)
            </CardTitle>
            <CardDescription className="mt-1">
              Deliveries that exhausted all retry attempts and failed terminally.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="gap-1.5 text-xs w-fit"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Refresh DLQ
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {deliveries.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-500 mb-3">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold">Dead-letter queue is clear</h3>
            <p className="text-muted-foreground text-xs mt-1 max-w-sm">
              All webhook dispatches have succeeded or are currently within active retry backoff windows.
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs font-semibold">Event</TableHead>
                  <TableHead className="text-xs font-semibold">Target URL</TableHead>
                  <TableHead className="text-xs font-semibold">BullMQ Job ID</TableHead>
                  <TableHead className="text-xs font-semibold">Attempts</TableHead>
                  <TableHead className="text-xs font-semibold">Last HTTP Status</TableHead>
                  <TableHead className="text-xs font-semibold">Error Message</TableHead>
                  <TableHead className="text-xs font-semibold">Failed At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell>
                      <Badge
                        variant={delivery.event.includes("failed") ? "destructive" : "secondary"}
                        className="text-[10px] font-mono"
                      >
                        {delivery.event}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-xs truncate">
                      {delivery.url}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                        {delivery.bullJobId}
                      </code>
                    </TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="outline" className="text-[10px]">
                        {delivery.attemptCount} retries
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="font-mono font-semibold text-rose-500">
                        {delivery.lastStatusCode ?? "ERR_NETWORK"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate" title={delivery.lastError ?? ""}>
                      {delivery.lastError ?? "Unknown error"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {formatDate(delivery.createdAt)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
