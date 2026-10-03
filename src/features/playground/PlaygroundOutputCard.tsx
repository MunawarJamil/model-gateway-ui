import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Check,
  RotateCcw,
  Clock,
  Cpu,
  Bot,
  Sparkles,
  AlertCircle,
  Radio,
  FileCode,
  Terminal,
  Activity,
  ArrowDownLeft,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import type { CompletionMetrics, StreamChunk } from "./types";

interface PlaygroundOutputCardProps {
  output: string;
  rawChunks: StreamChunk[];
  metrics: CompletionMetrics | null;
  error: string | null;
  isRunning: boolean;
  isStreaming: boolean;
  onClear: () => void;
}

type OutputTab = "response" | "stream" | "json";

export function PlaygroundOutputCard({
  output,
  rawChunks,
  metrics,
  error,
  isRunning,
  isStreaming,
  onClear,
}: PlaygroundOutputCardProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<OutputTab>("response");

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      toast.success("Response copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy response");
    }
  };

  return (
    <Card className="flex flex-col h-full shadow-sm min-h-[500px]">
      {/* Header */}
      <CardHeader className="pb-3 border-b">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" />
              Gateway Response
            </CardTitle>

            {/* Status indicator */}
            {isStreaming ? (
              <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1.5 animate-pulse text-xs">
                <Radio className="h-3 w-3 animate-spin" />
                Streaming SSE...
              </Badge>
            ) : isRunning ? (
              <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1.5 text-xs">
                <Activity className="h-3 w-3 animate-spin" />
                Processing...
              </Badge>
            ) : error ? (
              <Badge variant="destructive" className="gap-1 text-xs">
                <AlertCircle className="h-3 w-3" />
                Error
              </Badge>
            ) : metrics ? (
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">
                Completed
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                Idle
              </Badge>
            )}
          </div>

          {/* View Tab Switcher & Actions */}
          <div className="flex items-center gap-2">
            <div className="flex bg-muted/60 p-0.5 rounded-md border text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("response")}
                className={`px-2.5 py-1 rounded transition-all font-medium ${
                  activeTab === "response"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Text
              </button>
              {rawChunks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("stream")}
                  className={`px-2.5 py-1 rounded transition-all font-medium flex items-center gap-1 ${
                    activeTab === "stream"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>Chunks</span>
                  <span className="text-[10px] bg-muted px-1.5 py-0.2 rounded-full">
                    {rawChunks.length}
                  </span>
                </button>
              )}
              {metrics && (
                <button
                  type="button"
                  onClick={() => setActiveTab("json")}
                  className={`px-2.5 py-1 rounded transition-all font-medium flex items-center gap-1 ${
                    activeTab === "json"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileCode className="h-3 w-3" />
                  JSON
                </button>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!output}
              className="h-8 gap-1.5 text-xs"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              disabled={!output && !error && !metrics}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Main Content Area */}
      <CardContent className="flex-1 p-4 flex flex-col justify-between">
        <div className="flex-1">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 mb-4 text-xs text-destructive flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-sm">Completion Failed</p>
                <p className="font-mono">{error}</p>
                <p className="text-muted-foreground text-[11px] mt-1">
                  Ensure your Gateway API Key is active, and the provider (Gemini or Groq) key is configured in backend .env.
                </p>
              </div>
            </div>
          )}

          {activeTab === "response" && (
            <div className="relative min-h-[300px]">
              {!output && !isRunning && !error ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                  <div className="rounded-full bg-muted/60 p-4 mb-3">
                    <Sparkles className="h-8 w-8 text-muted-foreground/60" />
                  </div>
                  <p className="text-sm font-medium">Ready for Execution</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    Enter a prompt and select your desired model configuration to stream or generate an AI completion.
                  </p>
                </div>
              ) : (
                <div className="rounded-md bg-muted/30 p-4 text-sm font-sans leading-relaxed whitespace-pre-wrap select-text border min-h-[280px]">
                  {output}
                  {isStreaming && (
                    <span className="inline-block w-2 h-4 bg-primary ml-1 translate-y-0.5 animate-pulse" />
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "stream" && (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1 pb-1">
                <span>Received SSE Chunks ({rawChunks.length})</span>
                <span>Real-time Stream Inspection</span>
              </div>
              <div className="space-y-1 font-mono text-xs">
                {rawChunks.map((chunk, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2 rounded bg-muted/40 border text-[11px]"
                  >
                    <span className="text-muted-foreground select-none w-8 text-right shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="flex-1 break-all whitespace-pre-wrap text-foreground font-mono">
                      {JSON.stringify(chunk.token)}
                    </span>
                    {chunk.done && (
                      <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                        done: true
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "json" && metrics && (
            <pre className="rounded-md bg-muted/50 p-4 font-mono text-xs overflow-x-auto border max-h-[420px]">
              {JSON.stringify(
                {
                  metrics,
                  outputPreview: output.slice(0, 100) + (output.length > 100 ? "..." : ""),
                  totalCharacters: output.length,
                },
                null,
                2
              )}
            </pre>
          )}
        </div>

        {/* Live Gauges / Metrics Bar */}
        {metrics && (
          <div className="mt-4 pt-3 border-t grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-2 rounded-md bg-muted/40 p-2 border">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">Latency</p>
                <p className="font-semibold font-mono">{metrics.latencyMs ?? 0} ms</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-md bg-muted/40 p-2 border">
              <Cpu className="h-4 w-4 text-emerald-500 shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">Tokens (Total)</p>
                <p className="font-semibold font-mono">
                  {metrics.totalTokens ?? (metrics.promptTokens ?? 0) + (metrics.completionTokens ?? 0)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-md bg-muted/40 p-2 border">
              <ArrowDownLeft className="h-4 w-4 text-blue-500 shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">Prompt / Output</p>
                <p className="font-semibold font-mono text-[11px]">
                  {metrics.promptTokens ?? 0} in / {metrics.completionTokens ?? 0} out
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-md bg-muted/40 p-2 border">
              <Bot className="h-4 w-4 text-amber-500 shrink-0" />
              <div className="truncate">
                <p className="text-[10px] text-muted-foreground">Model & Routing</p>
                <p className="font-semibold font-mono text-[11px] truncate" title={metrics.model || metrics.provider}>
                  {metrics.model || metrics.provider}
                  {metrics.fallbackUsed && " (fallback)"}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
