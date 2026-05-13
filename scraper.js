const USER_AGENT = 'PetalPress/0.1 (educational demo)';
const countries = [
  { name: 'Japan', query: 'cherry blossom national flower Japan', slug: 'japan' },
  { name: 'Brazil', query: 'Cattleya labiata orchid national flower Brazil', slug: 'brazil' },
  { name: 'Kenya', query: 'national flower Kenya Clivia', slug: 'kenya' },
  { name: 'Norway', query: 'Heather national flower Norway Calluna vulgaris', slug: 'norway' },
  { name: 'Australia', query: 'Golden Wattle national flower Australia Acacia pycnantha', slug: 'australia' }
];

async function geocode(country) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(country)}&count=5&language=en&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  const exact = data.results?.find(r => r.country?.toLowerCase() === country.toLowerCase());
  return exact ?? data.results?.[0];
}

async function getWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`;
  const res = await fetch(url);
  const data = await res.json();
  return data.current;
}

const weatherCodes = {0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',51:'Light drizzle',61:'Slight rain',63:'Moderate rain',65:'Heavy rain',71:'Slight snow',80:'Rain showers',95:'Thunderstorm'};

async function wikiSearch(query) {
  const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&namespace=0&format=json`;
  const res = await fetch(url, {headers:{'User-Agent':USER_AGENT}});
  const data = await res.json();
  return data[1]?.[0] ?? null;
}

async function wikiSummary(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const res = await fetch(url, {headers:{'User-Agent':USER_AGENT}});
  return await res.json();
}

function pickImageUrl(summary, w) {
  const thumb = summary.thumbnail?.source;
  if (thumb) {
    const m = thumb.match(/^(.+\/)(\d+)px-([^/]+)$/);
    if (m) return `${m[1]}${w}px-${m[3]}`;
    return thumb;
  }
  return summary.originalimage?.source ?? null;
}

const fs = await import('fs/promises');
const path = await import('path');

const results = [];
for (const c of countries) {
  try {
    const geo = await geocode(c.name);
    const wx = await getWeather(geo.latitude, geo.longitude);
    const wCode = wx.weather_code;
    const wDesc = weatherCodes[wCode] ?? 'Unknown';
    
    let flowerPath = null, flowerAttribution = null;
    try {
      const title = await wikiSearch(c.query);
      if (title) {
        const summary = await wikiSummary(title);
        const imgUrl = pickImageUrl(summary, 400);
        if (imgUrl) {
          const imgRes = await fetch(imgUrl, {headers:{'User-Agent':USER_AGENT}});
          const buf = Buffer.from(await imgRes.arrayBuffer());
          const savePath = `output/country-images/${c.slug}.jpg`;
          await fs.mkdir('output/country-images', {recursive:true});
          await fs.writeFile(savePath, buf);
          flowerPath = savePath;
          flowerAttribution = `Image from Wikipedia article "${title}"`;
        }
      }
    } catch(e) { console.error('Flower error for ' + c.name + ':', e.message); }
    
    results.push({
      country: c.name,
      country_iso: geo.country_code,
      capital: geo.name,
      temperature_c: wx.temperature_2m,
      weather_code: wCode,
      weather_description: wDesc,
      wind_kmh: wx.wind_speed_10m,
      fetched_at: new Date().toISOString(),
      flower_slug: c.slug,
      flower_path: flowerPath,
      flower_attribution: flowerAttribution
    });
    console.log('Done: ' + c.name);
  } catch(e) {
    console.error('Error for ' + c.name + ':', e.message);
  }
}
console.log('RESULTS_JSON:' + JSON.stringify(results, null, 2));
