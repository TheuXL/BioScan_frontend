import type { PontoGloboV1, RespostaCamadaGloboV1 } from '../api/types/globe';

export const GLOBE_PAGE_SIZE = 5_000;
export const GLOBE_MAX_LIMIT = 50_000;
export const GLOBE_DEFAULT_LIMIT = 500;

export interface VisibleBbox {
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
}

export function expandBbox(bbox: VisibleBbox, factor = 0.15): VisibleBbox {
  const latPad = Math.max(0.5, (bbox.maxLatitude - bbox.minLatitude) * factor);
  const lonPad = Math.max(0.5, (bbox.maxLongitude - bbox.minLongitude) * factor);
  return {
    minLatitude: Math.max(-90, bbox.minLatitude - latPad),
    maxLatitude: Math.min(90, bbox.maxLatitude + latPad),
    minLongitude: Math.max(-180, bbox.minLongitude - lonPad),
    maxLongitude: Math.min(180, bbox.maxLongitude + lonPad),
  };
}

export function isWorldView(bbox: VisibleBbox | null, cameraHeight: number | null): boolean {
  if (cameraHeight != null && cameraHeight > 12_000_000) return true;
  if (!bbox) return true;
  const latSpan = bbox.maxLatitude - bbox.minLatitude;
  const lonSpan = Math.abs(bbox.maxLongitude - bbox.minLongitude);
  return latSpan > 80 || lonSpan > 160;
}

export function maxRenderedForZoom(cameraHeight: number | null): number {
  if (cameraHeight == null) return 2_500;
  if (cameraHeight > 20_000_000) return 1_200;
  if (cameraHeight > 12_000_000) return 2_000;
  if (cameraHeight > 6_000_000) return 3_500;
  if (cameraHeight > 2_500_000) return 5_000;
  return 8_000;
}

export function buildApiBboxQuery(bbox: VisibleBbox): Record<string, number> {
  return {
    minLatitude: Number(bbox.minLatitude.toFixed(4)),
    maxLatitude: Number(bbox.maxLatitude.toFixed(4)),
    minLongitude: Number(bbox.minLongitude.toFixed(4)),
    maxLongitude: Number(bbox.maxLongitude.toFixed(4)),
  };
}

/** GLIMS: bbox=minLon,minLat,maxLon,maxLat */
export function buildGlimsBboxQuery(bbox: VisibleBbox): Record<string, string> {
  const minLon = Number(bbox.minLongitude.toFixed(4));
  const minLat = Number(bbox.minLatitude.toFixed(4));
  const maxLon = Number(bbox.maxLongitude.toFixed(4));
  const maxLat = Number(bbox.maxLatitude.toFixed(4));
  return {
    bbox: `${minLon},${minLat},${maxLon},${maxLat}`,
  };
}

export function buildUsgsBboxQuery(bbox: VisibleBbox): Record<string, number> {
  return {
    minlatitude: Number(bbox.minLatitude.toFixed(4)),
    maxlatitude: Number(bbox.maxLatitude.toFixed(4)),
    minlongitude: Number(bbox.minLongitude.toFixed(4)),
    maxlongitude: Number(bbox.maxLongitude.toFixed(4)),
  };
}

export function pointInBbox(p: PontoGloboV1, bbox: VisibleBbox): boolean {
  return (
    p.lat >= bbox.minLatitude &&
    p.lat <= bbox.maxLatitude &&
    p.lon >= bbox.minLongitude &&
    p.lon <= bbox.maxLongitude
  );
}

export function filterPointsByBbox(pontos: PontoGloboV1[], bbox: VisibleBbox | null): PontoGloboV1[] {
  if (!bbox) return pontos;
  return pontos.filter((p) => pointInBbox(p, bbox));
}

export function samplePointsSpatially(pontos: PontoGloboV1[], maxPoints: number): PontoGloboV1[] {
  if (pontos.length <= maxPoints) return pontos;

  const cells = Math.ceil(Math.sqrt(maxPoints));
  const buckets = new Map<string, PontoGloboV1[]>();

  for (const p of pontos) {
    const gx = Math.floor(((p.lon + 180) / 360) * cells);
    const gy = Math.floor(((p.lat + 90) / 180) * cells);
    const key = `${gx}:${gy}`;
    const list = buckets.get(key);
    if (list) list.push(p);
    else buckets.set(key, [p]);
  }

  const sampled: PontoGloboV1[] = [];
  const perCell = Math.max(1, Math.floor(maxPoints / Math.max(1, buckets.size)));

  for (const list of buckets.values()) {
    const step = Math.max(1, Math.ceil(list.length / perCell));
    for (let i = 0; i < list.length && sampled.length < maxPoints; i += step) {
      sampled.push(list[i]!);
    }
    if (sampled.length >= maxPoints) break;
  }

  return sampled;
}

export function selectPointsForViewport(
  pontos: PontoGloboV1[],
  bbox: VisibleBbox | null,
  cameraHeight: number | null,
): PontoGloboV1[] {
  const padded = bbox ? expandBbox(bbox, isWorldView(bbox, cameraHeight) ? 0 : 0.12) : null;
  const inView = filterPointsByBbox(pontos, padded);
  const maxPoints = maxRenderedForZoom(cameraHeight);
  return samplePointsSpatially(inView, maxPoints);
}

export async function fetchAllGlobePages(
  fetchPage: (offset: number, limit: number) => Promise<RespostaCamadaGloboV1>,
  pageSize = GLOBE_PAGE_SIZE,
): Promise<RespostaCamadaGloboV1> {
  let offset = 0;
  const pontos: PontoGloboV1[] = [];
  let meta: RespostaCamadaGloboV1 | null = null;

  while (offset < GLOBE_MAX_LIMIT) {
    const page = await fetchPage(offset, pageSize);
    meta ??= page;
    pontos.push(...page.pontos);

    const pageLimit = page.limit ?? pageSize;
    const hasMore = page.hasMore === true && page.pontos.length > 0;
    if (!hasMore) break;
    if (page.totalMatching != null && pontos.length >= page.totalMatching) break;

    offset += pageLimit;
  }

  return {
    schemaVersion: '1.0',
    camada: meta?.camada ?? '',
    count: pontos.length,
    totalMatching: meta?.totalMatching ?? pontos.length,
    offset: 0,
    limit: pontos.length,
    hasMore: false,
    pontos,
  };
}
