import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

interface OpenSearchResponse extends Array<unknown> {
  0: string;
  1: string[];
  2: string[];
  3: string[];
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

async function downloadImage(imageUrl: string, savePath: string): Promise<void> {
  const fixedUrl = imageUrl.startsWith("http") ? imageUrl : "https:" + imageUrl;
  
  const res = await fetch(fixedUrl, { 
    headers: { "User-Agent": USER_AGENT },
    redirect: "follow"
  });
  if (!res.ok) throw new Error(`Image download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(dirname(savePath), { recursive: true });
  await writeFile(savePath, buf);
}

async function searchAndDownload(query: string, savePath: string): Promise<any> {
  const title = await wikiSearch(query);
  if (!title) {
    throw new Error(`No Wikipedia results for query: ${query}`);
  }

  console.log(`  Found article: "${title}"`);
  const summary = await wikiSummary(title);
  
  let imageUrl = summary.originalimage?.source;
  if (!imageUrl) {
    imageUrl = summary.thumbnail?.source;
  }
  
  if (!imageUrl) {
    throw new Error(`No image available on page: ${title}`);
  }

  console.log(`  Downloading...`);
  const absPath = resolve(process.cwd(), savePath);
  await downloadImage(imageUrl, absPath);

  return {
    path: savePath,
    query,
    source_url: summary.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    attribution: `Image from Wikipedia article "${title}"`,
  };
}

async function main() {
  const images = [];
  const queries = [
    { query: "Proton", path: "output/images/hero.jpg" },
    { query: "Proton Holdings", path: "output/images/body-1.jpg" },
    { query: "Proton Saga", path: "output/images/body-2.jpg" },
  ];

  for (const { query, path } of queries) {
    try {
      console.log(`\nFetching image for: "${query}"...`);
      const result = await searchAndDownload(query, path);
      images.push(result);
      console.log(`✓ Saved: ${path}`);
    } catch (err) {
      console.error(`✗ Failed: ${err}`);
      // Try alternate query for this slot
      if (query === "Proton Saga") {
        try {
          console.log(`  Trying alternate: "Malaysian automobile industry"...`);
          const result = await searchAndDownload("Malaysian automobile industry", path);
          images.push(result);
          console.log(`✓ Saved: ${path}`);
        } catch (err2) {
          console.error(`✗ Alternate also failed: ${err2}`);
        }
      }
    }
  }

  console.log("\n" + JSON.stringify({ images }, null, 2));
}

main();
