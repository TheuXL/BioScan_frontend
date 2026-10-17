import type { PontoGloboV1 } from '../../api/types/globe';
import { formatDate } from '../../lib/format';

function field(detalhes: Record<string, unknown> | undefined, ...keys: string[]): unknown {
  if (!detalhes) return undefined;
  for (const key of keys) {
    if (detalhes[key] != null) return detalhes[key];
  }
  return undefined;
}

export function OceanDetail({ point }: { point: PontoGloboV1 }) {
  const descricao =
    (field(point.detalhes, 'Descriptio', 'descriptio', 'material', 'debrisType') as string) ??
    point.titulo;
  const categoria = field(point.detalhes, 'Debris_Cat', 'debrisCat');
  const seaState = field(point.detalhes, 'Sea_State', 'seaState');

  return (
    <div className="mt-4 space-y-3 text-sm border-t border-white/10 pt-4">
      <div className="glass-panel rounded-lg p-3 bg-secondary-container/5">
        <p className="font-label text-outline uppercase mb-1">O que é este ponto</p>
        <p className="text-on-surface leading-relaxed">
          Um único registro de detrito marinho — <strong>não</strong> é peso (kg/toneladas) nem
          volume. Representa um item observado ou recolhido numa expedição da EPA.
        </p>
      </div>

      {descricao && (
        <p>
          <span className="font-label text-outline">DESCRIÇÃO</span>{' '}
          <span>{String(descricao)}</span>
        </p>
      )}
      {categoria != null && (
        <p>
          <span className="font-label text-outline">CATEGORIA EPA</span>{' '}
          <span className="font-label-md">{String(categoria)}</span>
        </p>
      )}
      {seaState != null && seaState !== '' && (
        <p>
          <span className="font-label text-outline">ESTADO DO MAR</span>{' '}
          <span>{String(seaState)}</span>
        </p>
      )}
      {point.momento && (
        <p>
          <span className="font-label text-outline">DATA DA OBSERVAÇÃO</span>{' '}
          <span>{formatDate(point.momento)}</span>
        </p>
      )}
      <p className="text-xs text-on-surface-variant">Fonte: EPA — programa de detritos marinhos</p>
    </div>
  );
}
