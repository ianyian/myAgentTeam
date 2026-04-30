import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const UA = "PetalPress/0.1 (educational demo; contact: ianyian@gmail.com)";

async function wikiSearch(query) {
  const url = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" + encodeURIComponent(query) + "&limit=5&namespace=0&format=json";
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  const data = await res.json();
  return data[1]?.[0] ?? null;
}

async function wikiSummary(title) {
  const url = "https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title);
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  return await res.json();
}

function pickImageUrl(summary, w) {
  const thumb = summary.thumbnail?.source;
  if (thumb) {
    const m = thumb.match(/^(.+\/)(\d+)px-([^/]+)$/);
    if (m) return m[1] + w + "px-" + m[3];
    return thumb;
  }
  return summary.originalimage?.source ?? null;
}

async function fetchAndSave(query, savePath) {
  try {
    const title = await wikiSearch(query);
    if (!title) throw new Error("No results for: " + query);
    const summary = await wikiSummary(title);
    const imageUrl = pickImageUrl(summary, 800);
    if (!imageUrl) throw new Error("No image on page: " + title);
    const res = await fetch(imageUrl, { headers: { "User-Agent": UA } });
    const buf = Buffer.from(await res.arrayBuffer());
    const abs = resolve(process.cwd(), savePath);
    await mkdir(dirname(abs), { recursive: true });
    await writeFile(abs, buf);
    const sourceUrl = summary.content_urls?.desktop?.page ?? ("https://en.wikipedia.org/wiki/" + encodeURIComponent(title));
    return { path: savePath, query, source_url: sourceUrl, attribution: 'Image from Wikipedia article "' + title + '" — see ' + sourceUrl + ' for license details.', bytes: buf.byteLength };
  } catch(e) {
    return { path: savePath, query, error: e.message };
  }
}

const results = await Promise.all([
  fetchAndSave("Proton Saga Malaysia", "output/images/hero.jpg"),
  fetchAndSave("Proton car Malaysia", "output/images/body-1.jpg"),
  fetchAndSave("Proton X70 SUV", "output/images/body-2.jpg"),
]);
console.log(JSON.stringify(results, null, 2));
