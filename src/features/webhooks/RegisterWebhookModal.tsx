import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Webhook, Loader2 } from "lucide-react";
import {
  registerWebhookSchema,
  type RegisterWebhookPayload,
  type RegisteredWebhook,
} from "./types";

interface RegisterWebhookModalProps {
  open: boolean;
  onClose: () => void;
  onRegister: (payload: RegisterWebhookPayload) => Promise<RegisteredWebhook>;
  onSuccess: (registered: RegisteredWebhook) => void;
}

export function RegisterWebhookModal({
  open,
  onClose,
  onRegister,
  onSuccess,
}: RegisterWebhookModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterWebhookPayload>({
    resolver: zodResolver(registerWebhookSchema),
    defaultValues: { url: "" },
  });

  const onSubmit = async (data: RegisterWebhookPayload) => {
    try {
      const result = await onRegister(data);
      reset();
      onClose();
      onSuccess(result);
    } catch {
      // error handled by mutation toast
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? handleClose() : null)}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-primary" />
              Register Webhook Endpoint
            </DialogTitle>
            <DialogDescription>
              Model Gateway will dispatch signed HTTP POST payloads to this URL when background jobs finish.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Endpoint URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://api.yourdomain.com/webhooks/ai"
                {...register("url")}
                disabled={isSubmitting}
                className={errors.url ? "border-destructive" : ""}
              />
              {errors.url && (
                <p className="text-xs text-destructive">{errors.url.message}</p>
              )}
            </div>

            <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Dispatched Events:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li><code className="text-primary font-mono">job.completed</code> — fires when async completion succeeds</li>
                <li><code className="text-primary font-mono">job.failed</code> — fires after terminal retry failure</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Create Endpoint"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
