import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib";
import { playgroundApi } from "./api";
import {
  AVAILABLE_MODELS,
  type CompletionMode,
  type ProviderOption,
  type CompletionRequestPayload,
  type StreamChunk,
  type CompletionMetrics,
  type PlaygroundHistoryItem,
} from "./types";

import { useAuthStore } from "@/store";
import { userStorage } from "@/lib/userStorage";

const MAX_HISTORY_ITEMS = 30;

export function usePlayground(apiKey: string) {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;

  // Input configuration state
  const [prompt, setPrompt] = useState<string>(() => {
    try {
      const initial = sessionStorage.getItem("mg_playground_initial_prompt");
      if (initial) {
        sessionStorage.removeItem("mg_playground_initial_prompt");
        return initial;
      }
    } catch {
      // ignore
    }
    return "";
  });
  const [provider, setProvider] = useState<ProviderOption>("auto");
  const [model, setModel] = useState<string>("");
  const [mode, setMode] = useState<CompletionMode>("stream");

  // Output execution state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [output, setOutput] = useState<string>("");
  const [rawChunks, setRawChunks] = useState<StreamChunk[]>([]);
  const [metrics, setMetrics] = useState<CompletionMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cancellation controller ref
  const abortControllerRef = useRef<AbortController | null>(null);

  // History state strictly isolated per logged-in user
  const [history, setHistory] = useState<PlaygroundHistoryItem[]>(() => {
    return userStorage.getPlaygroundHistory<PlaygroundHistoryItem>(userId);
  });


  // Persist history strictly under user ID
  useEffect(() => {
    if (userId) {
      userStorage.setPlaygroundHistory(userId, history);
    }
  }, [history, userId]);

  // Change provider and immediately set appropriate default model without cascading render effects
  const handleSetProvider = useCallback((nextProvider: ProviderOption) => {
    setProvider(nextProvider);
    if (nextProvider === "gemini") {
      const defaultGemini = AVAILABLE_MODELS.gemini.find((m) => m.isDefault);
      setModel(defaultGemini ? defaultGemini.id : "gemini-3.8-flash");
    } else if (nextProvider === "groq") {
      const defaultGroq = AVAILABLE_MODELS.groq.find((m) => m.isDefault);
      setModel(defaultGroq ? defaultGroq.id : "openai/gpt-oss-20b");
    } else {
      setModel("");
    }
  }, []);

  // Clean up any pending abort controllers on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const addToHistory = useCallback((item: PlaygroundHistoryItem) => {
    setHistory((prev) => [item, ...prev.slice(0, MAX_HISTORY_ITEMS - 1)]);
  }, []);

  const abortExecution = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsRunning(false);
    toast.info("Generation halted by user.");
  }, []);

  const executeCompletion = async () => {
    if (!apiKey) {
      toast.error("Please enter a Gateway API Key first.");
      return;
    }

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      toast.error("Please provide a prompt to run.");
      return;
    }

    // Reset previous run display
    setOutput("");
    setRawChunks([]);
    setMetrics(null);
    setError(null);
    setIsRunning(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const payload: CompletionRequestPayload = {
      prompt: trimmedPrompt,
      ...(provider !== "auto" ? { provider } : {}),
      ...(model.trim() ? { model: model.trim() } : {}),
    };

    const startTime = performance.now();
    const historyId = `run_${Date.now()}`;

    if (mode === "stream") {
      setIsStreaming(true);
      let accumulatedText = "";
      const chunksAcc: StreamChunk[] = [];

      try {
        const streamResult = await playgroundApi.streamCompletion(apiKey, payload, {
          signal: controller.signal,
          onChunk: (chunk) => {
            if (chunk.token) {
              accumulatedText += chunk.token;
              setOutput(accumulatedText);
            }
            chunksAcc.push(chunk);
            setRawChunks([...chunksAcc]);
          },
        });

        const latencyMs = Math.round(performance.now() - startTime);
        const promptTokens = streamResult.promptTokens ?? 0;
        const completionTokens = streamResult.completionTokens ?? 0;
        const totalTokens = promptTokens + completionTokens;

        const capturedMetrics: CompletionMetrics = {
          latencyMs,
          promptTokens,
          completionTokens,
          totalTokens,
          provider: provider !== "auto" ? provider : "gateway (auto)",
          model: streamResult.model || model || "default",
          fallbackUsed: false,
        };

        setMetrics(capturedMetrics);

        addToHistory({
          id: historyId,
          prompt: trimmedPrompt,
          response: accumulatedText,
          mode: "stream",
          provider,
          model: streamResult.model || model,
          metrics: capturedMetrics,
          timestamp: Date.now(),
          status: "success",
        });

        toast.success(`Stream finished in ${latencyMs}ms`);
      } catch (err: unknown) {
        if (controller.signal.aborted) {
          const latencyMs = Math.round(performance.now() - startTime);
          addToHistory({
            id: historyId,
            prompt: trimmedPrompt,
            response: accumulatedText,
            mode: "stream",
            provider,
            model,
            metrics: { latencyMs },
            timestamp: Date.now(),
            status: "aborted",
          });
          return;
        }

        const msg = err instanceof Error ? err.message : getApiErrorMessage(err);
        setError(msg);
        toast.error(`Streaming failed: ${msg}`);

        addToHistory({
          id: historyId,
          prompt: trimmedPrompt,
          response: accumulatedText,
          mode: "stream",
          provider,
          model,
          timestamp: Date.now(),
          status: "error",
          error: msg,
        });
      } finally {
        setIsStreaming(false);
        setIsRunning(false);
        abortControllerRef.current = null;
      }
    } else {
      // Synchronous completion
      try {
        const result = await playgroundApi.completeSync(apiKey, payload, controller.signal);

        const latencyMs = result.latencyMs || Math.round(performance.now() - startTime);
        setOutput(result.text);

        const capturedMetrics: CompletionMetrics = {
          latencyMs,
          promptTokens: result.usage.promptTokens,
          completionTokens: result.usage.completionTokens,
          totalTokens: result.usage.totalTokens,
          provider: result.provider,
          model: result.model,
          fallbackUsed: result.fallbackUsed,
        };

        setMetrics(capturedMetrics);

        addToHistory({
          id: historyId,
          prompt: trimmedPrompt,
          response: result.text,
          mode: "sync",
          provider,
          model: result.model,
          metrics: capturedMetrics,
          timestamp: Date.now(),
          status: "success",
        });

        toast.success(`Completion completed in ${latencyMs}ms`);
      } catch (err: unknown) {
        if (controller.signal.aborted) {
          toast.info("Request cancelled.");
          return;
        }

        const msg = getApiErrorMessage(err);
        setError(msg);
        toast.error(`Completion failed: ${msg}`);

        addToHistory({
          id: historyId,
          prompt: trimmedPrompt,
          response: "",
          mode: "sync",
          provider,
          model,
          timestamp: Date.now(),
          status: "error",
          error: msg,
        });
      } finally {
        setIsRunning(false);
        abortControllerRef.current = null;
      }
    }
  };

  const clearOutput = () => {
    setOutput("");
    setRawChunks([]);
    setMetrics(null);
    setError(null);
  };

  const clearHistory = () => {
    setHistory([]);
    userStorage.clearPlaygroundHistory(userId);
    toast.info("Playground run history cleared");
  };

  const loadFromHistory = (item: PlaygroundHistoryItem) => {
    setPrompt(item.prompt);
    setProvider(item.provider);
    if (item.model) setModel(item.model);
    setMode(item.mode);
    setOutput(item.response);
    setMetrics(item.metrics ?? null);
    setError(item.error ?? null);
    setRawChunks([]);
    toast.success("Loaded prompt and result from history");
  };

  return {
    prompt,
    setPrompt,
    provider,
    setProvider: handleSetProvider,
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
  };
}
