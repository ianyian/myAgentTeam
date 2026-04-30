/**
 * PetalPress — PowerPoint generator
 * Reads myArchitecture.md slide sections and produces output/PetalPress-Architecture.pptx
 * Run: node scripts/gen-ppt.mjs
 */
import PptxGenJS from "pptxgenjs";
import { mkdir } from "fs/promises";

// ── Brand colours (PetalPress pink + pastel palette) ──────────────────────────
const C = {
  pink:       "D63384",   // hot pink  — headings
  pinkLight:  "F48FB1",   // medium pink — accents
  pastel:     "FFF0F7",   // near-white pink — slide background
  pastelMid:  "FFD6E7",   // soft pink — section fills
  dark:       "5A0A25",   // deep burgundy — body text
  mid:        "8B2252",   // mid-rose — subheadings / labels
  white:      "FFFFFF",
  codeBack:   "FBE8F1",   // code block background
};

const FONT_HEAD  = "Calibri";
const FONT_BODY  = "Calibri";

await mkdir("output", { recursive: true });

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE"; // 13.33 × 7.5 in

// ── Shared slide helpers ───────────────────────────────────────────────────────

function bgRect(slide) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: "100%",
    fill: { color: C.pastel },
    line: { color: C.pastel },
  });
}

function titleBar(slide, title, subtitle = "") {
  // Left accent bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.3, y: 0.25, w: 0.08, h: subtitle ? 0.9 : 0.65,
    fill: { color: C.pink }, line: { color: C.pink },
  });
  slide.addText(title, {
    x: 0.55, y: 0.22, w: 12, h: 0.55,
    fontSize: 28, bold: true, color: C.pink, fontFace: FONT_HEAD,
    valign: "middle",
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.55, y: 0.78, w: 12, h: 0.35,
      fontSize: 14, color: C.mid, fontFace: FONT_BODY, italic: true,
    });
  }
}

function footerLine(slide) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 7.2, w: "100%", h: 0.04,
    fill: { color: C.pinkLight }, line: { color: C.pinkLight },
  });
  slide.addText("PetalPress — Multi-Agent Webpage Builder", {
    x: 0.3, y: 7.25, w: 12.7, h: 0.22,
    fontSize: 9, color: C.pinkLight, fontFace: FONT_BODY, italic: true,
  });
}

function bodyText(slide, lines, opts = {}) {
  const defaults = {
    x: 0.5, y: 1.35, w: 12.3, h: 5.6,
    fontSize: 14, color: C.dark, fontFace: FONT_BODY,
    valign: "top", bullet: false,
    ...opts,
  };
  slide.addText(lines, defaults);
}

// ── SLIDE 1 — Title / What is PetalPress? ─────────────────────────────────────
{
  const s = pptx.addSlide();
  bgRect(s);

  // Big centred hero text
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 2.2, w: "100%", h: 3.1,
    fill: { color: C.pastelMid }, line: { color: C.pastelMid },
  });

  s.addText("🌸 PetalPress", {
    x: 0.5, y: 2.3, w: 12.3, h: 1.1,
    fontSize: 48, bold: true, color: C.pink, fontFace: FONT_HEAD, align: "center",
  });
  s.addText("A Multi-Agent Webpage Builder", {
    x: 0.5, y: 3.4, w: 12.3, h: 0.6,
    fontSize: 24, color: C.mid, fontFace: FONT_BODY, align: "center",
  });
  s.addText("Sub-agent orchestration · MCP integration · Visible loop pattern", {
    x: 0.5, y: 4.1, w: 12.3, h: 0.4,
    fontSize: 14, color: C.dark, fontFace: FONT_BODY, align: "center", italic: true,
  });

  s.addText([
    { text: "Input: ", options: { bold: true, color: C.mid } },
    { text: "one paragraph describing what the page is about   ", options: {} },
    { text: "Output: ", options: { bold: true, color: C.mid } },
    { text: "output/index.html  +  output/report.html", options: {} },
  ], {
    x: 1.5, y: 5.5, w: 10.3, h: 0.6,
    fontSize: 13, color: C.dark, fontFace: FONT_BODY, align: "center",
  });

  s.addText("Stack: TypeScript · Claude Agent SDK · Model Context Protocol (MCP)", {
    x: 0.5, y: 6.15, w: 12.3, h: 0.35,
    fontSize: 12, color: C.mid, fontFace: FONT_BODY, align: "center",
  });
  s.addText("Runs inside Claude Code (CLI / VS Code) or as a standalone Node program", {
    x: 0.5, y: 6.5, w: 12.3, h: 0.35,
    fontSize: 12, color: C.mid, fontFace: FONT_BODY, align: "center", italic: true,
  });

  footerLine(s);
}

// ── SLIDE 2 — The Team (8 agents) ─────────────────────────────────────────────
{
  const s = pptx.addSlide();
  bgRect(s);
  titleBar(s, "The Team — 8 Agents", "Each agent has one job, a focused system prompt, and a strict JSON output contract");

  const rows = [
    ["#", "Agent", "Responsibility"],
    ["1", "content-checker", "Verifies intro / body / footer; asks the user for anything missing (up to 3 retry rounds)"],
    ["2", "translator",      "English → Chinese (Simplified), Malay, Tamil. Page renders all four languages."],
    ["3", "image-fetcher",   "Downloads 2–3 page images via the images MCP → output/images/"],
    ["4", "html-generator",  "Writes output/index.html — pink + pastel theme, 4-language layout, empty country grid"],
    ["5", "weather-fetcher", "Loop: picks a fresh country (not yet used), fetches live weather via MCP"],
    ["6", "flower-fetcher",  "Loop: downloads the country's national flower image → output/country-images/"],
    ["7", "page-injector",   "Loop: inserts a country card (<article>) into index.html in place"],
    ["8", "reporter",        "Generates output/report.html — themed timeline of every agent action"],
  ];

  s.addTable(rows, {
    x: 0.35, y: 1.35, w: 12.6,
    fontSize: 11.5, fontFace: FONT_BODY,
    color: C.dark,
    rowH: 0.48,
    align: "left",
    valign: "middle",
    border: { type: "solid", color: C.pastelMid, pt: 1 },
    fill: C.white,
    colW: [0.4, 1.65, 10.55],
  });

  // Header row colour override
  s.addShape(pptx.ShapeType.rect, {
    x: 0.35, y: 1.35, w: 12.6, h: 0.48,
    fill: { color: C.pink }, line: { color: C.pink },
  });
  s.addText([
    { text: "#   Agent                     Responsibility", options: {} },
  ], {
    x: 0.55, y: 1.38, w: 12.4, h: 0.44,
    fontSize: 12, bold: true, color: C.white, fontFace: FONT_HEAD, valign: "middle",
  });

  footerLine(s);
}

// ── SLIDE 3 — The Pipeline ─────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  bgRect(s);
  titleBar(s, "The Pipeline", "8 steps — sequential with a 5-iteration inner loop");

  const steps = [
    { num: "1", label: "content-checker", note: "interactive Q&A if sections missing", loop: false },
    { num: "2", label: "translator",      note: "EN → ZH, MS, TA",                    loop: false },
    { num: "3", label: "image-fetcher",   note: "→ output/images/",                   loop: false },
    { num: "4", label: "html-generator",  note: "→ output/index.html (empty grid)",   loop: false },
    { num: "5", label: "weather-fetcher", note: "loop ×5: pick country + live weather", loop: true },
    { num: "6", label: "flower-fetcher",  note: "loop ×5: → output/country-images/",  loop: true },
    { num: "7", label: "page-injector",   note: "loop ×5: edit output/index.html",    loop: true },
    { num: "8", label: "reporter",        note: "→ output/report.html",               loop: false },
  ];

  const startX = 0.35;
  const boxW   = 3.8;
  const boxH   = 0.52;
  const gapX   = 0.22;
  const startY = 1.4;
  const colCount = 4;

  steps.forEach((step, i) => {
    const col = i % colCount;
    const row = Math.floor(i / colCount);
    const x = startX + col * (boxW + gapX);
    const y = startY + row * (boxH + 0.35);

    const fill = step.loop ? C.pinkLight : C.pastelMid;
    const textColor = step.loop ? C.white : C.dark;

    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w: boxW, h: boxH,
      fill: { color: fill },
      line: { color: C.pinkLight, pt: 1.5 },
      rectRadius: 0.1,
    });
    s.addText(`${step.num}. ${step.label}`, {
      x: x + 0.08, y, w: boxW - 0.1, h: boxH * 0.55,
      fontSize: 12, bold: true, color: textColor, fontFace: FONT_HEAD,
      valign: "bottom",
    });
    s.addText(step.note, {
      x: x + 0.08, y: y + boxH * 0.52, w: boxW - 0.1, h: boxH * 0.5,
      fontSize: 9.5, color: step.loop ? "FFE0EF" : C.mid, fontFace: FONT_BODY,
      valign: "top", italic: true,
    });

    // Arrow between steps in the same row (not after last in row or last overall)
    if (col < colCount - 1 && i < steps.length - 1) {
      s.addShape(pptx.ShapeType.rect, {
        x: x + boxW, y: y + boxH / 2 - 0.02, w: gapX, h: 0.04,
        fill: { color: C.pinkLight }, line: { color: C.pinkLight },
      });
    }
  });

  // Loop bracket label
  s.addShape(pptx.ShapeType.rect, {
    x: 0.3, y: 3.36, w: 12.7, h: 1.04,
    fill: { type: "none" },
    line: { color: C.pink, pt: 2 },
  });
  s.addText("LOOP ×5  (5→6→7 in order per iteration — never batched)", {
    x: 0.35, y: 3.27, w: 5.5, h: 0.28,
    fontSize: 10, bold: true, color: C.pink, fontFace: FONT_HEAD,
    fill: { color: C.pastel },
  });

  footerLine(s);
}

// ── SLIDE 4 — The Loop ────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  bgRect(s);
  titleBar(s, "The Loop — Showcase Feature", "Agents 5 → 6 → 7, run in strict order, 5 times");

  // Iteration columns
  const iters = ["Iter 1", "Iter 2", "Iter 3", "Iter 4", "Iter 5"];
  const colW  = 2.2;
  const startX = 0.55;
  const rowLabels = ["5. weather-fetcher", "6. flower-fetcher", "7. page-injector"];
  const rowColors = [C.pastelMid, "F7C6DF", C.pinkLight];
  const rowTextC  = [C.dark, C.dark, C.white];

  // Column headers
  iters.forEach((label, ci) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x: startX + ci * (colW + 0.18), y: 1.35, w: colW, h: 0.42,
      fill: { color: C.pink }, line: { color: C.pink }, rectRadius: 0.08,
    });
    s.addText(label, {
      x: startX + ci * (colW + 0.18), y: 1.35, w: colW, h: 0.42,
      fontSize: 13, bold: true, color: C.white, fontFace: FONT_HEAD,
      align: "center", valign: "middle",
    });
  });

  // Grid cells
  rowLabels.forEach((rowLabel, ri) => {
    const y = 1.88 + ri * 1.05;

    // Row label
    s.addText(rowLabel, {
      x: 0, y, w: startX + 0.02, h: 0.75,
      fontSize: 0, color: C.pastel, // hidden; used for row spacing only
    });

    iters.forEach((_, ci) => {
      const x = startX + ci * (colW + 0.18);
      s.addShape(pptx.ShapeType.roundRect, {
        x, y, w: colW, h: 0.75,
        fill: { color: rowColors[ri] }, line: { color: C.pinkLight, pt: 1 },
        rectRadius: 0.08,
      });
      s.addText(rowLabel, {
        x: x + 0.06, y: y + 0.05, w: colW - 0.12, h: 0.65,
        fontSize: 11, color: rowTextC[ri], fontFace: FONT_BODY,
        align: "center", valign: "middle",
      });
    });

    // Vertical arrows between rows (not after last row)
    if (ri < rowLabels.length - 1) {
      iters.forEach((_, ci) => {
        const x = startX + ci * (colW + 0.18) + colW / 2 - 0.02;
        s.addShape(pptx.ShapeType.rect, {
          x, y: y + 0.75, w: 0.04, h: 0.3,
          fill: { color: C.pinkLight }, line: { color: C.pinkLight },
        });
      });
    }
  });

  // Callout bullets
  const bullets = [
    "Each iteration's output (country name) feeds the next agent — chained state.",
    "The orchestrator maintains already_used_countries so no country appears twice.",
    "Pattern generalises: any \"for each X, run sub-pipeline\" task uses the same shape.",
  ];
  bullets.forEach((b, i) => {
    s.addText(`• ${b}`, {
      x: 0.5, y: 5.35 + i * 0.42, w: 12.3, h: 0.38,
      fontSize: 12.5, color: C.dark, fontFace: FONT_BODY,
    });
  });

  footerLine(s);
}

// ── SLIDE 5 — Two Execution Paths ─────────────────────────────────────────────
{
  const s = pptx.addSlide();
  bgRect(s);
  titleBar(s, "Two Execution Paths — One Source of Truth", ".claude/agents/*.md drives both paths");

  // Central source box
  s.addShape(pptx.ShapeType.roundRect, {
    x: 4.4, y: 1.45, w: 4.5, h: 0.75,
    fill: { color: C.pastelMid }, line: { color: C.pink, pt: 2 }, rectRadius: 0.12,
  });
  s.addText(".claude/agents/*.md", {
    x: 4.4, y: 1.45, w: 4.5, h: 0.75,
    fontSize: 15, bold: true, color: C.pink, fontFace: FONT_HEAD,
    align: "center", valign: "middle",
  });
  s.addText("canonical sub-agent definitions", {
    x: 4.4, y: 2.1, w: 4.5, h: 0.3,
    fontSize: 10, color: C.mid, fontFace: FONT_BODY, align: "center", italic: true,
  });

  // Left path — Claude Code
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 3.05, w: 5.2, h: 1.5,
    fill: { color: C.codeBack }, line: { color: C.pinkLight, pt: 1.5 }, rectRadius: 0.12,
  });
  s.addText("Claude Code\n/build-page command", {
    x: 0.6, y: 3.1, w: 5.0, h: 0.65,
    fontSize: 14, bold: true, color: C.pink, fontFace: FONT_HEAD, valign: "middle",
  });
  s.addText("Uses the Task tool to delegate each step\nPermissions set in .claude/settings.json", {
    x: 0.6, y: 3.75, w: 5.0, h: 0.75,
    fontSize: 11, color: C.dark, fontFace: FONT_BODY,
  });

  // Right path — Standalone
  s.addShape(pptx.ShapeType.roundRect, {
    x: 7.6, y: 3.05, w: 5.2, h: 1.5,
    fill: { color: C.codeBack }, line: { color: C.pinkLight, pt: 1.5 }, rectRadius: 0.12,
  });
  s.addText("Standalone TS\nnpm run start", {
    x: 7.7, y: 3.1, w: 5.0, h: 0.65,
    fontSize: 14, bold: true, color: C.pink, fontFace: FONT_HEAD, valign: "middle",
  });
  s.addText("Claude Agent SDK  •  permissionMode: bypassPermissions\nsrc/lib/agentLoader.ts parses gray-matter frontmatter", {
    x: 7.7, y: 3.75, w: 5.0, h: 0.75,
    fontSize: 11, color: C.dark, fontFace: FONT_BODY,
  });

  // Connector lines (simplified as coloured rectangles)
  // Left arrow
  s.addShape(pptx.ShapeType.rect, { x: 3.05, y: 1.78, w: 1.35, h: 0.04, fill: { color: C.pinkLight }, line: { color: C.pinkLight } });
  s.addShape(pptx.ShapeType.rect, { x: 3.05, y: 1.78, w: 0.04, h: 1.27, fill: { color: C.pinkLight }, line: { color: C.pinkLight } });
  // Right arrow
  s.addShape(pptx.ShapeType.rect, { x: 8.9,  y: 1.78, w: 1.35, h: 0.04, fill: { color: C.pinkLight }, line: { color: C.pinkLight } });
  s.addShape(pptx.ShapeType.rect, { x: 10.21,y: 1.78, w: 0.04, h: 1.27, fill: { color: C.pinkLight }, line: { color: C.pinkLight } });

  // Frontmatter callout
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 4.8, w: 12.3, h: 1.75,
    fill: { color: C.codeBack }, line: { color: C.pastelMid, pt: 1 }, rectRadius: 0.1,
  });
  s.addText("Agent .md frontmatter schema:", {
    x: 0.7, y: 4.85, w: 5, h: 0.3, fontSize: 11, bold: true, color: C.mid, fontFace: FONT_HEAD,
  });
  s.addText(
    "---\nname: weather-fetcher\ndescription: Picks a country and fetches current weather.\ntools: [mcp__weather__get_weather, mcp__weather__list_countries]\n---\n<system prompt body>",
    {
      x: 0.7, y: 5.15, w: 11.9, h: 1.3,
      fontSize: 10.5, color: C.dark, fontFace: "Courier New",
    }
  );

  footerLine(s);
}

// ── SLIDE 6 — MCP Integration ─────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  bgRect(s);
  titleBar(s, "MCP Integration", "External APIs isolated behind two MCP servers — swap a source without touching any agent");

  // Table
  const rows = [
    ["MCP Server",  "Tool(s)",                                    "Data Source",              "Purpose"],
    ["weather",     "get_weather(country)\nlist_countries()",     "Open-Meteo\n(free, no key)","Geocode capital → live weather (temp, wind, condition)"],
    ["images",      "search_image(query, save_path)",             "Wikipedia REST API\n(free)","OpenSearch → page summary → originalimage → save to disk"],
  ];

  s.addTable(rows, {
    x: 0.35, y: 1.35, w: 12.6,
    fontSize: 11.5, fontFace: FONT_BODY, color: C.dark,
    rowH: [0.45, 0.65, 0.65],
    align: "left", valign: "middle",
    border: { type: "solid", color: C.pastelMid, pt: 1 },
    fill: C.white,
    colW: [1.4, 3.1, 2.2, 5.9],
  });

  s.addShape(pptx.ShapeType.rect, {
    x: 0.35, y: 1.35, w: 12.6, h: 0.45,
    fill: { color: C.pink }, line: { color: C.pink },
  });
  s.addText("MCP Server       Tool(s)                          Data Source            Purpose", {
    x: 0.55, y: 1.38, w: 12.4, h: 0.41,
    fontSize: 12, bold: true, color: C.white, fontFace: FONT_HEAD, valign: "middle",
  });

  // Registration note
  const regPoints = [
    [".claude/settings.json", "Claude Code path — MCP server registration + bash command whitelist (mkdir, rm, ls, open)"],
    ["src/lib/runAgent.ts",   "Standalone path — spawns each MCP server as a stdio child process via npx tsx"],
  ];
  regPoints.forEach(([file, desc], i) => {
    const y = 3.65 + i * 0.72;
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.35, y, w: 12.6, h: 0.62,
      fill: { color: C.codeBack }, line: { color: C.pastelMid, pt: 1 }, rectRadius: 0.08,
    });
    s.addText(file, {
      x: 0.55, y: y + 0.04, w: 3.2, h: 0.54,
      fontSize: 11.5, bold: true, color: C.pink, fontFace: "Courier New", valign: "middle",
    });
    s.addText(desc, {
      x: 3.9, y: y + 0.04, w: 8.9, h: 0.54,
      fontSize: 11.5, color: C.dark, fontFace: FONT_BODY, valign: "middle",
    });
  });

  s.addText("💡  Changing a data provider = editing one MCP server file. Zero agent definitions touched.", {
    x: 0.5, y: 5.2, w: 12.3, h: 0.42,
    fontSize: 13, color: C.mid, fontFace: FONT_BODY, italic: true, bold: true,
  });

  footerLine(s);
}

// ── SLIDE 7 — Four-Language Layout ────────────────────────────────────────────
{
  const s = pptx.addSlide();
  bgRect(s);
  titleBar(s, "Four-Language Layout", "Every content section rendered side-by-side in 4 languages");

  const langs = [
    { code: "en", name: "English",              script: "Latin",     sample: "Welcome to our page…" },
    { code: "zh", name: "Chinese (Simplified)", script: "简体中文",  sample: "欢迎来到我们的页面…" },
    { code: "ms", name: "Malay",                script: "Latin",     sample: "Selamat datang ke…"    },
    { code: "ta", name: "Tamil",                script: "தமிழ்",     sample: "வரவேற்கிறோம்…"          },
  ];

  langs.forEach((lang, i) => {
    const x = 0.35 + i * 3.25;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 1.35, w: 3.05, h: 4.2,
      fill: { color: C.codeBack }, line: { color: C.pinkLight, pt: 1.5 }, rectRadius: 0.12,
    });
    // Code badge
    s.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.1, y: 1.45, w: 0.55, h: 0.38,
      fill: { color: C.pink }, line: { color: C.pink }, rectRadius: 0.06,
    });
    s.addText(lang.code, {
      x: x + 0.1, y: 1.45, w: 0.55, h: 0.38,
      fontSize: 12, bold: true, color: C.white, fontFace: FONT_HEAD, align: "center", valign: "middle",
    });
    s.addText(lang.name, {
      x: x + 0.72, y: 1.47, w: 2.3, h: 0.34,
      fontSize: 12, bold: true, color: C.pink, fontFace: FONT_HEAD, valign: "middle",
    });
    s.addText(lang.script, {
      x: x + 0.1, y: 1.9, w: 2.85, h: 0.3,
      fontSize: 10.5, color: C.mid, fontFace: FONT_BODY, italic: true,
    });
    s.addShape(pptx.ShapeType.rect, {
      x: x + 0.1, y: 2.25, w: 2.85, h: 0.02,
      fill: { color: C.pastelMid }, line: { color: C.pastelMid },
    });
    s.addText(`"${lang.sample}"`, {
      x: x + 0.1, y: 2.32, w: 2.85, h: 1.8,
      fontSize: 11.5, color: C.dark, fontFace: FONT_BODY, italic: true,
      wrap: true,
    });
  });

  const bullets = [
    "Agent #2 (translator) produces { section: { en, zh, ms, ta } } JSON",
    "Agent #4 (html-generator) lays out 4 columns with lang= attributes for accessibility",
    "Pink + soft-pastel theme keeps the page coherent across scripts",
  ];
  bullets.forEach((b, i) => {
    s.addText(`• ${b}`, {
      x: 0.5, y: 5.75 + i * 0.38, w: 12.3, h: 0.34,
      fontSize: 12, color: C.dark, fontFace: FONT_BODY,
    });
  });

  footerLine(s);
}

// ── SLIDE 8 — The Run Report ──────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  bgRect(s);
  titleBar(s, "The Run Report", "Agent #8 writes output/report.html — a themed timeline of every step");

  // Schema box
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.35, y: 1.35, w: 6.0, h: 3.6,
    fill: { color: C.codeBack }, line: { color: C.pastelMid, pt: 1 }, rectRadius: 0.1,
  });
  s.addText("RunLogEntry schema (types.ts)", {
    x: 0.55, y: 1.4, w: 5.6, h: 0.3,
    fontSize: 11, bold: true, color: C.mid, fontFace: FONT_HEAD,
  });
  s.addText(
`{
  step:        1,
  agent:       "content-checker",
  started_at:  "2026-04-30T08:42:11Z",
  finished_at: "2026-04-30T08:42:14Z",
  duration_ms: 3120,
  description: "Validate intro/body/footer",
  result:      { /* agent JSON output */ }
}`,
    {
      x: 0.45, y: 1.75, w: 5.8, h: 3.1,
      fontSize: 10.5, color: C.dark, fontFace: "Courier New",
    }
  );

  // Feature list
  const features = [
    "Total wall-clock time + agent count in summary card",
    "Loop iterations visually grouped (5/6/7 nested under \"Iteration N\")",
    "Raw result JSON in collapsible <details> blocks",
    "Self-contained HTML — no external dependencies",
    "Pink + pastel theme matches output/index.html",
  ];
  features.forEach((f, i) => {
    s.addShape(pptx.ShapeType.ellipse, {
      x: 6.6, y: 1.46 + i * 0.68, w: 0.28, h: 0.28,
      fill: { color: C.pink }, line: { color: C.pink },
    });
    s.addText(f, {
      x: 7.0, y: 1.43 + i * 0.68, w: 5.8, h: 0.4,
      fontSize: 12, color: C.dark, fontFace: FONT_BODY, valign: "middle",
    });
  });

  s.addText("Scroll through the report in a live demo to show exactly what each agent did.", {
    x: 0.5, y: 5.3, w: 12.3, h: 0.42,
    fontSize: 13, color: C.mid, fontFace: FONT_BODY, italic: true,
  });

  footerLine(s);
}

// ── SLIDE 9 — Reset & Reuse ───────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  bgRect(s);
  titleBar(s, "Reset & Reuse", "Designed for repeated live demos — wipes in seconds, source code untouched");

  const options = [
    {
      title: "Option A — Reset in place",
      cmd1:  "/reset                   (Claude Code)",
      cmd2:  "npm run reset            (standalone)",
      desc:  "Removes output/index.html, output/report.html, output/images/, output/country-images/\nSource code, node_modules, .claude/ are never touched.\nReady for the next /build-page immediately.",
    },
    {
      title: "Option B — Clone per demo",
      cmd1:  "cp -r myAgentTeam demo-coffee/",
      cmd2:  "cd demo-coffee && npm run start",
      desc:  "Each clone keeps its own generated artifacts.\nUseful when you want to show two different pages side-by-side.\noutput/ is gitignored — the template repo stays clean.",
    },
  ];

  options.forEach((opt, i) => {
    const x = 0.35 + i * 6.5;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 1.35, w: 6.1, h: 5.5,
      fill: { color: C.codeBack }, line: { color: C.pinkLight, pt: 1.5 }, rectRadius: 0.12,
    });
    s.addText(opt.title, {
      x: x + 0.15, y: 1.45, w: 5.8, h: 0.42,
      fontSize: 14, bold: true, color: C.pink, fontFace: FONT_HEAD, valign: "middle",
    });
    [opt.cmd1, opt.cmd2].forEach((cmd, ci) => {
      s.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.15, y: 2.0 + ci * 0.58, w: 5.8, h: 0.48,
        fill: { color: C.pastelMid }, line: { color: C.pastelMid }, rectRadius: 0.07,
      });
      s.addText(cmd, {
        x: x + 0.25, y: 2.0 + ci * 0.58, w: 5.6, h: 0.48,
        fontSize: 11, color: C.dark, fontFace: "Courier New", valign: "middle",
      });
    });
    s.addText(opt.desc, {
      x: x + 0.15, y: 3.25, w: 5.8, h: 3.2,
      fontSize: 11.5, color: C.dark, fontFace: FONT_BODY,
    });
  });

  footerLine(s);
}

// ── SLIDE 10 — File Map ────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  bgRect(s);
  titleBar(s, "File Map", "Full workspace layout — gitignored output/ keeps the template repo clean");

  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.35, y: 1.35, w: 12.6, h: 5.6,
    fill: { color: C.codeBack }, line: { color: C.pastelMid, pt: 1 }, rectRadius: 0.1,
  });

  s.addText(
`myAgentTeam/
├── .claude/
│   ├── agents/            ← 8 sub-agent .md files (canonical definitions)
│   ├── commands/          ← /build-page · /reset slash commands
│   └── settings.json      ← MCP registration + Claude Code permission whitelist
├── src/
│   ├── orchestrator.ts    ← standalone pipeline entry point
│   └── lib/
│       ├── agentLoader.ts ← gray-matter parser → AgentDefinition
│       ├── runAgent.ts    ← Claude Agent SDK wrapper (bypassPermissions)
│       ├── prompt.ts      ← readline helper for interactive Q&A
│       └── types.ts       ← shared TypeScript interfaces
├── mcp-servers/
│   ├── weather/src/index.ts  ← Open-Meteo MCP (get_weather, list_countries)
│   └── images/src/index.ts   ← Wikipedia MCP (search_image)
├── scripts/reset.ts       ← wipes output/ only
├── package.json           ← scripts: start · reset · build:all · mcp:weather · mcp:images
├── tsconfig.json
├── output/                ← generated artifacts (gitignored)
│   ├── index.html         ←   the webpage
│   ├── report.html        ←   agent run report
│   ├── images/            ←   page images (agent 3)
│   └── country-images/    ←   national flower images (agent 6)
├── CLAUDE.md  ·  myArchitecture.md  ·  README.md`,
    {
      x: 0.55, y: 1.42, w: 12.2, h: 5.45,
      fontSize: 10.8, color: C.dark, fontFace: "Courier New",
    }
  );

  footerLine(s);
}

// ── SLIDE 11 — Key Takeaways ──────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  bgRect(s);
  titleBar(s, "Key Takeaways");

  const takeaways = [
    {
      num: "1",
      head: "Sub-agents are first-class.",
      body: "Each agent owns one responsibility, has its own system prompt, and exposes a strict JSON output contract.",
    },
    {
      num: "2",
      head: "MCP isolates the external boundary.",
      body: "Switching data providers never requires editing agent definitions — change one MCP server file.",
    },
    {
      num: "3",
      head: "The loop demonstrates chained state.",
      body: "Each iteration's output feeds the next agent; the shared list grows with each pass.",
    },
    {
      num: "4",
      head: "Uniqueness is the orchestrator's job.",
      body: "already_used_countries is maintained by the orchestrator and passed to weather-fetcher each iteration — not the agent's concern.",
    },
    {
      num: "5",
      head: "One source of truth, two execution paths.",
      body: "The same .claude/agents/*.md files drive Claude Code and the standalone TypeScript orchestrator — no duplication.",
    },
    {
      num: "6",
      head: "Agent .md files are self-contained.",
      body: "YAML frontmatter declares the tool whitelist; the file body is the system prompt. One edit = changed behaviour everywhere.",
    },
    {
      num: "7",
      head: "Built for repetition.",
      body: "/reset clears state in seconds; the template is ready for the next audience.",
    },
  ];

  const perCol = 4;
  takeaways.forEach((t, i) => {
    const col = Math.floor(i / perCol);
    const row = i % perCol;
    const x = 0.35 + col * 6.55;
    const y = 1.35 + row * 1.42;

    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 6.2, h: 1.28,
      fill: { color: C.codeBack }, line: { color: C.pastelMid, pt: 1 }, rectRadius: 0.1,
    });
    // Number badge
    s.addShape(pptx.ShapeType.ellipse, {
      x: x + 0.12, y: y + 0.12, w: 0.46, h: 0.46,
      fill: { color: C.pink }, line: { color: C.pink },
    });
    s.addText(t.num, {
      x: x + 0.12, y: y + 0.12, w: 0.46, h: 0.46,
      fontSize: 13, bold: true, color: C.white, fontFace: FONT_HEAD, align: "center", valign: "middle",
    });
    s.addText(t.head, {
      x: x + 0.68, y: y + 0.1, w: 5.4, h: 0.38,
      fontSize: 12, bold: true, color: C.pink, fontFace: FONT_HEAD, valign: "middle",
    });
    s.addText(t.body, {
      x: x + 0.12, y: y + 0.5, w: 5.96, h: 0.72,
      fontSize: 10.5, color: C.dark, fontFace: FONT_BODY,
    });
  });

  footerLine(s);
}

// ── Write file ────────────────────────────────────────────────────────────────
const outPath = "output/PetalPress-Architecture.pptx";
await pptx.writeFile({ fileName: outPath });
console.log(`✅  Saved: ${outPath}`);
