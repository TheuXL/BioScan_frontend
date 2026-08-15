import type { PontoGloboV1, RespostaCamadaGloboV1 } from '../../api/types/globe';
import type { OpenAqLocationsResponse } from '../../api/endpoints/openaq';
import { fetchOpenAqLocations } from '../../api/endpoints/openaq';
import { GLOBE_DEFAULT_LIMIT } from '../../lib/globeLimits';

export function openaqToRespostaCamada(response: OpenAqLocationsResponse): RespostaCamadaGloboV1 {
  const pontos: PontoGloboV1[] = [];

  for (const loc of response.results ?? []) {
    const lat = loc.coordinates?.latitude;
    const lon = loc.coordinates?.longitude;
    if (lat == null || lon == null) continue;

    const pollutants = loc.sensors?.map((s) => s.parameter?.displayName ?? s.parameter?.name).filter(Boolean);

    pontos.push({
      lat,
      lon,
      tipo: 'estacao_ar',
      momento: null,
      origem: 'OpenAQ v3',
      idFonte: `openaq:${loc.id}`,
      severidade: pollutants?.length ?? null,
      titulo: loc.name,
      detalhes: {
        country: loc.country?.name,
        countryCode: loc.country?.code,
        locality: loc.locality,
        pollutants,
      },
    });
  }

  const found = response.meta?.found;
  const totalMatching = typeof found === 'number' ? found : typeof found === 'string' ? undefined : undefined;

  return {
    schemaVersion: '1.0',
    camada: 'estacao_ar',
    count: pontos.length,
    totalMatching,
    pontos,
  };
}

export async function fetchOpenAqLayer(
  extra?: Record<string, string | number | undefined>,
): Promise<RespostaCamadaGloboV1> {
  const response = await fetchOpenAqLocations({ limit: GLOBE_DEFAULT_LIMIT, ...extra });
  return openaqToRespostaCamada(response);
}
