import type { PontoGloboV1 } from '../../api/types/globe';

export function IncendioDetail({ point }: { point: PontoGloboV1 }) {
  const frp = point.detalhes?.frp;
  const confidence = point.detalhes?.confidence ?? point.severidade;

  return (
    <div className="mt-4 space-y-2 text-sm border-t border-white/10 pt-4">
      {confidence != null && (
        <p>
          <span className="font-label text-outline">CONFIANÇA</span>{' '}
          <span className="font-label-md">{String(confidence)}</span>
        </p>
      )}
      {frp != null && (
        <p>
          <span className="font-label text-outline">FRP</span>{' '}
          <span className="font-label-md">{String(frp)} MW</span>
        </p>
      )}
    </div>
  );
}
