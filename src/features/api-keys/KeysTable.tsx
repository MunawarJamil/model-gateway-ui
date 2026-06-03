import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Key, Clock, Zap, BarChart3, Plus } from "lucide-react";
import type { ApiKey } from "./types";

// ─── Skeleton rows while loading ──────────────────────────────────────────────
function KeysTableSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-48" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-16" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

// ─── Single key row ────────────────────────────────────────────────────────────
function KeyRow({
  apiKey,
  onRevoke,
}: {
  apiKey: ApiKey;
  onRevoke: (id: string, name: string) => void;
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{apiKey.name}</TableCell>
      <TableCell>
        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
          {apiKey.maskedKey}
        </code>
      </TableCell>
      <TableCell>{apiKey.requestsPerMin}/min</TableCell>
      <TableCell>{apiKey.monthlyTokenLimit.toLocaleString()}</TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {apiKey.lastUsedAt
          ? new Date(apiKey.lastUsedAt).toLocaleDateString()
          : "Never"}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {new Date(apiKey.createdAt).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onRevoke(apiKey.id, apiKey.name)}
        >
          Revoke
        </Button>
      </TableCell>
    </TableRow>
  );
}

// ─── Table props ───────────────────────────────────────────────────────────────
interface KeysTableProps {
  keys: ApiKey[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onRevoke: (id: string, name: string) => void;
  onCreateFirst: () => void;
}

// ─── Main table component ──────────────────────────────────────────────────────
export function KeysTable({
  keys,
  isLoading,
  isError,
  onRetry,
  onRevoke,
  onCreateFirst,
}: KeysTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Rate Limit
              </span>
            </TableHead>
            <TableHead>
              <span className="flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                Monthly Tokens
              </span>
            </TableHead>
            <TableHead>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last Used
              </span>
            </TableHead>
            <TableHead>
              <span className="flex items-center gap-1">
                <Key className="w-3 h-3" />
                Created
              </span>
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && <KeysTableSkeleton />}

          {isError && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
                <p className="text-muted-foreground mb-3">
                  Failed to load API keys
                </p>
                <Button variant="outline" size="sm" onClick={onRetry}>
                  Try again
                </Button>
              </TableCell>
            </TableRow>
          )}

          {!isLoading && !isError && keys?.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
                <Key className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-3">No API keys yet</p>
                <Button size="sm" onClick={onCreateFirst}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create your first key
                </Button>
              </TableCell>
            </TableRow>
          )}

          {keys?.map((key) => (
            <KeyRow key={key.id} apiKey={key} onRevoke={onRevoke} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
