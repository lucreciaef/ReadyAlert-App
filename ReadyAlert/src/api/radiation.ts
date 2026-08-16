/**
 * Service layer for the Austrian Federal Ministry for Climate Action radiation-monitoring network (Strahlenschutz).
 *
 * Endpoint: GET https://mb.strahlenschutz.gv.at/api/current
 *
 * The response contains pixel coordinates (coordinateX / coordinateY) that correspond to positions on an
 * Austrian map image shown at https://mb.strahlenschutz.gv.at/. These pixels are converted to WGS-84 lon/lat with a simple linear interpolation over Austria's bounding box.
 * Measured values are in nSv/h (nanosieverts per hour).
 * Typical Austrian background range: 50 – 150 nSv/h.
 */

// Raw station entry as returned by the API
export interface RadiationStationRaw {
  nummer: string; // Station ID
  name: string;
  koordinatenX: number; // Pixel X on the Austrian map image (west → east)
  koordinatenY: number; // Pixel Y on the Austrian map image (north → south)
  messwert: number; // Measured radiation level in nSv/h
}

export interface RadiationApiResponse {
  time: number;
  data: RadiationStationRaw[];
}

// Station enriched with geographic coordinates and distance from the user
export interface RadiationStation {
  number: string;
  name: string;
  latitude: number;
  longitude: number;
  measurement: number;
  distanceKm: number; // Distance from user in km, populated by the hook
}

// Map pixel → WGS-84 conversion
//
// The Strahlenschutz site renders stations as pixels on a ~700×370 px image of Austria.
// A simple linear fit over 10 known stations (OLS) gives:
//
// longitude = 9.488 + 0.011288 × x (°E)
// latitude = 48.968 − 0.007397 × y (°N)
//
// Calibration points used (pixel -> real WGS-84):
// Feldkirch (10,224)->(47.233,9.600), Bregenz (23,195)->(47.503,9.747)
// Innsbruck (167,232)->(47.268,11.393), Salzburg (316,163)->(47.797,13.043)
// Wien (609,104)->(48.196,16.383), Wien-BL (617,99)->(48.232,16.497)
// Klagenfurt(430,318)->(46.624,14.308), Graz (531,257)->(47.069,15.440)
// Leibnitz (540,292)->(46.782,15.541), Linz (425,96)->(48.312,14.286)
const LON_OFFSET = 9.488;
const LON_SCALE = 0.011288; // °/pixel  (east)
const LAT_OFFSET = 48.968;
const LAT_SCALE = 0.007397; // °/pixel  (south)

function pixelToLatLon(x: number, y: number): { latitude: number; longitude: number } {
  return {
    longitude: LON_OFFSET + x * LON_SCALE,
    latitude: LAT_OFFSET - y * LAT_SCALE,
  };
}

// Haversine distance (km) - source https://en.wikipedia.org/wiki/Haversine_formula
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Radiation level tier
export type RadiationLevel = 'normal' | 'elevated' | 'high' | 'serious';

/**
 * Classify a measurement (nSv/h) into a human-readable tier.
 *
 * Thresholds are approximate; Austria's actual alert thresholds are defined by AGES / BMSGPK.
 * <= 100 nSv/h -> very low (typical low-altitude background)
 * 50 – 200 -> normal background (high-altitude or post-event monitoring)
 * > 200-500 -> high but not alarming (typical elevated background)
 * > 500 -> high (potentially concerning, but not yet an emergency)
 * > 1000 -> serious, abnormal (emergency)
 *
 * Sources: https://www.bmluk.gv.at/en/topics/climate-environment/radiation-protection/radiation-early-warning-system.html
 * More info: https://biologyinsights.com/how-many-microsieverts-per-hour-is-dangerous/
 */
export function classifyRadiation(nsvh: number): RadiationLevel {
  if (nsvh <= 200) return 'normal';
  if (nsvh <= 500) return 'elevated';
  if (nsvh <= 1000) return 'high';
  return 'serious'; // beyond the defined tiers
}

export const RADIATION_LEVEL_LABEL: Record<RadiationLevel, string> = {
  normal: 'Normal',
  elevated: 'Elevated',
  high: 'High',
  serious: 'Serious',
};

// API fetch
const RADIATION_API_URL = 'https://mb.strahlenschutz.gv.at/api/current';

/**
 * Fetch the latest radiation readings for all Austrian monitoring stations.
 * Returns every station enriched with geographic coordinates; distanceKm is set to 0 here — call-sites should update it.
 */
export async function fetchRadiationData(): Promise<{
  time: Date;
  stations: Omit<RadiationStation, 'distanceKm'>[];
}> {
  const response = await fetch(RADIATION_API_URL);
  if (!response.ok) {
    throw new Error(`Radiation API responded with HTTP ${response.status}`);
  }

  const json: RadiationApiResponse = await response.json();

  const stations = json.data.map((raw) => {
    const { latitude, longitude } = pixelToLatLon(raw.koordinatenX, raw.koordinatenY);
    return {
      number: raw.nummer,
      name: raw.name,
      latitude,
      longitude,
      measurement: raw.messwert,
    };
  });

  return {
    time: new Date(json.time * 1000),
    stations,
  };
}
