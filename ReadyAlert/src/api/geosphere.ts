/**
 * Service layer for the Austrian Geosphere (ZAMG) weather warning API.
 * Exposes functions to fetch active warnings for given coordinates and to extract summary data from the response.
 */

import { GeoLocation, GeosphereResponse } from './types';
import { mockResponseWithWarnings, mockResponseNoWarnings } from './mockData';

/** Thrown when the queried coordinates are outside the supported coverage area. */
export class OutsideAustriaError extends Error {
  constructor(message = 'Location unsupported. Please wait until we can support more regions!') {
    super(message);
    this.name = 'OutsideAustriaError';
  }
}

const BASE_URL = 'https://warnungen.zamg.at/wsapp/api';
const ENDPOINT = '/getWarningsForCoords';

// Toggle this to use mock data instead of real API
const USE_MOCK_DATA = false;
// Toggle this to use mock data WITH warnings
const USE_MOCK_WITH_WARNINGS = true;

interface GeoLocationParams extends GeoLocation {
  lang?: string;
}

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

      const mockData = USE_MOCK_WITH_WARNINGS ? mockResponseWithWarnings : mockResponseNoWarnings;
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
      // Treat any HTTP error as an unsupported-location signal and show a
      // user-friendly toast instead of a raw "API Error: 404" message.
      throw new OutsideAustriaError();
    }

    const data = await response.json();

    // The API returns HTTP 200 with {type:"Error"} for unsupported coordinates
    if (data?.type === 'Error') {
      const apiMsg: string = data.msg ?? 'Unknown API error';
      console.warn('Geosphere API error:', apiMsg);
      // Provide a user-friendly message for the "outside Austria" case
      if (apiMsg.toLowerCase().includes('municipal')) {
        throw new OutsideAustriaError();
      }
      throw new Error(apiMsg);
    }

    console.log('Geosphere API response received:', data);
    return data as GeosphereResponse;
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
 * Get location name from response
 */
export function getLocationName(data: GeosphereResponse | null): string {
  if (!data?.properties?.location?.properties?.name) return 'Unknown Location';
  return data.properties.location.properties.name;
}
