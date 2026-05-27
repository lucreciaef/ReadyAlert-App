/**
 * Type definitions for Geosphere API (ZAMG Warnings API)
 * Austrian weather warning system
 */

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

/**
 * Type definitions for the RTR Austria Alerting System API
**/

export type RtrAlertLevel = 'AlertLevel1' | 'AlertLevel2' | 'AlertLevel3' | 'AlertLevel4' | 'Amber';
export type RtrRegion = string;
export interface RtrAlertListRequest {
  regions: RtrRegion[];
  alertLevels: RtrAlertLevel[];
  search: string;
  limit: number;
  offset: number;
}

export interface RtrAlert {
  consolidation_identifier: string;
  alert_level: RtrAlertLevel;
  title?: string;
  description?: string;
  info_description?: string;
  info_area_description?: string;
  info_expires?: string; // ISO-8601 timestamp
  begin_date?: string; // ISO-8601 timestamp
  end_date?: string; // ISO-8601 timestamp
  sender?: string;
  sent?: string; //ISO-8601 timestamp
  polygons?: number[][][]; // Each polygon is an array of [latitude, longitude] coordinate pairs.
  [key: string]: unknown;
}

export interface RtrListPayload {
  totalCount: number;
  alerts: RtrAlert[];
}

export interface RtrAlertListResponse {
  json: RtrListPayload;
}
