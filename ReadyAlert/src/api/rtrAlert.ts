/**
 * Service layer for the RTR Austria Alerting System API.
 * https://warnungen.at-alert.at
 *
 * All public alerts for Austria (civil-protection, infrastructure, weather, etc) are available via a single POST endpoint.
 * This module wraps that endpoint and exposes typed helpers used by the UI layer.
 */

import {
  RtrAlert,
  RtrAlertLevel,
  RtrAlertListRequest,
  RtrAlertListResponse,
} from './types';
import { getThemeColours } from '../styles/themeColours';

const RTR_BASE_URL = 'https://warnungen.at-alert.at/api/rpc';
const ALERT_LIST_ENDPOINT = '/alert/list';

export const ALL_ALERT_LEVELS: RtrAlertLevel[] = [
  'AlertLevel1',
  'AlertLevel2',
  'AlertLevel3',
  'AlertLevel4',
  'Amber',
];

export const ALERT_LEVEL_LABELS: Record<RtrAlertLevel, string> = {
  AlertLevel1: 'Emergency Alert',
  AlertLevel2: 'Extreme Threat',
  AlertLevel3: 'Severe Threat',
  AlertLevel4: 'Information',
  Amber:       'Other',
};

export function getAlertLevelColours(isDark: boolean): Record<RtrAlertLevel, string> {
  const c = getThemeColours(isDark);
  return {
    AlertLevel1: c.critical, // purple – Emergency Alert (worst tier)
    AlertLevel2: c.error,    // red – Extreme Threat
    AlertLevel3: c.warning,  // amber – Severe Threat
    AlertLevel4: c.info,     // blue – Threat Information
    Amber:       c.warning,  // amber – Missing Person
  };
}

//Build the default request body that fetches every active alert across Austria.
export function buildDefaultAlertRequest(overrides?: Partial<RtrAlertListRequest>): RtrAlertListRequest {
  return {
    regions: [],
    alertLevels: ALL_ALERT_LEVELS,
    search: '',
    limit: 100,
    offset: 0,
    ...overrides,
  };
}

/** Fetch the list of active RTR alerts.
 * @param params  Optional overrides for regions, alert levels, pagination, etc.
 * @returns       Resolved `RtrListPayload` with `totalCount` and `alerts`.
 * @throws        Error if the network request fails or the server returns a non-2xx status.
 */
export async function fetchRtrAlerts(
  params?: Partial<RtrAlertListRequest>,
): Promise<{ totalCount: number; alerts: RtrAlert[] }> {
  const body = buildDefaultAlertRequest(params);
  const url = `${RTR_BASE_URL}${ALERT_LIST_ENDPOINT}`;

  console.log('[RTR] Fetching alerts from', url, 'with body', JSON.stringify(body));

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ json: body } satisfies { json: RtrAlertListRequest }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`RTR API error ${response.status}: ${response.statusText}${text ? ` – ${text}` : ''}`);
  }

  const envelope: RtrAlertListResponse = await response.json();
  const payload = envelope?.json;

  if (!payload || typeof payload.totalCount !== 'number' || !Array.isArray(payload.alerts)) {
    throw new Error('RTR API returned an unexpected response shape');
  }

  console.log(`[RTR] Received ${payload.totalCount} alert(s) (page contains ${payload.alerts.length})`);
  return payload;
}

// Returns the colour token for a given alert level (defaults to a neutral grey for unknown levels).
export function getAlertLevelColour(level: RtrAlertLevel | string, isDark = false): string {
  return getAlertLevelColours(isDark)[level as RtrAlertLevel] ?? getThemeColours(isDark).textMuted;
}

//Returns the human-readable label for a given alert level.
export function getAlertLevelLabel(level: RtrAlertLevel | string): string {
  return ALERT_LEVEL_LABELS[level as RtrAlertLevel] ?? level;
}

// Sort a list of RTR alerts from most to least severe.
// Order: Level1 > Level2 > Level3 > Amber > Level4
const SEVERITY_ORDER: Record<string, number> = {
  AlertLevel1: 5,
  AlertLevel2: 4,
  AlertLevel3: 3,
  Amber:       2,
  AlertLevel4: 1,
};

export function sortAlertsBySeverity(alerts: RtrAlert[]): RtrAlert[] {
  return [...alerts].sort(
    (a, b) => (SEVERITY_ORDER[b.alert_level] ?? 0) - (SEVERITY_ORDER[a.alert_level] ?? 0),
  );
}
