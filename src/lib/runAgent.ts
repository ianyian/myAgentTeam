/**
 * Thin wrapper around `@anthropic-ai/claude-agent-sdk`'s query() that:
 *   - applies a sub-agent's system prompt + tool whitelist
 *   - registers the PetalPress MCP servers
 *   - returns the agent's final text result (and the parsed JSON if the agent
 *     emitted a single JSON object as its last message)
 */
import { query, type Options } from "@anthropic-ai/claude-agent-sdk";
import { resolve } from "node:path";
import type { AgentDefinition } from "./types.js";

const PROJECT_ROOT = process.cwd();

const MCP_SERVERS: Options["mcpServers"] = {
  weather: {
    type: "stdio",
    command: "npx",
    args: ["tsx", resolve(PROJECT_ROOT, "mcp-servers/weather/src/index.ts")],
  },
  images: {
    type: "stdio",
    command: "npx",
    args: ["tsx", resolve(PROJECT_ROOT, "mcp-servers/images/src/index.ts")],
  },
  mssql: {
    type: "stdio",
    command: "npx",
    args: ["tsx", resolve(PROJECT_ROOT, "mcp-servers/mssql/src/index.ts")],
  },
};

export interface RunAgentResult {
  text: string;
  json: unknown | null;
}

/**
 * Run a sub-agent end-to-end and return its final text + parsed JSON.
 * The system prompt comes from the agent definition (loaded from .claude/agents/).
 */
export async function runAgent(
  agent: AgentDefinition,
  userPrompt: string,
): Promise<RunAgentResult> {
  // Map the agent's declared tool whitelist to the SDK's allowedTools format.
  // Built-in tools pass through; MCP tools are already namespaced (mcp__server__tool).
  const allowedTools = agent.tools.length > 0 ? agent.tools : undefined;

  let lastText = "";

  for await (const message of query({
    prompt: userPrompt,
    options: {
      systemPrompt: agent.systemPrompt,
      allowedTools,
      mcpServers: MCP_SERVERS,
      cwd: PROJECT_ROOT,
      permissionMode: "bypassPermissions",
      settingSources: [],
    },
  })) {
    if (message.type === "result" && message.subtype === "success") {
      lastText = message.result ?? "";
    }
  }

  return { text: lastText, json: tryParseJson(lastText) };
}

function tryParseJson(text: string): unknown | null {
  if (!text) return null;
  // Agents are instructed to emit a single JSON object — but be lenient about
  // accidental code fences or surrounding prose.
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenceMatch ? fenceMatch[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}
