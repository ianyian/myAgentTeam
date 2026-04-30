/**
 * PetalPress — PowerPoint generator v2
 * Produces output/PetalPress-Architecture.pptx
 * Run: node scripts/gen-ppt-v2.mjs
 *
 * Slides:
 *   1. Title (GitHub link + sample prompt)
 *   2. Key Concepts Glossary
 *   3. The Team — 8 Agents (+ agent .md snippet)
 *   4. The Pipeline
 *   5. The Loop (+ orchestrator loop code)
 *   6. Two Execution Paths (+ agentLoader code)
 *   7. MCP Integration (+ MCP server code)
 *   8. Four-Language Layout (+ translator JSON)
 *   9. The Run Report
 *  10. File Map
 *  11. Key Takeaways
 */
import PptxGenJS from "pptxgenjs";
import { mkdir } from "fs/promises";

// ── Brand colours ─────────────────────────────────────────────────────────────
const C = {
  pink:      "D63384",
  pinkLight: "F48FB1",
  pastel:    "FFF0F7",
  pastelMid: "FFD6E7",
  dark:      "5A0A25",
  mid:       "8B2252",
  white:     "FFFFFF",
  codeBack:  "FBE8F1",
  codeBorder:"F0C8DC",
};
const FH = "Calibri";
const FB = "Calibri";
const FM = "Courier New";

await mkdir("output", { recursive: true });

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE"; // 13.33 × 7.5 in

// ── Helpers ───────────────────────────────────────────────────────────────────
const bg = s => s.addShape(pptx.ShapeType.rect, {
  x:0,y:0,w:"100%",h:"100%", fill:{color:C.pastel}, line:{color:C.pastel},
});

function titleBar(s, title, sub="") {
  s.addShape(pptx.ShapeType.rect, {
    x:0.28,y:0.2, w:0.08, h: sub?0.9:0.65,
    fill:{color:C.pink}, line:{color:C.pink},
  });
  s.addText(title, {
    x:0.52,y:0.18, w:12.3, h:0.55,
    fontSize:27, bold:true, color:C.pink, fontFace:FH, valign:"middle",
  });
  if(sub) s.addText(sub,{
    x:0.52,y:0.73, w:12.3, h:0.32,
    fontSize:12.5, color:C.mid, fontFace:FB, italic:true,
  });
}

function footer(s) {
  s.addShape(pptx.ShapeType.rect,{x:0,y:7.18,w:"100%",h:0.04,fill:{color:C.pinkLight},line:{color:C.pinkLight}});
  s.addText("PetalPress — Multi-Agent Webpage Builder  ·  github.com/ianyian/myAgentTeam",{
    x:0.3,y:7.22,w:12.7,h:0.24,fontSize:9,color:C.pinkLight,fontFace:FB,italic:true,
  });
}

function codeBox(s, code, x, y, w, h, opts={}) {
  s.addShape(pptx.ShapeType.roundRect,{
    x,y,w,h, fill:{color:C.codeBack}, line:{color:C.codeBorder,pt:1}, rectRadius:0.08,
  });
  s.addText(code,{
    x:x+0.12,y:y+0.08,w:w-0.24,h:h-0.16,
    fontSize: opts.fontSize||9.5, color:C.dark, fontFace:FM,
    valign:"top", wrap:true,
  });
}

function badge(s, label, x, y) {
  s.addShape(pptx.ShapeType.roundRect,{
    x,y,w:0.48,h:0.32, fill:{color:C.pink}, line:{color:C.pink}, rectRadius:0.06,
  });
  s.addText(label,{x,y,w:0.48,h:0.32,fontSize:11,bold:true,color:C.white,fontFace:FH,align:"center",valign:"middle"});
}

// ── SLIDE 1 — Title ───────────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bg(s);

  s.addShape(pptx.ShapeType.rect,{x:0,y:2.1,w:"100%",h:2.8,fill:{color:C.pastelMid},line:{color:C.pastelMid}});

  s.addText("🌸 PetalPress",{
    x:0.5,y:2.2,w:12.3,h:1.0,fontSize:48,bold:true,color:C.pink,fontFace:FH,align:"center",
  });
  s.addText("A Multi-Agent Webpage Builder",{
    x:0.5,y:3.22,w:12.3,h:0.55,fontSize:24,color:C.mid,fontFace:FB,align:"center",
  });
  s.addText("Sub-agent orchestration  ·  MCP integration  ·  Visible loop pattern",{
    x:0.5,y:3.8,w:12.3,h:0.35,fontSize:13,color:C.dark,fontFace:FB,align:"center",italic:true,
  });

  // GitHub link
  s.addText("🔗  github.com/ianyian/myAgentTeam",{
    x:0.5,y:5.05,w:12.3,h:0.38,fontSize:14,color:C.pink,fontFace:FH,align:"center",bold:true,
    hyperlink:{url:"https://github.com/ianyian/myAgentTeam"},
  });

  // Sample prompt box
  s.addText("Try it now — copy and paste:",{
    x:1.0,y:5.58,w:11.3,h:0.28,fontSize:11,color:C.mid,fontFace:FB,align:"center",italic:true,
  });
  codeBox(s,
    "/build-page  A short page about BMW car, with variance of BMW car with history in the body and a thank-you footer.",
    1.0, 5.88, 11.3, 0.55, {fontSize:11}
  );

  s.addText("Stack: TypeScript · Claude Agent SDK · Model Context Protocol (MCP)  |  Runs in Claude Code (VS Code / CLI) or npm run start",{
    x:0.5,y:6.6,w:12.3,h:0.32,fontSize:10.5,color:C.mid,fontFace:FB,align:"center",
  });

  footer(s);
}

// ── SLIDE 2 — Key Concepts Glossary ──────────────────────────────────────────
{
  const s = pptx.addSlide(); bg(s);
  titleBar(s,"Key Concepts — Glossary","Definitions of the core terms used throughout this deck");

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

  const colW  = [2.2, 10.1];
  const rowH  = 0.48;
  const startY = 1.3;

  terms.forEach(([term, def], i) => {
    const y = startY + i * (rowH + 0.04);
    const fill = i % 2 === 0 ? C.codeBack : C.white;

    s.addShape(pptx.ShapeType.roundRect,{
      x:0.3,y,w:12.7,h:rowH, fill:{color:fill}, line:{color:C.codeBorder,pt:0.5}, rectRadius:0.06,
    });
    s.addText(term,{
      x:0.42,y,w:colW[0],h:rowH, fontSize:11.5,bold:true,color:C.pink,fontFace:FH,valign:"middle",
    });
    s.addText(def,{
      x:0.42+colW[0],y,w:colW[1]-0.12,h:rowH, fontSize:11,color:C.dark,fontFace:FB,valign:"middle",
    });
  });

  footer(s);
}

// ── SLIDE 3 — The Team ────────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bg(s);
  titleBar(s,"The Team — 8 Agents","Each agent: one job · focused system prompt · strict JSON output contract · least-privilege tool whitelist");

  // Agent table (left half)
  const agents = [
    ["1","content-checker","Validates intro/body/footer; up to 3 interactive Q&A rounds if sections missing"],
    ["2","translator",     "EN → Chinese (ZH), Malay (MS), Tamil (TA)  — structured JSON output"],
    ["3","image-fetcher",  "Downloads 2–3 page images → output/images/  via images MCP"],
    ["4","html-generator", "Writes output/index.html — pink pastel theme, 4-language layout, empty country grid"],
    ["5","weather-fetcher","LOOP: picks a fresh country, calls mcp__weather__get_weather"],
    ["6","flower-fetcher", "LOOP: finds national flower image, saves to output/country-images/"],
    ["7","page-injector",  "LOOP: inserts <article class=\"country-card\"> into output/index.html"],
    ["8","reporter",       "Reads run log → writes output/report.html (themed timeline)"],
  ];

  agents.forEach(([num,name,desc],i) => {
    const y = 1.35 + i * 0.62;
    const isLoop = ["5","6","7"].includes(num);
    const fill = isLoop ? C.pastelMid : C.white;
    s.addShape(pptx.ShapeType.roundRect,{x:0.3,y,w:7.3,h:0.54,fill:{color:fill},line:{color:C.codeBorder,pt:0.8},rectRadius:0.07});
    badge(s,num,0.38,y+0.11);
    s.addText(name,{x:0.92,y,w:2.1,h:0.54,fontSize:11,bold:true,color:C.pink,fontFace:FH,valign:"middle"});
    s.addText(desc,{x:3.05,y,w:4.45,h:0.54,fontSize:10.5,color:C.dark,fontFace:FB,valign:"middle"});
  });

  // Code box (right half) — weather-fetcher .md snippet
  s.addText("Agent definition (.md) — weather-fetcher:",{
    x:7.9,y:1.35,w:5.15,h:0.3,fontSize:10.5,bold:true,color:C.mid,fontFace:FH,
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
    7.9, 1.68, 5.15, 3.5, {fontSize:9.5}
  );

  s.addText("Agent definition (.md) — page-injector:",{
    x:7.9,y:5.28,w:5.15,h:0.28,fontSize:10.5,bold:true,color:C.mid,fontFace:FH,
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
    7.9, 5.58, 5.15, 1.58, {fontSize:9.5}
  );

  footer(s);
}

// ── SLIDE 4 — The Pipeline ────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bg(s);
  titleBar(s,"The Pipeline","8 sequential steps — the loop (5→6→7) runs ×5 before step 8");

  const steps = [
    {n:"1",label:"content-checker", note:"Q&A if missing",   loop:false},
    {n:"2",label:"translator",      note:"EN→ZH/MS/TA",      loop:false},
    {n:"3",label:"image-fetcher",   note:"→ images/",        loop:false},
    {n:"4",label:"html-generator",  note:"→ index.html",     loop:false},
    {n:"5",label:"weather-fetcher", note:"loop ×5",          loop:true },
    {n:"6",label:"flower-fetcher",  note:"loop ×5",          loop:true },
    {n:"7",label:"page-injector",   note:"loop ×5",          loop:true },
    {n:"8",label:"reporter",        note:"→ report.html",    loop:false},
  ];

  const bw=3.0, bh=0.6, gx=0.22, gy=0.42, cols=4;
  const sx=0.3, sy=1.35;

  steps.forEach((st,i)=>{
    const c=i%cols, r=Math.floor(i/cols);
    const x=sx+c*(bw+gx), y=sy+r*(bh+gy);
    const fill = st.loop ? C.pinkLight : C.pastelMid;
    const tc   = st.loop ? C.white : C.dark;

    s.addShape(pptx.ShapeType.roundRect,{x,y,w:bw,h:bh,fill:{color:fill},line:{color:C.pinkLight,pt:1.5},rectRadius:0.1});
    badge(s,st.n,x+0.1,y+0.13);
    s.addText(st.label,{x:x+0.65,y:y+0.05,w:bw-0.75,h:0.32,fontSize:11.5,bold:true,color:tc,fontFace:FH,valign:"bottom"});
    s.addText(st.note, {x:x+0.65,y:y+0.34,w:bw-0.75,h:0.24,fontSize:10,color:st.loop?"FFE0EF":C.mid,fontFace:FB,italic:true});

    // right-arrow between steps in same row (not last in row / last step)
    if(c<cols-1 && i<steps.length-1){
      s.addShape(pptx.ShapeType.rect,{x:x+bw,y:y+bh/2-0.02,w:gx,h:0.04,fill:{color:C.pinkLight},line:{color:C.pinkLight}});
    }
  });

  // Loop bracket
  s.addShape(pptx.ShapeType.roundRect,{
    x:0.25,y:3.38,w:12.85,h:1.06,
    fill:{type:"none"}, line:{color:C.pink,pt:2}, rectRadius:0.1,
  });
  s.addText("LOOP ×5  —  all three agents run per iteration before starting the next",{
    x:0.32,y:3.28,w:7.0,h:0.28,
    fontSize:10,bold:true,color:C.pink,fontFace:FH,fill:{color:C.pastel},
  });

  // Down arrow between rows
  for(let c2=0;c2<cols;c2++){
    const x=sx+c2*(bw+gx)+bw/2-0.02;
    s.addShape(pptx.ShapeType.rect,{x,y:sy+bh,w:0.04,h:gy,fill:{color:C.pinkLight},line:{color:C.pinkLight}});
  }

  footer(s);
}

// ── SLIDE 5 — The Loop ────────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bg(s);
  titleBar(s,"The Loop — Showcase Feature","Agents 5→6→7 in strict order, 5 times — chained state, no batching");

  // Grid: 5 columns × 3 rows
  const iters=["Iter 1","Iter 2","Iter 3","Iter 4","Iter 5"];
  const rowLabels=["5. weather-fetcher","6. flower-fetcher","7. page-injector"];
  const rowFills=[C.pastelMid,"F7C6DF",C.pinkLight];
  const rowTxt  =[C.dark,C.dark,C.white];
  const cw=2.28, rh=0.68, sx=0.42;

  // Column headers
  iters.forEach((label,ci)=>{
    const x=sx+ci*(cw+0.14);
    s.addShape(pptx.ShapeType.roundRect,{x,y:1.32,w:cw,h:0.38,fill:{color:C.pink},line:{color:C.pink},rectRadius:0.07});
    s.addText(label,{x,y:1.32,w:cw,h:0.38,fontSize:12,bold:true,color:C.white,fontFace:FH,align:"center",valign:"middle"});
  });

  rowLabels.forEach((rl,ri)=>{
    const y=1.8+ri*(rh+0.18);
    iters.forEach((_,ci)=>{
      const x=sx+ci*(cw+0.14);
      s.addShape(pptx.ShapeType.roundRect,{x,y,w:cw,h:rh,fill:{color:rowFills[ri]},line:{color:C.pinkLight,pt:1},rectRadius:0.08});
      s.addText(rl,{x,y,w:cw,h:rh,fontSize:10.5,color:rowTxt[ri],fontFace:FB,align:"center",valign:"middle"});
    });
    if(ri<rowLabels.length-1){
      iters.forEach((_,ci)=>{
        const x=sx+ci*(cw+0.14)+cw/2-0.02;
        s.addShape(pptx.ShapeType.rect,{x,y:y+rh,w:0.04,h:0.18,fill:{color:C.pinkLight},line:{color:C.pinkLight}});
      });
    }
  });

  // Code box — orchestrator loop snippet
  s.addText("Orchestrator loop (src/orchestrator.ts):",{
    x:0.4,y:4.62,w:7,h:0.28,fontSize:10.5,bold:true,color:C.mid,fontFace:FH,
  });
  codeBox(s,
`const usedCountries = [];

for (let i = 1; i <= 5; i++) {
  // Agent 5: pass already-used list → picks a fresh country
  const weather = await step(agents.weatherFetcher,
    \`Loop \${i}/5 — pick a fresh country\`,
    \`already_used_countries = \${JSON.stringify(usedCountries)}\`);

  usedCountries.push(weather.country); // orchestrator owns uniqueness

  // Agent 6: uses the country name from weather output
  const flower = await step(agents.flowerFetcher,
    \`Loop \${i}/5 — flower for \${weather.country}\`,
    \`Country: \${weather.country}\`);

  // Agent 7: injects a card into output/index.html
  await step(agents.pageInjector, \`Loop \${i}/5 — inject card\`,
    \`Weather: \${JSON.stringify(weather)}\nFlower: \${JSON.stringify(flower)}\`);
}`,
    0.4, 4.94, 12.55, 2.14, {fontSize:9.5}
  );

  footer(s);
}

// ── SLIDE 6 — Two Execution Paths ────────────────────────────────────────────
{
  const s = pptx.addSlide(); bg(s);
  titleBar(s,"Two Execution Paths — One Source of Truth",".claude/agents/*.md drives both paths — one edit, zero duplication");

  // Central source box
  s.addShape(pptx.ShapeType.roundRect,{x:4.35,y:1.38,w:4.65,h:0.72,fill:{color:C.pastelMid},line:{color:C.pink,pt:2},rectRadius:0.1});
  s.addText(".claude/agents/*.md",{x:4.35,y:1.38,w:4.65,h:0.72,fontSize:15,bold:true,color:C.pink,fontFace:FH,align:"center",valign:"middle"});
  s.addText("canonical sub-agent definitions",{x:4.35,y:2.1,w:4.65,h:0.26,fontSize:10,color:C.mid,fontFace:FB,italic:true,align:"center"});

  // Connectors
  const connY=1.74;
  s.addShape(pptx.ShapeType.rect,{x:2.95,y:connY,w:1.4,h:0.04,fill:{color:C.pinkLight},line:{color:C.pinkLight}});
  s.addShape(pptx.ShapeType.rect,{x:2.95,y:connY,w:0.04,h:1.18,fill:{color:C.pinkLight},line:{color:C.pinkLight}});
  s.addShape(pptx.ShapeType.rect,{x:9.0,y:connY,w:1.4,h:0.04,fill:{color:C.pinkLight},line:{color:C.pinkLight}});
  s.addShape(pptx.ShapeType.rect,{x:10.36,y:connY,w:0.04,h:1.18,fill:{color:C.pinkLight},line:{color:C.pinkLight}});

  // Left path
  s.addShape(pptx.ShapeType.roundRect,{x:0.3,y:2.96,w:5.6,h:1.38,fill:{color:C.codeBack},line:{color:C.pinkLight,pt:1.5},rectRadius:0.1});
  s.addText("Claude Code  /build-page",{x:0.45,y:3.02,w:5.3,h:0.42,fontSize:14,bold:true,color:C.pink,fontFace:FH,valign:"middle"});
  s.addText("Uses the Task tool to delegate each step\nPermissions: .claude/settings.json",{x:0.45,y:3.45,w:5.3,h:0.82,fontSize:11,color:C.dark,fontFace:FB});

  // Right path
  s.addShape(pptx.ShapeType.roundRect,{x:7.45,y:2.96,w:5.6,h:1.38,fill:{color:C.codeBack},line:{color:C.pinkLight,pt:1.5},rectRadius:0.1});
  s.addText("Standalone TS  npm run start",{x:7.6,y:3.02,w:5.3,h:0.42,fontSize:14,bold:true,color:C.pink,fontFace:FH,valign:"middle"});
  s.addText("Claude Agent SDK  ·  permissionMode: bypassPermissions\nsrc/lib/agentLoader.ts parses gray-matter frontmatter",{x:7.6,y:3.45,w:5.3,h:0.82,fontSize:11,color:C.dark,fontFace:FB});

  // agentLoader code
  s.addText("src/lib/agentLoader.ts — how agent .md files are loaded:",{
    x:0.35,y:4.52,w:9,h:0.28,fontSize:10.5,bold:true,color:C.mid,fontFace:FH,
  });
  codeBox(s,
`import matter from "gray-matter";

export async function loadAgent(name) {
  const raw    = await readFile(\`.claude/agents/\${name}.md\`, "utf8");
  const parsed = matter(raw);        // splits YAML frontmatter from body

  return {
    name:         parsed.data.name ?? name,
    description:  parsed.data.description ?? "",
    tools:        parsed.data.tools ?? [],   // tool whitelist
    systemPrompt: parsed.content.trim(),     // body = system prompt text
  };
}`,
    0.35, 4.84, 12.65, 2.28, {fontSize:9.5}
  );

  footer(s);
}

// ── SLIDE 7 — MCP Integration ─────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bg(s);
  titleBar(s,"MCP Integration","Model Context Protocol — agents call tools, never fetch() directly. Swap a source = edit one file.");

  const rows=[
    ["MCP Server","Tool(s)","Data Source","Purpose"],
    ["weather",
     "get_weather(country)\nlist_countries()",
     "Open-Meteo\n(free, no API key)",
     "Geocode country capital → live temperature, wind, conditions"],
    ["images",
     "search_image(query, save_path)",
     "Wikipedia REST API\n(free, no API key)",
     "OpenSearch → page summary → download originalimage to disk"],
  ];

  s.addTable(rows,{
    x:0.3,y:1.32,w:12.75,
    fontSize:11.5,fontFace:FB,color:C.dark,
    rowH:[0.42,0.72,0.72],
    align:"left",valign:"middle",
    border:{type:"solid",color:C.pastelMid,pt:1},
    fill:C.white,
    colW:[1.3,2.95,2.2,6.3],
  });
  s.addShape(pptx.ShapeType.rect,{x:0.3,y:1.32,w:12.75,h:0.42,fill:{color:C.pink},line:{color:C.pink}});
  s.addText("Server          Tool(s)                    Data Source           Purpose",{
    x:0.5,y:1.35,w:12.55,h:0.38,fontSize:12,bold:true,color:C.white,fontFace:FH,valign:"middle",
  });

  // Registration boxes
  const regItems=[
    [".claude/settings.json",  "Claude Code path — MCP server config + bash whitelist: mkdir, rm, ls, open, mcp__weather, mcp__images"],
    ["src/lib/runAgent.ts",    "Standalone path — spawns each MCP server as a stdio child process via  npx tsx  mcp-servers/<name>/src/index.ts"],
  ];
  regItems.forEach(([f,d],i)=>{
    const y=3.6+i*0.72;
    s.addShape(pptx.ShapeType.roundRect,{x:0.3,y,w:12.75,h:0.62,fill:{color:C.codeBack},line:{color:C.codeBorder,pt:1},rectRadius:0.08});
    s.addText(f,{x:0.48,y,w:3.1,h:0.62,fontSize:11,bold:true,color:C.pink,fontFace:FM,valign:"middle"});
    s.addText(d,{x:3.7,y,w:9.2,h:0.62,fontSize:11,color:C.dark,fontFace:FB,valign:"middle"});
  });

  // MCP server code snippet
  s.addText("mcp-servers/weather/src/index.ts — how a tool is declared and handled:",{
    x:0.35,y:5.12,w:12.65,h:0.28,fontSize:10.5,bold:true,color:C.mid,fontFace:FH,
  });
  codeBox(s,
`// 1. Declare tools this MCP server exposes
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{ name: "get_weather",
            description: "Fetch current weather for a country capital.",
            inputSchema: { type:"object", properties:{ country:{type:"string"} }, required:["country"] } }]
}));

// 2. Handle a tool call from an agent
server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const geo  = await geocode(req.params.arguments.country);  // Open-Meteo geocoding
  const data = await fetchWeather(geo.latitude, geo.longitude); // Open-Meteo forecast
  return { content: [{ type:"text", text: JSON.stringify(data) }] };
});

// 3. Serve over stdio — agents connect via npx tsx
await server.connect(new StdioServerTransport());`,
    0.35, 5.44, 12.65, 1.72, {fontSize:9.5}
  );

  footer(s);
}

// ── SLIDE 8 — Four-Language Layout ───────────────────────────────────────────
{
  const s = pptx.addSlide(); bg(s);
  titleBar(s,"Four-Language Layout","Every section (intro / body / footer) rendered in 4 languages side-by-side");

  const langs=[
    {code:"en",name:"English",  script:"Latin",  sample:"Welcome to our page…"},
    {code:"zh",name:"Chinese",  script:"简体中文",sample:"欢迎来到我们的页面…"},
    {code:"ms",name:"Malay",    script:"Latin",  sample:"Selamat datang ke…"},
    {code:"ta",name:"Tamil",    script:"தமிழ்",  sample:"வரவேற்கிறோம்…"},
  ];

  langs.forEach((l,i)=>{
    const x=0.3+i*3.25;
    s.addShape(pptx.ShapeType.roundRect,{x,y:1.32,w:3.08,h:3.6,fill:{color:C.codeBack},line:{color:C.pinkLight,pt:1.5},rectRadius:0.1});
    badge(s,l.code,x+0.1,1.42);
    s.addText(l.name,{x:x+0.65,y:1.42,w:2.3,h:0.32,fontSize:12,bold:true,color:C.pink,fontFace:FH,valign:"middle"});
    s.addText(l.script,{x:x+0.1,y:1.8,w:2.88,h:0.28,fontSize:10,color:C.mid,fontFace:FB,italic:true});
    s.addShape(pptx.ShapeType.rect,{x:x+0.1,y:2.13,w:2.88,h:0.02,fill:{color:C.pastelMid},line:{color:C.pastelMid}});
    s.addText(`"${l.sample}"`,{x:x+0.1,y:2.18,w:2.88,h:1.58,fontSize:11,color:C.dark,fontFace:FB,italic:true,wrap:true});
  });

  s.addText("Translator output contract (.claude/agents/translator.md):",{
    x:0.35,y:5.02,w:12.65,h:0.28,fontSize:10.5,bold:true,color:C.mid,fontFace:FH,
  });
  codeBox(s,
`// Agent #2 returns this JSON — all four languages per section
{
  "intro":  { "en": "Welcome to...", "zh": "欢迎来到...", "ms": "Selamat datang...", "ta": "வரவேற்கிறோம்..." },
  "body":   { "en": "...",           "zh": "...",          "ms": "...",               "ta": "..." },
  "footer": { "en": "Thank you...",  "zh": "谢谢...",      "ms": "Terima kasih...",   "ta": "நன்றி..." }
}

// Agent #4 (html-generator) renders each section in a 4-column grid with lang= attributes:
// <div lang="en">...</div>  <div lang="zh">...</div>  <div lang="ms">...</div>  <div lang="ta">...</div>`,
    0.35, 5.34, 12.65, 1.72, {fontSize:9.5}
  );

  footer(s);
}

// ── SLIDE 9 — The Run Report ──────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bg(s);
  titleBar(s,"The Run Report","Agent #8 writes output/report.html — a themed timeline of every step");

  codeBox(s,
`// RunLogEntry — appended after every agent call (src/lib/types.ts)
{
  step:        1,
  agent:       "content-checker",
  started_at:  "2026-04-30T08:42:11Z",
  finished_at: "2026-04-30T08:42:14Z",
  duration_ms: 3120,
  description: "Validate intro/body/footer in user requirements",
  result:      { status:"complete", sections:{ intro:"...", body:"...", footer:"..." } }
}`,
    0.35, 1.32, 7.3, 2.5, {fontSize:9.5}
  );

  const features=[
    "Total wall-clock time + agent count in summary card",
    "Loop iterations grouped (5/6/7 nested under \"Iteration N\")",
    "Raw result JSON in collapsible <details> blocks",
    "Self-contained HTML — no external dependencies",
    "Pink + pastel theme matches output/index.html",
    "Scroll through live in a demo to show exactly what each agent did",
  ];
  features.forEach((f,i)=>{
    const y=1.38+i*0.72;
    s.addShape(pptx.ShapeType.ellipse,{x:7.9,y:y+0.08,w:0.26,h:0.26,fill:{color:C.pink},line:{color:C.pink}});
    s.addText(f,{x:8.25,y,w:4.9,h:0.58,fontSize:12,color:C.dark,fontFace:FB,valign:"middle"});
  });

  // Reporter call
  s.addText("How agent #8 is invoked (orchestrator):",{
    x:0.35,y:3.98,w:12.65,h:0.28,fontSize:10.5,bold:true,color:C.mid,fontFace:FH,
  });
  codeBox(s,
`// After all 5 loop iterations complete, the full run_log is passed to the reporter:
await step(agents.reporter,
  "Generate output/report.html from run log",
  \`Theme it pink + pastel for visual consistency.\\nrun_log = \${JSON.stringify(runLog, null, 2)}\`
);`,
    0.35, 4.3, 12.65, 1.22, {fontSize:9.5}
  );

  footer(s);
}

// ── SLIDE 10 — File Map ───────────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bg(s);
  titleBar(s,"File Map","output/ is gitignored — template repo stays clean across runs");

  codeBox(s,
`myAgentTeam/
├── .claude/
│   ├── agents/               ← 8 sub-agent .md files  (content-checker, translator, image-fetcher,
│   │                            html-generator, weather-fetcher, flower-fetcher, page-injector, reporter)
│   ├── commands/             ← /build-page  ·  /reset  slash commands
│   └── settings.json         ← MCP server registration + Claude Code permission whitelist
├── src/
│   ├── orchestrator.ts       ← standalone pipeline entry point
│   └── lib/
│       ├── agentLoader.ts    ← gray-matter parser  →  AgentDefinition
│       ├── runAgent.ts       ← Claude Agent SDK wrapper  (permissionMode: bypassPermissions)
│       ├── prompt.ts         ← readline helper for interactive Q&A
│       └── types.ts          ← shared TypeScript interfaces
├── mcp-servers/
│   ├── weather/src/index.ts  ← Open-Meteo MCP  (get_weather, list_countries)
│   └── images/src/index.ts   ← Wikipedia MCP   (search_image)
├── scripts/
│   ├── reset.ts              ← wipes output/ only — source code untouched
│   └── gen-ppt-v2.mjs        ← this PowerPoint generator
├── package.json              ← scripts: start · reset · build:all · mcp:weather · mcp:images
├── tsconfig.json
├── output/                   ← generated artifacts  (gitignored)
│   ├── index.html            ←   the webpage
│   ├── report.html           ←   agent run report
│   ├── images/               ←   page images  (agent 3)
│   └── country-images/       ←   national flower images  (agent 6)
├── CLAUDE.md  ·  myArchitecture.md  ·  README.md`,
    0.3, 1.32, 12.75, 5.78, {fontSize:10.2}
  );

  footer(s);
}

// ── SLIDE 11 — Key Takeaways ──────────────────────────────────────────────────
{
  const s = pptx.addSlide(); bg(s);
  titleBar(s,"Key Takeaways");

  const items=[
    ["1","Sub-agents are first-class.",
         "Each agent owns one responsibility, has its own system prompt, and returns strict JSON. No agent has more tool access than its job needs."],
    ["2","MCP isolates the external boundary.",
         "Switching data providers never requires editing agent definitions. Change one MCP server file — zero blast radius."],
    ["3","The loop demonstrates chained state.",
         "Each iteration's output feeds the next agent. The pattern generalises to any \"for each X, run sub-pipeline\" workflow."],
    ["4","Uniqueness is the orchestrator's job.",
         "already_used_countries is maintained by the orchestrator and passed to weather-fetcher each iteration — not the agent's concern."],
    ["5","One source of truth, two execution paths.",
         "The same .claude/agents/*.md files drive Claude Code and the standalone TypeScript orchestrator — no duplication."],
    ["6","Agent .md files are self-contained.",
         "YAML frontmatter = tool whitelist. File body = system prompt. One edit changes behaviour on both execution paths everywhere."],
    ["7","Built for repetition.",
         "/reset clears output/ in seconds. Source code is never touched. Ready for the next audience immediately."],
  ];

  const perCol=4, colW=6.28;
  items.forEach((item,i)=>{
    const col=Math.floor(i/perCol), row=i%perCol;
    const x=0.28+col*(colW+0.22), y=1.35+row*1.48;

    s.addShape(pptx.ShapeType.roundRect,{x,y,w:colW,h:1.32,fill:{color:C.codeBack},line:{color:C.codeBorder,pt:0.8},rectRadius:0.1});
    s.addShape(pptx.ShapeType.ellipse,{x:x+0.1,y:y+0.1,w:0.44,h:0.44,fill:{color:C.pink},line:{color:C.pink}});
    s.addText(item[0],{x:x+0.1,y:y+0.1,w:0.44,h:0.44,fontSize:13,bold:true,color:C.white,fontFace:FH,align:"center",valign:"middle"});
    s.addText(item[1],{x:x+0.62,y:y+0.08,w:colW-0.72,h:0.4,fontSize:12,bold:true,color:C.pink,fontFace:FH,valign:"middle"});
    s.addText(item[2],{x:x+0.1,y:y+0.5,w:colW-0.2,h:0.76,fontSize:10.5,color:C.dark,fontFace:FB});
  });

  footer(s);
}

// ── Write file ─────────────────────────────────────────────────────────────────
const out="output/PetalPress-Architecture.pptx";
await pptx.writeFile({fileName:out});
console.log(`✅  Saved: ${out}`);
