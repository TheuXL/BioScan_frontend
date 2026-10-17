import { Flame, Thermometer, Trash2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '../ui/GlassCard';
import { DataChip } from '../ui/DataChip';
import { PanelEmpty, PanelError, PanelLoading, PanelValue } from '../ui/PanelState';
import type { AppDomain } from '../../layers/types';
import type { RespostaCamadaGloboV1 } from '../../api/types/globe';
import { fetchEvents } from '../../api/endpoints/events';
import { fetchOpenAqParameters } from '../../api/endpoints/openaq';
import { getLayerById } from '../../layers/registry';
import { topDebrisRegions } from '../../lib/panelData';
import { formatLayerCount } from '../../lib/format';
import {
  useHasActiveDomainLayers,
  useIsLayerActive,
  useLayerCount,
} from '../../hooks/useLayerActive';

interface DomainPanelProps {
  domain: AppDomain;
}

function SelectLayerPrompt() {
  return (
    <GlassCard active className="w-full pointer-events-auto">
      <PanelEmpty message="Ative uma camada na barra lateral para ver indicadores no mapa." />
    </GlassCard>
  );
}

function FirePanel() {
  const fireActive = useIsLayerActive('incendio-nasa');
  const sismosActive = useIsLayerActive('sismos');
  const eventsActive = useIsLayerActive('eventos-naturais');
  const fireCounts = useLayerCount('incendio-nasa');
  const sismosCounts = useLayerCount('sismos');

  const events = useQuery({
    queryKey: ['panel', 'events', 'open'],
    queryFn: () => fetchEvents({ limit: 5, status: 'open' }),
    enabled: eventsActive,
    staleTime: 120_000,
  });

  return (
    <GlassCard active className="w-full pointer-events-auto">
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
        <h3 className="text-lg font-medium">Panorama</h3>
        {fireActive && fireCounts?.count != null && (
          <span className="font-label text-outline uppercase">{fireCounts.count} focos</span>
        )}
      </div>
      <div className="flex flex-col gap-4">
        {fireActive && fireCounts && (
          <div className="flex justify-between items-end">
            <PanelValue
              label="Focos de calor"
              value={fireCounts.count}
              sub={formatLayerCount(fireCounts.count)}
            />
            <Flame className="w-6 h-6 text-error-container opacity-80" />
          </div>
        )}

        {sismosActive && sismosCounts && (
          <PanelValue
            label="Sismos recentes"
            value={sismosCounts.count}
            sub={formatLayerCount(sismosCounts.count)}
          />
        )}

        {eventsActive && (
          <>
            {events.isLoading && <PanelLoading label="Carregando eventos…" />}
            {events.isError && <PanelError error={events.error} />}
            {events.data?.events && events.data.events.length > 0 && (
              <div>
                <h4 className="font-label text-outline uppercase mb-2">Eventos naturais ativos</h4>
                <div className="space-y-2 text-sm">
                  {events.data.events.map((ev) => (
                    <div key={ev.id} className="glass-panel rounded p-2">
                      <p className="truncate">{ev.title}</p>
                      <p className="text-xs text-outline">{ev.categories?.[0]?.title ?? 'Evento'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {events.data?.events?.length === 0 && (
              <PanelEmpty message="Nenhum evento natural ativo no momento." />
            )}
          </>
        )}
      </div>
    </GlassCard>
  );
}

function OceanPanel() {
  const oceanActive = useIsLayerActive('lixo-marinho-epa');
  const glaciersActive = useIsLayerActive('geleiras-glims');
  const counts = useLayerCount('lixo-marinho-epa');
  const glacierCounts = useLayerCount('geleiras-glims');
  const queryClient = useQueryClient();
  const layer = getLayerById('lixo-marinho-epa');
  const queryParams = { ...layer?.defaultQuery };

  const cached = queryClient.getQueryData<RespostaCamadaGloboV1>([
    'layer',
    'lixo-marinho-epa',
    queryParams,
  ]);
  const hotspots = cached?.pontos ? topDebrisRegions(cached.pontos) : [];

  if (!oceanActive && !glaciersActive) return null;

  return (
    <GlassCard active className="w-full pointer-events-auto">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Oceano & gelo</h3>
        <p className="font-label text-on-surface-variant">Camadas activas nesta vista</p>
      </div>
      <div className="space-y-4">
        {oceanActive && counts && (
          <>
            <PanelValue
              label="Registos de detritos"
              value={counts.count}
              sub={formatLayerCount(counts.count)}
            />
            {hotspots.length > 0 && (
              <div>
                <span className="font-label text-outline uppercase flex items-center gap-1 mb-2">
                  <Trash2 className="w-3 h-3" /> Regiões com mais registros
                </span>
                <div className="space-y-2 text-sm">
                  {hotspots.map((h) => (
                    <div key={h.label} className="flex justify-between glass-panel rounded p-2">
                      <span>{h.label}</span>
                      <DataChip variant="info">{h.count}</DataChip>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {counts.count === 0 && <PanelEmpty message="Sem registros de detritos nesta vista." />}
          </>
        )}

        {glaciersActive && glacierCounts && (
          <PanelValue
            label="Geleiras na vista"
            value={glacierCounts.count}
            sub={formatLayerCount(glacierCounts.count)}
          />
        )}
        {glaciersActive && glacierCounts?.count === 0 && (
          <PanelEmpty message="Aproxime o zoom numa região glaciar para ver contornos GLIMS." />
        )}
      </div>
    </GlassCard>
  );
}

function ClimatePanel() {
  const airActive = useIsLayerActive('estacoes-openaq');
  const counts = useLayerCount('estacoes-openaq');

  const openAqParams = useQuery({
    queryKey: ['panel', 'openaq', 'parameters'],
    queryFn: fetchOpenAqParameters,
    enabled: airActive,
    staleTime: 600_000,
    retry: false,
  });

  if (!airActive) return null;

  return (
    <GlassCard active className="w-full pointer-events-auto">
      <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
        <Thermometer className="w-5 h-5 text-secondary-container" />
        Qualidade do ar
      </h3>
      {openAqParams.isLoading && <PanelLoading />}
      {openAqParams.isError && <PanelError error={openAqParams.error} />}
      {counts && (
        <PanelValue
          label="Estações no mapa"
          value={counts.count}
          sub={formatLayerCount(counts.count)}
        />
      )}
      {openAqParams.data?.results && (
        <div className="mt-4">
          <PanelValue
            label="Poluentes monitorados"
            value={openAqParams.data.results.length}
            sub="Tipos de poluição medidos na rede"
          />
        </div>
      )}
    </GlassCard>
  );
}

function ForestsPanel() {
  const speciesActive = useIsLayerActive('especies-ameacadas');
  const counts = useLayerCount('especies-ameacadas');

  if (!speciesActive || !counts) return null;

  return (
    <GlassCard active className="w-full pointer-events-auto">
      <h3 className="text-lg font-medium mb-2">Biodiversidade</h3>
      <PanelValue
        label="Espécies em risco"
        value={counts.count}
        sub={formatLayerCount(counts.count)}
      />
      {counts.count === 0 && <PanelEmpty message="Sem ocorrências nesta camada." />}
    </GlassCard>
  );
}

export function DomainPanel({ domain }: DomainPanelProps) {
  const hasActive = useHasActiveDomainLayers(domain);
  const wrapper =
    'relative z-20 flex-1 flex flex-col items-end p-4 md:p-8 gap-4 pt-8 pointer-events-none w-full max-w-sm ml-auto';

  if (!hasActive) {
    return (
      <div className={wrapper}>
        <SelectLayerPrompt />
      </div>
    );
  }

  if (domain === 'fire') {
    return (
      <div className={`${wrapper} max-w-md`}>
        <FirePanel />
      </div>
    );
  }
  if (domain === 'ocean') {
    return (
      <div className={wrapper}>
        <OceanPanel />
      </div>
    );
  }
  if (domain === 'climate') {
    return (
      <div className={wrapper}>
        <ClimatePanel />
      </div>
    );
  }

  return (
    <div className={wrapper}>
      <ForestsPanel />
    </div>
  );
}
