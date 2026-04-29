---
description: Run the full PetalPress 8-agent pipeline to produce output/index.html and output/report.html.
argument-hint: <free-text webpage requirements>
---

Run the **PetalPress** pipeline. The user has provided these webpage requirements:

> $ARGUMENTS

If `$ARGUMENTS` is empty, ask the user for their webpage requirements first, then proceed.

## Pipeline

Maintain a `run_log` array. After each sub-agent call, append a record:
`{ step, agent, started_at, finished_at, duration_ms, description, result }`.

Execute these steps in order. Use the **Task** tool to delegate to each sub-agent (the agent name in the `subagent_type` field matches the file under `.claude/agents/`).

1. **content-checker** — pass the user's requirements.
   - If the result has `status: "needs_input"`, ask the user the listed `questions` directly in chat. Wait for their replies, merge into the section text, and re-run **content-checker** until `status: "complete"`.
2. **translator** — pass the validated `sections`.
3. **image-fetcher** — pass the page topic and English `sections`.
4. **html-generator** — pass the four-language sections and the image list. After this step, `output/index.html` exists with an empty `country-grid` container.
5. **Loop 5 times** to populate 5 distinct countries:
   - 5a. **weather-fetcher** — pass `already_used_countries` (the running list of countries picked so far).
   - 5b. **flower-fetcher** — pass the country name returned by 5a.
   - 5c. **page-injector** — pass the weather data + flower path. This edits `output/index.html` in place.
   - Append the country to `already_used_countries` and continue.
6. **reporter** — pass the full `run_log` array. Produces `output/report.html`.

## Loop directive (important)

The 5→6→7 loop is the showcase feature. Run **all three agents per iteration before starting the next iteration** — do not batch all weather calls first, then all flower calls. The order must be visibly: 5, 6, 7, 5, 6, 7, … five times.

## After completion

Print a short summary to the user:
- Path to `output/index.html`
- Path to `output/report.html`
- The 5 countries that were processed
- Suggest opening `output/index.html` in a browser

If anything fails mid-pipeline, stop and surface the failing step + error to the user — do not silently skip.
