import { useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Webhook, Trash2, Plus, Copy, Check, Clock, Globe } from "lucide-react";
import { toast } from "sonner";
import type { WebhookEndpoint } from "./types";

interface WebhookEndpointsTableProps {
  endpoints: WebhookEndpoint[];
  isLoading: boolean;
  onRevoke: (id: string) => Promise<unknown>;
  isRevoking: boolean;
  onRegisterFirst: () => void;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Invalid date";
  }
}

export function WebhookEndpointsTable({
  endpoints,
  isLoading,
  onRevoke,
  isRevoking,
  onRegisterFirst,
}: WebhookEndpointsTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [targetToRevoke, setTargetToRevoke] = useState<WebhookEndpoint | null>(null);

  const handleCopyUrl = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      toast.success("Webhook URL copied");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Couldn't copy URL");
    }
  };

  const handleConfirmRevoke = async () => {
    if (!targetToRevoke) return;
    try {
      await onRevoke(targetToRevoke.id);
      setTargetToRevoke(null);
    } catch {
      // error handled by hook toast
    }
  };

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

  const activeEndpoints = endpoints.filter((e) => e.isActive);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5 text-primary" />
                Active Webhook Endpoints
              </CardTitle>
              <CardDescription className="mt-1">
                Endpoints receiving HMAC-signed events for completed and failed completions.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="w-fit">
              {activeEndpoints.length} {activeEndpoints.length === 1 ? "Endpoint" : "Endpoints"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {activeEndpoints.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
              <div className="rounded-full bg-muted p-3 text-muted-foreground mb-3">
                <Webhook className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold">No webhooks registered</h3>
              <p className="text-muted-foreground text-xs mt-1 mb-4 max-w-sm">
                Register a webhook URL to receive notifications when background AI completion jobs terminate.
              </p>
              <Button size="sm" onClick={onRegisterFirst}>
                <Plus className="h-4 w-4 mr-1.5" />
                Register Endpoint
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs font-semibold">Callback URL</TableHead>
                    <TableHead className="text-xs font-semibold">Status</TableHead>
                    <TableHead className="text-xs font-semibold">Subscribed Events</TableHead>
                    <TableHead className="text-xs font-semibold">Created Date</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeEndpoints.map((endpoint) => (
                    <TableRow key={endpoint.id}>
                      <TableCell className="font-mono text-xs max-w-xs sm:max-w-md truncate">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{endpoint.url}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                            onClick={() => handleCopyUrl(endpoint.id, endpoint.url)}
                          >
                            {copiedId === endpoint.id ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={endpoint.isActive ? "default" : "secondary"}
                          className="text-[10px] px-2 py-0"
                        >
                          {endpoint.isActive ? "Active" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">
                            job.completed
                          </Badge>
                          <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">
                            job.failed
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {formatDate(endpoint.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setTargetToRevoke(endpoint)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Revoke
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revocation Confirmation Dialog */}
      <AlertDialog
        open={Boolean(targetToRevoke)}
        onOpenChange={(o) => (!o ? setTargetToRevoke(null) : null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Webhook Endpoint?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke{" "}
              <code className="font-mono text-foreground font-semibold break-all">
                {targetToRevoke?.url}
              </code>
              ? The gateway will immediately stop dispatching completion events to this destination.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevoking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRevoke}
              disabled={isRevoking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRevoking ? "Revoking..." : "Revoke Endpoint"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
