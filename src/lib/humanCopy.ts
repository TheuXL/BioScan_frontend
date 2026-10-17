import type { PontoGloboV1 } from '../api/types/globe';

export function humanPointSummary(p: PontoGloboV1): string {
  switch (p.tipo) {
    case 'sismo': {
      const mag = p.severidade ?? '?';
      const depth = p.detalhes?.depthKm;
      return `Sismo de magnitude ${mag}${depth != null ? ` a ${depth} km de profundidade` : ''}. Os dados ajudam a perceber a atividade sísmica na região.`;
    }
    case 'incendio':
      return 'Foco de calor detectado por satélite. Pode indicar incêndio ou queimada — a proximidade de florestas e comunidades importa.';
    case 'lixo_marinho':
      return 'Cada ponto é um registro individual de detrito marinho (item observado ou recolhido), não uma quantidade em toneladas. Os números no mapa, quando visíveis, indicam quantos registros estão agrupados — aproxime o zoom para ver cada um.';
    case 'ameacada_gbif':
      return `Espécie em risco (${p.severidade ?? 'IUCN'}). A biodiversidade desta região precisa de atenção e proteção.`;
    case 'evento_natural':
      return 'Evento natural ativo registrado pela NASA EONET nesta coordenada.';
    case 'estacao_ar':
      return 'Estação de monitoramento da qualidade do ar. Os poluentes medidos dependem dos sensores instalados.';
    case 'geleira':
      return 'Geleira catalogada pelo inventário GLIMS. Aproximar o zoom mostra mais contornos na região visível.';
    default:
      return p.titulo ?? 'Evento ambiental registrado nesta coordenada.';
  }
}

export function severityLabel(p: PontoGloboV1): string {
  if (p.severidade == null) return '—';
  if (p.tipo === 'lixo_marinho') return p.titulo ?? 'Detrito observado';
  if (p.tipo === 'ameacada_gbif') return String(p.severidade);
  if (p.tipo === 'geleira') {
    const area = p.detalhes?.area ?? p.detalhes?.db_area;
    if (area != null) return `${Number(area).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} km²`;
    return p.titulo ?? 'Geleira';
  }
  if (p.tipo === 'sismo' && typeof p.severidade === 'number') return `M ${p.severidade}`;
  if (typeof p.severidade === 'number') return String(p.severidade);
  return String(p.severidade);
}

export function pointTypeLabel(tipo: string): string {
  const labels: Record<string, string> = {
    lixo_marinho: 'Detrito marinho',
    ameacada_gbif: 'Espécie ameaçada',
    evento_natural: 'Evento natural',
    estacao_ar: 'Estação de ar',
    incendio: 'Foco de calor',
    sismo: 'Sismo',
    geleira: 'Geleira',
  };
  return labels[tipo] ?? tipo.replace(/_/g, ' ');
}
