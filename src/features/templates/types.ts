import { z } from "zod";

export const promptTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  content: z.string(),
  variables: z.array(z.string()),
  version: z.number(),
  createdAt: z.string(),
});

export const promptTemplatesListSchema = z.array(promptTemplateSchema);

export type PromptTemplate = z.infer<typeof promptTemplateSchema>;

export const createTemplateSchema = z.object({
  name: z
    .string()
    .min(1, "Template name is required")
    .max(100, "Template name must be 100 characters or fewer"),
  content: z
    .string()
    .min(1, "Template content cannot be empty")
    .max(10000, "Content cannot exceed 10,000 characters"),
});

export type CreateTemplatePayload = z.infer<typeof createTemplateSchema>;

/**
 * Extracts unique {{variable}} names from template content.
 */
export function extractTemplateVariables(content: string): string[] {
  const matches = content.matchAll(/\{\{\s*(\w+)\s*\}\}/g);
  const names = new Set<string>();
  for (const match of matches) {
    if (match[1]) {
      names.add(match[1]);
    }
  }
  return Array.from(names);
}

/**
 * Replaces {{variable}} placeholders with provided values for live preview.
 */
export function substituteTemplateVariables(
  content: string,
  variables: Record<string, string>
): string {
  return content.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, name: string) => {
    return variables[name] !== undefined && variables[name] !== ""
      ? variables[name]
      : `{{${name}}}`;
  });
}
