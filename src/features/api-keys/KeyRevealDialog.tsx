import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Copy } from "lucide-react";
import { CreatedApiKey } from "./types";
import { useState } from "react";
import { toast } from "sonner";

// ─── Key Reveal Dialog — shown once after creation ────────────────────────────
export function KeyRevealDialog({
  createdKey,
  onClose,
}: {
  createdKey: CreatedApiKey;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleCopy = async () => {
    // clipboard.writeText can reject in an insecure context or if permission is
    // denied — fall back to a clear instruction instead of failing silently.
    try {
      await navigator.clipboard.writeText(createdKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — select and copy manually");
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o && confirmed) onClose();
      }}
    >
      <DialogContent
        className="sm:max-w-lg"
        // Block Esc / outside-click dismissal until the user confirms they
        // saved the key — make the intent explicit rather than relying on the
        // onOpenChange short-circuit above.
        onEscapeKeyDown={(e) => {
          if (!confirmed) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          if (!confirmed) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Save your API Key</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Warning banner */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            ⚠ This key will <strong>not be shown again</strong>. Copy it now and
            store it somewhere safe.
          </div>

          {/* Key name */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Key name</p>
            <p className="font-medium">{createdKey.name}</p>
          </div>

          {/* Raw key + copy button */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">API Key</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted px-3 py-2 rounded font-mono break-all">
                {createdKey.key}
              </code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1 text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Limits info */}
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div className="bg-muted rounded-lg p-3">
              <p className="text-muted-foreground text-xs">Rate limit</p>
              <p className="font-medium">{createdKey.requestsPerMin} req/min</p>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-muted-foreground text-xs">Monthly tokens</p>
              <p className="font-medium">
                {createdKey.monthlyTokenLimit.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Confirmation checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id="confirm"
              checked={confirmed}
              onCheckedChange={(v) => setConfirmed(v === true)}
            />
            <label htmlFor="confirm" className="text-sm cursor-pointer">
              I have copied my API key and stored it safely
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} disabled={!confirmed}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}