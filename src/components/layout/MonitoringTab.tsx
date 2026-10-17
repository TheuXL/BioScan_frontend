import { useQuery } from '@tanstack/react-query';
import { fetchFiresSyncStatus, fetchFiresByCountry } from '../../api/endpoints/fire';
import { fetchExtinctionSyncStatus } from '../../api/endpoints/globe';
import { PanelEmpty, PanelLoading } from '../ui/PanelState';
import { formatDate, formatInteger } from '../../lib/format';
import { useIsLayerActive } from '../../hooks/useLayerActive';

function SyncRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs glass-panel rounded p-2">
      <span className="text-on-surface-variant">{label}</span>
      <span className="font-label-md text-secondary-container">{value}</span>
    </div>
  );
}

function readFireCountryCount(data: Record<string, unknown>): number | null {
  if (typeof data.count === 'number') return data.count;
  if (Array.isArray(data.data)) return data.data.length;
  if (Array.isArray(data.fires)) return data.fires.length;
  return null;
}

export function MonitoringTab() {
  const fireActive = useIsLayerActive('incendio-nasa');
  const speciesActive = useIsLayerActive('especies-ameacadas');

  const fireSync = useQuery({
    queryKey: ['fires', 'sync-status'],
    queryFn: fetchFiresSyncStatus,
    enabled: fireActive,
    staleTime: 60_000,
  });
  const extinctionSync = useQuery({
    queryKey: ['extinction', 'sync-status'],
    queryFn: fetchExtinctionSyncStatus,
    enabled: speciesActive,
    staleTime: 60_000,
    retry: false,
  });
  const firesByCountry = useQuery({
    queryKey: ['fires', 'by-country', 'BRA'],
    queryFn: () => fetchFiresByCountry({ countryCode: 'BRA', days: 1 }),
    enabled: fireActive,
    staleTime: 120_000,
    retry: false,
  });

  const brFires = firesByCountry.data ? readFireCountryCount(firesByCountry.data) : null;
  const hasAny =
    (fireActive && (fireSync.data || brFires != null)) ||
    (speciesActive && extinctionSync.data?.lastSyncTime);

  if (!fireActive && !speciesActive) {
    return (
      <div className="px-2">
        <PanelEmpty message="Ative uma camada para ver atualizações." />
      </div>
    );
  }

  if (fireActive && fireSync.isLoading) return <PanelLoading />;

  return (
    <div className="flex flex-col gap-3 px-2 overflow-y-auto">
      <p className="text-xs text-on-surface-variant px-1">Atualização dos dados ativos</p>

      {fireActive && fireSync.data && (
        <SyncRow
          label="Incêndios"
          value={
            fireSync.data.lastSyncTime
              ? formatDate(fireSync.data.lastSyncTime)
              : fireSync.data.isRunning
                ? 'Atualizando…'
                : '—'
          }
        />
      )}

      {fireActive && brFires != null && (
        <SyncRow label="Focos no Brasil (24h)" value={formatInteger(brFires)} />
      )}

      {speciesActive && extinctionSync.data?.lastSyncTime && (
        <SyncRow
          label="Espécies ameaçadas"
          value={formatDate(extinctionSync.data.lastSyncTime)}
        />
      )}

      {!hasAny && <PanelEmpty message="Sem informação de atualização disponível." />}
    </div>
  );
}
