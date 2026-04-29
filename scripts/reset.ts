/**
 * Reset script — wipe generated artifacts so the template is clean for the
 * next demo. Source code (src/, mcp-servers/, .claude/, package.json, etc.)
 * is untouched.
 *
 * Usage: `npm run reset`
 */
import { rm, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const ROOT = process.cwd();
const TARGETS = [
  "output/index.html",
  "output/report.html",
  "output/images",
  "output/country-images",
];

async function main(): Promise<void> {
  console.log("🌸 PetalPress reset — clearing generated artifacts...\n");

  for (const rel of TARGETS) {
    const path = resolve(ROOT, rel);
    try {
      await rm(path, { recursive: true, force: true });
      console.log(`  removed: ${rel}`);
    } catch (err) {
      console.warn(`  skip:    ${rel} (${err instanceof Error ? err.message : err})`);
    }
  }

  // Recreate the empty image directories so subsequent runs find them.
  await mkdir(resolve(ROOT, "output/images"), { recursive: true });
  await mkdir(resolve(ROOT, "output/country-images"), { recursive: true });

  console.log("\n✓ Output cleared. Source code is untouched.");
  console.log("  Run `/build-page` (Claude Code) or `npm run start` to regenerate.");
}

main().catch((err) => {
  console.error("✖ reset failed:", err);
  process.exit(1);
});
