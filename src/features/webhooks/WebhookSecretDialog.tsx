import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Copy, ShieldAlert, KeyRound, Terminal } from "lucide-react";
import { toast } from "sonner";
import type { RegisteredWebhook } from "./types";

interface WebhookSecretDialogProps {
  webhook: RegisteredWebhook;
  onClose: () => void;
}

export function WebhookSecretDialog({
  webhook,
  onClose,
}: WebhookSecretDialogProps) {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(webhook.secret);
      setCopied(true);
      toast.success("Signing secret copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — please select and copy manually");
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && confirmed) onClose();
      }}
    >
      <DialogContent
        className="sm:max-w-lg"
        onEscapeKeyDown={(e) => {
          if (!confirmed) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          if (!confirmed) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Save Webhook Signing Secret
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Warning Banner */}
          <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Save this secret now</p>
              <p className="mt-0.5">
                This secret will <strong>never be shown again</strong>. Store it in your backend environment variables to authenticate incoming webhook deliveries.
              </p>
            </div>
          </div>

          {/* Endpoint Target URL */}
          <div className="text-xs space-y-1">
            <span className="text-muted-foreground">Target URL:</span>
            <div className="truncate rounded border bg-muted/40 px-2.5 py-1.5 font-mono">
              {webhook.url}
            </div>
          </div>

          {/* Raw Secret Box */}
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              HMAC SHA-256 Signing Secret
            </span>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md border bg-muted px-3 py-2 text-xs font-mono break-all select-all">
                {webhook.secret}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="shrink-0 gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick verification sample */}
          <div className="rounded-md border bg-muted/50 p-2.5 text-[11px] space-y-1">
            <div className="flex items-center gap-1 font-semibold text-muted-foreground">
              <Terminal className="h-3.5 w-3.5" />
              <span>Verify Signature on Receiver</span>
            </div>
            <pre className="text-muted-foreground overflow-x-auto p-1 font-mono text-[10px]">
              {`const expected = crypto
  .createHmac('sha256', secret)
  .update(rawBody)
  .digest('hex');`}
            </pre>
          </div>

          {/* Confirmation Checkbox */}
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="confirm-secret-saved"
              checked={confirmed}
              onCheckedChange={(c) => setConfirmed(c === true)}
            />
            <label
              htmlFor="confirm-secret-saved"
              className="text-xs font-medium leading-none cursor-pointer"
            >
              I have saved this secret in a secure location
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button
            className="w-full sm:w-auto"
            disabled={!confirmed}
            onClick={onClose}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
