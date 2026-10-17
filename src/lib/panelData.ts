import type { PontoGloboV1 } from '../api/types/globe';

export function topDebrisRegions(pontos: PontoGloboV1[], limit = 5) {
  const buckets = new Map<string, { label: string; count: number }>();

  for (const p of pontos) {
    const latKey = Math.round(p.lat / 5) * 5;
    const lonKey = Math.round(p.lon / 5) * 5;
    const key = `${latKey}_${lonKey}`;
    const latDir = latKey >= 0 ? 'N' : 'S';
    const lonDir = lonKey >= 0 ? 'L' : 'O';
    const label = `${Math.abs(latKey)}°${latDir}, ${Math.abs(lonKey)}°${lonDir}`;
    const prev = buckets.get(key);
    buckets.set(key, { label, count: (prev?.count ?? 0) + 1 });
  }

  return [...buckets.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}

export function extractSeaLevelSummary(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const p = payload as Record<string, unknown>;
  if (p.feed && typeof p.feed === 'object') {
    const feed = p.feed as Record<string, unknown>;
    if (Array.isArray(feed.entry) && feed.entry.length === 0) return null;
    if (feed.updated) {
      return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(
        new Date(String(feed.updated)),
      );
    }
  }
  return null;
}

export interface AirMeasurement {
  name: string;
  value: number;
  unit?: string;
}

export function readOpenAqLatest(data: Record<string, unknown>): AirMeasurement[] {
  const results = data.results as Array<Record<string, unknown>> | undefined;
  if (!Array.isArray(results)) return [];

  const out: AirMeasurement[] = [];
  for (const row of results) {
    const param = row.parameter as Record<string, unknown> | undefined;
    const value = row.value;
    if (typeof value !== 'number') continue;
    const name =
      (param?.displayName as string | undefined) ??
      (param?.name as string | undefined) ??
      'Poluente';
    const unit = row.unit as string | undefined;
    out.push({ name, value, unit });
    if (out.length >= 6) break;
  }
  return out;
}

export function readMeteoCurrent(data: Record<string, unknown>) {
  const current = data.current as Record<string, unknown> | undefined;
  if (!current) return null;
  return {
    temperature: current.temperature_2m as number | undefined,
    humidity: current.relative_humidity_2m as number | undefined,
    windSpeed: current.wind_speed_10m as number | undefined,
    weatherCode: current.weather_code as number | undefined,
  };
}

export function readAirQualityCurrent(data: Record<string, unknown>) {
  const current = data.current as Record<string, unknown> | undefined;
  if (!current) return null;
  return {
    pm25: current.pm2_5 as number | undefined,
    pm10: current.pm10 as number | undefined,
    usAqi: current.us_aqi as number | undefined,
  };
}
