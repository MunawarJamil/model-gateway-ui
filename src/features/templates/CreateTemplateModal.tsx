import { useState, useId } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Plus, Code, Lightbulb } from "lucide-react";
import {
  createTemplateSchema,
  extractTemplateVariables,
  type CreateTemplatePayload,
} from "./types";

interface CreateTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTemplatePayload) => Promise<unknown>;
  isSubmitting: boolean;
}

const SAMPLE_STARTERS = [
  {
    name: "Customer Support Email",
    content:
      "Draft a polite and empathetic customer support response to {{customer_name}} regarding their issue with {{product_name}}. Apologize for the inconvenience and offer {{solution}}.",
  },
  {
    name: "Code Refactoring Advice",
    content:
      "Analyze the following {{language}} code and suggest performance optimizations and clean code improvements:\n\n```{{language}}\n{{code_snippet}}\n```",
  },
  {
    name: "Product Description Generator",
    content:
      "Write a high-converting product description for {{product_title}} targeted at {{target_audience}}. Emphasize these key features: {{features}}.",
  },
];

export function CreateTemplateModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: CreateTemplateModalProps) {
  const contentInputId = useId();
  const nameInputId = useId();

  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<{ name?: string; content?: string }>({});

  const detectedVariables = extractTemplateVariables(content);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = createTemplateSchema.safeParse({ name: name.trim(), content: content.trim() });
    if (!result.success) {
      const fieldErrors: { name?: string; content?: string } = {};
      for (const issue of result.error.issues) {
        if (issue.path[0] === "name") fieldErrors.name = issue.message;
        if (issue.path[0] === "content") fieldErrors.content = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    try {
      await onSubmit(result.data);
      setName("");
      setContent("");
      onOpenChange(false);
    } catch {
      // toast handled in mutation
    }
  };

  const insertVariable = (varName: string) => {
    const placeholder = `{{${varName}}}`;
    setContent((prev) => (prev ? `${prev} ${placeholder}` : placeholder));
    if (errors.content) {
      setErrors((prev) => ({ ...prev, content: undefined }));
    }
  };

  const applySample = (sample: { name: string; content: string }) => {
    setName(sample.name);
    setContent(sample.content);
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Create Prompt Template
          </DialogTitle>
          <DialogDescription>
            Build reusable prompt templates with dynamic <code className="text-primary font-mono text-xs">{"{{variable}}"}</code> placeholders.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
          {/* Quick Starters */}
          <div className="space-y-1.5 rounded-lg bg-muted/40 p-3 border text-xs">
            <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              <span>Quick Starters:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_STARTERS.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => applySample(s)}
                  className="rounded-md border bg-card px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Template Name */}
          <div className="space-y-1.5">
            <Label htmlFor={nameInputId} className="text-xs">
              Template Name
            </Label>
            <Input
              id={nameInputId}
              placeholder="e.g. Support Ticket Responder, Refactor Assistant"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              disabled={isSubmitting}
              className="text-xs"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Template Content */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor={contentInputId} className="text-xs">
                Template Body
              </Label>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <span>Add placeholder:</span>
                {["user", "topic", "context"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVariable(v)}
                    className="font-mono text-primary hover:underline"
                  >
                    +{"{{" + v + "}}"}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              id={contentInputId}
              rows={6}
              placeholder="Write your prompt using {{variable_name}} syntax..."
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errors.content) setErrors((prev) => ({ ...prev, content: undefined }));
              }}
              disabled={isSubmitting}
              className={`w-full rounded-md border bg-background p-3 font-mono text-xs shadow-xs placeholder:font-sans placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                errors.content ? "border-destructive" : "border-input"
              }`}
            />
            {errors.content && (
              <p className="text-xs text-destructive">{errors.content}</p>
            )}
          </div>

          {/* Detected Variables Live Indicator */}
          <div className="rounded-md border bg-muted/30 p-2.5 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground flex items-center gap-1.5">
                <Code className="h-3.5 w-3.5 text-primary" />
                Detected Variables ({detectedVariables.length}):
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                {content.length} characters
              </span>
            </div>
            {detectedVariables.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {detectedVariables.map((v) => (
                  <Badge
                    key={v}
                    variant="secondary"
                    className="font-mono text-[11px] px-2 py-0.5 border border-primary/20 text-primary"
                  >
                    {"{{" + v + "}}"}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground italic">
                No variables detected yet. Wrap words in {"{{"} variable {"}}"} to make them dynamic.
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="gap-2 text-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Template...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Save Template
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
