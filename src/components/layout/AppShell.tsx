import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TopBar } from './TopBar';
import { LayerSidebar } from './LayerSidebar';
import { DetailPanel } from './DetailPanel';
import { DomainPanel } from './DomainPanel';
import { TimeSlider } from './TimeSlider';
import { AppFooter } from './AppFooter';
import { LayerLegend } from './LayerLegend';
import { CesiumGlobe } from '../../globe/CesiumGlobe';
import { GlobeLayersHost } from '../../hooks/useGlobeLayers';
import { useAppStore } from '../../store/useAppStore';
import { fetchGlobeIndex, fetchHealth } from '../../api/endpoints/globe';
import { LAYER_REGISTRY } from '../../layers/registry';

export function AppShell() {
  const activeDomain = useAppStore((s) => s.activeDomain);
  const setDomain = useAppStore((s) => s.setDomain);
  const sidebarTab = useAppStore((s) => s.ui.sidebarTab);
  const setSidebarTab = useAppStore((s) => s.setSidebarTab);
  const selectedPoint = useAppStore((s) => s.selectedPoint);
  const pickedLocation = useAppStore((s) => s.pickedLocation);

  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    staleTime: 60_000,
    retry: false,
  });

  const indexQuery = useQuery({
    queryKey: ['globe', 'index'],
    queryFn: fetchGlobeIndex,
    staleTime: 300_000,
    retry: false,
  });

  useEffect(() => {
    if (!indexQuery.data?.camadas || !healthQuery.data) return;
    const availablePaths = new Set(indexQuery.data.camadas.map((c) => c.caminho));
    const mongoOk = healthQuery.data.mongodb === 'connected';
    const openAqOk = healthQuery.data.openAq?.enabled === true;

    for (const layer of LAYER_REGISTRY) {
      let disponivel = availablePaths.has(layer.endpoint);
      if (layer.requiresMongo && !mongoOk) disponivel = false;
      if (layer.requiresOpenAq && !openAqOk) disponivel = false;
      if (layer.id === 'sismos') disponivel = true;
      if (layer.id === 'eventos-naturais') disponivel = true;
      if (layer.id === 'geleiras-glims') disponivel = true;
      layer.disponivel = disponivel;
    }
  }, [indexQuery.data, healthQuery.data]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-primary-container">
      <TopBar activeDomain={activeDomain} onDomainChange={setDomain} />
      <LayerSidebar domain={activeDomain} activeTab={sidebarTab} onTabChange={setSidebarTab} />

      <main className="relative w-full h-full pt-16 md:pl-80 flex flex-col">
        <CesiumGlobe />
        <GlobeLayersHost />

        <div className="relative z-10 flex-1 flex pointer-events-none">
          {!selectedPoint && !pickedLocation && <DomainPanel domain={activeDomain} />}
        </div>

        <LayerLegend />
        <TimeSlider />
      </main>

      <DetailPanel />
      <AppFooter />

      <div className="md:hidden fixed bottom-12 left-0 right-0 z-40 glass-panel border-t border-white/10 rounded-t-xl">
        <LayerSidebar
          domain={activeDomain}
          activeTab={sidebarTab}
          onTabChange={setSidebarTab}
          mobile
        />
      </div>
    </div>
  );
}
