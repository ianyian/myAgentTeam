/** Shared types for the PetalPress orchestrator. */

export interface AgentDefinition {
  name: string;
  description: string;
  tools: string[];
  systemPrompt: string;
}

export interface RunLogEntry {
  step: number;
  agent: string;
  started_at: string;
  finished_at: string;
  duration_ms: number;
  description: string;
  result: unknown;
}

export interface ContentSections {
  intro: string;
  body: string;
  footer: string;
}

export interface ContentCheckResult {
  status: "complete" | "needs_input";
  sections: ContentSections;
  missing: Array<keyof ContentSections>;
  questions: string[];
}

export interface TranslatedSections {
  intro: { en: string; zh: string; ms: string; ta: string };
  body: { en: string; zh: string; ms: string; ta: string };
  footer: { en: string; zh: string; ms: string; ta: string };
}

export interface FetchedImage {
  path: string;
  query: string;
  source_url: string;
  attribution: string;
}

export interface CountryWeather {
  country: string;
  country_iso: string;
  capital: string;
  temperature_c: number;
  weather_code: number;
  weather_description: string;
  wind_kmh: number;
  fetched_at: string;
}

export interface CountryFlower {
  country: string;
  flower_name: string;
  path: string;
  source_url: string;
  attribution: string;
}
