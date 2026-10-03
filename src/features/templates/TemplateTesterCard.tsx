import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Copy,
  Check,
  Play,
  Code2,
  Sparkles,
  Layers,
  Terminal,
  Calendar,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import {
  substituteTemplateVariables,
  type PromptTemplate,
} from "./types";

interface TemplateTesterCardProps {
  template: PromptTemplate | null | undefined;
  apiKey: string;
}

export function TemplateTesterCard({ template }: TemplateTesterCardProps) {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Dynamic variable values state
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"test" | "raw" | "api">("test");

  if (!template) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[420px]">
        <div className="rounded-full bg-muted/60 p-4 text-muted-foreground mb-3">
          <Layers className="h-8 w-8" />
        </div>
        <h3 className="text-sm font-semibold">No Template Selected</h3>
        <p className="text-muted-foreground text-xs mt-1 max-w-xs">
          Select a prompt template from the list to test variable substitutions, preview output, and view API integration code.
        </p>
      </Card>
    );
  }

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(template.id);
      setCopiedId(true);
      toast.success("Template ID copied");
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      toast.error("Failed to copy ID");
    }
  };

  const handleCopyPrompt = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPrompt(true);
      toast.success("Rendered prompt copied");
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      toast.error("Failed to copy prompt");
    }
  };

  const renderedContent = substituteTemplateVariables(template.content, variableValues);

  const handleOpenInPlayground = () => {
    sessionStorage.setItem("mg_playground_initial_prompt", renderedContent);
    navigate("/playground");
  };

  const curlExample = `curl -X POST "${import.meta.env.VITE_API_URL || "http://localhost:3000"}/v1/complete" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_GATEWAY_API_KEY" \\
  -d '${JSON.stringify(
    {
      templateId: template.id,
      variables: variableValues,
      provider: "gemini",
    },
    null,
    2
  )}'`;

  const handleCopyCurl = async () => {
    try {
      await navigator.clipboard.writeText(curlExample);
      setCopiedCurl(true);
      toast.success("cURL example copied");
      setTimeout(() => setCopiedCurl(false), 2000);
    } catch {
      toast.error("Failed to copy cURL");
    }
  };

  return (
    <Card className="flex flex-col h-full shadow-sm">
      {/* Header */}
      <CardHeader className="pb-3 border-b">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">
                {template.name}
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono">
                v{template.version}
              </Badge>
            </div>
            <CardDescription className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                ID: {template.id}
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="hover:text-foreground ml-1"
                  title="Copy Template ID"
                >
                  {copiedId ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(template.createdAt).toLocaleDateString()}
              </span>
            </CardDescription>
          </div>

          {/* View Tab Switcher */}
          <div className="flex bg-muted/60 p-0.5 rounded-md border text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("test")}
              className={`px-2.5 py-1 rounded transition-all font-medium ${
                activeTab === "test"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Test Variables
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("raw")}
              className={`px-2.5 py-1 rounded transition-all font-medium ${
                activeTab === "raw"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Template Body
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("api")}
              className={`px-2.5 py-1 rounded transition-all font-medium flex items-center gap-1 ${
                activeTab === "api"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Terminal className="h-3 w-3" />
              API
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 flex-1 flex flex-col justify-between">
        {/* Tab 1: Live Interactive Variable Tester */}
        {activeTab === "test" && (
          <div className="space-y-4">
            {/* Variable Inputs */}
            {template.variables.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <Label className="font-semibold text-muted-foreground flex items-center gap-1.5">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                    Fill Placeholders ({template.variables.length})
                  </Label>
                  <button
                    type="button"
                    onClick={() => setVariableValues({})}
                    className="text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    Reset inputs
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {template.variables.map((varName) => (
                    <div key={varName} className="space-y-1">
                      <Label htmlFor={`var-${varName}`} className="text-[11px] font-mono text-muted-foreground">
                        {"{{" + varName + "}}"}
                      </Label>
                      <Input
                        id={`var-${varName}`}
                        placeholder={`Value for ${varName}...`}
                        value={variableValues[varName] || ""}
                        onChange={(e) =>
                          setVariableValues((prev) => ({
                            ...prev,
                            [varName]: e.target.value,
                          }))
                        }
                        className="text-xs font-sans h-8"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-md border bg-muted/20 p-3 text-xs text-muted-foreground">
                This template has no variable placeholders. The prompt will be used exactly as defined.
              </div>
            )}

            {/* Live Rendered Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Live Rendered Preview
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {renderedContent.length} chars
                </span>
              </div>
              <div className="rounded-md border bg-muted/30 p-3 text-xs font-mono leading-relaxed whitespace-pre-wrap select-text max-h-[220px] overflow-y-auto">
                {renderedContent}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Raw Template Definition */}
        {activeTab === "raw" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-primary" />
                Raw Template Content
              </span>
              <div className="flex items-center gap-1">
                {template.variables.map((v) => (
                  <Badge key={v} variant="outline" className="text-[10px] font-mono px-1.5 py-0">
                    {"{{" + v + "}}"}
                  </Badge>
                ))}
              </div>
            </div>
            <pre className="rounded-md border bg-muted/40 p-3.5 text-xs font-mono leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto select-text">
              {template.content}
            </pre>
          </div>
        )}

        {/* Tab 3: API Integration Snippet */}
        {activeTab === "api" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-primary" />
                cURL Integration
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCurl}
                className="h-7 text-xs gap-1"
              >
                {copiedCurl ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                Copy cURL
              </Button>
            </div>
            <pre className="rounded-md border bg-muted/50 p-3 text-[11px] font-mono overflow-x-auto text-foreground leading-relaxed select-text">
              {curlExample}
            </pre>
          </div>
        )}

        {/* Action Buttons Footer */}
        <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopyPrompt(renderedContent)}
            className="text-xs gap-1.5 h-8"
          >
            {copiedPrompt ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            Copy Rendered
          </Button>

          <Button
            size="sm"
            onClick={handleOpenInPlayground}
            className="text-xs gap-1.5 h-8"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Test in Playground
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
