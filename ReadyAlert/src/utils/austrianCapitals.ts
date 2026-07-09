/**
 * Capital cities of the nine Austrian federal states with their WGS84 coordinates.
 * Shared between the National Status weather widget and the map markers.
 */

import { Coordinates } from '../hooks/useLocation';

export interface CapitalCity {
  state: string;
  capital: string;
  coords: Coordinates;
}

export const AUSTRIAN_CAPITALS: CapitalCity[] = [
  { state: 'Vienna',         capital: 'Vienna',      coords: { latitude: 48.2082, longitude: 16.3738 } },
  { state: 'Lower Austria',  capital: 'St. Pölten',  coords: { latitude: 48.2058, longitude: 15.6232 } },
  { state: 'Upper Austria',  capital: 'Linz',        coords: { latitude: 48.3069, longitude: 14.2858 } },
  { state: 'Styria',         capital: 'Graz',        coords: { latitude: 47.0707, longitude: 15.4395 } },
  { state: 'Tyrol',          capital: 'Innsbruck',   coords: { latitude: 47.2692, longitude: 11.4041 } },
  { state: 'Carinthia',      capital: 'Klagenfurt',  coords: { latitude: 46.6247, longitude: 14.3053 } },
  { state: 'Salzburg',       capital: 'Salzburg',    coords: { latitude: 47.8095, longitude: 13.0550 } },
  { state: 'Vorarlberg',     capital: 'Bregenz',     coords: { latitude: 47.5031, longitude: 9.7471 } },
  { state: 'Burgenland',     capital: 'Eisenstadt',  coords: { latitude: 47.8455, longitude: 16.5218 } },
];

export const AUSTRIAN_CAPITAL_COORDS: Coordinates[] = AUSTRIAN_CAPITALS.map((c) => c.coords);
