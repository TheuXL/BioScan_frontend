export interface LayerVisualMeta {
  unidadePonto: string;
  unidadeCluster: string;
  legendaCluster: string;
  dicaZoom: string;
}

export const LAYER_VISUAL_META: Record<string, LayerVisualMeta> = {
  'lixo-marinho-epa': {
    unidadePonto: 'Cada ponto = 1 registo de detrito marinho (item observado ou recolhido)',
    unidadeCluster: 'registos',
    legendaCluster: 'Números no mapa = quantidade de registos agrupados nesta área',
    dicaZoom: 'Aproxime o zoom para ver cada registo individualmente',
  },
  'incendio-nasa': {
    unidadePonto: 'Cada ponto = 1 foco de calor detectado por satélite (NASA FIRMS)',
    unidadeCluster: 'focos',
    legendaCluster: 'Números no mapa = focos de calor agrupados nesta área',
    dicaZoom: 'Aproxime o zoom para separar focos individuais',
  },
  sismos: {
    unidadePonto: 'Cada ponto = 1 evento sísmico (magnitude no tamanho/cor)',
    unidadeCluster: 'sismos',
    legendaCluster: 'Números no mapa = eventos sísmicos agrupados nesta área',
    dicaZoom: 'Aproxime o zoom para ver sismos individuais',
  },
  'especies-ameacadas': {
    unidadePonto: 'Cada ponto = 1 ocorrência de espécie ameaçada (GBIF / IUCN)',
    unidadeCluster: 'ocorrências',
    legendaCluster: 'Números no mapa = ocorrências agrupadas nesta área',
    dicaZoom: 'Aproxime o zoom para ver cada ocorrência',
  },
  'eventos-naturais': {
    unidadePonto: 'Cada ponto = 1 evento natural NASA EONET (tempestades, vulcões, incêndios…)',
    unidadeCluster: 'eventos',
    legendaCluster: 'Números no mapa = eventos agrupados nesta área',
    dicaZoom: 'Aproxime o zoom para ver eventos individuais',
  },
  'estacoes-openaq': {
    unidadePonto: 'Cada ponto = 1 estação de qualidade do ar (OpenAQ)',
    unidadeCluster: 'estações',
    legendaCluster: 'Números no mapa = estações agrupadas nesta área',
    dicaZoom: 'Aproxime o zoom para ver cada estação',
  },
  'geleiras-glims': {
    unidadePonto: 'Cada ponto = 1 geleira catalogada (GLIMS)',
    unidadeCluster: 'geleiras',
    legendaCluster: 'Números no mapa = geleiras agrupadas nesta área',
    dicaZoom: 'Aproxime o zoom numa região glaciar para carregar mais contornos',
  },
};

export function getLayerVisualMeta(layerId: string): LayerVisualMeta | undefined {
  return LAYER_VISUAL_META[layerId];
}

export function formatClusterLabel(layerId: string, count: number): string {
  const meta = getLayerVisualMeta(layerId);
  const unit = meta?.unidadeCluster ?? 'pontos';
  return `${count} ${unit}`;
}
