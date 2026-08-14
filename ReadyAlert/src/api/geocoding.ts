/**
 * Service layer for the Open-Meteo geocoding API.
 * Used to search for cities and districts by name when the user is saving a custom location.
 * Source: https://open-meteo.com/en/docs/geocoding-api
 */

const BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

// Feature codes that represent cities, towns, or districts within cities, so the app only stores
// locations we can meaningfully attach weather/warnings to
const ALLOWED_FEATURE_CODES = new Set([
  'PPL',
  'PPLA',
  'PPLA2',
  'PPLA3',
  'PPLA4',
  'PPLA5',
  'PPLC',
  'PPLG',
  'PPLS',
  'PPLX',
]);

interface GeocodingResultRaw {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  feature_code?: string;
  country_code?: string;
  country?: string;
  admin1?: string;
  admin2?: string;
  admin3?: string;
  admin4?: string;
  population?: number;
}

interface GeocodingResponseRaw {
  results?: GeocodingResultRaw[];
}

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  subtitle: string; // Formatted "Region, Country" line for display under the name
  countryCode?: string;
}

function buildSubtitle(r: GeocodingResultRaw): string {
  const parts = [r.admin1, r.country].filter((s): s is string => !!s && s !== r.name);
  return parts.join(', ');
}

export async function searchCities(
  query: string,
  { signal }: { signal?: AbortSignal } = {},
): Promise<GeocodingResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const params = new URLSearchParams({
    name: trimmed,
    count: '10',
    language: 'en',
    format: 'json',
  });

  const response = await fetch(`${BASE_URL}?${params.toString()}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Geocoding request failed with status ${response.status}`);
  }

  const data = (await response.json()) as GeocodingResponseRaw;
  const raw = data.results ?? [];

  return raw
    .filter((r) => !r.feature_code || ALLOWED_FEATURE_CODES.has(r.feature_code))
    .map<GeocodingResult>((r) => ({
      id: r.id,
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      subtitle: buildSubtitle(r),
      countryCode: r.country_code,
    }));
}
