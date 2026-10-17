import type { PontoGloboV1 } from '../../api/types/globe';
import { formatNumber } from '../../lib/format';

function confidenceLabel(raw: unknown): string {
  const code = String(raw).trim().toLowerCase();
  if (code === 'h' || code === 'high') return 'Alta';
  if (code === 'n' || code === 'nominal') return 'Nominal';
  if (code === 'l' || code === 'low') return 'Baixa';
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    if (raw >= 80) return 'Alta';
    if (raw >= 30) return 'Nominal';
    return 'Baixa';
  }
  return String(raw);
}

export function IncendioDetail({ point }: { point: PontoGloboV1 }) {
  const frp = point.detalhes?.frp;
  const confidence = point.detalhes?.confidence ?? point.severidade;

  return (
    <div className="mt-4 space-y-2 text-sm border-t border-white/10 pt-4">
      {confidence != null && (
        <p>
          <span className="font-label text-outline">CONFIANÇA</span>{' '}
          <span className="font-label-md">{confidenceLabel(confidence)}</span>
        </p>
      )}
      {frp != null && Number.isFinite(Number(frp)) && (
        <p>
          <span className="font-label text-outline">FRP</span>{' '}
          <span className="font-label-md">{formatNumber(Number(frp), 1)} MW</span>
        </p>
      )}
    </div>
  );
}
