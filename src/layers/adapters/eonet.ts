import type { PontoGloboV1, RespostaCamadaGloboV1 } from '../../api/types/globe';
import type { EonetEvent, EonetEventsResponse } from '../../api/endpoints/events';
import { fetchEvents } from '../../api/endpoints/events';
import { GLOBE_DEFAULT_LIMIT } from '../../lib/globeLimits';

type EonetGeometry = NonNullable<EonetEvent['geometries']>[number];

function extractPointCoords(geometry: EonetGeometry): { lat: number; lon: number } | null {
  if (!geometry) return null;
  const { type, coordinates } = geometry;
  if (type === 'Point' && Array.isArray(coordinates) && coordinates.length >= 2) {
    return { lon: coordinates[0] as number, lat: coordinates[1] as number };
  }
  return null;
}

export function eonetToRespostaCamada(response: EonetEventsResponse): RespostaCamadaGloboV1 {
  const pontos: PontoGloboV1[] = [];

  for (const event of response.events ?? []) {
    const geometry = event.geometries?.[event.geometries.length - 1];
    const coords = geometry ? extractPointCoords(geometry) : null;
    if (!coords) continue;

    pontos.push({
      lat: coords.lat,
      lon: coords.lon,
      tipo: 'evento_natural',
      momento: geometry?.date ?? null,
      origem: 'NASA EONET',
      idFonte: `eonet:${event.id}`,
      severidade: event.categories?.[0]?.title ?? null,
      titulo: event.title,
      detalhes: {
        description: event.description,
        categories: event.categories,
        link: event.link,
      },
    });
  }

  return {
    schemaVersion: '1.0',
    camada: 'evento_natural',
    count: pontos.length,
    totalMatching: response.events?.length,
    pontos,
  };
}

export async function fetchEonetLayer(
  extra?: Record<string, string | number | undefined>,
): Promise<RespostaCamadaGloboV1> {
  const response = await fetchEvents({
    limit: GLOBE_DEFAULT_LIMIT,
    status: 'open',
    ...extra,
  });
  return eonetToRespostaCamada(response);
}
