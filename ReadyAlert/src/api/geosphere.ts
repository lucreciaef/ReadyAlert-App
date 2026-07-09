/**
 * Service layer for the Austrian Geosphere (ZAMG) weather warning API.
 * Exposes functions to fetch active warnings for given coordinates and to extract summary data from the response.
 */

import { GeosphereResponse, Warning } from './types';
import { convertGeosphereCoordinates } from '../utils/coordConvert';
import { mockGeoSphereResponseWithWarnings, mockResponseNoWarnings } from './mockData';

// Thrown when the queried coordinates are outside the supported coverage area
export class OutsideAustriaError extends Error {
  constructor(message = 'Location unsupported. Please wait until we can support more regions!') {
    super(message);
    this.name = 'OutsideAustriaError';
  }
}

// used when the service is temporarily unavailable ( HTTP 503)
export class ServiceUnavailableError extends Error {
  constructor(message = 'The weather warning service is currently unavailable. Please try again later.') {
    super(message);
    this.name = 'ServiceUnavailableError';
  }
}

const BASE_URL = 'https://warnungen.zamg.at/wsapp/api';
const ENDPOINT = '/getWarningsForCoords';

// Toggle this to use mock data instead of real API
const USE_MOCK_DATA = false;
// Toggle this to use mock data WITH warnings
const USE_MOCK_WITH_WARNINGS = false;


/**
 * Fetch warnings for a specific location
 * @param lon - Longitude
 * @param lat - Latitude
 * @param lang - Language code (default: 'en')
 * @returns Promise with GeosphereResponse
 */
export async function fetchWarningsForLocation(
  lon: number,
  lat: number,
  lang: string = 'en',
): Promise<GeosphereResponse> {
  try {
    // Use mock data if enabled
    if (USE_MOCK_DATA) {
      console.log('Using mock data mode');
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

      const mockData = USE_MOCK_WITH_WARNINGS ? mockGeoSphereResponseWithWarnings : mockResponseNoWarnings;
      console.log('Mock data returned:', mockData);
      return mockData;
    }

    // Real API call
    const params = new URLSearchParams({
      lon: lon.toString(),
      lat: lat.toString(),
      lang,
    });

    const url = `${BASE_URL}${ENDPOINT}?${params.toString()}`;
    console.log('Fetching warnings from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Geosphere HTTP error:', response.status, response.statusText);
      if (response.status === 503) {
        throw new ServiceUnavailableError();
      }
      // Treat any other HTTP error as an unsupported-location signal and show a user-friendly toast instead of a raw "API Error: 404" message
      throw new OutsideAustriaError();
    }

    const rawText = await response.text();
    // console.log('Geosphere raw response:', rawText);
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(rawText) as Record<string, unknown>;
    } catch (parseError) {
      console.error('Geosphere JSON parse error:', parseError, '\nRaw text:', rawText);
      // The server returned HTML error instead of json (aka service is currently down or overloaded)
      throw new Error('The weather warning service is temporarily unavailable. Please try again in a moment.');
    }

    // The API returns HTTP 200 with {type:"Error"} for unsupported coordinates
    if (data?.type === 'Error') {
      const apiMsg: string = (data.msg as string) ?? 'Unknown API error';
      console.warn('Geosphere API error:', apiMsg);
      // Provide a user-friendly message for the "outside Austria" case
      if (apiMsg.toLowerCase().includes('municipal')) {
        throw new OutsideAustriaError();
      }
      throw new Error(apiMsg);
    }

    console.log('Geosphere API response received:', data);
    const parsed = data as unknown as GeosphereResponse;
    if (parsed?.geometry?.coordinates) {
      parsed.geometry.coordinates = convertGeosphereCoordinates(parsed.geometry.coordinates);
    }
    return parsed;
  } catch (error) {
    console.error('🔴 Error fetching warnings:', error);
    throw error;
  }
}

/**
 * Get warning count for a location
 */
export function getWarningCount(data: GeosphereResponse | null): number {
  if (!data?.properties?.warnings) return 0;
  return data.properties.warnings.length;
}

/**
 * Filter warnings whose active period overlaps [now, now + windowHours].
 * If there are malformed rawinfo timestamps, messages are displayed anyway to avoid filtering real alerts.
 */
export function filterWarningsInWindow(warnings: Warning[], windowHours: number): Warning[] {
  const nowSec = Date.now() / 1000;
  const windowEndSec = nowSec + windowHours * 60 * 60;
  return warnings.filter((w) => {
    const start = Number(w.properties.rawinfo?.start);
    const end = Number(w.properties.rawinfo?.end);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return true;
    return start <= windowEndSec && end >= nowSec;
  });
}

/**
 * Get location name from response
 */
export function getLocationName(data: GeosphereResponse | null): string {
  if (!data?.properties?.location?.properties?.name) return 'Unknown Location';
  return data.properties.location.properties.name;
}
