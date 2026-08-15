import type { PontoGloboV1 } from '../api/types/globe';

export function formatCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('pt-PT', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export function formatNumber(value: number, decimals = 1): string {
  return value.toLocaleString('pt-PT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function pointKey(p: PontoGloboV1): string {
  return `${p.idFonte}-${p.lat}-${p.lon}`;
}

export function parseCoordinates(input: string): { lat: number; lon: number } | null {
  const cleaned = input.trim().replace(/,/g, ' ').replace(/\s+/g, ' ');
  const parts = cleaned.split(' ');
  if (parts.length !== 2) return null;

  const lat = Number(parts[0]);
  const lon = Number(parts[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;

  return { lat, lon };
}

export function archiveDateRange(days = 7): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { startDate: fmt(start), endDate: fmt(end) };
}

export function formatLayerCount(count: number): string {
  return `${count.toLocaleString('pt-PT')} no mapa`;
}
