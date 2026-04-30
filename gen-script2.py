script = r'''import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
const UA = "PetalPress/0.1 (educational demo)";
const HDR = {"User-Agent": UA, "Referer": "https://en.wikipedia.org/"};
async function wikiSearch(q) {
  const params = new URLSearchParams({action:"opensearch",search:q,limit:"5",namespace:"0",format:"json"});
  const r = await fetch("https://en.wikipedia.org/w/api.php?" + params, {headers: HDR});
  const d = await r.json();
  return d[1]?.[0] ?? null;
}
async function wikiSummary(t) {
  const r = await fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(t), {headers: HDR});
  return r.json();
}
function pickUrl(s, w) {
  const th = s.thumbnail?.source;
  if (th) {
    const m = th.match(/^(.+\/)([0-9]+)px-([^/]+)$/);
    if (m) return m[1] + w + "px-" + m[3];
    return th;
  }
  return s.originalimage?.source ?? null;
}
async function go(query, savePath) {
  try {
    const title = await wikiSearch(query);
    if (!title) throw new Error("No results: " + query);
    const s = await wikiSummary(title);
    const imgUrl = pickUrl(s, 800);
    if (!imgUrl) throw new Error("No image for: " + title);
    const res = await fetch(imgUrl, {headers: HDR});
    if (!res.ok) throw new Error("Download failed " + res.status + " " + imgUrl);
    const buf = Buffer.from(await res.arrayBuffer());
    const abs = resolve(process.cwd(), savePath);
    await mkdir(dirname(abs), {recursive: true});
    await writeFile(abs, buf);
    const src = s.content_urls?.desktop?.page ?? ("https://en.wikipedia.org/wiki/" + encodeURIComponent(title));
    return {path: savePath, query, source_url: src, attribution: "Wikipedia: " + title, bytes: buf.byteLength};
  } catch(e) { return {path: savePath, query, error: e.message}; }
}
const delay = ms => new Promise(r => setTimeout(r, ms));
const r1 = await go("Proton Saga", "output/images/hero.jpg");
await delay(2000);
const r2 = await go("Proton Holdings", "output/images/body-1.jpg");
await delay(2000);
const r3 = await go("Proton X70", "output/images/body-2.jpg");
console.log(JSON.stringify([r1,r2,r3], null, 2));
'''
with open("fetch-proton.mjs", "w", encoding="utf-8") as f:
    f.write(script)
print("ok")
