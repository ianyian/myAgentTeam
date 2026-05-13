/**
 * loop-helper.mjs — fetches weather + flower image for a single country.
 * Usage: node scripts/loop-helper.mjs <country>
 */
import { mkdir, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";

const USER_AGENT = "PetalPress/0.1 (educational demo)";
const WEATHER_CODE_MAP = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  80: "Rain showers",
  81: "Heavy rain showers",
  95: "Thunderstorm",
};

async function geocode(country) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(country)}&count=5&language=en&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.results?.length)
    throw new Error(`No geocoding result for: ${country}`);
  const exact = data.results.find(
    (r) => r.country.toLowerCase() === country.toLowerCase(),
  );
  return exact ?? data.results[0];
}

async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m`;
  const res = await fetch(url);
  const data = await res.json();
  return data.current;
}

async function wikiSearch(query) {
  const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&namespace=0&format=json`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  const data = await res.json();
  return data[1]?.[0] ?? null;
}

async function wikiSummary(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  return await res.json();
}

async function downloadImage(imageUrl, savePath) {
  const fullPath = resolve(savePath);
  await mkdir(dirname(fullPath), { recursive: true });
  const res = await fetch(imageUrl, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Image download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(fullPath, buf);
  return fullPath;
}

// National flowers for common countries
const NATIONAL_FLOWERS = {
  japan: "Cherry blossom Prunus",
  brazil: "Cattleya labiata orchid",
  india: "Lotus Nelumbo nucifera",
  australia: "Golden wattle Acacia pycnantha",
  mexico: "Dahlia flower Mexico",
  france: "Iris flower France",
  germany: "Cornflower Centaurea cyanus",
  italy: "White lily Madonna",
  canada: "Sugar maple leaf",
  norway: "Heather Calluna vulgaris",
  sweden: "Linnaea borealis twinflower",
  kenya: "Clivia miniata bush lily",
  "south africa": "King protea flower",
  thailand: "Cassia fistula flower",
  indonesia: "Moon orchid Phalaenopsis amabilis",
  china: "Plum blossom prunus mume",
  "south korea": "Hibiscus syriacus rose of sharon",
  singapore: "Vanda Miss Joaquim orchid",
  "new zealand": "Silver fern",
};

async function run() {
  const country = process.argv[2];
  if (!country) {
    console.error("Usage: node loop-helper.mjs <country>");
    process.exit(1);
  }

  // 1. Weather
  const geo = await geocode(country);
  const weather = await fetchWeather(geo.latitude, geo.longitude);
  const weatherDesc =
    WEATHER_CODE_MAP[weather.weather_code] ?? `Code ${weather.weather_code}`;

  // 2. Flower image
  const slug = country.toLowerCase().replace(/\s+/g, "-");
  const flowerQuery =
    NATIONAL_FLOWERS[country.toLowerCase()] ?? `${country} national flower`;
  let flowerPath = `output/country-images/${slug}.jpg`;
  let flowerName = `National flower of ${country}`;

  try {
    const wikiTitle = await wikiSearch(flowerQuery);
    if (wikiTitle) {
      const summary = await wikiSummary(wikiTitle);
      flowerName = summary.description ?? wikiTitle;
      const imgUrl = summary.originalimage?.source ?? summary.thumbnail?.source;
      if (imgUrl) {
        await downloadImage(imgUrl, flowerPath);
      } else {
        flowerPath = null;
      }
    }
  } catch (e) {
    console.error("Flower fetch warning:", e.message);
    flowerPath = null;
  }

  const result = {
    country: geo.country ?? country,
    capital: geo.name,
    latitude: geo.latitude,
    longitude: geo.longitude,
    temperature_c: weather.temperature_2m,
    weather_description: weatherDesc,
    wind_speed_kmh: weather.wind_speed_10m,
    flower_path: flowerPath,
    flower_name: flowerName,
  };
  console.log(JSON.stringify(result, null, 2));
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
