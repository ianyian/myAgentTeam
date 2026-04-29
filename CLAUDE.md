# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**PetalPress** — a multi-agent webpage builder. When the user opens this folder and chats about a webpage they want, you orchestrate an 8-agent pipeline that produces `output/index.html` (a multilingual page with weather + national-flower content for 5 random countries) and `output/report.html` (a chronological log of every agent's actions).

**This is a presentation template, not a production app.** The point is to demonstrate sub-agent orchestration, MCP integration, and a visible loop pattern. Keep that demo-clarity in mind when making changes — visible structure beats clever abstraction here.

## When the user describes a webpage, route through `/build-page`

If the user says anything like *"build me a page about X"*, *"make a webpage on Y"*, or otherwise describes webpage content/requirements — **invoke the `/build-page` slash command** with their description as the argument. Do **not** write HTML yourself; the agent team is the whole point.

If they explicitly want one-off HTML help unrelated to the team (e.g., "fix this typo in src/lib/types.ts"), handle it normally.

## Pipeline at a glance (defined in `.claude/commands/build-page.md`)

1. **content-checker** — verify intro / body / footer; ask the user for anything missing.
2. **translator** — English → zh / ms / ta (page shows all four).
3. **image-fetcher** — 2–3 page images via the `images` MCP → `output/images/`.
4. **html-generator** — writes `output/index.html`, pink + soft pastel theme, leaves `<div id="country-grid">` empty.
5–7. **Loop ×5 distinct countries** — `weather-fetcher` → `flower-fetcher` → `page-injector`. The order 5→6→7 must be visible per iteration; don't batch.
8. **reporter** — writes `output/report.html` from the run log.

The loop is the showcase feature. When orchestrating, run all three loop agents per iteration before starting the next iteration — never run 5 weather calls then 5 flower calls.

## Two execution paths, one source of truth

Sub-agents are defined as markdown files under `.claude/agents/`. Both paths consume the same files:

- **Inside Claude Code** (CLI / VS Code extension): `/build-page <requirements>` → uses Task tool to delegate to each agent.
- **Standalone**: `npm run start` → `src/orchestrator.ts` reads `.claude/agents/*.md` via `gray-matter`, calls the Claude Agent SDK with each system prompt.

If you change an agent's behavior, edit its `.claude/agents/*.md` file — both paths pick up the change automatically.

## MCP servers (the only external boundary)

Two TypeScript MCP servers wrap the external APIs so swapping data sources is a one-file change. **Don't add `fetch()` calls directly in agent definitions or the orchestrator** — route through MCP.

- `mcp-servers/weather/` — wraps Open-Meteo (geocoding + current weather). Tool: `mcp__weather__get_weather`.
- `mcp-servers/images/` — wraps Wikipedia REST API (search + page summary + image download). Tool: `mcp__images__search_image`.

Each MCP server is a standalone Node package with its own `package.json` and `tsconfig.json`. They're registered in `.claude/settings.json` (for Claude Code) and in `src/lib/runAgent.ts` (for the standalone path).

## Common commands

```bash
npm install                    # one-time
npm run start                  # run the pipeline (standalone path)
npm run reset                  # clear output/ between demos
npm run build:all              # type-check everything
npm run mcp:weather            # run weather MCP standalone (debugging)
npm run mcp:images             # run images MCP standalone (debugging)
```

In Claude Code: `/build-page <requirements>` and `/reset`.

## Output layout (gitignored)

```
output/
├── index.html              # the generated webpage
├── report.html             # run report (agent #8 emits this)
├── images/                 # page images (agent #3)
└── country-images/         # national flower images (agent #6)
```

`output/` is wiped clean by `/reset` or `npm run reset`. Source code is never touched by reset.

## Things that will surprise a future maintainer

- **Permission mode is `bypassPermissions` in `src/lib/runAgent.ts`.** That's intentional for the automated standalone run — the orchestrator has to write files without prompting. Inside Claude Code, normal permissions apply.
- **Agent system prompts demand strict JSON output as the final message.** `src/lib/runAgent.ts` extracts the JSON leniently (handles code fences and surrounding prose) — don't tighten that without checking each agent's `.md`.
- **Country uniqueness is enforced by the orchestrator, not the weather-fetcher.** The agent gets `already_used_countries` in its prompt; the orchestrator appends after each successful call.
- **The page injector relies on the comment marker** `<!-- country-grid: agents 5–7 will inject country cards here -->` as its Edit anchor. If you change that string, also update `.claude/agents/page-injector.md` and `.claude/agents/html-generator.md`.

## Architecture document

`myArchitecture.md` describes the system at a level suitable for pasting into a slide deck generator. Keep it in sync with material structural changes (new agent, removed MCP, changed loop count).
