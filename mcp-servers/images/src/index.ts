/**
 * PetalPress Images MCP server.
 *
 * Tools:
 *   - search_image(query, save_path)   — find a relevant image and download to disk
 *
 * Data source: Wikipedia REST API (page summary → originalimage / thumbnail).
 * Free, no API key required, attribution-friendly. Swap this file out to change sources.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const USER_AGENT = "PetalPress/0.1 (educational demo; contact: ianyian@gmail.com)";

interface OpenSearchResponse extends Array<unknown> {
  0: string;        // query
  1: string[];      // titles
  2: string[];      // descriptions
  3: string[];      // urls
}

interface PageSummary {
  title: string;
  description?: string;
  originalimage?: { source: string; width: number; height: number };
  thumbnail?: { source: string; width: number; height: number };
  content_urls?: { desktop?: { page?: string } };
}

async function wikiSearch(query: string): Promise<string | null> {
  const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
    query,
  )}&limit=5&namespace=0&format=json`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Wikipedia search failed: ${res.status}`);
  const data = (await res.json()) as OpenSearchResponse;
  return data[1]?.[0] ?? null;
}

async function wikiSummary(title: string): Promise<PageSummary> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Wikipedia summary failed: ${res.status}`);
  return (await res.json()) as PageSummary;
}

/**
 * Pick a sensibly-sized image URL for an embedded webpage.
 *
 * Wikimedia thumbnail URLs follow a predictable pattern:
 *   .../thumb/<a>/<b>/<file>/<W>px-<file>
 * We rewrite <W> to the desired width when possible so the page doesn't
 * embed multi-megabyte originals. Falls back to the thumbnail as-is if the
 * URL doesn't match, and finally to the original image.
 */
function pickImageUrl(summary: PageSummary, targetWidth: number): string | null {
  const thumb = summary.thumbnail?.source;
  if (thumb) {
    const m = thumb.match(/^(.+\/)(\d+)px-([^/]+)$/);
    if (m) return `${m[1]}${targetWidth}px-${m[3]}`;
    return thumb;
  }
  return summary.originalimage?.source ?? null;
}

async function downloadImage(imageUrl: string, savePath: string): Promise<number> {
  const res = await fetch(imageUrl, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Image download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(dirname(savePath), { recursive: true });
  await writeFile(savePath, buf);
  return buf.byteLength;
}

const server = new Server(
  { name: "petalpress-images", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "search_image",
      description:
        "Find an image matching the query (via Wikipedia / Wikimedia Commons) and download it to save_path. Returns the local path, source URL, and attribution string.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Short search phrase, e.g. 'cherry blossom', 'national flower of Malaysia', 'tropical rainforest'.",
          },
          save_path: {
            type: "string",
            description:
              "Path (relative to cwd) where the image should be saved, e.g. 'output/images/hero.jpg' or 'output/country-images/japan.jpg'.",
          },
        },
        required: ["query", "save_path"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name !== "search_image") throw new Error(`Unknown tool: ${name}`);

    const query = String((args as { query?: string })?.query ?? "").trim();
    const savePath = String((args as { save_path?: string })?.save_path ?? "").trim();
    if (!query) throw new Error("Missing required argument: query");
    if (!savePath) throw new Error("Missing required argument: save_path");

    const title = await wikiSearch(query);
    if (!title) {
      throw new Error(`No Wikipedia results for query: ${query}`);
    }

    const summary = await wikiSummary(title);
    const imageUrl = pickImageUrl(summary, 800);
    if (!imageUrl) {
      throw new Error(`No image available on page: ${title}`);
    }

    const absPath = resolve(process.cwd(), savePath);
    const bytes = await downloadImage(imageUrl, absPath);

    const result = {
      path: savePath,
      bytes,
      source_title: title,
      source_url: summary.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      attribution: `Image from Wikipedia article "${title}" — see ${summary.content_urls?.desktop?.page ?? ""} for license details.`,
      query,
    };

    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      isError: true,
      content: [{ type: "text", text: JSON.stringify({ error: message }) }],
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
