import type { PontoGloboV1 } from '../../api/types/globe';

export function SismosDetail({ point }: { point: PontoGloboV1 }) {
  const depth = point.detalhes?.depthKm;
  const tsunami = point.detalhes?.tsunami;
  const url = point.detalhes?.url as string | undefined;

  return (
    <div className="mt-4 space-y-2 text-sm border-t border-white/10 pt-4">
      {depth != null && (
        <p>
          <span className="font-label text-outline">PROFUNDIDADE</span>{' '}
          <span className="font-label-md">{String(depth)} km</span>
        </p>
      )}
      {tsunami != null && Number(tsunami) > 0 && (
        <p className="text-error text-xs">Alerta de tsunami reportado</p>
      )}
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-secondary-container text-xs hover:underline"
        >
          Ver no USGS →
        </a>
      )}
    </div>
  );
}
