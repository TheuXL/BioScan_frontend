import { Color, ConstantProperty } from 'cesium';
import type { PontoGloboV1 } from '../api/types/globe';

const COLORS = {
  fire: '#FF4444',
  earthquake: '#FFD166',
  ocean: '#43D8F2',
  glacier: '#B8ECFF',
  speciesCR: '#FF4444',
  speciesEN: '#FF8C42',
  speciesVU: '#FFD166',
  speciesDefault: '#4ADE80',
  uiActive: '#00F1FE',
};

export function severityToColor(tipo: string, severidade: string | number | null): string {
  if (tipo === 'incendio') return COLORS.fire;
  if (tipo === 'sismo') {
    const mag = typeof severidade === 'number' ? severidade : parseFloat(String(severidade));
    if (mag >= 6) return COLORS.fire;
    if (mag >= 4.5) return COLORS.speciesEN;
    return COLORS.earthquake;
  }
  if (tipo === 'lixo_marinho') return COLORS.ocean;
  if (tipo === 'geleira') return COLORS.glacier;
  if (tipo === 'evento_natural') return COLORS.speciesEN;
  if (tipo === 'estacao_ar') return '#A78BFA';
  if (tipo === 'ameacada_gbif') {
    const cat = String(severidade ?? '').toUpperCase();
    if (cat === 'CR') return COLORS.speciesCR;
    if (cat === 'EN') return COLORS.speciesEN;
    if (cat === 'VU') return COLORS.speciesVU;
    return COLORS.speciesDefault;
  }
  return COLORS.uiActive;
}

export function magnitudeToPixelSize(severidade: string | number | null, tipo: string): number {
  if (tipo === 'sismo') {
    const mag = typeof severidade === 'number' ? severidade : parseFloat(String(severidade)) || 3;
    return Math.min(18, Math.max(6, mag * 2.5));
  }
  if (tipo === 'incendio') return 8;
  if (tipo === 'lixo_marinho') return 7;
  if (tipo === 'geleira') return 7;
  return 6;
}

export function cssColorToCesium(css: string): Color {
  return Color.fromCssColorString(css);
}

export function entityFromPoint(p: PontoGloboV1, layerId: string) {
  const color = severityToColor(p.tipo, p.severidade);
  const size = magnitudeToPixelSize(p.severidade, p.tipo);

  return {
    id: `${layerId}:${p.idFonte}`,
    position: undefined as never,
    point: {
      pixelSize: size,
      color: cssColorToCesium(color),
      outlineColor: Color.WHITE.withAlpha(0.3),
      outlineWidth: 1,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    properties: {
      bioscanPoint: new ConstantProperty(p),
      bioscanLayerId: new ConstantProperty(layerId),
    },
  };
}
