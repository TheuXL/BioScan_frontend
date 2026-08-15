import type { PontoGloboV1 } from '../../api/types/globe';
import { formatDate } from '../../lib/format';

function field(detalhes: Record<string, unknown> | undefined, ...keys: string[]): unknown {
  if (!detalhes) return undefined;
  for (const key of keys) {
    if (detalhes[key] != null && detalhes[key] !== '') return detalhes[key];
  }
  return undefined;
}

export function GeleiraDetail({ point }: { point: PontoGloboV1 }) {
  const name = field(point.detalhes, 'glac_name') ?? point.titulo;
  const area = field(point.detalhes, 'area', 'db_area');
  const status = field(point.detalhes, 'status', 'rec_status');
  const glacId = field(point.detalhes, 'glac_id');
  const affiliation = field(point.detalhes, 'chief_affl');
  const srcDate = field(point.detalhes, 'src_date');

  return (
    <div className="mt-4 space-y-2 text-sm border-t border-white/10 pt-4">
      {name && (
        <p>
          <span className="font-label text-outline">NOME</span>{' '}
          <span>{String(name)}</span>
        </p>
      )}
      {area != null && (
        <p>
          <span className="font-label text-outline">ÁREA</span>{' '}
          <span className="font-label-md">{Number(area).toLocaleString('pt-PT', { maximumFractionDigits: 4 })} km²</span>
        </p>
      )}
      {status != null && (
        <p>
          <span className="font-label text-outline">ESTADO</span> {String(status)}
        </p>
      )}
      {glacId != null && (
        <p>
          <span className="font-label text-outline">ID GLIMS</span>{' '}
          <span className="font-label-md">{String(glacId)}</span>
        </p>
      )}
      {srcDate != null && (
        <p>
          <span className="font-label text-outline">DATA DA FONTE</span>{' '}
          {formatDate(String(srcDate))}
        </p>
      )}
      {affiliation != null && (
        <p className="text-xs text-on-surface-variant">{String(affiliation)}</p>
      )}
      <p className="text-xs text-on-surface-variant">Fonte: GLIMS — inventário global de geleiras</p>
    </div>
  );
}
