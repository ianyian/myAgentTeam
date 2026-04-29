/**
 * Reads .claude/agents/*.md as the canonical sub-agent definitions.
 * The same files are consumed by Claude Code (CLI / VS Code) and by this
 * standalone orchestrator — single source of truth.
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import matter from "gray-matter";
import type { AgentDefinition } from "./types.js";

const AGENTS_DIR = resolve(process.cwd(), ".claude/agents");

export async function loadAgent(name: string): Promise<AgentDefinition> {
  const path = resolve(AGENTS_DIR, `${name}.md`);
  const raw = await readFile(path, "utf8");
  const parsed = matter(raw);
  const fm = parsed.data as { name?: string; description?: string; tools?: string[] | string };

  const tools = Array.isArray(fm.tools)
    ? fm.tools
    : typeof fm.tools === "string"
      ? fm.tools.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

  return {
    name: fm.name ?? name,
    description: fm.description ?? "",
    tools,
    systemPrompt: parsed.content.trim(),
  };
}
