/**
 * Geosphere API Service
 * Handles requests to the Austrian ZAMG warning API
 */

import { GeoLocation, GeosphereResponse } from './types';
import { mockResponseWithWarnings, mockResponseNoWarnings } from './mockData';

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
  lang: string = 'en'
): Promise<GeosphereResponse> {
  try {
    // Use mock data if enabled
    if (USE_MOCK_DATA) {
      console.log('🧪 Using MOCK data mode');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

      const mockData = USE_MOCK_WITH_WARNINGS ? mockResponseWithWarnings : mockResponseNoWarnings;
      console.log('✅ Mock data returned:', mockData);
      return mockData;
    }

    // Real API call
    const params = new URLSearchParams({
      lon: lon.toString(),
      lat: lat.toString(),
      lang,
    });

    const url = `${BASE_URL}${ENDPOINT}?${params.toString()}`;
    console.log('🌍 Fetching Geosphere warnings from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data: GeosphereResponse = await response.json();
    console.log('✅ Geosphere API response received:', data);

    return data;
  } catch (error) {
    console.error('❌ Error fetching warnings:', error);
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

/**
 * Check if there are any active warnings
 */
export function hasActiveWarnings(data: GeosphereResponse | null): boolean {
  return getWarningCount(data) > 0;
}

