/**
 * Type definitions for Geosphere API (ZAMG Warnings API)
 * Austrian weather warning system
 */

export interface GeoLocation {
  lon: number;
  lat: number;
}

export interface MunicipalityProperties {
  gemeindenr: number;
  name: string;
  urlname: string;
}

export interface LocationData {
  type: 'Municipal' | 'District' | string;
  properties: MunicipalityProperties;
}

export interface WarningRawInfo {
  wtype: number;
  wlevel: number;
  start: string;
  end: string;
}

export interface WarningProperties {
  warnid: number;
  chgid: number;
  verlaufid: number;
  warntypid: number;
  begin: string;
  end: string;
  create: string;
  text: string;
  auswirkungen: string;
  empfehlungen: string;
  meteotext: string;
  updategrund: string;
  warnstufeid: number;
  rawinfo: WarningRawInfo;
}

export interface Warning {
  type: 'Warning';
  properties: WarningProperties;
}

export interface GeosphereProperties {
  location: LocationData;
  warnings: Warning[];
}

export interface GeosphereResponse {
  type: 'Feature';
  geometry: {
    type: 'MultiPolygon';
    coordinates: number[][][][];
  };
  properties: GeosphereProperties;
}
