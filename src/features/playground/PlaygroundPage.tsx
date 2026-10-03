import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { usePlayground } from "./usePlayground";
import { PlaygroundConfigCard } from "./PlaygroundConfigCard";
import { PlaygroundOutputCard } from "./PlaygroundOutputCard";
import { PlaygroundHistoryList } from "./PlaygroundHistoryList";

export function PlaygroundPage() {
  // Session-persisted API key for gateway completions
  const [apiKey, setApiKey] = useState<string>(() => {
    return (
      sessionStorage.getItem("mg_gateway_key") ??
      sessionStorage.getItem("mg_webhooks_key") ??
      ""
    );
  });
  const [inputKey, setInputKey] = useState<string>(apiKey);

  useEffect(() => {
    if (apiKey) {
      sessionStorage.setItem("mg_gateway_key", apiKey);
      sessionStorage.setItem("mg_webhooks_key", apiKey);
    }
  }, [apiKey]);

  const {
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
    output,
    rawChunks,
    metrics,
    error,
    history,
    executeCompletion,
    abortExecution,
    clearOutput,
    clearHistory,
    loadFromHistory,
  } = usePlayground(apiKey);

  const handleApplyKey = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(inputKey.trim());
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">AI Completions & Streaming Playground</h1>
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          Test real-time token streaming over Server-Sent Events (SSE) or synchronous completions against Google Gemini & Groq.
        </p>
      </div>

      {/* Scoping API Key Bar */}
      <div className="rounded-lg border bg-card p-4 shadow-xs">
        <form
          onSubmit={handleApplyKey}
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <Key className="h-4 w-4 text-primary shrink-0" />
            <span className="text-muted-foreground">Gateway API Key:</span>
          </div>

          <div className="flex flex-1 items-center gap-2 max-w-lg">
            <Input
              type="password"
              placeholder="Paste raw key (mgk_live_...) to run completions"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="font-mono text-xs"
            />
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              disabled={!inputKey.trim() || inputKey === apiKey}
            >
              Apply
            </Button>
          </div>
        </form>

        {!apiKey && (
          <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
            <span>
              A valid API key is required to authenticate completions with the gateway.
            </span>
            <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs gap-1">
              <Link to="/api-keys">
                Manage Keys <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Main Content Layout */}
      {!apiKey ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <div className="rounded-full bg-primary/10 p-4 text-primary mb-4">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-semibold">Enter an API Key to Access Playground</h2>
          <p className="text-muted-foreground text-sm mt-1 max-w-md">
            Enter your raw API key above to initiate streaming SSE connections or run synchronous model completions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Left Column: Configuration & Prompt (5 cols) */}
          <div className="space-y-6 lg:col-span-5">
            <PlaygroundConfigCard
              prompt={prompt}
              setPrompt={setPrompt}
              provider={provider}
              setProvider={setProvider}
              model={model}
              setModel={setModel}
              mode={mode}
              setMode={setMode}
              isRunning={isRunning}
              isStreaming={isStreaming}
              onExecute={executeCompletion}
              onAbort={abortExecution}
              onClear={() => {
                setPrompt("");
                setModel("");
              }}
              disabled={!apiKey}
            />

            <PlaygroundHistoryList
              history={history}
              onSelect={loadFromHistory}
              onClear={clearHistory}
            />
          </div>

          {/* Right Column: Output & Telemetry (7 cols) */}
          <div className="lg:col-span-7">
            <PlaygroundOutputCard
              output={output}
              rawChunks={rawChunks}
              metrics={metrics}
              error={error}
              isRunning={isRunning}
              isStreaming={isStreaming}
              onClear={clearOutput}
            />
          </div>
        </div>
      )}
    </div>
  );
}
