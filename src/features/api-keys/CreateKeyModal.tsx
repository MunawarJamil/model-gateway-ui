import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreatedApiKey, CreateKeyPayload, createKeySchema } from "./types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { keysApi } from "./api";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

// ─── Create Key Modal ──────────────────────────────────────────────────────────
export function CreateKeyModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (key: CreatedApiKey) => void;
}) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateKeyPayload>({
    resolver: zodResolver(createKeySchema),
    defaultValues: { name: "", requestsPerMin: 60, monthlyTokenLimit: 100_000 },
  });

  // useMutation — POST /v1/keys
  // onSuccess: invalidate cache (list refreshes) + pass raw key to reveal dialog
  const { mutate, isPending } = useMutation({
    mutationFn: keysApi.create,
    onSuccess: (createdKey) => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key created!");
      reset();
      onClose();
      onCreated(createdKey); // → open key reveal dialog
    },
    onError: () => {
      toast.error("Failed to create API key");
    },
  });

  const onSubmit = handleSubmit((values) => mutate(values));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Key Name</Label>
            <Input
              id="name"
              placeholder="e.g. Production Key"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-destructive text-xs">{errors.name.message}</p>
            )}
          </div>

          {/* Requests per minute */}
          <div className="space-y-1.5">
            <Label htmlFor="requestsPerMin">Requests / minute</Label>
            <Input
              id="requestsPerMin"
              type="number"
              {...register("requestsPerMin", { valueAsNumber: true })}
            />
            {errors.requestsPerMin && (
              <p className="text-destructive text-xs">
                {errors.requestsPerMin.message}
              </p>
            )}
          </div>

          {/* Monthly token limit */}
          <div className="space-y-1.5">
            <Label htmlFor="monthlyTokenLimit">Monthly Token Limit</Label>
            <Input
              id="monthlyTokenLimit"
              type="number"
              {...register("monthlyTokenLimit", { valueAsNumber: true })}
            />
            {errors.monthlyTokenLimit && (
              <p className="text-destructive text-xs">
                {errors.monthlyTokenLimit.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Key"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
