import { KeyboardEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Bot,
  Zap,
  Play,
  Square,
  Loader2,
  SlidersHorizontal,
  RotateCcw,
  Radio,
  Layers,
} from "lucide-react";
import {
  AVAILABLE_MODELS,
  type CompletionMode,
  type ProviderOption,
} from "./types";

interface PlaygroundConfigCardProps {
  prompt: string;
  setPrompt: (value: string) => void;
  provider: ProviderOption;
  setProvider: (value: ProviderOption) => void;
  model: string;
  setModel: (value: string) => void;
  mode: CompletionMode;
  setMode: (value: CompletionMode) => void;
  isRunning: boolean;
  isStreaming: boolean;
  onExecute: () => void;
  onAbort: () => void;
  onClear: () => void;
  disabled?: boolean;
}

const SAMPLE_PROMPTS = [
  {
    title: "Quantum Physics",
    text: "Explain quantum superposition and entanglement in simple terms with an analogy.",
  },
  {
    title: "TypeScript Utility",
    text: "Write a strongly-typed TypeScript function that deep-merges two generic objects.",
  },
  {
    title: "API Design",
    text: "List 5 essential security best practices when building a multi-tenant AI API Gateway.",
  },
  {
    title: "JSON Output",
    text: "Return a JSON array of 3 fictitious sci-fi books with title, author, year, and a 1-sentence logline.",
  },
];

export function PlaygroundConfigCard({
  prompt,
  setPrompt,
  provider,
  setProvider,
  model,
  setModel,
  mode,
  setMode,
  isRunning,
  isStreaming,
  onExecute,
  onAbort,
  onClear,
  disabled,
}: PlaygroundConfigCardProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (!isRunning && !disabled) {
        onExecute();
      }
    }
  };

  const currentModels =
    provider === "gemini"
      ? AVAILABLE_MODELS.gemini
      : provider === "groq"
      ? AVAILABLE_MODELS.groq
      : [];

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            Prompt & Model Configuration
          </CardTitle>
          <Badge variant="outline" className="text-xs font-mono">
            {mode === "stream" ? "SSE Mode" : "Sync Mode"}
          </Badge>
        </div>
        <CardDescription>
          Choose your model provider, execution method, and test your prompts.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Mode Selector (Stream vs Sync) */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground flex items-center justify-between">
            <span>Execution Protocol</span>
            <span className="text-[11px] text-muted-foreground">
              {mode === "stream" ? "Token-by-token streaming" : "Blocking wait for full response"}
            </span>
          </Label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/60 rounded-lg border">
            <button
              type="button"
              onClick={() => setMode("stream")}
              disabled={isRunning}
              className={`flex items-center justify-center gap-2 rounded-md py-2 px-3 text-xs font-medium transition-all ${
                mode === "stream"
                  ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Radio className="h-3.5 w-3.5 text-primary" />
              Real-time Stream (SSE)
            </button>
            <button
              type="button"
              onClick={() => setMode("sync")}
              disabled={isRunning}
              className={`flex items-center justify-center gap-2 rounded-md py-2 px-3 text-xs font-medium transition-all ${
                mode === "sync"
                  ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="h-3.5 w-3.5 text-primary" />
              Synchronous (/complete)
            </button>
          </div>
        </div>

        {/* Provider Selection */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">AI Provider</Label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setProvider("auto")}
              disabled={isRunning}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg border p-2.5 text-xs font-medium transition-all ${
                provider === "auto"
                  ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>Auto (Default)</span>
            </button>

            <button
              type="button"
              onClick={() => setProvider("gemini")}
              disabled={isRunning}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg border p-2.5 text-xs font-medium transition-all ${
                provider === "gemini"
                  ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Google Gemini</span>
            </button>

            <button
              type="button"
              onClick={() => setProvider("groq")}
              disabled={isRunning}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg border p-2.5 text-xs font-medium transition-all ${
                provider === "groq"
                  ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Bot className="h-4 w-4" />
              <span>Groq LPU</span>
            </button>
          </div>
        </div>

        {/* Model Selection */}
        {provider !== "auto" && (
          <div className="space-y-2 animate-in fade-in-50 duration-200">
            <Label className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              <span>Model Identifier</span>
              <span className="text-[11px] text-muted-foreground">Select preset or enter custom</span>
            </Label>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-1.5">
                {currentModels.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setModel(m.id)}
                    disabled={isRunning}
                    className={`rounded-md px-2.5 py-1 text-xs transition-colors border ${
                      model === m.id
                        ? "bg-secondary text-secondary-foreground font-medium border-primary/50 ring-1 ring-primary/30"
                        : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted"
                    }`}
                  >
                    {m.name}
                    {m.isDefault && (
                      <span className="ml-1 text-[10px] text-primary">(default)</span>
                    )}
                  </button>
                ))}
              </div>
              <Input
                type="text"
                placeholder="Custom model id (e.g. llama-3.1-8b-instant)"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={isRunning}
                className="font-mono text-xs h-8"
              />
            </div>
          </div>
        )}

        {/* Prompt Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="playground-prompt" className="text-xs font-medium text-muted-foreground">
              Prompt
            </Label>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span>Samples:</span>
              {SAMPLE_PROMPTS.map((sample, idx) => (
                <button
                  key={sample.title}
                  type="button"
                  onClick={() => setPrompt(sample.text)}
                  disabled={isRunning}
                  className="text-primary hover:underline"
                >
                  {sample.title}
                  {idx < SAMPLE_PROMPTS.length - 1 && <span className="ml-1 text-muted-foreground">•</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <textarea
              id="playground-prompt"
              rows={6}
              placeholder="Enter your prompt here... (Press Ctrl + Enter to run)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isRunning || disabled}
              className="w-full rounded-md border border-input bg-background p-3 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-sans disabled:opacity-50"
            />
            <div className="flex justify-between items-center text-[11px] text-muted-foreground px-1 mt-1">
              <span>{prompt.length} characters</span>
              <span>Tip: Ctrl + Enter to submit</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          {isStreaming ? (
            <Button
              type="button"
              variant="destructive"
              onClick={onAbort}
              className="flex-1 gap-2 animate-pulse"
            >
              <Square className="h-4 w-4 fill-current" />
              Stop Generation
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onExecute}
              disabled={isRunning || disabled || !prompt.trim()}
              className="flex-1 gap-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Response...
                </>
              ) : mode === "stream" ? (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  Stream Response
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Run Completion
                </>
              )}
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onClear}
            disabled={isRunning || (!prompt && !model)}
            title="Clear Prompt"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
