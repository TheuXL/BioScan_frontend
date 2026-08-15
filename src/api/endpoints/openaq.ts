import { apiGet } from '../client';

export interface OpenAqLocation {
  id: number;
  name: string;
  locality?: string | null;
  country?: { code?: string; name?: string };
  coordinates?: { latitude: number; longitude: number };
  sensors?: Array<{ parameter?: { displayName?: string; name?: string } }>;
}

export interface OpenAqLocationsResponse {
  meta?: { found?: number | string; limit?: number };
  results: OpenAqLocation[];
}

export function fetchOpenAqParameters() {
  return apiGet<{ results: Array<{ id: number; name: string; displayName?: string }> }>(
    '/api/openaq/parameters',
  );
}

export function fetchOpenAqCountries(limit?: number) {
  return apiGet<Record<string, unknown>>('/api/openaq/countries', limit ? { limit } : undefined);
}

export function fetchOpenAqLocations(extra?: Record<string, string | number>) {
  return apiGet<OpenAqLocationsResponse>('/api/openaq/locations', extra);
}

export function fetchOpenAqLocation(id: number) {
  return apiGet<OpenAqLocation>(`/api/openaq/locations/${id}`);
}

export function fetchOpenAqLocationLatest(id: number) {
  return apiGet<Record<string, unknown>>(`/api/openaq/locations/${id}/latest`);
}
