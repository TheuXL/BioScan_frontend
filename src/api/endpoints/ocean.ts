import { apiGet } from '../client';
import type { GeoFeatureCollection } from '../types/geojson';
import type { RespostaCamadaGloboV1 } from '../types/globe';

export function fetchOceanIndex() {
  return apiGet<Record<string, unknown>>('/api/ocean');
}

export function fetchOceanEpa(
  limit = 500,
  extra?: Record<string, string | number | undefined>,
) {
  return apiGet<RespostaCamadaGloboV1>('/api/ocean/epa', { limit, ...extra });
}

export function fetchOceanPollutionIndex() {
  return apiGet<{ datasets?: string[]; basePath?: string; provider?: string }>(
    '/api/ocean-pollution',
  );
}

export function fetchOceanPollutionMetadata(dataset: string) {
  return apiGet<Record<string, unknown>>(`/api/ocean-pollution/epa-r9/${dataset}/metadata`);
}

export function fetchOceanPollutionGeoJson(
  dataset: string,
  layerId: number,
  extra?: Record<string, string | number>,
) {
  return apiGet<GeoFeatureCollection>(
    `/api/ocean-pollution/epa-r9/${dataset}/layers/${layerId}/geojson`,
    extra,
  );
}
