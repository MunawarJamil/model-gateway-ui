import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Send, Loader2, Sparkles, Bot } from "lucide-react";
import type { AsyncCompletePayload } from "./types";

interface JobDispatchCardProps {
  onEnqueue: (payload: AsyncCompletePayload) => Promise<unknown>;
  isEnqueuing: boolean;
  disabled?: boolean;
}

const formSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
});

type FormValues = z.infer<typeof formSchema>;

const SAMPLE_PROMPTS = [
  "Explain quantum computing principles in three simple bullet points.",
  "Generate a TypeScript function to debounce an async search input.",
  "Summarize the architectural differences between BullMQ and RabbitMQ.",
];

export function JobDispatchCard({
  onEnqueue,
  isEnqueuing,
  disabled,
}: JobDispatchCardProps) {
  // React 19 Compiler-friendly provider state (replaces watch)
  const [provider, setProvider] = useState<"gemini" | "groq">("gemini");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await onEnqueue({ prompt: data.prompt, provider });
      reset({ prompt: "" });
    } catch {
      // error handled by mutation toast
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Send className="h-5 w-5 text-primary" />
          Enqueue Asynchronous Completion
        </CardTitle>
        <CardDescription>
          Offloads execution to the BullMQ queue and returns an immediate Job ID.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label className="text-xs">Routing Provider</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProvider("gemini")}
                className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-medium transition-all ${
                  provider === "gemini"
                    ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                Google Gemini
              </button>

              <button
                type="button"
                onClick={() => setProvider("groq")}
                className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-medium transition-all ${
                  provider === "groq"
                    ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <Bot className="h-4 w-4" />
                Groq LPU
              </button>
            </div>
          </div>

          {/* Prompt Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="job-prompt" className="text-xs">
                Prompt
              </Label>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground">Quick sample:</span>
                <button
                  type="button"
                  onClick={() => setValue("prompt", SAMPLE_PROMPTS[0]!)}
                  className="text-[11px] text-primary hover:underline"
                >
                  Physics
                </button>
                <span className="text-muted-foreground">•</span>
                <button
                  type="button"
                  onClick={() => setValue("prompt", SAMPLE_PROMPTS[1]!)}
                  className="text-[11px] text-primary hover:underline"
                >
                  TypeScript
                </button>
              </div>
            </div>

            <textarea
              id="job-prompt"
              rows={4}
              placeholder="Type your prompt here..."
              {...register("prompt")}
              disabled={isEnqueuing || disabled}
              className={`w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 ${
                errors.prompt ? "border-destructive" : "border-input"
              }`}
            />
            {errors.prompt && (
              <p className="text-xs text-destructive">{errors.prompt.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isEnqueuing || disabled}
            className="w-full gap-2 sm:w-auto"
          >
            {isEnqueuing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Dispatching to Queue...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enqueue Job
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
