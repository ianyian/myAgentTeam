# PetalPress — Bootstrap Prompt

This file contains a single self-contained prompt that reproduces the entire **PetalPress** agent-team template from scratch.

## How to use

1. Create an empty folder somewhere (e.g. `~/git/petalpress-clone`).
2. Open it in **VS Code with the Claude Code extension** (or run `claude` in that folder from a terminal).
3. Copy **everything below the `===` line** and paste it as a single message in Claude Code.
4. Claude will scaffold every file. After it finishes, run `npm install`, restart the Claude Code session (so the new `.claude/` agents and slash commands register), then try `/build-page <your topic>`.

> Tip: keep this file with the project. If you ever want to spin up another clone for a different demo, you've got the prompt ready.

---

===

You are bootstrapping a Claude Code agent-team template called **PetalPress** in this currently-empty folder. Build the entire project to the spec below — no questions, just produce the files. At the end, type-check what you wrote.

## What PetalPress is

A multi-agent webpage builder used as a presentation template. The user describes a webpage in chat; an 8-agent team produces:

- `output/index.html` — a multilingual webpage (English / Chinese / Malay / Tamil), pink + soft pastel theme, with weather + national-flower content for **5 distinct random countries**.
- `output/report.html` — a chronological log of every agent's actions (timestamps, durations, inputs/outputs).

The template runs two interchangeable ways:

- **Inside Claude Code** (CLI / VS Code extension) — slash command `/build-page <requirements>`.
- **Standalone TypeScript** — `npm run start` using `@anthropic-ai/claude-agent-sdk`.

Both paths read the **same** sub-agent definitions from `.claude/agents/*.md` — single source of truth.

## Tech stack

- **TypeScript / Node 20+, ESM modules.**
- `@anthropic-ai/claude-agent-sdk` for the standalone orchestrator.
- `@modelcontextprotocol/sdk` for two MCP servers wrapping external APIs.
- `gray-matter` to parse agent frontmatter.
- `tsx` for running TypeScript directly (no separate build step required for execution).

External APIs are **only** reached through MCP servers — no agent or orchestrator code calls `fetch()` directly. This makes swapping data sources a one-file change.

- **Weather MCP** (`mcp-servers/weather/`) — wraps Open-Meteo (free, no API key). Tools: `get_weather(country)` and `list_countries()`.
- **Images MCP** (`mcp-servers/images/`) — wraps Wikipedia REST API (`api/rest_v1/page/summary/{title}`). Tool: `search_image(query, save_path)`. **Important:** the images MCP must rewrite the Wikimedia thumbnail URL to a ~800 px width using the `…/<W>px-<file>` pattern so the page doesn't embed multi-megabyte originals (see "Bugs to avoid" below).

## Project layout

```
.
├── .claude/
│   ├── agents/                  # 8 sub-agent definitions (canonical)
│   │   ├── content-checker.md
│   │   ├── translator.md
│   │   ├── image-fetcher.md
│   │   ├── html-generator.md
│   │   ├── weather-fetcher.md
│   │   ├── flower-fetcher.md
│   │   ├── page-injector.md
│   │   └── reporter.md
│   ├── commands/
│   │   ├── build-page.md         # /build-page slash command — runs full pipeline
│   │   └── reset.md              # /reset slash command — clears output/
│   └── settings.json             # registers MCP servers, permission allowlist
├── src/
│   ├── orchestrator.ts           # standalone TS pipeline (npm run start)
│   └── lib/
│       ├── agentLoader.ts        # parses .claude/agents/*.md via gray-matter
│       ├── runAgent.ts           # SDK wrapper that invokes one agent
│       ├── prompt.ts             # readline helper for interactive prompts
│       └── types.ts              # shared TS types
├── mcp-servers/
│   ├── weather/                  # Open-Meteo MCP (own package.json + tsconfig.json)
│   │   └── src/index.ts
│   └── images/                   # Wikipedia MCP (own package.json + tsconfig.json)
│       └── src/index.ts
├── scripts/
│   └── reset.ts                  # npm run reset — wipes output/
├── .vscode/
│   ├── launch.json               # F5 debug configs for orchestrator + each MCP
│   ├── tasks.json                # "Build page" / "Reset" tasks
│   └── extensions.json           # recommends anthropic.claude-code
├── output/                       # generated artifacts (also create empty subfolders images/ + country-images/)
├── CLAUDE.md                     # guidance for future Claude Code sessions
├── README.md                     # human-readable overview + quick start
├── myArchitecture.md             # PPT-ready architecture doc, slide-per-section
├── package.json
├── tsconfig.json
├── .gitignore
└── .env.example
```

## The 8 sub-agents

Each agent lives at `.claude/agents/<name>.md` with YAML frontmatter (`name`, `description`, `tools`) and a markdown body that becomes the system prompt. Each agent must declare a strict **JSON output contract** — the orchestrator parses the final message as JSON.

1. **content-checker** — `tools: []`. Validates the user's free-text webpage requirements provide intro / body / footer. Outputs `{ status: "complete"|"needs_input", sections: { intro, body, footer }, missing: [...], questions: [...] }`. If incomplete, the orchestrator asks the user the listed questions and re-invokes.
2. **translator** — `tools: []`. Translates the three English sections into Simplified Chinese (`zh`), Malay (`ms`), Tamil (`ta`). Output: `{ intro: { en, zh, ms, ta }, body: { en, zh, ms, ta }, footer: { en, zh, ms, ta } }`.
3. **image-fetcher** — `tools: ["mcp__images__search_image", "Read", "Bash"]`. Picks 2–3 short queries based on the page topic, fetches one image per query, saves under `output/images/`. Output: `{ images: [{ path, query, source_url, attribution }, …] }`.
4. **html-generator** — `tools: ["Read", "Write"]`. Writes `output/index.html` with the four-language layout, pink + soft-pastel theme, embeds the page images, and leaves an empty country-grid container with a **specific marker** (see "Bugs to avoid"). Output: `{ path: "output/index.html", bytes: <n> }`.
5. **weather-fetcher** — `tools: ["mcp__weather__get_weather", "mcp__weather__list_countries"]`. Receives `already_used_countries`, picks one fresh country (geographically diverse), fetches current weather. Output: `{ country, country_iso, capital, temperature_c, weather_code, weather_description, wind_kmh, fetched_at }`. **Runs once per loop iteration.**
6. **flower-fetcher** — `tools: ["mcp__images__search_image"]`. Receives a country name, finds an image of its national flower (or a representative flower), saves to `output/country-images/<slug>.jpg`. Output: `{ country, flower_name, path, source_url, attribution }`. **Runs once per loop iteration.**
7. **page-injector** — `tools: ["Read", "Edit"]`. Reads `output/index.html`, inserts a country card immediately before the marker line, preserves the marker for the next iteration. Output: `{ country, injected: true, card_index }`. **Runs once per loop iteration.**
8. **reporter** — `tools: ["Read", "Write"]`. Receives the orchestrator's `run_log` and writes `output/report.html` — a self-contained themed timeline with summary card, per-step cards, and collapsible raw-result `<details>` blocks. Loop iterations are grouped visually. Output: `{ path: "output/report.html", bytes: <n>, steps: <n> }`.

## Pipeline + loop semantics

```
1. content-checker  (interactive Q&A loop until complete)
2. translator
3. image-fetcher    → output/images/
4. html-generator   → output/index.html (empty country-grid)
5–7 LOOP × 5 distinct countries (5 → 6 → 7 each iteration, sequentially):
    5. weather-fetcher  (gets already_used_countries; orchestrator appends after success)
    6. flower-fetcher   → output/country-images/<slug>.jpg
    7. page-injector    → edits output/index.html
8. reporter         → output/report.html
```

**Loop must run literally five times sequentially**, agents 5 → 6 → 7 → 5 → 6 → 7 → … Do **not** batch (don't fetch all 5 weathers first then all 5 flowers). The visible interleaving is the showcase feature.

## Theme + languages

- **Theme:** primary pink (`#ff85a1`, `#ffb6c1`, `#ffd1dc`), background soft pastel (`#fff5f7`, `#fdf6f8`). Embedded `<style>`, no external CSS or JS. Responsive (works at 360 px). System font stack must include CJK and Tamil fallbacks (`PingFang SC`, `Hiragino Sans GB`, `Microsoft YaHei`, `Noto Sans CJK SC`, `Noto Sans Tamil`).
- **Languages on page:** every section (intro / body / footer) renders in **all four** languages — `en`, `zh`, `ms`, `ta` — each in a `lang`-tagged card.
- **Country cards:** flower image rendered as a 120 × 120 circular thumbnail with pink border. Card shows country, capital, temperature + condition, wind, and the flower's English common name.

## Two execution paths

- **Claude Code path:** `/build-page <requirements>` (defined in `.claude/commands/build-page.md`). The command body instructs the main assistant to delegate to each sub-agent via the **Task** tool in order, maintain a `run_log`, run the loop literally five times, and produce both `index.html` and `report.html`.
- **Standalone path:** `npm run start` runs `src/orchestrator.ts`. It loads each `.claude/agents/*.md` with `gray-matter`, then for each pipeline step calls a thin SDK wrapper (`runAgent.ts`) that invokes `query()` from `@anthropic-ai/claude-agent-sdk` with the agent's system prompt + tool whitelist + the two MCP servers (registered programmatically). Permission mode is `bypassPermissions` for the standalone run. The orchestrator owns the `for (let i = 1; i <= 5; i++)` loop and the `already_used_countries` list — that loop should be visible in the source so it can be pointed to in a presentation.

## Slash commands

- `.claude/commands/build-page.md` — orchestration instructions. Begin with **"Hard rules"**: (1) all 8 agents must run; (2) loop runs literally 5 times; (3) every sub-agent goes through Task tool; (4) verify after each step (file existence, country card actually inserted) and retry rather than skipping. End with a verification step that confirms both `output/index.html` (with 5 country cards) and `output/report.html` exist before reporting success.
- `.claude/commands/reset.md` — wipes `output/index.html`, `output/report.html`, `output/images/`, `output/country-images/`. Recreates the two empty subfolders. **Never** touches `src/`, `mcp-servers/`, `.claude/`, `package.json`, or any other source.

## Reset (npm path)

`scripts/reset.ts` mirrors the slash command: removes the same four targets and recreates the empty image folders. `npm run reset` runs it via `tsx`.

## CLAUDE.md guidance

CLAUDE.md must instruct future sessions: when a user describes a webpage in chat, **route through `/build-page`** rather than writing HTML directly. The agent team is the whole point. Also document the project structure, the two execution paths, the MCP boundary rule, common commands, and the maintainer-surprise notes (permission mode, lenient JSON parsing, country-uniqueness handled by orchestrator, marker-string contract).

## myArchitecture.md format

Slide-per-section markdown so it can be pasted into a PPT generator. Sections: glossary of terms (Agent, Agent Team, Orchestrator, MCP, MCP Server, System Prompt, Tool Whitelist, Slash Command, Loop/Iteration, Run Log), what is PetalPress, the 8-agent table with one example agent definition shown, the pipeline diagram (ASCII), the loop showcase, two-paths diagram, MCP integration, the four-language layout, the run report, reusing the template across demos, file map, key takeaways.

## VS Code config

- `launch.json`: 4 launch configs — orchestrator, reset script, weather MCP, images MCP. All use `npx tsx <path>`, integrated terminal, `${workspaceFolder}` cwd.
- `tasks.json`: 4 tasks — "PetalPress: Build page" (`npm run start`), "PetalPress: Reset" (`npm run reset`), "PetalPress: Open generated page" (`open output/index.html`), "PetalPress: Open run report" (`open output/report.html`).
- `extensions.json`: recommends `anthropic.claude-code`.

## .claude/settings.json

Registers the two MCP servers (stdio transport, `npx tsx mcp-servers/<name>/src/index.ts`) and an explicit `permissions.allow` list including `Read`, `Write`, `Edit`, `Bash(mkdir:*)`, `Bash(rm:*)`, `Bash(ls:*)`, `Bash(open:*)`, `mcp__weather`, `mcp__images`.

## package.json

Scripts: `build` (tsc -b), `build:mcp`, `build:all`, `start` (tsx src/orchestrator.ts), `reset` (tsx scripts/reset.ts), `mcp:weather`, `mcp:images`. Dependencies: `@anthropic-ai/claude-agent-sdk`, `@modelcontextprotocol/sdk`, `gray-matter`, `zod`. Dev: `@types/node`, `tsx`, `typescript`. `"type": "module"`, `"engines": { "node": ">=20" }`.

## Bugs to avoid (lessons from a previous run)

These specific issues sank the first cut — design them out from the start:

1. **Image paths in `index.html` must be relative to the file itself**, not to the project root. The image-fetcher returns paths like `output/images/hero.jpg`, but `index.html` lives in `output/`, so the `<img src>` must be `images/hero.jpg`. Same rule for country flowers: `country-images/<slug>.jpg`, **not** `output/country-images/<slug>.jpg`. Document this explicitly in both `html-generator.md` and `page-injector.md`.

2. **Country-grid marker must be inside the container, with a stable, simple text.** Use exactly:
   ```html
   <section class="country-section">
     <h2>Country Weather</h2>
     <div id="country-grid">
       <!-- INSERT-COUNTRY-CARDS-HERE -->
     </div>
   </section>
   ```
   The page-injector finds the line containing `<!-- INSERT-COUNTRY-CARDS-HERE -->`, replaces it with `<article>…</article>` followed by the **same** marker (so it persists for the next iteration). Don't use long sentence-style markers — they break easily on whitespace.

3. **Page-injector must read the file first** to capture the exact marker line (with whatever indentation the html-generator produced) before calling Edit. Don't rely on a hardcoded indentation guess.

4. **`/build-page` must enforce "all 8 agents run, no skipping."** Without that, the orchestrator can quietly stop after step 4 if the loop logic feels uncertain, leaving you with a partial page and no report. The hard-rules preamble above prevents this.

5. **Images MCP must downsize.** Wikipedia originals are often 5–20 MB. Five of those embedded in a page = a multi-hundred-megabyte demo. The MCP must rewrite the Wikimedia thumbnail URL pattern (`.+/(\d+)px-(.+)$` → replace the captured width with `800`) and fall back to the thumbnail-as-is if the URL doesn't match. Final downloads should be < 300 KB each.

## Verification

After scaffolding everything, run:

```bash
npm install
cd mcp-servers/weather && npm install && cd ../images && npm install && cd ../..
npx tsc --noEmit
cd mcp-servers/weather && npx tsc --noEmit && cd ../..
cd mcp-servers/images && npx tsc --noEmit && cd ../..
```

All three type-checks should pass with no output. Then briefly smoke-test both MCPs by piping JSON-RPC `initialize` + `tools/call` requests via `npx tsx`, confirming `get_weather({country:"Singapore"})` returns real numbers and `search_image({query:"hibiscus", save_path:"output/_smoke.jpg"})` writes a < 300 KB file. Delete the smoke test file afterward.

Tell the user when you're done:
- Summary of what was created.
- Reminder to run `npm install` if they haven't.
- Reminder to **restart Claude Code** before trying `/build-page` (slash commands and sub-agents register at session start).
- Suggested first command: `/build-page <some short topic>`.
