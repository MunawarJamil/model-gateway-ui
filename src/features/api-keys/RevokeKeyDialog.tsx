import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { toast } from "sonner";
import { keysApi } from "./api";

interface RevokeKeyDialogProps {
  keyId: string | null; // null = dialog closed
  keyName: string;
  onClose: () => void;
}

export function RevokeKeyDialog({
  keyId,
  keyName,
  onClose,
}: RevokeKeyDialogProps) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      // keyId is non-null whenever the dialog is open, but guard explicitly
      // instead of asserting so a stray call can't fire a bad request.
      if (!keyId) throw new Error("No API key selected to revoke");
      return keysApi.revoke(keyId);
    },
    onSuccess: () => {
      // invalidateQueries — trigger refetch of keys list to reflect revoked key
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success(`"${keyName}" revoked successfully`);
      onClose();
    },
    onError: () => {
      toast.error("Failed to revoke API key");
      onClose();
    },
  });

  return (
    <AlertDialog open={!!keyId} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently revoke{" "}
            <span className="font-semibold text-foreground">"{keyName}"</span>.
            Any application using this key will stop working immediately. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => mutate()}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Revoking..." : "Revoke Key"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
