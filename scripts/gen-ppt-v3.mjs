/**
 * PetalPress — PowerPoint generator v3
 * Produces output/PetalPress-Architecture.pptx
 * Run: node scripts/gen-ppt-v3.mjs
 *
 * Changes from v2:
 *  - Dark blue colour scheme (formal / corporate)
 *  - Slides 2 & 3: real screenshots of BMW page + run report
 *  - Left/right partition on all code slides (text left, code right)
 *  - Pipeline slide fully redrawn (clear sequential flow + loop ×5)
 *  - Q&A end slide (no "End" slide)
 *
 * Slides:
 *   1.  Title
 *   2.  Demo — Generated BMW Page (screenshot)
 *   3.  Demo — Agent Run Report (screenshot)
 *   4.  Key Concepts Glossary
 *   5.  The Team — 8 Agents
 *   6.  The Pipeline (fixed)
 *   7.  The Loop
 *   8.  Two Execution Paths
 *   9.  MCP Integration
 *  10.  Four-Language Layout
 *  11.  The Run Report
 *  12.  File Map
 *  13.  Key Takeaways
 *  14.  Q & A
 */
import PptxGenJS from "pptxgenjs";
import { mkdir } from "fs/promises";

// ── Brand colours (dark blue) ──────────────────────────────────────────────────
const C = {
  blue:      "1565C0",   // primary accent (titles, badges)
  blueLight: "90CAF9",   // light blue (arrows, borders, highlight)
  bgLight:   "E3F2FD",   // slide background
  bgMid:     "BBDEFB",   // section fill / loop highlight
  dark:      "0D1B3E",   // primary text
  mid:       "1976D2",   // secondary text / subtitles
  white:     "FFFFFF",
  codeBack:  "EFF8FF",   // code box background
  codeBorder:"90CAF9",   // code box border
};

const FH = "Calibri";    // heading font
const FB = "Calibri";    // body font
const FM = "Courier New";// mono font

// left/right split constants
const LX = 0.3;   // left content start x
const LW = 6.45;  // left content width  (ends at 6.75)
const RX = 6.95;  // right code start x
const RW = 6.15;  // right code width    (ends at 13.10)

await mkdir("output", { recursive: true });

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE"; // 13.33 × 7.5 in

// ── Helpers ───────────────────────────────────────────────────────────────────
const bg = s => s.addShape(pptx.ShapeType.rect, {
  x:0, y:0, w:"100%", h:"100%", fill:{color:C.bgLight}, line:{color:C.bgLight},
});

function titleBar(s, title, sub="") {
  s.addShape(pptx.ShapeType.rect, {
    x:0.28, y:0.2, w:0.08, h: sub ? 0.9 : 0.65,
    fill:{color:C.blue}, line:{color:C.blue},
  });
  s.addText(title, {
    x:0.52, y:0.18, w:12.3, h:0.55,
    fontSize:27, bold:true, color:C.blue, fontFace:FH, valign:"middle",
  });
  if (sub) s.addText(sub, {
    x:0.52, y:0.73, w:12.3, h:0.32,
    fontSize:12.5, color:C.mid, fontFace:FB, italic:true,
  });
}

function footer(s) {
  s.addShape(pptx.ShapeType.rect, {
    x:0, y:7.18, w:"100%", h:0.04,
    fill:{color:C.blueLight}, line:{color:C.blueLight},
  });
  s.addText("PetalPress — Multi-Agent Webpage Builder  ·  github.com/ianyian/myAgentTeam", {
    x:0.3, y:7.22, w:12.7, h:0.24,
    fontSize:9, color:C.blueLight, fontFace:FB, italic:true,
  });
}

function codeBox(s, code, x, y, w, h, opts={}) {
  s.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, fill:{color:C.codeBack}, line:{color:C.codeBorder, pt:1}, rectRadius:0.08,
  });
  s.addText(code, {
    x:x+0.12, y:y+0.08, w:w-0.24, h:h-0.16,
    fontSize:opts.fontSize||9.5, color:C.dark, fontFace:FM,
    valign:"top", wrap:true,
  });
}

function badge(s, label, x, y) {
  s.addShape(pptx.ShapeType.roundRect, {
    x, y, w:0.48, h:0.32,
    fill:{color:C.blue}, line:{color:C.blue}, rectRadius:0.06,
  });
  s.addText(label, {
    x, y, w:0.48, h:0.32,
    fontSize:11, bold:true, color:C.white, fontFace:FH, align:"center", valign:"middle",
  });
}

// Arrow helpers (thin rect = line)
const hArrow = (s, x, y, w) =>
  s.addShape(pptx.ShapeType.rect, { x, y:y-0.04, w, h:0.08, fill:{color:C.blueLight}, line:{color:C.blueLight} });
const vArrow = (s, x, y, h) =>
  s.addShape(pptx.ShapeType.rect, { x:x-0.04, y, w:0.08, h, fill:{color:C.blueLight}, line:{color:C.blueLight} });

// ── SLIDE 1 — Title ───────────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bg(s);

  s.addShape(pptx.ShapeType.rect, {
    x:0, y:2.0, w:"100%", h:2.9,
    fill:{color:C.bgMid}, line:{color:C.bgMid},
  });
  s.addText("🌸 PetalPress", {
    x:0.5, y:2.1, w:12.3, h:1.0,
    fontSize:48, bold:true, color:C.blue, fontFace:FH, align:"center",
  });
  s.addText("A Multi-Agent Webpage Builder", {
    x:0.5, y:3.12, w:12.3, h:0.55,
    fontSize:24, color:C.mid, fontFace:FB, align:"center",
  });
  s.addText("Sub-agent orchestration  ·  MCP integration  ·  Visible loop pattern", {
    x:0.5, y:3.7, w:12.3, h:0.35,
    fontSize:13, color:C.dark, fontFace:FB, align:"center", italic:true,
  });

  s.addText("🔗  github.com/ianyian/myAgentTeam", {
    x:0.5, y:5.08, w:12.3, h:0.38,
    fontSize:14, color:C.blue, fontFace:FH, align:"center", bold:true,
    hyperlink:{url:"https://github.com/ianyian/myAgentTeam"},
  });
  s.addText("Try it now — copy and paste:", {
    x:1.0, y:5.58, w:11.3, h:0.28,
    fontSize:11, color:C.mid, fontFace:FB, align:"center", italic:true,
  });
  codeBox(s,
    "/build-page  A short page about BMW car, with variance of BMW car with history in the body and a thank-you footer.",
    1.0, 5.88, 11.3, 0.55, {fontSize:11}
  );
  s.addText("Stack: TypeScript · Claude Agent SDK · Model Context Protocol (MCP)  |  Claude Code (VS Code / CLI) or npm run start", {
    x:0.5, y:6.6, w:12.3, h:0.32,
    fontSize:10.5, color:C.mid, fontFace:FB, align:"center",
  });

  footer(s);
}

// ── SLIDE 2 — Demo: Generated BMW Page (screenshot) ───────────────────────────
{
  const s = pptx.addSlide(); bg(s);
  titleBar(s, "Demo — The Generated Page", "Real output produced by running: /build-page  A short page about BMW car…");

  // Frame shadow
  s.addShape(pptx.ShapeType.rect, {
    x:2.1, y:1.45, w:9.15, h:5.45,
    fill:{color:"C0D8F5"}, line:{color:"C0D8F5"},
  });
  s.addImage({
    path: "output/screenshot-index-full.png",
    x:2.0, y:1.38, w:9.15, h:5.45,
  });

  s.addShape(pptx.ShapeType.roundRect, {
    x:LX, y:1.38, w:1.55, h:5.45,
    fill:{color:C.bgMid}, line:{color:C.blueLight, pt:0.5}, rectRadius:0.1,
  });
  const bullets = [
    "BMW hero image",
    "4-language intro",
    "EN / ZH / MS / TA",
    "About BMW section",
    "3 car images",
    "Country cards",
    "(5 countries)",
    "Weather data",
    "National flowers",
  ];
  s.addText(bullets.map(t => ({ text: t+"\n" })), {
    x:LX+0.08, y:1.46, w:1.38, h:5.3,
    fontSize:9.5, color:C.dark, fontFace:FB, valign:"top",
  });

  footer(s);
}

// ── SLIDE 3 — Demo: Agent Run Report (screenshot) ─────────────────────────────
{
  const s = pptx.addSlide(); bg(s);
  titleBar(s, "Demo — The Agent Run Report", "output/report.html — generated by agent #8 (reporter) from the run log");

  s.addShape(pptx.ShapeType.rect, {
    x:2.1, y:1.45, w:9.15, h:5.45,
    fill:{color:"C0D8F5"}, line:{color:"C0D8F5"},
  });
  s.addImage({
    path: "output/screenshot-report.png",
    x:2.0, y:1.38, w:9.15, h:5.45,
  });

  s.addShape(pptx.ShapeType.roundRect, {
    x:LX, y:1.38, w:1.55, h:5.45,
    fill:{color:C.bgMid}, line:{color:C.blueLight, pt:0.5}, rectRadius:0.1,
  });
  const bullets2 = [
    "19 agents run",
    "5 countries",
    "4 languages",
    "3 images fetched",
    "Step-by-step",
    "timeline",
    "",
    "Collapsible",
    "raw result",
    "JSON blocks",
  ];
  s.addText(bullets2.map(t => ({ text: t+"\n" })), {
    x:LX+0.08, y:1.46, w:1.38, h:5.3,
    fontSize:9.5, color:C.dark, fontFace:FB, valign:"top",
  });

  footer(s);
}

// ── SLIDE 4 — Key Concepts Glossary ───────────────────────────────────────────
{
  const s = pptx.addSlide(); bg(s);
  titleBar(s, "Key Concepts — Glossary", "Definitions of the core terms used throughout this deck");

  const terms = [
    ["Agent",          "An AI model instance given a focused system prompt, whitelisted tools, and a strict JSON output contract. Does exactly one job."],
    ["Agent Team",     "A collection of agents orchestrated in sequence. Agents don't talk to each other — the orchestrator passes outputs between them."],
    ["Orchestrator",   "The coordinating program (/build-page or src/orchestrator.ts) that runs agents in order, routes outputs, and manages shared state."],
    ["MCP",            "Model Context Protocol — an open standard that wraps external APIs as structured tool servers. Agents call tools by name; never fetch() directly."],
    ["MCP Server",     "A small Node.js program in mcp-servers/ that registers tools and handles calls. PetalPress has two: weather and images."],
    ["System Prompt",  "The instruction text defining an agent's role, rules, and output format. Stored as the body of each .claude/agents/*.md file."],
    ["Tool Whitelist", "The list of tools an agent may call (e.g. Read, Edit, mcp__weather__get_weather). Declared in YAML frontmatter. Least-privilege design."],
    ["Slash Command",  "/build-page and /reset — defined in .claude/commands/. Trigger the full pipeline from the Claude Code chat interface."],
    ["Loop / Iteration","Agents 5→6→7 run as a sub-pipeline repeated 5 times (once per country). Demonstrates chained-state orchestration."],
    ["Run Log",        "An array of RunLogEntry objects appended after each agent call. Agent #8 (reporter) turns this into output/report.html."],
  ];

  const rowH = 0.48, startY = 1.32;
  terms.forEach(([term, def], i) => {
    const y = startY + i * (rowH + 0.04);
    const fill = i % 2 === 0 ? C.codeBack : C.white;
    s.addShape(pptx.ShapeType.roundRect, {
      x:0.3, y, w:12.7, h:rowH, fill:{color:fill}, line:{color:C.codeBorder, pt:0.5}, rectRadius:0.06,
    });
    s.addText(term, {
      x:0.42, y, w:2.2, h:rowH, fontSize:11.5, bold:true, color:C.blue, fontFace:FH, valign:"middle",
    });
    s.addText(def, {
      x:2.72, y, w:10.1, h:rowH, fontSize:11, color:C.dark, fontFace:FB, valign:"middle",
    });
  });

  footer(s);
}

// ── SLIDE 5 — The Team ─────────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bg(s);
  titleBar(s, "The Team — 8 Agents", "One agent · one job · focused prompt · strict JSON contract · least-privilege tool whitelist");

  const agents = [
    ["1","content-checker","Validates intro/body/footer; up to 3 interactive Q&A rounds if sections missing",false],
    ["2","translator",     "EN → Chinese (ZH), Malay (MS), Tamil (TA) — structured JSON output",false],
    ["3","image-fetcher",  "Downloads 2–3 page images → output/images/  via images MCP",false],
    ["4","html-generator", "Writes output/index.html — themed layout, 4-language grid, empty country grid",false],
    ["5","weather-fetcher","LOOP: picks a fresh country, calls mcp__weather__get_weather",true],
    ["6","flower-fetcher", "LOOP: finds national flower image, saves to output/country-images/",true],
    ["7","page-injector",  "LOOP: inserts <article class=\"country-card\"> into output/index.html",true],
    ["8","reporter",       "Reads run log → writes output/report.html (themed timeline)",false],
  ];

  agents.forEach(([num, name, desc, loop], i) => {
    const y = 1.35 + i * 0.62;
    const fill = loop ? C.bgMid : C.white;
    s.addShape(pptx.ShapeType.roundRect, {
      x:LX, y, w:LW, h:0.54, fill:{color:fill}, line:{color:C.codeBorder, pt:0.8}, rectRadius:0.07,
    });
    badge(s, num, LX+0.08, y+0.11);
    s.addText(name, { x:LX+0.62, y, w:2.1, h:0.54, fontSize:11, bold:true, color:C.blue, fontFace:FH, valign:"middle" });
    s.addText(desc, { x:LX+2.75, y, w:LW-2.85, h:0.54, fontSize:10.5, color:C.dark, fontFace:FB, valign:"middle" });
  });

  // Right side — code
  s.addText("Agent definition (.md) — weather-fetcher:", {
    x:RX, y:1.35, w:RW, h:0.3, fontSize:10.5, bold:true, color:C.mid, fontFace:FH,
  });
  codeBox(s,
`---
name: weather-fetcher
tools: ["mcp__weather__get_weather",
        "mcp__weather__list_countries"]
---
You are the Weather Fetcher (agent 5).

1. Receive already_used_countries.
2. Pick ONE country not in that list.
3. Call mcp__weather__get_weather({country}).

Return exactly one JSON object:
{
  "country": "Japan",
  "capital": "Tokyo",
  "temperature_c": 18.4,
  "weather_description": "Overcast",
  "wind_kmh": 12.0
}`,
    RX, 1.68, RW, 3.5, {fontSize:9.5}
  );

  s.addText("Agent definition (.md) — page-injector:", {
    x:RX, y:5.28, w:RW, h:0.28, fontSize:10.5, bold:true, color:C.mid, fontFace:FH,
  });
  codeBox(s,
`---
name: page-injector
tools: ["Read", "Edit"]
---
Insert a card BEFORE the marker:
<!-- country-grid: agents 5–7 inject here -->

<article class="country-card">
  <img src="{{flower_path}}" class="country-flower">
  <h3>{{country}}</h3>
  <p>{{temperature_c}}°C — {{weather_description}}</p>
</article>`,
    RX, 5.58, RW, 1.58, {fontSize:9.5}
  );

  footer(s);
}

// ── SLIDE 6 — The Pipeline (FIXED) ────────────────────────────────────────────
{
  const s = pptx.addSlide(); bg(s);
  titleBar(s, "The Pipeline", "Sequential flow: 4 pre-loop steps → LOOP ×5 (agents 5→6→7 per country) → report");

  // ── Row 1: Steps 1–4 (pre-loop) ──
  const bw=2.5, bh=0.68, gap=0.42;
  const row1Total = 4*bw + 3*gap; // = 11.26
  const sx = (13.33 - row1Total) / 2; // = 1.035
  const row1Y = 1.38;
  const preSteps = [
    {n:"1", label:"content-checker", note:"Validate, Q&A"},
    {n:"2", label:"translator",      note:"EN→ZH/MS/TA"},
    {n:"3", label:"image-fetcher",   note:"→ images/"},
    {n:"4", label:"html-generator",  note:"→ index.html"},
  ];
  preSteps.forEach((st, i) => {
    const x = sx + i*(bw+gap);
    s.addShape(pptx.ShapeType.roundRect, {
      x, y:row1Y, w:bw, h:bh,
      fill:{color:C.bgMid}, line:{color:C.blueLight, pt:1.5}, rectRadius:0.1,
    });
    badge(s, st.n, x+0.1, row1Y+0.13);
    s.addText(st.label, { x:x+0.65, y:row1Y+0.04, w:bw-0.75, h:0.34, fontSize:11, bold:true, color:C.dark, fontFace:FH, valign:"bottom" });
    s.addText(st.note,  { x:x+0.65, y:row1Y+0.35, w:bw-0.75, h:0.26, fontSize:10, color:C.mid, fontFace:FB, italic:true });
    // Arrow between boxes in same row
    if (i < 3) {
      const ax = x + bw;
      hArrow(s, ax+0.04, row1Y+bh/2, gap-0.08);
    }
  });

  // ── Down connector row1 → loop box (from center of slide) ──
  const centerX = 13.33/2;
  const row1Bottom = row1Y + bh; // = 2.06
  const loopTop = 2.46;
  vArrow(s, centerX, row1Bottom, loopTop - row1Bottom);

  // ── Loop box ──
  const loopH = 1.68;
  s.addShape(pptx.ShapeType.roundRect, {
    x:0.3, y:loopTop, w:12.73, h:loopH,
    fill:{type:"none"}, line:{color:C.blue, pt:2}, rectRadius:0.1,
  });
  // LOOP label (floating on top-left of the box border)
  s.addText("LOOP  ×5  —  agents 5→6→7 run per iteration (one country each)", {
    x:0.5, y:loopTop-0.18, w:7.5, h:0.3,
    fontSize:11, bold:true, color:C.blue, fontFace:FH, fill:{color:C.bgLight},
  });

  // ── Steps 5,6,7 inside loop box (horizontal, centered) ──
  const lbw=3.0, lbh=0.72;
  const loopTotal = 3*lbw + 2*0.45;
  const loopSX = (13.33 - loopTotal) / 2;
  const loopStepY = loopTop + (loopH - lbh) / 2;
  const loopSteps = [
    {n:"5", label:"weather-fetcher", note:"live weather"},
    {n:"6", label:"flower-fetcher",  note:"flower image"},
    {n:"7", label:"page-injector",   note:"inject card"},
  ];
  loopSteps.forEach((st, i) => {
    const x = loopSX + i*(lbw+0.45);
    s.addShape(pptx.ShapeType.roundRect, {
      x, y:loopStepY, w:lbw, h:lbh,
      fill:{color:C.blue}, line:{color:C.blue}, rectRadius:0.1,
    });
    badge(s, st.n, x+0.1, loopStepY+0.18);
    s.addText(st.label, { x:x+0.64, y:loopStepY+0.06, w:lbw-0.74, h:0.36, fontSize:11.5, bold:true, color:C.white, fontFace:FH, valign:"bottom" });
    s.addText(st.note,  { x:x+0.64, y:loopStepY+0.4,  w:lbw-0.74, h:0.28, fontSize:10, color:C.blueLight, fontFace:FB, italic:true });
    if (i < 2) {
      hArrow(s, x+lbw+0.04, loopStepY+lbh/2, 0.45-0.08);
    }
  });

  // ── Down connector loop box → step 8 ──
  const loopBottom = loopTop + loopH; // = 4.14
  const step8Y = 4.54;
  vArrow(s, centerX, loopBottom, step8Y - loopBottom);

  // ── Step 8 ──
  const s8x = centerX - bw/2;
  s.addShape(pptx.ShapeType.roundRect, {
    x:s8x, y:step8Y, w:bw, h:bh,
    fill:{color:C.bgMid}, line:{color:C.blueLight, pt:1.5}, rectRadius:0.1,
  });
  badge(s, "8", s8x+0.1, step8Y+0.13);
  s.addText("reporter",       { x:s8x+0.65, y:step8Y+0.04, w:bw-0.75, h:0.34, fontSize:11, bold:true, color:C.dark, fontFace:FH, valign:"bottom" });
  s.addText("→ report.html", { x:s8x+0.65, y:step8Y+0.35, w:bw-0.75, h:0.26, fontSize:10, color:C.mid, fontFace:FB, italic:true });

  footer(s);
}

// ── SLIDE 7 — The Loop ────────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bg(s);
  titleBar(s, "The Loop — Showcase Feature", "Agents 5→6→7 in strict order, 5 times — chained state, no batching");

  // Left: iteration grid
  const iters = ["Iter 1","Iter 2","Iter 3","Iter 4","Iter 5"];
  const rowLabels = ["5. weather-fetcher","6. flower-fetcher","7. page-injector"];
  const rowFills  = [C.bgMid, "C5DCF8", C.blue];
  const rowTxt    = [C.dark, C.dark, C.white];
  const cw = 1.18, rh = 0.68;
  const gx = 0.06;
  const leftGridW = iters.length*(cw+gx) - gx; // fits in left half
  const leftStartX = LX;

  // Column headers
  iters.forEach((label, ci) => {
    const x = leftStartX + ci*(cw+gx);
    s.addShape(pptx.ShapeType.roundRect, {
      x, y:1.35, w:cw, h:0.36,
      fill:{color:C.blue}, line:{color:C.blue}, rectRadius:0.06,
    });
    s.addText(label, {
      x, y:1.35, w:cw, h:0.36,
      fontSize:9.5, bold:true, color:C.white, fontFace:FH, align:"center", valign:"middle",
    });
  });

  rowLabels.forEach((rl, ri) => {
    const y = 1.8 + ri*(rh+0.16);
    iters.forEach((_, ci) => {
      const x = leftStartX + ci*(cw+gx);
      s.addShape(pptx.ShapeType.roundRect, {
        x, y, w:cw, h:rh, fill:{color:rowFills[ri]}, line:{color:C.blueLight, pt:1}, rectRadius:0.07,
      });
      s.addText(rl, { x, y, w:cw, h:rh, fontSize:8.5, color:rowTxt[ri], fontFace:FB, align:"center", valign:"middle" });
    });
    if (ri < rowLabels.length-1) {
      iters.forEach((_, ci) => {
        const x = leftStartX + ci*(cw+gx) + cw/2;
        vArrow(s, x, y+rh, 0.16);
      });
    }
  });

  // Key points below grid
  const points = [
    "Orchestrator tracks used countries between iterations",
    "Each iteration's weather output feeds directly into flower & injector",
    "No batching — agents run strictly 5→6→7 per iteration",
    "Loop state lives in orchestrator, not in any agent",
  ];
  points.forEach((p, i) => {
    const y = 4.12 + i*0.46;
    s.addShape(pptx.ShapeType.ellipse, { x:LX+0.02, y:y+0.1, w:0.22, h:0.22, fill:{color:C.blue}, line:{color:C.blue} });
    s.addText(p, { x:LX+0.3, y, w:LW-0.32, h:0.42, fontSize:11, color:C.dark, fontFace:FB, valign:"middle" });
  });

  // Right: loop code
  s.addText("Orchestrator loop (src/orchestrator.ts):", {
    x:RX, y:1.35, w:RW, h:0.28, fontSize:10.5, bold:true, color:C.mid, fontFace:FH,
  });
  codeBox(s,
`const usedCountries = [];

for (let i = 1; i <= 5; i++) {
  // Agent 5: receives used list → picks fresh country
  const weather = await step(agents.weatherFetcher,
    \`Loop \${i}/5 — pick a fresh country\`,
    \`already_used_countries = \${JSON.stringify(usedCountries)}\`);

  // Orchestrator owns uniqueness — not the agent
  usedCountries.push(weather.country);

  // Agent 6: receives country name from weather output
  const flower = await step(agents.flowerFetcher,
    \`Loop \${i}/5 — flower for \${weather.country}\`,
    \`Country: \${weather.country}\`);

  // Agent 7: injects card into output/index.html
  await step(agents.pageInjector, \`Loop \${i}/5 — inject card\`,
    \`Weather: \${JSON.stringify(weather)}\n\` +
    \`Flower:  \${JSON.stringify(flower)}\`);
}`,
    RX, 1.68, RW, 5.25, {fontSize:9.5}
  );

  footer(s);
}

// ── SLIDE 8 — Two Execution Paths ─────────────────────────────────────────────
{
  const s = pptx.addSlide(); bg(s);
  titleBar(s, "Two Execution Paths — One Source of Truth", ".claude/agents/*.md drives both paths — one edit, zero duplication");

  // Left: two-path diagram
  const srcX = LX + (LW-4.65)/2;
  s.addShape(pptx.ShapeType.roundRect, {
    x:srcX, y:1.38, w:4.65, h:0.72,
    fill:{color:C.bgMid}, line:{color:C.blue, pt:2}, rectRadius:0.1,
  });
  s.addText(".claude/agents/*.md", {
    x:srcX, y:1.38, w:4.65, h:0.72,
    fontSize:15, bold:true, color:C.blue, fontFace:FH, align:"center", valign:"middle",
  });
  s.addText("canonical sub-agent definitions", {
    x:srcX, y:2.1, w:4.65, h:0.26,
    fontSize:10, color:C.mid, fontFace:FB, italic:true, align:"center",
  });

  // Connectors from source box
  const centerLX = srcX + 4.65/2;
  vArrow(s, centerLX-1.35, 2.1, 0.65);
  vArrow(s, centerLX+1.35, 2.1, 0.65);
  hArrow(s, centerLX-1.35, 2.75, 2.7);

  // Left path
  s.addShape(pptx.ShapeType.roundRect, {
    x:LX, y:2.85, w:LW/2-0.15, h:1.4,
    fill:{color:C.codeBack}, line:{color:C.blueLight, pt:1.5}, rectRadius:0.1,
  });
  s.addText("Claude Code\n/build-page", {
    x:LX+0.15, y:2.91, w:LW/2-0.35, h:0.48,
    fontSize:12.5, bold:true, color:C.blue, fontFace:FH,
  });
  s.addText("Uses the Task tool to delegate\neach step. Permissions via\n.claude/settings.json", {
    x:LX+0.15, y:3.39, w:LW/2-0.35, h:0.78,
    fontSize:10.5, color:C.dark, fontFace:FB,
  });

  // Right path (within left column)
  s.addShape(pptx.ShapeType.roundRect, {
    x:LX+LW/2+0.05, y:2.85, w:LW/2-0.15, h:1.4,
    fill:{color:C.codeBack}, line:{color:C.blueLight, pt:1.5}, rectRadius:0.1,
  });
  s.addText("Standalone TS\nnpm run start", {
    x:LX+LW/2+0.2, y:2.91, w:LW/2-0.35, h:0.48,
    fontSize:12.5, bold:true, color:C.blue, fontFace:FH,
  });
  s.addText("Claude Agent SDK\npermissionMode: bypassPermissions\nreads same .md files via gray-matter", {
    x:LX+LW/2+0.2, y:3.39, w:LW/2-0.35, h:0.78,
    fontSize:10.5, color:C.dark, fontFace:FB,
  });

  // Key benefit
  s.addShape(pptx.ShapeType.roundRect, {
    x:LX, y:4.42, w:LW, h:0.68,
    fill:{color:C.bgMid}, line:{color:C.blueLight, pt:1}, rectRadius:0.08,
  });
  s.addText("✓  One edit to any .md file applies everywhere, both paths, immediately — no sync required", {
    x:LX+0.15, y:4.42, w:LW-0.2, h:0.68,
    fontSize:12, bold:true, color:C.dark, fontFace:FH, valign:"middle",
  });

  // Additional features
  const features = [
    "Both paths share: gray-matter frontmatter parsing, tool whitelists, system prompt bodies",
    "Claude Code path uses .claude/settings.json for MCP registration and bash permissions",
    "Standalone path spawns MCP servers as stdio child processes via npx tsx",
  ];
  features.forEach((f, i) => {
    s.addShape(pptx.ShapeType.ellipse, { x:LX+0.02, y:5.25+i*0.5+0.1, w:0.22, h:0.22, fill:{color:C.blue}, line:{color:C.blue} });
    s.addText(f, { x:LX+0.3, y:5.25+i*0.5, w:LW-0.32, h:0.46, fontSize:10.5, color:C.dark, fontFace:FB, valign:"middle" });
  });

  // Right: agentLoader code
  s.addText("src/lib/agentLoader.ts — parsing agent .md files:", {
    x:RX, y:1.38, w:RW, h:0.28, fontSize:10.5, bold:true, color:C.mid, fontFace:FH,
  });
  codeBox(s,
`import matter from "gray-matter";

export async function loadAgent(name) {
  const raw    = await readFile(
    \`.claude/agents/\${name}.md\`, "utf8");
  const parsed = matter(raw);   // splits frontmatter from body

  return {
    name:         parsed.data.name ?? name,
    description:  parsed.data.description ?? "",
    tools:        parsed.data.tools ?? [],   // whitelist
    systemPrompt: parsed.content.trim(),     // = system prompt
  };
}`,
    RX, 1.7, RW, 3.0, {fontSize:9.5}
  );

  s.addText("Structure of any agent .md file:", {
    x:RX, y:4.82, w:RW, h:0.26, fontSize:10.5, bold:true, color:C.mid, fontFace:FH,
  });
  codeBox(s,
`---                          ← YAML frontmatter
name: weather-fetcher
description: "…"
tools:
  - mcp__weather__get_weather
  - mcp__weather__list_countries
---                          ← everything below = system prompt

You are the Weather Fetcher (agent 5).
Pick a country, call the weather tool,
return exactly one JSON object.`,
    RX, 5.12, RW, 2.05, {fontSize:9.5}
  );

  footer(s);
}

// ── SLIDE 9 — MCP Integration ──────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bg(s);
  titleBar(s, "MCP Integration", "Model Context Protocol — agents call tools by name, never fetch() directly. Swap a source = edit one file.");

  // Left: MCP table + registration
  const rows = [
    ["Server", "Tool(s)", "Data Source", "Agent(s)"],
    ["weather", "get_weather(country)\nlist_countries()", "Open-Meteo\n(free, no API key)", "5 weather-fetcher"],
    ["images",  "search_image(query,\nsave_path)",        "Wikipedia REST\n(free, no API key)", "3 image-fetcher\n6 flower-fetcher"],
  ];

  s.addTable(rows, {
    x:LX, y:1.38, w:LW,
    fontSize:10.5, fontFace:FB, color:C.dark,
    rowH:[0.38, 0.78, 0.78],
    align:"left", valign:"middle",
    border:{type:"solid", color:C.bgMid, pt:1},
    fill:C.white,
    colW:[1.25, 1.65, 1.85, 1.7],
  });
  // override header row colour
  s.addShape(pptx.ShapeType.rect, {
    x:LX, y:1.38, w:LW, h:0.38,
    fill:{color:C.blue}, line:{color:C.blue},
  });
  s.addText("Server            Tool(s)              Data Source           Agent(s)", {
    x:LX+0.15, y:1.41, w:LW-0.2, h:0.34,
    fontSize:11, bold:true, color:C.white, fontFace:FH, valign:"middle",
  });

  // Registration rows
  const regs = [
    [".claude/settings.json", "Claude Code path — MCP config + bash whitelist: mkdir, rm, ls, open, mcp__weather, mcp__images"],
    ["src/lib/runAgent.ts",   "Standalone path — spawns each MCP as stdio child process: npx tsx mcp-servers/<name>/src/index.ts"],
  ];
  regs.forEach(([f,d], i) => {
    const y = 3.1 + i*0.72;
    s.addShape(pptx.ShapeType.roundRect, {
      x:LX, y, w:LW, h:0.62,
      fill:{color:C.codeBack}, line:{color:C.codeBorder, pt:1}, rectRadius:0.08,
    });
    s.addText(f, { x:LX+0.12, y, w:2.4, h:0.62, fontSize:10, bold:true, color:C.blue, fontFace:FM, valign:"middle" });
    s.addText(d, { x:LX+2.6,  y, w:LW-2.7, h:0.62, fontSize:10, color:C.dark, fontFace:FB, valign:"middle" });
  });

  // Benefits
  const benefits = [
    "Agents never know which API is behind a tool",
    "Replace Open-Meteo with any weather API — zero agent changes",
    "Tool schema is the contract; implementation is hidden",
  ];
  benefits.forEach((b, i) => {
    const y = 4.6 + i*0.5;
    s.addShape(pptx.ShapeType.ellipse, { x:LX+0.02, y:y+0.1, w:0.22, h:0.22, fill:{color:C.blue}, line:{color:C.blue} });
    s.addText(b, { x:LX+0.3, y, w:LW-0.32, h:0.46, fontSize:11, color:C.dark, fontFace:FB, valign:"middle" });
  });

  // Right: MCP server code
  s.addText("mcp-servers/weather/src/index.ts — tool declaration + handler:", {
    x:RX, y:1.38, w:RW, h:0.28, fontSize:10.5, bold:true, color:C.mid, fontFace:FH,
  });
  codeBox(s,
`// 1. Declare tools this MCP server exposes
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "get_weather",
    description: "Fetch current weather for a country capital.",
    inputSchema: {
      type:"object",
      properties:{ country:{type:"string"} },
      required:["country"]
    }
  }]
}));

// 2. Handle a tool call from any agent
server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const geo  = await geocode(
    req.params.arguments.country);  // Open-Meteo geocoding
  const data = await fetchWeather(
    geo.latitude, geo.longitude);   // Open-Meteo forecast
  return {
    content: [{ type:"text", text: JSON.stringify(data) }]
  };
});

// 3. Serve over stdio — agents connect via npx tsx
await server.connect(new StdioServerTransport());`,
    RX, 1.7, RW, 5.45, {fontSize:9.5}
  );

  footer(s);
}

// ── SLIDE 10 — Four-Language Layout ───────────────────────────────────────────
{
  const s = pptx.addSlide(); bg(s);
  titleBar(s, "Four-Language Layout", "Every section rendered in EN / ZH / MS / TA side-by-side — agent #2 produces all four");

  const langs = [
    {code:"en", name:"English",  script:"Latin",  sample:"Welcome to our page…"},
    {code:"zh", name:"Chinese",  script:"简体中文",sample:"欢迎来到我们的页面…"},
    {code:"ms", name:"Malay",    script:"Latin",  sample:"Selamat datang ke…"},
    {code:"ta", name:"Tamil",    script:"தமிழ்",  sample:"வரவேற்கிறோம்…"},
  ];

  const cardW = (LW - 3*0.12) / 4; // ~1.5 per card
  langs.forEach((l, i) => {
    const x = LX + i*(cardW+0.12);
    s.addShape(pptx.ShapeType.roundRect, {
      x, y:1.38, w:cardW, h:3.45,
      fill:{color:C.codeBack}, line:{color:C.blueLight, pt:1.5}, rectRadius:0.1,
    });
    badge(s, l.code, x+0.07, 1.48);
    s.addText(l.name,   { x:x+0.07, y:1.86, w:cardW-0.14, h:0.3, fontSize:11, bold:true, color:C.blue, fontFace:FH });
    s.addText(l.script, { x:x+0.07, y:2.16, w:cardW-0.14, h:0.25, fontSize:9.5, color:C.mid, fontFace:FB, italic:true });
    s.addShape(pptx.ShapeType.rect, { x:x+0.07, y:2.44, w:cardW-0.14, h:0.02, fill:{color:C.bgMid}, line:{color:C.bgMid} });
    s.addText(`"${l.sample}"`, { x:x+0.07, y:2.49, w:cardW-0.14, h:1.28, fontSize:9.5, color:C.dark, fontFace:FB, italic:true, wrap:true });
  });

  // How translator is used
  const usageItems = [
    "Agent #2 (translator) takes EN content and returns a single JSON object with all 4 languages",
    "Agent #4 (html-generator) renders each section in a 4-column grid with lang= attributes",
    "Country cards (agent #7) inherit the same layout for local weather descriptions",
  ];
  usageItems.forEach((u, i) => {
    const y = 5.0 + i*0.52;
    s.addShape(pptx.ShapeType.ellipse, { x:LX+0.02, y:y+0.1, w:0.22, h:0.22, fill:{color:C.blue}, line:{color:C.blue} });
    s.addText(u, { x:LX+0.3, y, w:LW-0.32, h:0.48, fontSize:10.5, color:C.dark, fontFace:FB, valign:"middle" });
  });

  // Right: translator contract
  s.addText("Translator output contract (.claude/agents/translator.md):", {
    x:RX, y:1.38, w:RW, h:0.28, fontSize:10.5, bold:true, color:C.mid, fontFace:FH,
  });
  codeBox(s,
`// Agent #2 returns this JSON — all 4 languages per section
{
  "intro": {
    "en": "Welcome to our page about BMW…",
    "zh": "欢迎来到有关宝马的页面…",
    "ms": "Selamat datang ke halaman tentang BMW…",
    "ta": "BMW பற்றிய பக்கத்திற்கு வரவேற்கிறோம்…"
  },
  "body": {
    "en": "BMW was founded in Munich…",
    "zh": "宝马于慕尼黑创立…",
    "ms": "BMW diasaskan di Munich…",
    "ta": "BMW மியூனிக்கில் நிறுவப்பட்டது…"
  },
  "footer": {
    "en": "Thank you for visiting…",
    "zh": "感谢您的访问…",
    "ms": "Terima kasih kerana melawat…",
    "ta": "வருகைக்கு நன்றி…"
  }
}

// html-generator renders each as:
// <div lang="en">…</div>  <div lang="zh">…</div>
// <div lang="ms">…</div>  <div lang="ta">…</div>`,
    RX, 1.7, RW, 5.45, {fontSize:9.5}
  );

  footer(s);
}

// ── SLIDE 11 — The Run Report ──────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bg(s);
  titleBar(s, "The Run Report", "Agent #8 writes output/report.html — a themed timeline of every agent step");

  // Left: RunLogEntry schema + reporter invocation
  s.addText("RunLogEntry (src/lib/types.ts):", {
    x:LX, y:1.38, w:LW, h:0.26, fontSize:10.5, bold:true, color:C.mid, fontFace:FH,
  });
  codeBox(s,
`{
  step:        1,
  agent:       "content-checker",
  started_at:  "2026-04-30T08:42:11Z",
  finished_at: "2026-04-30T08:42:14Z",
  duration_ms: 3120,
  description: "Validate intro/body/footer",
  result: {
    status: "complete",
    sections: { intro:"…", body:"…", footer:"…" }
  }
}`,
    LX, 1.68, LW, 2.5, {fontSize:9.5}
  );

  s.addText("Reporter invocation (after all 5 loop iterations):", {
    x:LX, y:4.3, w:LW, h:0.26, fontSize:10.5, bold:true, color:C.mid, fontFace:FH,
  });
  codeBox(s,
`await step(agents.reporter,
  "Generate output/report.html from run log",
  \`run_log = \${JSON.stringify(runLog, null, 2)}\`
);`,
    LX, 4.6, LW, 1.0, {fontSize:9.5}
  );

  // Report features
  const features = [
    "19 agent steps total (4 pre-loop + 5×3 loop + 1 reporter)",
    "Loop iterations grouped under \"Iteration N\" headings",
    "Raw result JSON in collapsible <details> blocks",
    "Summary card: total agents run, countries, languages, images",
    "Self-contained HTML — no external dependencies",
  ];
  features.forEach((f, i) => {
    const y = 5.74 + i*0.25;
    s.addShape(pptx.ShapeType.ellipse, { x:LX+0.02, y:y+0.04, w:0.18, h:0.18, fill:{color:C.blue}, line:{color:C.blue} });
    s.addText(f, { x:LX+0.26, y, w:LW-0.28, h:0.23, fontSize:10, color:C.dark, fontFace:FB, valign:"middle" });
  });

  // Right: MCP code (full code of reporter invocation context)
  s.addText("Types (src/lib/types.ts) — full interfaces:", {
    x:RX, y:1.38, w:RW, h:0.28, fontSize:10.5, bold:true, color:C.mid, fontFace:FH,
  });
  codeBox(s,
`export interface AgentDefinition {
  name:         string;
  description:  string;
  tools:        string[];
  systemPrompt: string;
}

export interface RunLogEntry {
  step:         number;
  agent:        string;
  started_at:   string;
  finished_at:  string;
  duration_ms:  number;
  description:  string;
  result:       unknown;
}

// step() helper — wraps runAgent + appends to runLog
async function step(
  agent: AgentDefinition,
  description: string,
  userMsg: string
): Promise<unknown> {
  const started_at = new Date().toISOString();
  const result = await runAgent(agent, userMsg);
  runLog.push({
    step: ++stepCount, agent: agent.name,
    started_at, finished_at: new Date().toISOString(),
    duration_ms: Date.now()-t0,
    description, result,
  });
  return result;
}`,
    RX, 1.7, RW, 5.45, {fontSize:9.5}
  );

  footer(s);
}

// ── SLIDE 12 — File Map ────────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bg(s);
  titleBar(s, "File Map", "output/ is gitignored — template repo stays clean across runs");

  codeBox(s,
`myAgentTeam/
├── .claude/
│   ├── agents/               ← 8 sub-agent .md files
│   │   ├── content-checker.md    translator.md
│   │   ├── image-fetcher.md      html-generator.md
│   │   ├── weather-fetcher.md    flower-fetcher.md
│   │   ├── page-injector.md      reporter.md
│   ├── commands/             ← /build-page  ·  /reset  slash commands
│   └── settings.json         ← MCP registration + Claude Code permission whitelist
├── src/
│   ├── orchestrator.ts       ← standalone pipeline entry point
│   └── lib/
│       ├── agentLoader.ts    ← gray-matter parser  →  AgentDefinition
│       ├── runAgent.ts       ← Claude Agent SDK wrapper  (bypassPermissions)
│       ├── prompt.ts         ← readline helper for interactive Q&A
│       └── types.ts          ← AgentDefinition · RunLogEntry interfaces
├── mcp-servers/
│   ├── weather/src/index.ts  ← Open-Meteo MCP  (get_weather, list_countries)
│   └── images/src/index.ts   ← Wikipedia MCP   (search_image)
├── scripts/
│   ├── reset.ts              ← wipes output/ only
│   └── gen-ppt-v3.mjs        ← this PowerPoint generator
├── package.json              ← scripts: start · reset · mcp:weather · mcp:images
├── tsconfig.json
├── output/                   ← generated artifacts  (gitignored)
│   ├── index.html            ←   the webpage (4 languages + 5 country cards)
│   ├── report.html           ←   agent run timeline
│   ├── images/               ←   page images  (agent 3 downloads)
│   └── country-images/       ←   national flower images  (agent 6 downloads)
├── CLAUDE.md  ·  myArchitecture.md  ·  README.md`,
    0.3, 1.38, 12.73, 5.65, {fontSize:10.2}
  );

  footer(s);
}

// ── SLIDE 13 — Key Takeaways ───────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bg(s);
  titleBar(s, "Key Takeaways");

  const items = [
    ["1","Sub-agents are first-class.",
         "Each agent owns one responsibility, has its own system prompt, and returns strict JSON. No agent has more tool access than its job needs."],
    ["2","MCP isolates the external boundary.",
         "Switching data providers never requires editing agent definitions. Change one MCP server file — zero blast radius."],
    ["3","The loop demonstrates chained state.",
         "Each iteration's output feeds the next agent. Generalises to any \"for each X, run sub-pipeline\" workflow."],
    ["4","Uniqueness is the orchestrator's job.",
         "already_used_countries is maintained by the orchestrator and passed to weather-fetcher each iteration — not the agent's concern."],
    ["5","One source of truth, two execution paths.",
         "The same .claude/agents/*.md files drive Claude Code and the standalone TypeScript orchestrator — no duplication."],
    ["6","Agent .md files are self-contained.",
         "YAML frontmatter = tool whitelist. File body = system prompt. One edit changes behaviour on both paths everywhere."],
    ["7","Built for repetition.",
         "/reset clears output/ in seconds. Source code is never touched. Ready for the next audience immediately."],
  ];

  const perCol=4, colW=6.28;
  items.forEach((item, i) => {
    const col = Math.floor(i/perCol), row = i%perCol;
    const x = 0.28+col*(colW+0.22), y = 1.35+row*1.48;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w:colW, h:1.32, fill:{color:C.codeBack}, line:{color:C.codeBorder, pt:0.8}, rectRadius:0.1,
    });
    s.addShape(pptx.ShapeType.ellipse, {
      x:x+0.1, y:y+0.1, w:0.44, h:0.44, fill:{color:C.blue}, line:{color:C.blue},
    });
    s.addText(item[0], { x:x+0.1, y:y+0.1, w:0.44, h:0.44, fontSize:13, bold:true, color:C.white, fontFace:FH, align:"center", valign:"middle" });
    s.addText(item[1], { x:x+0.62, y:y+0.08, w:colW-0.72, h:0.4, fontSize:12, bold:true, color:C.blue, fontFace:FH, valign:"middle" });
    s.addText(item[2], { x:x+0.1,  y:y+0.5,  w:colW-0.2,  h:0.76, fontSize:10.5, color:C.dark, fontFace:FB });
  });

  footer(s);
}

// ── SLIDE 14 — Q & A ──────────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bg(s);

  // Large centred background band
  s.addShape(pptx.ShapeType.rect, {
    x:0, y:2.2, w:"100%", h:2.8,
    fill:{color:C.bgMid}, line:{color:C.bgMid},
  });

  s.addText("Q & A", {
    x:0.5, y:2.3, w:12.3, h:1.6,
    fontSize:72, bold:true, color:C.blue, fontFace:FH, align:"center", valign:"middle",
  });
  s.addText("Questions? Comments? Try the demo?", {
    x:0.5, y:4.0, w:12.3, h:0.5,
    fontSize:22, color:C.mid, fontFace:FB, align:"center", italic:true,
  });

  s.addText("🔗  github.com/ianyian/myAgentTeam", {
    x:0.5, y:5.0, w:12.3, h:0.44,
    fontSize:16, color:C.blue, fontFace:FH, align:"center", bold:true,
    hyperlink:{url:"https://github.com/ianyian/myAgentTeam"},
  });
  s.addText("/build-page  A short page about <your topic>", {
    x:3.0, y:5.6, w:7.3, h:0.42,
    fontSize:13, color:C.dark, fontFace:FM, align:"center",
  });

  footer(s);
}

// ── Write file ─────────────────────────────────────────────────────────────────
const out = "output/PetalPress-Architecture.pptx";
await pptx.writeFile({ fileName: out });
console.log("✅  Saved:", out);
