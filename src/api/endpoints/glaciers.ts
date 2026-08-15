import { apiGet } from '../client';
import type { GeoFeatureCollection } from '../types/geojson';
import type { RespostaCamadaGloboV1 } from '../types/globe';

export type GlimsLayerAlias = 'outlines' | 'rgi' | 'rgi70' | 'extinct' | string;

export interface GlaciersIndexResponse {
  provider?: string;
  documentation?: string;
  basePath?: string;
  defaultLayer?: string;
  layers?: Record<string, string>;
  upstreamBase?: string;
  requiresApiKey?: boolean;
  endpoints?: Record<string, string>;
}

export function fetchGlaciersIndex() {
  return apiGet<GlaciersIndexResponse>('/api/glaciers');
}

export function fetchGlaciersCapabilities() {
  return apiGet<string>('/api/glaciers/capabilities');
}

export function fetchGlaciersLayerGeoJson(
  layerName: string,
  extra?: Record<string, string | number | undefined>,
) {
  return apiGet<GeoFeatureCollection>(
    `/api/glaciers/layers/${encodeURIComponent(layerName)}/geojson`,
    extra,
  );
}

export function fetchGeleiras(
  limit = 500,
  extra?: Record<string, string | number | undefined>,
) {
  return apiGet<RespostaCamadaGloboV1>('/api/globe/geleiras', { limit, ...extra });
}
