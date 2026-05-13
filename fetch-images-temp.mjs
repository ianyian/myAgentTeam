import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function wikiSearch(query) {
  const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&namespace=0&format=json`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  const data = await res.json();
  return data[1]?.[0] ?? null;
}

async function wikiSummary(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Summary API failed: ${res.status}`);
  return await res.json();
}

async function fetchImage(query, savePath) {
  try {
    const title = await wikiSearch(query);
    if (!title) throw new Error(`No results for ${query}`);
    const summary = await wikiSummary(title);
    const imgUrl = summary.originalimage?.source;
    if (!imgUrl) throw new Error(`No image for ${title}`);
    const res = await fetch(imgUrl, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`Download failed: ${res.status} for ${imgUrl}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await mkdir(dirname(savePath), { recursive: true });
    await writeFile(savePath, buf);
    const sourceUrl = summary.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
    const attribution = `Wikipedia: ${title}`;
    console.log(JSON.stringify({ path: savePath, query, source_url: sourceUrl, attribution, bytes: buf.byteLength }));
    return { path: savePath, query, source_url: sourceUrl, attribution };
  } catch(e) {
    console.error(`FAILED [${query}]: ${e.message}`);
    return null;
  }
}

const jobs = [
  ['Ford Mustang', 'output/images/hero.jpg'],
  ['Ford Model T', 'output/images/body-1.jpg'],
  ['Ford F-Series', 'output/images/body-2.jpg'],
];

const results = [];
for (const [q, p] of jobs) {
  const r = await fetchImage(q, p);
  if (r) results.push(r);
}
console.log('FINAL_RESULTS:' + JSON.stringify(results));