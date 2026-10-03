import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { WebhookEndpointsTable } from "./WebhookEndpointsTable";
import { FailedDeliveriesTable } from "./FailedDeliveriesTable";
import { RegisterWebhookModal } from "./RegisterWebhookModal";
import { WebhookSecretDialog } from "./WebhookSecretDialog";
import { useWebhooks } from "./useWebhooks";
import {
  Plus,
  Key,
  Globe,
  AlertOctagon,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import type { RegisteredWebhook } from "./types";
import { cn } from "@/lib/utils";

export function WebhooksPage() {
  // Session-persisted API key for managing webhooks
  const [apiKey, setApiKey] = useState<string>(() => {
    return sessionStorage.getItem("mg_webhooks_key") ?? "";
  });
  const [inputKey, setInputKey] = useState<string>(apiKey);
  const [activeTab, setActiveTab] = useState<"endpoints" | "dlq">("endpoints");

  // Modals state
  const [registerOpen, setRegisterOpen] = useState(false);
  const [revealedWebhook, setRevealedWebhook] = useState<RegisteredWebhook | null>(null);

  // Sync to session storage
  useEffect(() => {
    if (apiKey) {
      sessionStorage.setItem("mg_webhooks_key", apiKey);
    }
  }, [apiKey]);

  const {
    endpoints,
    failedDeliveries,
    isEndpointsLoading,
    isFailedLoading,
    registerWebhook,
    revokeWebhook,
    isRevoking,
    refetch,
  } = useWebhooks(apiKey);

  const handleApplyKey = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(inputKey.trim());
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Webhooks Engine</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure real-time event callbacks for completed and failed completions.
          </p>
        </div>

        {apiKey && (
          <Button
            size="sm"
            onClick={() => setRegisterOpen(true)}
            className="gap-1.5 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Register Webhook</span>
          </Button>
        )}
      </div>

      {/* API Key Scoping Bar */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <form
          onSubmit={handleApplyKey}
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <Key className="h-4 w-4 text-primary shrink-0" />
            <span className="text-muted-foreground">Scoping API Key:</span>
          </div>

          <div className="flex flex-1 items-center gap-2 max-w-lg">
            <Input
              type="password"
              placeholder="Paste raw key (mgk_live_...) to manage its webhooks"
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
              Webhooks are bound to API keys. Enter your key above or generate a new one in the keys manager.
            </span>
            <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs gap-1">
              <Link to="/api-keys">
                Manage Keys <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Main Content (when key is active) */}
      {!apiKey ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <div className="rounded-full bg-primary/10 p-4 text-primary mb-4">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-semibold">Enter an API Key to Load Webhooks</h2>
          <p className="text-muted-foreground text-sm mt-1 max-w-md">
            Model Gateway signs each webhook delivery with a key-specific HMAC secret. Enter your raw key above to view active endpoints and delivery logs.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Segmented Navigation Tabs */}
          <div className="flex border-b border-border gap-6">
            <button
              type="button"
              onClick={() => setActiveTab("endpoints")}
              className={cn(
                "flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors -mb-px",
                activeTab === "endpoints"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Globe className="h-4 w-4" />
              <span>Active Endpoints</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {endpoints.length}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("dlq")}
              className={cn(
                "flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors -mb-px",
                activeTab === "dlq"
                  ? "border-destructive text-destructive"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <AlertOctagon className="h-4 w-4" />
              <span>Dead-Letter Queue</span>
              {failedDeliveries.length > 0 && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                  {failedDeliveries.length}
                </Badge>
              )}
            </button>
          </div>

          {/* Active Tab Panel */}
          {activeTab === "endpoints" ? (
            <WebhookEndpointsTable
              endpoints={endpoints}
              isLoading={isEndpointsLoading}
              onRevoke={revokeWebhook}
              isRevoking={isRevoking}
              onRegisterFirst={() => setRegisterOpen(true)}
            />
          ) : (
            <FailedDeliveriesTable
              deliveries={failedDeliveries}
              isLoading={isFailedLoading}
              onRefresh={refetch}
            />
          )}
        </div>
      )}

      {/* Modal: Register Endpoint */}
      <RegisterWebhookModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onRegister={registerWebhook}
        onSuccess={(registered) => setRevealedWebhook(registered)}
      />

      {/* Dialog: Secret Reveal (once only) */}
      {revealedWebhook && (
        <WebhookSecretDialog
          webhook={revealedWebhook}
          onClose={() => setRevealedWebhook(null)}
        />
      )}
    </div>
  );
}
