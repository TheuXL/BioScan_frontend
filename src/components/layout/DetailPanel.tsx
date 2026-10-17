import { X, MapPin, Clock, Database, ExternalLink } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { DataChip } from '../ui/DataChip';
import { useAppStore } from '../../store/useAppStore';
import { formatCoordinates, formatRelativeTime } from '../../lib/format';
import { humanPointSummary, severityLabel, pointTypeLabel } from '../../lib/humanCopy';
import { SismosDetail } from '../../layers/sismos/sismosDetail';
import { IncendioDetail } from '../../layers/incendio-nasa/incendioDetail';
import { OceanDetail } from '../../layers/lixo-marinho-epa/oceanDetail';
import { EspeciesDetail } from '../../layers/especies-ameacadas/especiesDetail';
import { GeleiraDetail } from '../../layers/geleiras-glims/geleiraDetail';
import { LocalMeteoPanel, OpenAqPointDetail } from './LocalMeteoPanel';

export function DetailPanel() {
  const selectedPoint = useAppStore((s) => s.selectedPoint);
  const pickedLocation = useAppStore((s) => s.pickedLocation);
  const selectPoint = useAppStore((s) => s.selectPoint);
  const setPickedLocation = useAppStore((s) => s.setPickedLocation);
  const detailOpen = useAppStore((s) => s.ui.detailOpen);

  if (!detailOpen || (!selectedPoint && !pickedLocation)) return null;

  function handleClose() {
    selectPoint(null);
    setPickedLocation(null);
  }

  return (
    <aside
      className="fixed inset-x-0 bottom-12 z-50 flex flex-col p-3 max-h-[70vh] pointer-events-none lg:inset-auto lg:right-0 lg:top-16 lg:bottom-12 lg:w-96 lg:max-h-none lg:p-4"
      role="dialog"
      aria-label="Detalhe do ponto"
    >
      <div className="pointer-events-auto flex flex-col gap-3 h-full min-h-0 overflow-hidden rounded-t-2xl lg:rounded-none">
        <div className="lg:hidden flex justify-center pt-1 pb-1">
          <div className="w-10 h-1 rounded-full bg-outline/40" aria-hidden />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4">
          {pickedLocation && !selectedPoint ? (
            <GlassCard active className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-medium text-on-surface">Meteorologia local</h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-outline hover:text-secondary-container p-1"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <LocalMeteoPanel
                lat={pickedLocation.lat}
                lon={pickedLocation.lon}
                defaultExpanded
                onClose={handleClose}
              />
            </GlassCard>
          ) : selectedPoint ? (
            <GlassCard active className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-medium text-on-surface pr-4">
                  {selectedPoint.titulo ?? 'Detalhe do ponto'}
                </h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-outline hover:text-secondary-container p-1"
                  aria-label="Fechar detalhe"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <DataChip variant="info">{pointTypeLabel(selectedPoint.tipo)}</DataChip>
                {(selectedPoint.tipo !== 'lixo_marinho' && selectedPoint.tipo !== 'geleira'
                  ? selectedPoint.severidade != null
                  : selectedPoint.titulo) && (
                  <DataChip variant="warning">{severityLabel(selectedPoint)}</DataChip>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <MapPin className="w-4 h-4 text-secondary-container shrink-0" />
                  <span className="font-label-md">
                    {formatCoordinates(selectedPoint.lat, selectedPoint.lon)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <Clock className="w-4 h-4 text-secondary-container shrink-0" />
                  <span title={selectedPoint.momento ?? undefined}>
                    {formatRelativeTime(selectedPoint.momento)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <Database className="w-4 h-4 text-secondary-container shrink-0" />
                  <span className="text-xs">{selectedPoint.origem}</span>
                </div>
              </div>

              <p className="mt-4 text-sm text-on-surface leading-relaxed border-t border-white/10 pt-4">
                {humanPointSummary(selectedPoint)}
              </p>

              {selectedPoint.tipo === 'sismo' && <SismosDetail point={selectedPoint} />}
              {selectedPoint.tipo === 'incendio' && <IncendioDetail point={selectedPoint} />}
              {selectedPoint.tipo === 'lixo_marinho' && <OceanDetail point={selectedPoint} />}
              {selectedPoint.tipo === 'ameacada_gbif' && <EspeciesDetail point={selectedPoint} />}
              {selectedPoint.tipo === 'geleira' && <GeleiraDetail point={selectedPoint} />}
              {selectedPoint.tipo === 'evento_natural' &&
                typeof selectedPoint.detalhes?.link === 'string' && (
                  <a
                    href={selectedPoint.detalhes.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-secondary-container text-sm mt-4 hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" /> Saiba mais
                  </a>
                )}
              {selectedPoint.tipo === 'estacao_ar' && (
                <OpenAqPointDetail
                  locationId={Number(String(selectedPoint.idFonte).replace('openaq:', ''))}
                />
              )}

              <div className="mt-4 border-t border-white/10 pt-4">
                <LocalMeteoPanel lat={selectedPoint.lat} lon={selectedPoint.lon} />
              </div>
            </GlassCard>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
