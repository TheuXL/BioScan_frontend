import { apiGet, apiPost } from '../client';
import type { HealthResponse } from '../types/health';
import type { GeoFeatureCollection } from '../types/geojson';
import type { GlobeIndexResponse, RespostaCamadaGloboV1 } from '../types/globe';

export function fetchHealth() {
  return apiGet<HealthResponse>('/health');
}

export function fetchGlobeIndex() {
  return apiGet<GlobeIndexResponse>('/api/globe');
}

export function fetchSismos(limit = 500, extra?: Record<string, string | number>) {
  return apiGet<RespostaCamadaGloboV1>('/api/globe/sismos', { limit, ...extra });
}

export function fetchEspeciesAmeacadas(
  limit = 500,
  extra?: Record<string, string | number | undefined>,
) {
  return apiGet<RespostaCamadaGloboV1>('/api/globe/especies-ameacadas', { limit, ...extra });
}

export function fetchEarthquakes(extra?: Record<string, string | number>) {
  return apiGet<GeoFeatureCollection>('/api/earthquakes', extra);
}

export function fetchEarthquakeFeed(window: string) {
  return apiGet<GeoFeatureCollection>(`/api/earthquakes/feed/${window}`);
}

export function fetchExtinction(limit = 150, extra?: Record<string, string | number | undefined>) {
  return apiGet<{
    count: number;
    totalMatching?: number;
    data: Array<Record<string, unknown>>;
    source?: string;
  }>('/api/extinction', { limit, ...extra });
}

export function fetchExtinctionSyncStatus() {
  return apiGet<{ isRunning?: boolean; lastSyncTime?: string | null }>('/api/extinction/sync-status');
}

export function fetchExtinctionSync(body?: { maxRecords?: number; categories?: string[] }) {
  return apiPost<{ message?: string }>('/api/extinction/sync', undefined, body);
}
