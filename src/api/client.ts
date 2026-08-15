import type { BioscanMeta } from './types/globe';

export class ApiError extends Error {
  status: number;
  body: { message?: string; hint?: string };

  constructor(status: number, body: { message?: string; hint?: string }) {
    super(body.message ?? `HTTP ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

const base = import.meta.env.VITE_API_BASE_URL ?? '';

export function humanApiError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 503) return 'Dados temporariamente indisponíveis';
    if (error.status === 502) return 'Fonte externa offline';
    if (error.status === 404) return 'Sem dados para esta região';
    if (error.status === 400) return 'Não foi possível obter estes dados';
    const msg = error.body.message ?? '';
    if (/api[_-]?key|mongodb|\.env/i.test(msg)) return 'Dados temporariamente indisponíveis';
    return msg || 'Não foi possível carregar os dados';
  }
  if (error instanceof Error) return 'Não foi possível carregar os dados';
  return 'Erro desconhecido';
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const url = new URL(path, base || window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString());
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body);
  return body as T;
}

export async function apiPost<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
  body?: Record<string, unknown>,
): Promise<T> {
  const url = new URL(path, base || window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const resBody = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, resBody);
  return resBody as T;
}

export function hasCacheMeta(data: unknown): BioscanMeta | undefined {
  if (data && typeof data === 'object' && 'bioscan_meta' in data) {
    return (data as { bioscan_meta: BioscanMeta }).bioscan_meta;
  }
  return undefined;
}
