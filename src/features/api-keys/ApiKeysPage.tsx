import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RevokeKeyDialog } from "./RevokeKeyDialog";
import { keysApi } from "./api";
import type { CreatedApiKey } from "./types";
import { CreateKeyModal } from "./CreateKeyModal";
import { KeyRevealDialog } from "./KeyRevealDialog";
import { KeysTable } from "./KeysTable";

export function ApiKeysPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [createdKey, setCreatedKey] = useState<CreatedApiKey | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const {
    data: keys,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["api-keys"],
    queryFn: keysApi.list,
  });

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your API keys. Each key has its own rate limit and token
            quota.
          </p>
        </div>
        <Button
          className="w-full sm:w-auto"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create API Key
        </Button>
      </div>

      <KeysTable
        keys={keys}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        onRevoke={(id, name) => setRevokeTarget({ id, name })}
        onCreateFirst={() => setCreateOpen(true)}
      />

      <CreateKeyModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(key) => setCreatedKey(key)}
      />

      {createdKey && (
        <KeyRevealDialog
          createdKey={createdKey}
          onClose={() => setCreatedKey(null)}
        />
      )}

      <RevokeKeyDialog
        keyId={revokeTarget?.id ?? null}
        keyName={revokeTarget?.name ?? ""}
        onClose={() => setRevokeTarget(null)}
      />
    </div>
  );
}
