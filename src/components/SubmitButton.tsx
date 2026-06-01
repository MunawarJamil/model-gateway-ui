import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SubmitButtonProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  // When driven by a controlled form (e.g. react-hook-form) pass the submitting
  // state explicitly. For native form `action` submissions, omit it and the
  // component falls back to `useFormStatus`.
  isLoading?: boolean
}

// ─── Why separate component? ──────────────────────────────────────────────────
// useFormStatus must be called inside a component that is a CHILD of the form.
// It only reports `pending` for native form `action` submissions, so RHF forms
// (which submit via onSubmit) must pass `isLoading` explicitly.
export function SubmitButton({
  children,
  className,
  variant = 'default',
  isLoading,
}: SubmitButtonProps) {
  const { pending } = useFormStatus()
  const loading = isLoading ?? pending

  return (
    <Button
      type="submit"
      variant={variant}
      disabled={loading}
      className={cn('relative', className)}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {children}
    </Button>
  )
}