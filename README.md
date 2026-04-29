# 🌸 PetalPress

A multi-agent webpage builder, used as a **presentation template**. You describe a webpage in chat; an 8-agent team produces a multilingual HTML page (English / Chinese / Malay / Tamil), peppers it with current weather and national-flower imagery for 5 random countries, and emits a run report so the audience can see exactly what each agent did.

It runs in two interchangeable ways:

- **Inside Claude Code** (CLI or VS Code extension) — type `/build-page <your requirements>`.
- **Standalone TypeScript** — `npm run start`.

Both paths read the same sub-agent definitions from `.claude/agents/`.

---

## Quick start

```bash
npm install
```

Then either:

### Path A — Claude Code / VS Code extension

1. Open this folder in VS Code (with the **Claude Code** extension installed) **or** run `claude` in this directory.
2. In chat, run:
   ```
   /build-page An introductory page about durians, including a section on regional varieties and a footer thanking my readers.
   ```
3. Open `output/index.html` and `output/report.html` in your browser.

### Path B — Standalone

```bash
export ANTHROPIC_API_KEY=sk-ant-...        # only needed for path B
npm run start
```

You'll be prompted for your webpage requirements interactively (or pipe them in: `echo "..." | npm run start`).

### Reset between demos

```
/reset                # in Claude Code
npm run reset         # standalone
```

Wipes only `output/`. Source code is left intact, ready for the next presentation.

---

## What you get

```
output/
├── index.html           # the multilingual webpage (pink + pastel theme)
├── report.html          # chronological log of every agent action
├── images/              # 2–3 page images
└── country-images/      # 5 national-flower images
```

---

## The agent team

| # | Agent | Role |
|---|---|---|
| 1 | **content-checker** | Verifies intro / body / footer are described; asks for missing pieces. |
| 2 | **translator** | English → Chinese (zh), Malay (ms), Tamil (ta). |
| 3 | **image-fetcher** | Pulls 2–3 images via the `images` MCP → `output/images/`. |
| 4 | **html-generator** | Writes `output/index.html` with a 4-language layout and an empty country grid. |
| 5 | **weather-fetcher** | (Loop ×5) Picks a fresh country, fetches current weather via the `weather` MCP. |
| 6 | **flower-fetcher** | (Loop ×5) Finds & downloads the country's national flower image. |
| 7 | **page-injector** | (Loop ×5) Injects a country card (weather + flower) into `index.html`. |
| 8 | **reporter** | Writes `output/report.html` from the orchestrator's run log. |

The 5 → 6 → 7 → (back to 5) loop is the showcase feature — see `myArchitecture.md` for the full picture.

---

## Project layout

```
.
├── .claude/
│   ├── agents/                # sub-agent definitions (canonical)
│   ├── commands/              # /build-page and /reset slash commands
│   └── settings.json          # MCP server registration + permissions
├── src/
│   ├── orchestrator.ts        # standalone TS pipeline
│   └── lib/                   # agent loader, SDK wrapper, prompt helper
├── mcp-servers/
│   ├── weather/               # Open-Meteo wrapper
│   └── images/                # Wikipedia / Wikimedia wrapper
├── scripts/reset.ts           # cleanup script
├── .vscode/                   # launch + tasks configs
├── output/                    # generated artifacts (gitignored)
├── CLAUDE.md                  # guidance for Claude Code
├── myArchitecture.md          # PPT-ready architecture doc
└── README.md                  # you are here
```

---

## Reusing the template across demos

Two patterns work:

- **Same folder, reset between demos** — simplest. `/reset` between presentations.
- **Clone per demo** — `cp -r myAgentTeam demo-coffee/` if you want to keep each demo's artifacts side-by-side. `output/` is gitignored so the template repo stays clean.

---

## Swapping data sources

External APIs are isolated behind the two MCP servers. To change weather provider or image source, edit only the relevant `mcp-servers/*/src/index.ts` — agents and orchestrator stay untouched.

---

## Requirements

- Node.js 20+
- For path A: Claude Code (CLI or VS Code extension), authenticated.
- For path B: an `ANTHROPIC_API_KEY` environment variable.

---

## License

This repository is a personal demo template. Images fetched at runtime come from Wikipedia / Wikimedia Commons under their respective licenses; attribution is preserved on the generated page footer.
