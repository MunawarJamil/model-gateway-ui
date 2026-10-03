import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key, ArrowRight, ShieldCheck, FileText, Plus } from "lucide-react";
import { useTemplates } from "./useTemplates";
import { TemplatesTable } from "./TemplatesTable";
import { TemplateTesterCard } from "./TemplateTesterCard";
import { CreateTemplateModal } from "./CreateTemplateModal";

export function TemplatesPage() {
  // Session-persisted API key for gateway operations
  const [apiKey, setApiKey] = useState<string>(() => {
    return (
      sessionStorage.getItem("mg_gateway_key") ??
      sessionStorage.getItem("mg_webhooks_key") ??
      ""
    );
  });
  const [inputKey, setInputKey] = useState<string>(apiKey);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    if (apiKey) {
      sessionStorage.setItem("mg_gateway_key", apiKey);
      sessionStorage.setItem("mg_webhooks_key", apiKey);
    }
  }, [apiKey]);

  const {
    templates,
    selectedTemplateId,
    setSelectedTemplateId,
    selectedTemplate,
    createTemplate,
    isCreating,
  } = useTemplates(apiKey);

  // If no template is explicitly selected, select the first one by default when loaded
  useEffect(() => {
    if (!selectedTemplateId && templates.length > 0) {
      const first = templates[0];
      if (first) {
        setSelectedTemplateId(first.id);
      }
    }
  }, [selectedTemplateId, templates, setSelectedTemplateId]);

  const handleApplyKey = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(inputKey.trim());
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Prompt Templates Manager</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Build and manage reusable prompt templates with dynamic variable placeholders.
          </p>
        </div>

        {apiKey && (
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="gap-2 text-xs self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            New Template
          </Button>
        )}
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
              placeholder="Paste raw key (mgk_live_...) to manage templates"
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
              A valid API key is required to authenticate and manage templates.
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
          <h2 className="text-lg font-semibold">Enter an API Key to Access Templates</h2>
          <p className="text-muted-foreground text-sm mt-1 max-w-md">
            Enter your raw API key above to load and manage your stored prompt templates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Templates Table Column (7 cols) */}
          <div className="lg:col-span-7">
            <TemplatesTable
              templates={templates}
              selectedId={selectedTemplateId}
              onSelect={(id) => setSelectedTemplateId(id)}
              onCreateOpen={() => setCreateModalOpen(true)}
            />
          </div>

          {/* Template Inspector & Variable Tester Column (5 cols) */}
          <div className="lg:col-span-5">
            <TemplateTesterCard
              template={selectedTemplate}
              apiKey={apiKey}
            />
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      <CreateTemplateModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={createTemplate}
        isSubmitting={isCreating}
      />
    </div>
  );
}
