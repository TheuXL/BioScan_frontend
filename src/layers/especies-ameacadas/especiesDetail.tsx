import type { PontoGloboV1 } from '../../api/types/globe';

export function EspeciesDetail({ point }: { point: PontoGloboV1 }) {
  const name = point.detalhes?.scientificName ?? point.titulo;
  const country = point.detalhes?.country;

  return (
    <div className="mt-4 space-y-2 text-sm border-t border-white/10 pt-4">
      {name && (
        <p>
          <span className="font-label text-outline">ESPÉCIE</span>{' '}
          <span className="italic">{String(name)}</span>
        </p>
      )}
      {country != null && (
        <p>
          <span className="font-label text-outline">PAÍS</span> {String(country)}
        </p>
      )}
    </div>
  );
}
