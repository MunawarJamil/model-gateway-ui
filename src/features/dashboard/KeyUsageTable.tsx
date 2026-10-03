import { Link } from "react-router-dom";
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
import { Key, ArrowUpRight, Plus, Clock, Gauge, Zap } from "lucide-react";
import type { ApiKey } from "@/features/api-keys/types";

interface KeyUsageTableProps {
  keys: ApiKey[];
  isLoading?: boolean;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Never used";
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

export function KeyUsageTable({ keys, isLoading }: KeyUsageTableProps) {
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

  const activeKeys = keys.filter((k) => k.isActive);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Key className="h-5 w-5 text-primary" />
              API Keys Quota & Activity
            </CardTitle>
            <CardDescription className="mt-1">
              Active credentials authorized for the completions pipeline.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild className="gap-1 text-xs">
            <Link to="/api-keys">
              Manage Keys
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {activeKeys.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <div className="rounded-full bg-muted p-3 text-muted-foreground mb-3">
              <Key className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold">No active API keys</h3>
            <p className="text-muted-foreground text-xs mt-1 mb-4 max-w-sm">
              Generate an API key to begin routing sync, streaming, and background completions.
            </p>
            <Button size="sm" asChild>
              <Link to="/api-keys">
                <Plus className="h-4 w-4 mr-1.5" />
                Create First Key
              </Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs font-semibold">Key Name</TableHead>
                  <TableHead className="text-xs font-semibold">Prefix</TableHead>
                  <TableHead className="text-xs font-semibold">Rate Limit</TableHead>
                  <TableHead className="text-xs font-semibold">Monthly Quota</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold">Last Used</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeKeys.slice(0, 5).map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium text-sm">
                      {key.name}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono text-muted-foreground">
                        {key.prefix}***
                      </code>
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Gauge className="h-3.5 w-3.5 text-primary" />
                        {key.requestsPerMin} req/min
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Zap className="h-3.5 w-3.5 text-amber-500" />
                        {key.monthlyTokenLimit.toLocaleString()} tokens
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={key.isActive ? "default" : "secondary"}
                        className="text-[10px] px-2 py-0"
                      >
                        {key.isActive ? "Active" : "Revoked"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {formatDate(key.lastUsedAt)}
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
