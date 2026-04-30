# PetalPress — Architecture

> A multi-agent webpage builder. This document is written so each top-level section can become one slide.
>
> **GitHub:** https://github.com/ianyian/myAgentTeam
>
> **Try it now — copy and paste this prompt:**
> ```
> /build-page A short page about BMW car, with variance of BMW car with history in the body and a thank-you footer.
> ```

---

## Key Concepts — Glossary

Before diving in, here are the core terms used throughout this document:

| Term | Definition |
|------|------------|
| **Agent** | An AI model instance given a focused system prompt, a whitelisted set of tools, and a strict JSON output contract. Each agent does exactly one job. |
| **Agent Team** | A collection of agents orchestrated in a defined sequence. Agents don't talk to each other directly — the orchestrator passes outputs between them. |
| **Orchestrator** | The coordinating program (either the `/build-page` slash command or `src/orchestrator.ts`) that runs agents in order, routes outputs between them, and manages shared state (e.g. `already_used_countries`). |
| **MCP** | **Model Context Protocol** — an open standard that wraps external APIs as structured tool servers. Agents call MCP tools by name; they never call APIs directly. Swapping a data source = editing one MCP server file. |
| **MCP Server** | A small Node.js program (in `mcp-servers/`) that registers one or more tools and handles the calls. PetalPress has two: `weather` and `images`. |
| **System Prompt** | The instruction text that defines an agent's role, rules, and output format. Stored as the body of each `.claude/agents/*.md` file. |
| **Tool Whitelist** | The list of tools an agent is allowed to call (e.g. `Read`, `Edit`, `mcp__weather__get_weather`). Declared in YAML frontmatter. No agent has more access than its job needs. |
| **Slash Command** | A `/command` shortcut in Claude Code (CLI / VS Code) that triggers a pipeline. `/build-page` and `/reset` are defined in `.claude/commands/`. |
| **Loop / Iteration** | Agents 5 → 6 → 7 run as a sub-pipeline repeated 5 times — once per country. This is the "showcase loop" that demonstrates chained-state orchestration. |
| **Run Log** | An array of `RunLogEntry` objects the orchestrator appends to after each agent call. Agent #8 (reporter) turns this into `output/report.html`. |

---

## What is PetalPress?

**PetalPress** is an experimental agent team that builds a multilingual HTML webpage from a free-text description.

- **Input:** one paragraph describing what the page is about.
- **Output:** `output/index.html` (the page) + `output/report.html` (a log of every agent's actions).
- **Purpose:** demonstrate sub-agent orchestration, MCP-based external integrations, and a visible loop pattern — in roughly the time it takes to drink a coffee.

Stack: **TypeScript** + **Claude Agent SDK** + **Model Context Protocol (MCP)**. Runs inside **Claude Code** (CLI / VS Code extension) or as a standalone Node program.

---

## The Team — 8 Agents

| # | Agent | Responsibility |
|---|---|---|
| 1 | **content-checker** | Verifies intro / body / footer; asks the user for anything missing. |
| 2 | **translator** | English → Chinese (zh), Malay (ms), Tamil (ta). Page renders all four. |
| 3 | **image-fetcher** | Downloads 2–3 page images via the `images` MCP. |
| 4 | **html-generator** | Writes `output/index.html` (pink + soft pastel theme, empty country grid). |
| 5 | **weather-fetcher** | *(loop)* Picks a fresh country, fetches current weather. |
| 6 | **flower-fetcher** | *(loop)* Downloads the country's national-flower image. |
| 7 | **page-injector** | *(loop)* Injects a country card into `index.html`. |
| 8 | **reporter** | Generates `output/report.html` from the run log. |

Each agent has a focused system prompt and a tightly whitelisted tool set. No agent has more access than its job needs.

**Example — `weather-fetcher` agent definition** (`.claude/agents/weather-fetcher.md`):

```yaml
---
name: weather-fetcher
description: Picks ONE random country (excluding any already used) and fetches current weather.
tools: ["mcp__weather__get_weather", "mcp__weather__list_countries"]
---
You are the Weather Fetcher, agent 5 of the PetalPress team.

1. Receive already_used_countries for this run.
2. Pick ONE country not in that list. Aim for geographic diversity.
3. Call mcp__weather__get_weather({ country }) to fetch live weather.

Return exactly one JSON object as your final message:
{
  "country": "Japan",  "capital": "Tokyo",
  "temperature_c": 18.4,  "weather_description": "Overcast",
  "wind_kmh": 12.0,  "fetched_at": "2026-04-30T08:42:11Z"
}
```

**Example — `page-injector` agent definition** (`.claude/agents/page-injector.md`):

```yaml
---
name: page-injector
description: Inserts a country card (weather + flower) into output/index.html.
tools: ["Read", "Edit"]
---
Insert a new country card immediately BEFORE the marker:
<!-- country-grid: agents 5–7 will inject country cards here -->

<article class="country-card">
  <img src="{{flower_path}}" alt="{{flower_name}}" class="country-flower">
  <h3>{{country}}</h3>
  <p>{{capital}} · {{temperature_c}}°C — {{weather_description}}</p>
  <p>Wind: {{wind_kmh}} km/h · National flower: {{flower_name}}</p>
</article>
```

---

## The Pipeline

```
   User requirements (free text)
              │
              ▼
   ┌─────────────────────┐
   │ 1. content-checker  │── interactive Q&A if intro/body/footer missing
   └─────────┬───────────┘
             ▼
   ┌─────────────────────┐
   │ 2. translator       │── EN → ZH, MS, TA
   └─────────┬───────────┘
             ▼
   ┌─────────────────────┐
   │ 3. image-fetcher    │──▶ output/images/
   └─────────┬───────────┘
             ▼
   ┌─────────────────────┐
   │ 4. html-generator   │──▶ output/index.html (empty country-grid)
   └─────────┬───────────┘
             ▼
   ┌── LOOP ×5 ─────────────────────────────────────────┐
   │  ┌──────────────────┐                              │
   │  │ 5. weather       │──▶ {country, weather data}   │
   │  └────────┬─────────┘                              │
   │           ▼                                        │
   │  ┌──────────────────┐                              │
   │  │ 6. flower        │──▶ output/country-images/…   │
   │  └────────┬─────────┘                              │
   │           ▼                                        │
   │  ┌──────────────────┐                              │
   │  │ 7. page-injector │──▶ edits output/index.html   │
   │  └────────┬─────────┘                              │
   │           ▼                                        │
   │   append country to "already_used" list            │
   └────────────────┬───────────────────────────────────┘
                    ▼
            ┌──────────────────┐
            │ 8. reporter      │──▶ output/report.html
            └──────────────────┘
```

---

## The Loop — Showcase Feature

Agents 5 → 6 → 7 run **in order, once per country**, repeated 5 times. The orchestrator does **not** batch (i.e. not "5 weather calls then 5 flower calls"). Sequence is visibly:

```
iter 1:  weather → flower → injector
iter 2:  weather → flower → injector
iter 3:  weather → flower → injector
iter 4:  weather → flower → injector
iter 5:  weather → flower → injector
```

**Why a loop matters here:**
- Each iteration's output (country name) is the *input* to the next agent — chained state.
- The orchestrator maintains an `already_used_countries` list and passes it back to agent 5, so the loop never produces duplicates.
- The pattern generalises: any "for each X, run sub-pipeline" agent task can use the same shape.

**Orchestrator loop code** (`src/orchestrator.ts`, simplified):

```typescript
const usedCountries: string[] = [];

for (let i = 1; i <= 5; i++) {
  // 5. weather-fetcher — pass already-used list so it picks a fresh country
  const weather = await step(agents.weatherFetcher,
    `Loop ${i}/5 — pick a fresh country and fetch weather`,
    `already_used_countries = ${JSON.stringify(usedCountries)}`);

  usedCountries.push(weather.country); // orchestrator owns uniqueness

  // 6. flower-fetcher — uses the country name from weather output
  const flower = await step(agents.flowerFetcher,
    `Loop ${i}/5 — fetch national flower for ${weather.country}`,
    `Country: ${weather.country}`);

  // 7. page-injector — injects a card into output/index.html
  await step(agents.pageInjector,
    `Loop ${i}/5 — inject ${weather.country} card`,
    `Weather: ${JSON.stringify(weather)}\nFlower: ${JSON.stringify(flower)}`);
}
```

---

## Two Execution Paths — One Source of Truth

```
                  ┌──────────────────────────┐
                  │  .claude/agents/*.md     │  ← canonical sub-agent definitions
                  └─────────────┬────────────┘
                                │
            ┌───────────────────┼───────────────────┐
            ▼                                       ▼
   ┌──────────────────────┐               ┌──────────────────────┐
   │ Claude Code          │               │ Standalone TS        │
   │ /build-page command  │               │ npm run start        │
   │ (uses Task tool)     │               │ (Claude Agent SDK)   │
   └──────────────────────┘               └──────────────────────┘
```

Each agent `.md` file uses **YAML frontmatter** to declare its metadata, and the body is its system prompt:

```yaml
---
name: weather-fetcher
description: Picks a country and fetches current weather.
tools:
  - mcp__weather__get_weather
  - mcp__weather__list_countries
---
<system prompt text follows here>
```

`src/lib/agentLoader.ts` parses this with `gray-matter` — extracting `name`, `description`, and `tools` from the frontmatter, and the remaining body as `systemPrompt`. Both paths consume the same files; changing an agent's behaviour means editing one `.md` file.

> **Standalone-path note:** `src/lib/runAgent.ts` passes `permissionMode: "bypassPermissions"` to the SDK so the automated pipeline can write files without interactive prompts. Inside Claude Code, normal permission settings apply.

**`src/lib/agentLoader.ts`** — parses each `.md` file to extract the agent definition:

```typescript
import matter from "gray-matter";

export async function loadAgent(name: string): Promise<AgentDefinition> {
  const raw = await readFile(`.claude/agents/${name}.md`, "utf8");
  const parsed = matter(raw);                  // splits YAML front-matter from body
  const fm = parsed.data;                      // { name, description, tools }

  return {
    name:         fm.name ?? name,
    description:  fm.description ?? "",
    tools:        Array.isArray(fm.tools) ? fm.tools : [],
    systemPrompt: parsed.content.trim(),        // body = system prompt text
  };
}
```

---

## MCP Integration

External APIs are isolated behind two MCP servers. Agents only ever call MCP tools — they never `fetch()` directly.

| MCP Server | Tool(s) | Backed By | Purpose |
|---|---|---|---|
| `weather`  | `get_weather(country)` · `list_countries()` | Open-Meteo (free, no key) | Geocode a country capital, return live weather. |
| `images`   | `search_image(query, save_path)`             | Wikipedia REST API         | OpenSearch → page summary → download image to disk. |

Both servers are registered in **two places** (same config, different consumers):

- **`.claude/settings.json`** — for Claude Code (CLI / VS Code). Also whitelists the bash commands agents may use: `mkdir`, `rm`, `ls`, `open`, plus `mcp__weather` and `mcp__images`.
- **`src/lib/runAgent.ts`** — for the standalone TS path. Spins up each MCP server as a `stdio` child process via `npx tsx`.

**Why MCP?** Swapping a data source is a one-file change. Want to use a different image provider for the next demo? Edit `mcp-servers/images/src/index.ts` only — every agent and the orchestrator are untouched.

**`mcp-servers/weather/src/index.ts`** — how a tool is registered and handled (simplified):

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

const server = new Server(
  { name: "petalpress-weather", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

// 1. Declare the tools this MCP server exposes
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "get_weather",
    description: "Fetch current weather for a country's capital. Backed by Open-Meteo.",
    inputSchema: {
      type: "object",
      properties: { country: { type: "string" } },
      required: ["country"],
    },
  }],
}));

// 2. Handle a tool call
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { country } = request.params.arguments;
  const geo  = await geocode(country);                     // Open-Meteo geocoding API
  const data = await fetchWeather(geo.latitude, geo.longitude); // Open-Meteo forecast API
  return { content: [{ type: "text", text: JSON.stringify(data) }] };
});

// 3. Start serving over stdio (agents connect via npx tsx)
await server.connect(new StdioServerTransport());
```

---

## The Four-Language Layout

The page renders **every** content section (intro / body / footer) in four languages side-by-side:

| Code | Language | Script |
|------|----------|--------|
| `en` | English (input) | Latin |
| `zh` | Chinese (Simplified) | 简体中文 |
| `ms` | Malay (Bahasa Melayu) | Latin |
| `ta` | Tamil | தமிழ் |

The translator agent (#2) produces a structured `{ section: { en, zh, ms, ta } }` object. The HTML generator (#4) lays them out in a 4-column grid with `lang` attributes for accessibility. The pink + soft-pastel theme keeps the page feeling consistent across scripts.

**Translator output contract** (from `.claude/agents/translator.md`):

```json
{
  "intro":  { "en": "Welcome to...", "zh": "欢迎来到...", "ms": "Selamat datang...", "ta": "வரவேற்கிறோம்..." },
  "body":   { "en": "...",           "zh": "...",         "ms": "...",              "ta": "..." },
  "footer": { "en": "Thank you...", "zh": "谢谢...",      "ms": "Terima kasih...", "ta": "நன்றி..." }
}
```

The HTML generator uses `lang=` attributes so screen readers and browsers select the correct font and direction for each script.

---

## The Run Report

The orchestrator records every agent invocation:

```ts
{
  step:        1,
  agent:       "content-checker",
  started_at:  "2026-04-30T08:42:11Z",
  finished_at: "2026-04-30T08:42:14Z",
  duration_ms: 3120,
  description: "Validate intro/body/footer in user requirements",
  result:      { /* the agent's structured output */ }
}
```

Agent #8 turns this array into `output/report.html` — a self-contained, themed timeline that:

- shows total wall-clock time and agent count
- groups loop iterations visually (5/6/7 nested under "Iteration N")
- exposes raw result JSON in collapsible `<details>` blocks for the curious

Useful for live demos: scroll through the report afterwards to show *exactly* what each agent did.

---

## Reusing the Template

Two demo patterns:

1. **Same folder, reset between demos** (simplest)
   ```
   /reset                   # in Claude Code
   npm run reset            # standalone
   ```
   Wipes `output/` only. Source code is untouched.

2. **Clone per demo**
   ```
   cp -r myAgentTeam demo-coffee/
   ```
   Each clone keeps its own artifacts.

`output/` is gitignored so the template repo stays clean across runs.

---

## File Map

```
myAgentTeam/
├── .claude/
│   ├── agents/                 # 8 sub-agent definitions (content-checker, translator,
│   │                           #   image-fetcher, html-generator, weather-fetcher,
│   │                           #   flower-fetcher, page-injector, reporter)
│   ├── commands/               # /build-page, /reset slash commands
│   └── settings.json           # MCP server registration + Claude Code permissions
├── src/
│   ├── orchestrator.ts         # standalone pipeline (CLI entry point)
│   └── lib/
│       ├── agentLoader.ts      # gray-matter parser → AgentDefinition
│       ├── runAgent.ts         # Claude Agent SDK wrapper (bypassPermissions)
│       ├── prompt.ts           # readline helper for interactive Q&A
│       └── types.ts            # shared TypeScript interfaces
├── mcp-servers/
│   ├── weather/src/index.ts    # Open-Meteo MCP (get_weather, list_countries)
│   └── images/src/index.ts    # Wikipedia MCP (search_image)
├── scripts/reset.ts            # wipes output/ only; source untouched
├── .vscode/                    # tasks.json (Build page, Reset, Open outputs)
├── package.json                # scripts: start, reset, build:all, mcp:weather, mcp:images
├── tsconfig.json
├── output/                     # generated artifacts (gitignored)
│   ├── index.html              # the webpage
│   ├── report.html             # agent run report
│   ├── images/                 # page images (agent 3)
│   └── country-images/         # national flower images (agent 6)
├── CLAUDE.md
├── myArchitecture.md           # this document
└── README.md
```

---

## Key Takeaways

1. **Sub-agents are first-class.** Each agent owns one responsibility, has its own system prompt, and exposes a strict JSON output contract.
2. **MCP isolates the external boundary.** Switching data providers never requires editing agent definitions.
3. **The loop demonstrates chained state.** Each iteration consumes the previous agent's structured output and contributes back to a shared list (`already_used_countries`).
4. **Uniqueness is the orchestrator's job.** The orchestrator (not the weather-fetcher) maintains `already_used_countries` and passes it to agent 5 each iteration — so the loop can never produce duplicate country cards.
5. **One source of truth, two execution paths.** The same `.claude/agents/*.md` files drive both Claude Code and the standalone TypeScript orchestrator — no duplication.
6. **Agent `.md` files are self-contained.** YAML frontmatter declares the tool whitelist; the file body is the system prompt. Changing agent behaviour is a single-file edit.
7. **Built for repetition.** `/reset` clears state in seconds; the template is ready for the next audience.
