import type { ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Flame, Waves, Thermometer, TreePine } from 'lucide-react';
import type { AppDomain } from '../../layers/types';
import type { RespostaCamadaGloboV1 } from '../../api/types/globe';
import { fetchEvents } from '../../api/endpoints/events';
import { fetchOpenAqParameters } from '../../api/endpoints/openaq';
import { fetchEarthquakeFeed } from '../../api/endpoints/globe';
import { getLayerById } from '../../layers/registry';
import { topDebrisRegions } from '../../lib/panelData';
import {
  useHasActiveDomainLayers,
  useIsLayerActive,
  useLayerCount,
} from '../../hooks/useLayerActive';
import { DataChip } from '../ui/DataChip';
import { PanelEmpty, PanelError, PanelLoading, PanelValue } from '../ui/PanelState';

interface AnalysisTabProps {
  domain: AppDomain;
}

function InsightCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="glass-panel rounded-lg p-3 space-y-2">
      <p className="font-label text-secondary-container">{title}</p>
      {children}
    </div>
  );
}

function SelectLayerPrompt() {
  return (
    <PanelEmpty message="Ative uma camada para ver a análise dos dados no mapa." />
  );
}

function FireAnalysis() {
  const fireActive = useIsLayerActive('incendio-nasa');
  const sismosActive = useIsLayerActive('sismos');
  const eventsActive = useIsLayerActive('eventos-naturais');
  const fireCounts = useLayerCount('incendio-nasa');
  const sismosCounts = useLayerCount('sismos');

  const earthquakes = useQuery({
    queryKey: ['analysis', 'earthquakes', 'all_day'],
    queryFn: () => fetchEarthquakeFeed('all_day'),
    enabled: sismosActive,
    staleTime: 120_000,
  });
  const events = useQuery({
    queryKey: ['panel', 'events', 'open'],
    queryFn: () => fetchEvents({ limit: 5, status: 'open' }),
    enabled: eventsActive,
    staleTime: 120_000,
  });

  const hasContent = fireActive || sismosActive || eventsActive;
  if (!hasContent) return <SelectLayerPrompt />;

  return (
    <div className="flex flex-col gap-3 px-2 text-sm overflow-y-auto max-h-[50vh]">
      {fireActive && fireCounts && (
        <InsightCard title="Focos de calor">
          <PanelValue
            label="No mapa"
            value={fireCounts.count}
            decimals={0}
            sub={
              fireCounts.totalMatching != null && fireCounts.totalMatching > fireCounts.count
                ? `de ${fireCounts.totalMatching.toLocaleString('pt-BR')} no total`
                : undefined
            }
          />
        </InsightCard>
      )}

      {sismosActive && (
        <>
          {sismosCounts && (
            <InsightCard title="Sismos">
              <PanelValue label="No mapa" value={sismosCounts.count} decimals={0} />
            </InsightCard>
          )}
          {earthquakes.isLoading && <PanelLoading label="Analisando sismos…" />}
          {earthquakes.data && (
            <InsightCard title="Atividade sísmica">
              <PanelValue
                label="Últimas 24 horas"
                value={earthquakes.data.features?.length ?? 0}
                decimals={0}
                sub="Eventos registrados globalmente"
              />
            </InsightCard>
          )}
        </>
      )}

      {eventsActive && (
        <>
          {events.isLoading && <PanelLoading label="Analisando eventos…" />}
          {events.isError && <PanelError error={events.error} />}
          {events.data?.events && events.data.events.length > 0 && (
            <InsightCard title="Eventos naturais ativos">
              <ul className="space-y-2">
                {events.data.events.map((ev) => (
                  <li key={ev.id} className="flex justify-between gap-2 text-xs">
                    <span className="truncate">{ev.title}</span>
                    <DataChip variant="warning">
                      {ev.categories?.[0]?.title ?? 'Evento'}
                    </DataChip>
                  </li>
                ))}
              </ul>
            </InsightCard>
          )}
        </>
      )}
    </div>
  );
}

function OceanAnalysis() {
  const oceanActive = useIsLayerActive('lixo-marinho-epa');
  const glaciersActive = useIsLayerActive('geleiras-glims');
  const counts = useLayerCount('lixo-marinho-epa');
  const glacierCounts = useLayerCount('geleiras-glims');
  const queryClient = useQueryClient();
  const layer = getLayerById('lixo-marinho-epa');
  const queryParams = { ...layer?.defaultQuery };

  if (!oceanActive && !glaciersActive) return <SelectLayerPrompt />;

  const cached = queryClient.getQueryData<RespostaCamadaGloboV1>([
    'layer',
    'lixo-marinho-epa',
    queryParams,
  ]);
  const hotspots = cached?.pontos ? topDebrisRegions(cached.pontos, 4) : [];

  return (
    <div className="flex flex-col gap-3 px-2 text-sm overflow-y-auto max-h-[50vh]">
      {oceanActive && counts && (
        <InsightCard title="Detritos marinhos">
          <PanelValue
            label="Registos"
            value={counts.count}
            sub={`${counts.count} pontos no mapa`}
          />
        </InsightCard>
      )}
      {oceanActive && hotspots.length > 0 && (
        <InsightCard title="Regiões com mais registros">
          <ul className="space-y-2 text-xs">
            {hotspots.map((h) => (
              <li key={h.label} className="flex justify-between glass-panel rounded p-2">
                <span>{h.label}</span>
                <DataChip variant="info">{h.count}</DataChip>
              </li>
            ))}
          </ul>
        </InsightCard>
      )}
      {glaciersActive && glacierCounts && (
        <InsightCard title="Geleiras GLIMS">
          <PanelValue
            label="Na vista"
            value={glacierCounts.count}
            sub="Contornos na região visível — aproxime o zoom para carregar mais"
          />
        </InsightCard>
      )}
      {oceanActive && counts?.count === 0 && <PanelEmpty message="Sem registros nesta camada." />}
      {glaciersActive && glacierCounts?.count === 0 && (
        <PanelEmpty message="Aproxime o zoom numa região glaciar." />
      )}
    </div>
  );
}

function ClimateAnalysis() {
  const airActive = useIsLayerActive('estacoes-openaq');
  const counts = useLayerCount('estacoes-openaq');

  const openAq = useQuery({
    queryKey: ['panel', 'openaq', 'parameters'],
    queryFn: fetchOpenAqParameters,
    enabled: airActive,
    staleTime: 600_000,
    retry: false,
  });

  if (!airActive) return <SelectLayerPrompt />;

  return (
    <div className="flex flex-col gap-3 px-2 text-sm overflow-y-auto max-h-[50vh]">
      {openAq.isLoading && <PanelLoading label="Analisando…" />}
      {openAq.isError && <PanelError error={openAq.error} />}
      {counts && (
        <InsightCard title="Estações de ar">
          <PanelValue label="No mapa" value={counts.count} decimals={0} />
        </InsightCard>
      )}
      {openAq.data?.results && (
        <InsightCard title="Poluentes">
          <PanelValue
            label="Tipos monitorados"
            value={openAq.data.results.length}
            decimals={0}
            sub="Medidos pela rede global"
          />
        </InsightCard>
      )}
    </div>
  );
}

function ForestsAnalysis() {
  const speciesActive = useIsLayerActive('especies-ameacadas');
  const counts = useLayerCount('especies-ameacadas');

  if (!speciesActive) return <SelectLayerPrompt />;

  return (
    <div className="flex flex-col gap-3 px-2 text-sm overflow-y-auto max-h-[50vh]">
      {counts && (
        <InsightCard title="Espécies em risco">
          <PanelValue
            label="No mapa"
            value={counts.count}
            decimals={0}
            sub={
              counts.totalMatching != null && counts.totalMatching > counts.count
                ? `de ${counts.totalMatching.toLocaleString('pt-BR')} no total`
                : undefined
            }
          />
        </InsightCard>
      )}
      {counts?.count === 0 && <PanelEmpty message="Sem ocorrências nesta camada." />}
    </div>
  );
}

const DOMAIN_HEADERS: Record<AppDomain, { icon: typeof Flame; label: string }> = {
  fire: { icon: Flame, label: 'Fogo, calor e sismos' },
  ocean: { icon: Waves, label: 'Oceano e gelo' },
  climate: { icon: Thermometer, label: 'Clima e ar' },
  forests: { icon: TreePine, label: 'Florestas e vida' },
};

export function AnalysisTab({ domain }: AnalysisTabProps) {
  const hasActive = useHasActiveDomainLayers(domain);
  const header = DOMAIN_HEADERS[domain];
  const Icon = header.icon;

  return (
    <div className="flex flex-col gap-2 min-h-0">
      <p className="px-2 text-xs text-on-surface-variant flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-secondary-container" />
        {header.label}
      </p>
      {!hasActive && <SelectLayerPrompt />}
      {hasActive && domain === 'fire' && <FireAnalysis />}
      {hasActive && domain === 'ocean' && <OceanAnalysis />}
      {hasActive && domain === 'climate' && <ClimateAnalysis />}
      {hasActive && domain === 'forests' && <ForestsAnalysis />}
    </div>
  );
}
