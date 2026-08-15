import { fetchFireNasa } from '../api/endpoints/fire';
import { fetchSismos, fetchEspeciesAmeacadas } from '../api/endpoints/globe';
import { fetchOceanEpa } from '../api/endpoints/ocean';
import { fetchGeleiras } from '../api/endpoints/glaciers';
import { fetchEonetLayer } from './adapters/eonet';
import { fetchOpenAqLayer } from './adapters/openaq';
import {
  fetchAllGlobePages,
  GLOBE_DEFAULT_LIMIT,
  GLOBE_PAGE_SIZE,
} from '../lib/globeLimits';
import type { GlobeLayerDefinition, AppDomain } from './types';
import type { RespostaCamadaGloboV1 } from '../api/types/globe';

async function fetchFireLayer(
  query?: Record<string, string | number>,
): Promise<RespostaCamadaGloboV1> {
  return fetchAllGlobePages(
    (offset, limit) => fetchFireNasa(limit, { ...query, offset }),
    GLOBE_PAGE_SIZE,
  );
}

async function fetchOceanLayer(
  query?: Record<string, string | number>,
): Promise<RespostaCamadaGloboV1> {
  return fetchAllGlobePages(
    (offset, limit) => fetchOceanEpa(limit, { ...query, offset }),
    GLOBE_PAGE_SIZE,
  );
}

export const LAYER_REGISTRY: GlobeLayerDefinition[] = [
  {
    id: 'sismos',
    dominio: 'fire',
    nomeExibicao: 'Sismos',
    descricaoCurta: 'Eventos sísmicos recentes (USGS)',
    mode: 'pontoGloboV1',
    endpoint: '/api/globe/sismos',
    defaultQuery: { limit: GLOBE_DEFAULT_LIMIT },
    corAccent: '#FFD166',
    disponivel: true,
    supportsViewportFilter: true,
    fetchFn: (q) => fetchSismos(Number(q?.limit ?? GLOBE_DEFAULT_LIMIT), q),
  },
  {
    id: 'incendio-nasa',
    dominio: 'fire',
    nomeExibicao: 'Incêndios NASA',
    descricaoCurta: 'Focos de calor FIRMS em tempo quase real',
    mode: 'pontoGloboV1',
    endpoint: '/api/fire/nasa',
    defaultQuery: {},
    corAccent: '#FF4444',
    disponivel: true,
    supportsTimeFilter: true,
    fetchFn: (q) => fetchFireLayer(q),
  },
  {
    id: 'eventos-naturais',
    dominio: 'fire',
    nomeExibicao: 'Eventos naturais',
    descricaoCurta: 'Tempestades, vulcões, incêndios — NASA EONET',
    mode: 'pontoGloboV1',
    endpoint: '/api/events',
    defaultQuery: { limit: GLOBE_DEFAULT_LIMIT, status: 'open' },
    corAccent: '#FF8C42',
    disponivel: true,
    fetchFn: (q) => fetchEonetLayer(q),
  },
  {
    id: 'lixo-marinho-epa',
    dominio: 'ocean',
    nomeExibicao: 'Lixo marinho EPA',
    descricaoCurta: 'Detritos marinhos registados pela EPA',
    mode: 'pontoGloboV1',
    endpoint: '/api/ocean/epa',
    defaultQuery: {},
    corAccent: '#43D8F2',
    disponivel: true,
    fetchFn: (q) => fetchOceanLayer(q),
  },
  {
    id: 'geleiras-glims',
    dominio: 'ocean',
    nomeExibicao: 'Geleiras GLIMS',
    descricaoCurta: 'Contornos e inventário de geleiras (GLIMS)',
    mode: 'pontoGloboV1',
    endpoint: '/api/globe/geleiras',
    defaultQuery: { limit: GLOBE_DEFAULT_LIMIT, layer: 'outlines' },
    corAccent: '#B8ECFF',
    disponivel: true,
    supportsViewportFilter: true,
    fetchFn: (q) => fetchGeleiras(Number(q?.limit ?? GLOBE_DEFAULT_LIMIT), q),
  },
  {
    id: 'estacoes-openaq',
    dominio: 'climate',
    nomeExibicao: 'Estações de ar (OpenAQ)',
    descricaoCurta: 'Estações de qualidade do ar com coordenadas',
    mode: 'pontoGloboV1',
    endpoint: '/api/openaq/locations',
    defaultQuery: { limit: GLOBE_DEFAULT_LIMIT },
    corAccent: '#A78BFA',
    disponivel: false,
    requiresOpenAq: true,
    fetchFn: (q) => fetchOpenAqLayer(q),
  },
  {
    id: 'especies-ameacadas',
    dominio: 'forests',
    nomeExibicao: 'Espécies ameaçadas',
    descricaoCurta: 'Ocorrências GBIF por categoria IUCN',
    mode: 'pontoGloboV1',
    endpoint: '/api/globe/especies-ameacadas',
    defaultQuery: { limit: GLOBE_DEFAULT_LIMIT },
    corAccent: '#4ADE80',
    disponivel: true,
    requiresMongo: true,
    supportsViewportFilter: true,
    fetchFn: (q) => fetchEspeciesAmeacadas(Number(q?.limit ?? GLOBE_DEFAULT_LIMIT), q),
  },
];

const DOMAIN_LABELS: Record<AppDomain, string> = {
  fire: 'Fogo & Sismos',
  ocean: 'Oceano & Gelo',
  climate: 'Clima',
  forests: 'Florestas',
};

export function getLayerById(id: string): GlobeLayerDefinition | undefined {
  return LAYER_REGISTRY.find((layer) => layer.id === id);
}

export function getLayersByDomain(domain: AppDomain): GlobeLayerDefinition[] {
  return LAYER_REGISTRY.filter((layer) => layer.dominio === domain);
}

export function getDomainLabel(domain: AppDomain): string {
  return DOMAIN_LABELS[domain];
}
