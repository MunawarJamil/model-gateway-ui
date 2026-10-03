import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  History,
  Trash2,
  ArrowUpRight,
  Clock,
  Radio,
  Layers,
  Sparkles,
  Bot,
  Zap,
} from "lucide-react";
import type { PlaygroundHistoryItem } from "./types";

interface PlaygroundHistoryListProps {
  history: PlaygroundHistoryItem[];
  onSelect: (item: PlaygroundHistoryItem) => void;
  onClear: () => void;
}

export function PlaygroundHistoryList({
  history,
  onSelect,
  onClear,
}: PlaygroundHistoryListProps) {
  if (history.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <History className="h-4 w-4" />
            Execution History
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6 text-xs text-muted-foreground">
          No previous playground runs yet. Completed prompts will appear here for instant replay.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <History className="h-4 w-4 text-primary" />
          <span>Recent Runs ({history.length})</span>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1 px-2"
        >
          <Trash2 className="h-3 w-3" />
          Clear
        </Button>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-2 max-h-[350px] overflow-y-auto">
        {history.map((item) => {
          const formattedTime = new Date(item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });

          return (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className="group cursor-pointer rounded-lg border bg-card p-3 transition-all hover:border-primary/50 hover:bg-muted/40 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Mode Badge */}
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4.5 gap-1">
                    {item.mode === "stream" ? (
                      <>
                        <Radio className="h-2.5 w-2.5 text-primary" />
                        Stream
                      </>
                    ) : (
                      <>
                        <Layers className="h-2.5 w-2.5 text-primary" />
                        Sync
                      </>
                    )}
                  </Badge>

                  {/* Provider Badge */}
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4.5 gap-1">
                    {item.provider === "gemini" ? (
                      <>
                        <Sparkles className="h-2.5 w-2.5 text-blue-500" />
                        Gemini
                      </>
                    ) : item.provider === "groq" ? (
                      <>
                        <Bot className="h-2.5 w-2.5 text-amber-500" />
                        Groq
                      </>
                    ) : (
                      <>
                        <Zap className="h-2.5 w-2.5 text-primary" />
                        Auto
                      </>
                    )}
                  </Badge>

                  {/* Status Badge */}
                  {item.status === "error" && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4.5">
                      Failed
                    </Badge>
                  )}
                  {item.status === "aborted" && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4.5 text-muted-foreground">
                      Stopped
                    </Badge>
                  )}
                </div>

                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formattedTime}
                </span>
              </div>

              {/* Prompt Snippet */}
              <p className="text-xs text-foreground line-clamp-2 font-medium">
                {item.prompt}
              </p>

              {/* Telemetry Footer */}
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                <div className="flex items-center gap-2">
                  {item.metrics?.latencyMs && (
                    <span>{item.metrics.latencyMs} ms</span>
                  )}
                  {item.metrics?.totalTokens ? (
                    <>
                      <span>•</span>
                      <span>{item.metrics.totalTokens} tokens</span>
                    </>
                  ) : null}
                </div>

                <span className="flex items-center gap-0.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                  Load <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
