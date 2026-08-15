import { apiGet } from '../client';

export function fetchDeforestationIndex() {
  return apiGet<{
    provider?: string;
    hasApiKey?: boolean;
    requiresApiKeyFor?: string[];
    endpoints?: Record<string, string>;
  }>('/api/deforestation');
}

export function fetchDeforestationPing() {
  return apiGet<Record<string, unknown>>('/api/deforestation/ping');
}

export function fetchDeforestationDatasets() {
  return apiGet<Record<string, unknown>>('/api/deforestation/datasets');
}

export function fetchDeforestationFields(dataset: string, version: string) {
  return apiGet<Record<string, unknown>>(`/api/deforestation/dataset/${dataset}/${version}/fields`);
}

export function fetchDeforestationQuery(
  dataset: string,
  version: string,
  sql: string,
  extra?: Record<string, string | number>,
) {
  return apiGet<Record<string, unknown>>(
    `/api/deforestation/dataset/${dataset}/${version}/query/json`,
    { sql, ...extra },
  );
}
