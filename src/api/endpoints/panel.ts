import { apiGet, apiPost } from '../client';

export function fetchGlobalTemperature(extra?: Record<string, string | number>) {
  return apiGet<{ count: number; data: Array<{ year: number; month: string; anomaly: number }> }>(
    '/api/global-temperature',
    extra,
  );
}

export function fetchGlobalTemperatureStats(stationType = 'Land-Ocean') {
  return apiGet<{
    message?: string;
    stats: {
      latestAnomaly?: number;
      minAnomaly?: number;
      maxAnomaly?: number;
      count?: number;
    } | null;
  }>('/api/global-temperature/stats', { stationType });
}

export function fetchGlobalTemperatureSyncStatus() {
  return apiGet<{ isRunning?: boolean; lastSyncTime?: string | null }>(
    '/api/global-temperature/sync-status',
  );
}

export function fetchGlobalTemperatureSync(stationType?: string) {
  return apiPost<{ message?: string }>(
    '/api/global-temperature/sync',
    undefined,
    stationType ? { stationType } : undefined,
  );
}

export function fetchIceMeltLatest() {
  return apiGet<{ source: string; payload: unknown; fetchedAt: string }>('/api/ice-melt/latest');
}

export function fetchIceMelt() {
  return apiGet<Record<string, unknown>>('/api/ice-melt');
}

export function fetchIceMeltSyncStatus() {
  return apiGet<{ isRunning?: boolean; lastSyncTime?: string | null }>('/api/ice-melt/sync-status');
}

export function fetchIceMeltSync() {
  return apiPost<{ message?: string }>('/api/ice-melt/sync');
}

export function fetchMeteoForecast(lat: number, lon: number, extra?: Record<string, string | number>) {
  return apiGet<Record<string, unknown>>('/api/meteo/forecast', {
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    ...extra,
  });
}

export function fetchMeteoArchive(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string,
  extra?: Record<string, string | number>,
) {
  return apiGet<Record<string, unknown>>('/api/meteo/archive', {
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    start_date: startDate,
    end_date: endDate,
    ...extra,
  });
}

export function fetchAirQuality(lat: number, lon: number, extra?: Record<string, string | number>) {
  return apiGet<Record<string, unknown>>('/api/meteo/air-quality', {
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    ...extra,
  });
}
