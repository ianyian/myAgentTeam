import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const UA = "PetalPress/0.1 (educational demo; contact: demo@example.com)";

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function wikiSearch(query) {
  await sleep(1000);
  const url = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" + encodeURIComponent(query) + "&limit=5&namespace=0&format=json";
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  const data = await res.json();
  return data[1]?.[0] ?? null;
}

async function wikiSummary(title) {
  await sleep(1000);
  const url = "https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title);
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  return res.json();
}

function pickImageUrl(summary) {
  return summary.thumbnail?.source ?? summary.originalimage?.source ?? null;
}

async function downloadImage(imageUrl, savePath) {
  await sleep(1500);
  const res = await fetch(imageUrl, { headers: { "User-Agent": UA, "Referer": "https://en.wikipedia.org/" } });
  if (!res.ok) throw new Error("Download failed: " + res.status + " " + imageUrl);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(dirname(savePath), { recursive: true });
  await writeFile(savePath, buf);
  return buf.byteLength;
}

async function fetchImage(query, savePath) {
  try {
    const title = await wikiSearch(query);
    if (!title) { process.stderr.write("No result for: " + query + "\n"); return null; }
    process.stderr.write("Found: " + title + "\n");
    const summary = await wikiSummary(title);
    const imgUrl = pickImageUrl(summary);
    if (!imgUrl) { process.stderr.write("No image for: " + title + "\n"); return null; }
    process.stderr.write("Downloading: " + imgUrl + "\n");
    const bytes = await downloadImage(imgUrl, savePath);
    const sourceUrl = (summary.content_urls?.desktop?.page) ?? ("https://en.wikipedia.org/wiki/" + encodeURIComponent(title));
    const attribution = summary.title + " via Wikipedia / Wikimedia Commons";
    process.stderr.write("OK: " + bytes + " bytes -> " + savePath + "\n");
    return { path: savePath, query, source_url: sourceUrl, attribution };
  } catch(e) {
    process.stderr.write("Error for " + query + ": " + e.message + "\n");
    return null;
  }
}

const r1 = await fetchImage("Durian", "output/images/hero.jpg");
const r2 = await fetchImage("Durio zibethinus", "output/images/body-1.jpg");
const r3 = await fetchImage("Musang King", "output/images/body-2.jpg");

const images = [r1, r2, r3].filter(Boolean);
process.stdout.write(JSON.stringify({ images }, null, 2) + "\n");
