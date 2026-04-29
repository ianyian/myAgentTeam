/**
 * PetalPress Weather MCP server.
 *
 * Tools:
 *   - get_weather(country)     — current weather for a country's capital (or first geocoded match)
 *   - list_countries()         — small built-in candidate list (helps the weather-fetcher agent)
 *
 * Data source: Open-Meteo (https://open-meteo.com) — free, no API key required.
 * Swap this file out to change sources without touching the agent definitions.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const WEATHER_CODE_MAP: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Heavy rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

const COUNTRY_CANDIDATES = [
  "Japan", "Singapore", "Brazil", "Iceland", "Kenya", "Australia",
  "Canada", "India", "Egypt", "Mexico", "Norway", "Thailand",
  "Argentina", "Morocco", "New Zealand", "Vietnam", "Portugal",
  "South Africa", "Greece", "South Korea", "Indonesia", "Peru",
  "Turkey", "Netherlands", "Philippines", "Sweden", "Chile",
  "Malaysia", "Italy", "Finland",
];

interface GeoResult {
  name: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
}

async function geocode(country: string): Promise<GeoResult> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    country,
  )}&count=5&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);
  const data = (await res.json()) as { results?: GeoResult[] };
  if (!data.results?.length) throw new Error(`No geocoding result for: ${country}`);
  // Prefer a result whose `country` matches the query (so "Japan" gives Tokyo, not "Japan, KS")
  const exact = data.results.find(
    (r) => r.country.toLowerCase() === country.toLowerCase(),
  );
  return exact ?? data.results[0];
}

interface CurrentWeather {
  temperature_2m: number;
  weather_code: number;
  wind_speed_10m: number;
}

async function fetchWeather(lat: number, lon: number): Promise<CurrentWeather> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Forecast failed: ${res.status}`);
  const data = (await res.json()) as { current: CurrentWeather };
  return data.current;
}

const server = new Server(
  { name: "petalpress-weather", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_weather",
      description:
        "Fetch current weather (temperature, conditions, wind) for the capital / primary city of the given country. Backed by Open-Meteo.",
      inputSchema: {
        type: "object",
        properties: {
          country: {
            type: "string",
            description: "Country name in English, e.g. 'Japan', 'Brazil', 'New Zealand'.",
          },
        },
        required: ["country"],
      },
    },
    {
      name: "list_countries",
      description:
        "Return a candidate list of countries known to geocode reliably. Use this if you want a vetted picker list.",
      inputSchema: { type: "object", properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "list_countries") {
      return {
        content: [{ type: "text", text: JSON.stringify({ countries: COUNTRY_CANDIDATES }) }],
      };
    }

    if (name === "get_weather") {
      const country = String((args as { country?: string })?.country ?? "").trim();
      if (!country) throw new Error("Missing required argument: country");

      const geo = await geocode(country);
      const cur = await fetchWeather(geo.latitude, geo.longitude);

      const result = {
        country: geo.country,
        country_iso: geo.country_code,
        capital: geo.name,
        latitude: geo.latitude,
        longitude: geo.longitude,
        temperature_c: cur.temperature_2m,
        weather_code: cur.weather_code,
        weather_description: WEATHER_CODE_MAP[cur.weather_code] ?? "Unknown",
        wind_kmh: cur.wind_speed_10m,
        fetched_at: new Date().toISOString(),
        source: "Open-Meteo",
      };

      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }

    throw new Error(`Unknown tool: ${name}`);
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
