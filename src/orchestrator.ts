/**
 * PetalPress orchestrator — the standalone TypeScript path.
 *
 * Run via `npm run start`. Reads webpage requirements from CLI args, stdin, or
 * an interactive prompt, then drives the 8-agent pipeline:
 *
 *   1. content-checker
 *   2. translator
 *   3. image-fetcher
 *   4. html-generator
 *   5..7 (loop ×5): weather-fetcher → flower-fetcher → page-injector
 *   8. reporter
 *
 * The loop is deliberately explicit (a `for` loop calling agents 5, 6, 7 in
 * order) so that the orchestration is visible — that's the showcase feature.
 */
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { loadAgent } from "./lib/agentLoader.js";
import { runAgent } from "./lib/runAgent.js";
import { ask } from "./lib/prompt.js";
import type {
  AgentDefinition,
  ContentCheckResult,
  ContentSections,
  CountryFlower,
  CountryWeather,
  RunLogEntry,
  TranslatedSections,
  FetchedImage,
} from "./lib/types.js";

const COUNTRY_LOOP_COUNT = 5;

const runLog: RunLogEntry[] = [];

async function step(
  agent: AgentDefinition,
  description: string,
  userPrompt: string,
): Promise<unknown> {
  const stepNum = runLog.length + 1;
  const started = new Date();
  console.log(`\n[${stepNum}] ▶ ${agent.name} — ${description}`);

  const { text, json } = await runAgent(agent, userPrompt);
  const finished = new Date();

  const entry: RunLogEntry = {
    step: stepNum,
    agent: agent.name,
    started_at: started.toISOString(),
    finished_at: finished.toISOString(),
    duration_ms: finished.getTime() - started.getTime(),
    description,
    result: json ?? text,
  };
  runLog.push(entry);

  console.log(`[${stepNum}] ✓ ${agent.name} (${entry.duration_ms} ms)`);
  return json ?? text;
}

async function getInitialRequirements(): Promise<string> {
  // Priority: CLI args > piped stdin > interactive prompt
  const argText = process.argv.slice(2).join(" ").trim();
  if (argText) return argText;

  if (!process.stdin.isTTY) {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
    const piped = Buffer.concat(chunks).toString("utf8").trim();
    if (piped) return piped;
  }

  console.log("PetalPress — describe the webpage you'd like to build.");
  console.log("(Include intro / body / footer ideas. Press Enter when done.)\n");
  return ask("Your requirements: ");
}

async function runContentChecker(
  agent: AgentDefinition,
  initialRequirements: string,
): Promise<ContentSections> {
  let requirements = initialRequirements;

  for (let attempt = 1; attempt <= 3; attempt++) {
    const result = (await step(
      agent,
      attempt === 1
        ? "Validate intro/body/footer in user requirements"
        : `Re-validate requirements after user clarification (attempt ${attempt})`,
      `User requirements:\n\n${requirements}\n\nReturn the JSON object specified in your instructions.`,
    )) as ContentCheckResult | string;

    if (typeof result === "string" || !("status" in (result as object))) {
      throw new Error(
        `content-checker did not return structured JSON. Got: ${String(result).slice(0, 200)}`,
      );
    }

    if (result.status === "complete") return result.sections;

    console.log("\n— content-checker needs more info —");
    const answers: string[] = [];
    for (const q of result.questions) {
      const a = await ask(`  ${q}\n  > `);
      if (a) answers.push(`Q: ${q}\nA: ${a}`);
    }
    requirements = `${requirements}\n\nAdditional information:\n${answers.join("\n\n")}`;
  }

  throw new Error(
    "content-checker still reports missing info after 3 rounds — aborting.",
  );
}

async function main(): Promise<void> {
  console.log("\n🌸 PetalPress — multi-agent webpage builder\n");

  await mkdir(resolve(process.cwd(), "output/images"), { recursive: true });
  await mkdir(resolve(process.cwd(), "output/country-images"), { recursive: true });

  const requirements = await getInitialRequirements();
  if (!requirements) throw new Error("No requirements provided.");

  // Load all agent definitions up front so a missing file fails fast.
  const agents = {
    contentChecker: await loadAgent("content-checker"),
    translator: await loadAgent("translator"),
    imageFetcher: await loadAgent("image-fetcher"),
    htmlGenerator: await loadAgent("html-generator"),
    weatherFetcher: await loadAgent("weather-fetcher"),
    flowerFetcher: await loadAgent("flower-fetcher"),
    pageInjector: await loadAgent("page-injector"),
    reporter: await loadAgent("reporter"),
  };

  // 1. content-checker (with interactive clarification loop)
  const sections = await runContentChecker(agents.contentChecker, requirements);

  // 2. translator
  const translations = (await step(
    agents.translator,
    "Translate sections into zh / ms / ta",
    `Translate these English sections into Chinese (Simplified), Malay, and Tamil. Return the JSON object specified in your instructions.\n\n${JSON.stringify(sections, null, 2)}`,
  )) as TranslatedSections;

  // 3. image-fetcher
  const imagesResult = (await step(
    agents.imageFetcher,
    "Fetch 2-3 page images",
    `Find and download 2-3 images relevant to this webpage. Save them under output/images/. Return the JSON object specified in your instructions.\n\nSections:\n${JSON.stringify(sections, null, 2)}`,
  )) as { images: FetchedImage[] };

  // 4. html-generator
  await step(
    agents.htmlGenerator,
    "Generate output/index.html (pink + pastel theme, 4-language layout)",
    `Generate output/index.html. Use the four-language sections and the fetched images. Leave a country-grid container empty for the loop to fill.\n\nTranslations:\n${JSON.stringify(translations, null, 2)}\n\nImages:\n${JSON.stringify(imagesResult.images, null, 2)}`,
  );

  // 5..7 — the loop (showcase feature)
  const usedCountries: string[] = [];
  for (let i = 1; i <= COUNTRY_LOOP_COUNT; i++) {
    console.log(`\n══════ Loop iteration ${i} of ${COUNTRY_LOOP_COUNT} ══════`);

    // 5. weather-fetcher
    const weather = (await step(
      agents.weatherFetcher,
      `Loop ${i}/5 — pick a fresh country and fetch weather`,
      `already_used_countries = ${JSON.stringify(usedCountries)}\n\nPick ONE country not in that list, fetch its weather via mcp__weather__get_weather, and return the JSON object specified in your instructions.`,
    )) as CountryWeather;

    if (!weather?.country) {
      throw new Error(`weather-fetcher returned no country on iteration ${i}`);
    }
    usedCountries.push(weather.country);

    // 6. flower-fetcher
    const flower = (await step(
      agents.flowerFetcher,
      `Loop ${i}/5 — fetch national flower image for ${weather.country}`,
      `Country: ${weather.country}\n\nFind the national (or representative) flower of this country, download an image via mcp__images__search_image, save under output/country-images/, and return the JSON object specified in your instructions.`,
    )) as CountryFlower;

    // 7. page-injector
    await step(
      agents.pageInjector,
      `Loop ${i}/5 — inject ${weather.country} card into index.html`,
      `Insert a country card into output/index.html for:\n\nWeather:\n${JSON.stringify(weather, null, 2)}\n\nFlower:\n${JSON.stringify(flower, null, 2)}\n\nUse the Edit tool with the country-grid comment marker as your anchor. Return the JSON object specified in your instructions.`,
    );
  }

  // 8. reporter
  await step(
    agents.reporter,
    "Generate output/report.html from run log",
    `Write output/report.html summarising every step of this run. Theme it pink + pastel for visual consistency with index.html.\n\nrun_log = ${JSON.stringify(runLog, null, 2)}`,
  );

  console.log("\n🌸 PetalPress run complete.");
  console.log(`   • output/index.html   — webpage`);
  console.log(`   • output/report.html  — agent run report`);
  console.log(`   • Countries: ${usedCountries.join(", ")}`);
  console.log(`\n   Open output/index.html in a browser to view the page.`);
}

main().catch((err) => {
  console.error("\n✖ PetalPress failed:", err);
  process.exit(1);
});
