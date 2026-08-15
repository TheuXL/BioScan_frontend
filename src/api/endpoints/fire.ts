import { apiGet, apiPost } from '../client';
import type { RespostaCamadaGloboV1 } from '../types/globe';

export function fetchFireIndex() {
  return apiGet<Record<string, unknown>>('/api/fire');
}

export function fetchFireNasa(
  limit = 500,
  extra?: Record<string, string | number | undefined>,
) {
  return apiGet<RespostaCamadaGloboV1>('/api/fire/nasa', { limit, ...extra });
}

export function fetchFires(limit = 100, extra?: Record<string, string | number>) {
  return apiGet<{ count: number; data: Array<Record<string, unknown>> }>('/api/fires', {
    limit,
    ...extra,
  });
}

export function fetchFiresByCountry(extra: Record<string, string | number>) {
  return apiGet<Record<string, unknown>>('/api/fires/by-country', extra);
}

export function fetchFiresSyncStatus() {
  return apiGet<{ isRunning: boolean; lastSyncTime: string | null; interval?: string }>(
    '/api/fires/sync-status',
  );
}

export function fetchFiresSync(source?: string) {
  return apiPost<{ message?: string }>('/api/fires/sync', source ? { source } : undefined);
}
