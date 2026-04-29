# PetalPress — Architecture

> A multi-agent webpage builder. This document is written so each top-level section can become one slide.

---

## Slide 1 — What is PetalPress?

**PetalPress** is an experimental agent team that builds a multilingual HTML webpage from a free-text description.

- **Input:** one paragraph describing what the page is about.
- **Output:** `output/index.html` (the page) + `output/report.html` (a log of every agent's actions).
- **Purpose:** demonstrate sub-agent orchestration, MCP-based external integrations, and a visible loop pattern — in roughly the time it takes to drink a coffee.

Stack: **TypeScript** + **Claude Agent SDK** + **Model Context Protocol (MCP)**. Runs inside **Claude Code** (CLI / VS Code extension) or as a standalone Node program.

---

## Slide 2 — The team (8 agents)

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

---

## Slide 3 — The pipeline

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

## Slide 4 — The loop (showcase feature)

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

---

## Slide 5 — Two execution paths, one source of truth

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

The standalone orchestrator (`src/orchestrator.ts`) parses each `.md` file with `gray-matter`, extracts the system prompt and tool whitelist, and feeds them to the SDK's `query()`. Slash command and SDK paths produce identical artifacts.

---

## Slide 6 — MCP integration

External APIs are isolated behind two MCP servers. Agents only ever call MCP tools — they never `fetch()` directly.

| MCP Server | Tool(s) | Backed By | Purpose |
|---|---|---|---|
| `weather`  | `get_weather`, `list_countries` | Open-Meteo (free, no key) | Geocode a country, return current weather. |
| `images`   | `search_image`                   | Wikipedia REST API         | Find a relevant image, download to disk. |

**Why MCP?** Swapping a data source is a one-file change. Want to use a different image provider for the next demo? Edit `mcp-servers/images/src/index.ts` only — every agent and the orchestrator are untouched.

---

## Slide 7 — The four-language layout

The page renders **every** content section (intro / body / footer) in four languages side-by-side:

| Code | Language | Script |
|------|----------|--------|
| `en` | English (input) | Latin |
| `zh` | Chinese (Simplified) | 简体中文 |
| `ms` | Malay (Bahasa Melayu) | Latin |
| `ta` | Tamil | தமிழ் |

The translator agent (#2) produces a structured `{ section: { en, zh, ms, ta } }` object. The HTML generator (#4) lays them out in a 4-column grid with `lang` attributes for accessibility. The pink + soft-pastel theme keeps the page feeling consistent across scripts.

---

## Slide 8 — The run report

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

## Slide 9 — Reusing the template

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

## Slide 10 — File map

```
myAgentTeam/
├── .claude/
│   ├── agents/                 # 8 sub-agent definitions
│   ├── commands/               # /build-page, /reset
│   └── settings.json           # MCP server registration
├── src/
│   ├── orchestrator.ts         # the standalone pipeline
│   └── lib/                    # agent loader, SDK wrapper, prompt helper
├── mcp-servers/
│   ├── weather/                # Open-Meteo MCP
│   └── images/                 # Wikipedia MCP
├── scripts/reset.ts
├── .vscode/                    # launch + tasks configs
├── output/                     # generated artifacts (gitignored)
├── CLAUDE.md
├── myArchitecture.md           # this document
└── README.md
```

---

## Slide 11 — Key takeaways

1. **Sub-agents are first-class.** Each agent owns one responsibility, has its own system prompt, and exposes a strict JSON output contract.
2. **MCP isolates the external boundary.** Switching data providers never requires editing agent definitions.
3. **The loop demonstrates chained state.** Each iteration consumes the previous agent's structured output and contributes back to a shared list (`already_used_countries`).
4. **One source of truth, two execution paths.** The same `.claude/agents/*.md` files drive both Claude Code and the standalone TypeScript orchestrator — no duplication.
5. **Built for repetition.** `/reset` clears state in seconds; the template is ready for the next audience.
