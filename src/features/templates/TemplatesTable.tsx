import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Search,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Plus,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import type { PromptTemplate } from "./types";

interface TemplatesTableProps {
  templates: PromptTemplate[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateOpen: () => void;
}

export function TemplatesTable({
  templates,
  selectedId,
  onSelect,
  onCreateOpen,
}: TemplatesTableProps) {
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.content.toLowerCase().includes(search.toLowerCase()) ||
      t.variables.some((v) => v.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCopyId = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      toast.success("Template ID copied");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy ID");
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Templates ({templates.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Manage your dynamic prompt templates and placeholders.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>

            <Button
              size="sm"
              onClick={onCreateOpen}
              className="text-xs gap-1.5 h-8 shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              New Template
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="rounded-full bg-muted/60 p-4 text-muted-foreground mb-3">
              <Sparkles className="h-8 w-8 text-primary/60" />
            </div>
            <h4 className="text-sm font-semibold">No Templates Created Yet</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Create your first reusable prompt template with <code className="text-primary font-mono text-[11px]">{"{{placeholders}}"}</code> to streamline AI workflows.
            </p>
            <Button
              size="sm"
              onClick={onCreateOpen}
              className="mt-4 gap-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Create First Template
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No templates match your search &quot;{search}&quot;.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Name & Content</TableHead>
                  <TableHead className="text-xs">Variables</TableHead>
                  <TableHead className="text-xs">Created</TableHead>
                  <TableHead className="text-xs text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => {
                  const isSelected = t.id === selectedId;

                  return (
                    <TableRow
                      key={t.id}
                      onClick={() => onSelect(t.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-primary/5 hover:bg-primary/10 border-l-2 border-l-primary"
                          : "hover:bg-muted/40"
                      }`}
                    >
                      <TableCell className="max-w-[280px] py-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-xs text-foreground">
                              {t.name}
                            </span>
                            <Badge variant="outline" className="text-[10px] font-mono px-1 py-0 h-4">
                              v{t.version}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate font-mono">
                            {t.content}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {t.variables.length > 0 ? (
                            t.variables.map((v) => (
                              <Badge
                                key={v}
                                variant="secondary"
                                className="text-[10px] font-mono px-1.5 py-0 h-4.5 text-primary"
                              >
                                {"{{" + v + "}}"}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-[11px] text-muted-foreground italic">None</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-3 text-[11px] text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(t.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>

                      <TableCell className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={(e) => handleCopyId(t.id, e)}
                            title="Copy Template ID"
                            className="p-1 rounded text-muted-foreground hover:text-foreground"
                          >
                            {copiedId === t.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <span
                            className={`p-1 rounded ${
                              isSelected ? "text-primary" : "text-muted-foreground"
                            }`}
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
