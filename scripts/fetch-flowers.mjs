import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const USER_AGENT = 'PetalPress/0.1 (educational demo)';

async function wikiSearch(query) {
  const url = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + encodeURIComponent(query) + '&limit=5&namespace=0&format=json&origin=*';
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  const data = await res.json();
  return data[1]?.[0] ?? null;
}

async function wikiSummary(title) {
  const url = 'https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title);
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  return await res.json();
}

function pickImageUrl(summary) {
  // Prefer originalimage to avoid broken thumbnail URL rewrites
  if (summary.originalimage?.source) return summary.originalimage.source;
  return summary.thumbnail?.source ?? null;
}

async function downloadImage(imageUrl, savePath) {
  const res = await fetch(imageUrl, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${imageUrl}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(path.dirname(savePath), { recursive: true });
  await writeFile(savePath, buf);
  return buf.byteLength;
}

const flowers = [
  { country: 'Malaysia', query: 'Hibiscus rosa-sinensis', slug: 'malaysia' },
  { country: 'Germany', query: 'Cornflower Centaurea cyanus Germany', slug: 'germany' },
  { country: 'South Korea', query: 'Hibiscus syriacus Mugunghwa', slug: 'south-korea' },
  { country: 'Australia', query: 'Acacia pycnantha golden wattle', slug: 'australia' },
  { country: 'Morocco', query: 'Rosa centifolia cabbage rose', slug: 'morocco' },
];

const delay = ms => new Promise(r => setTimeout(r, ms));

for (const f of flowers) {
  try {
    const title = await wikiSearch(f.query);
    if (!title) throw new Error(`No Wikipedia result for: ${f.query}`);
    await delay(1000);
    const summary = await wikiSummary(title);
    const imgUrl = pickImageUrl(summary);
    if (!imgUrl) throw new Error(`No image for: ${title}`);
    const savePath = `output/country-images/${f.slug}.jpg`;
    const bytes = await downloadImage(imgUrl, savePath);
    const sourceUrl = summary.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
    console.log(JSON.stringify({ country: f.country, flower_name: title, path: savePath, source_url: sourceUrl, bytes }));
    await delay(1000);
  } catch (e) {
    console.error(`ERROR ${f.country}: ${e.message}`);
  }
}
