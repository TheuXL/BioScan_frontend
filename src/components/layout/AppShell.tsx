import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layers, ChevronUp, ChevronDown } from 'lucide-react';
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
  const sidebarOpen = useAppStore((s) => s.ui.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const selectedPoint = useAppStore((s) => s.selectedPoint);
  const pickedLocation = useAppStore((s) => s.pickedLocation);
  const detailVisible = Boolean(selectedPoint || pickedLocation);

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
          {!detailVisible && <DomainPanel domain={activeDomain} />}
        </div>

        <LayerLegend />
        <TimeSlider />
      </main>

      <DetailPanel />
      <AppFooter />

      <div className="md:hidden fixed bottom-12 left-0 right-0 z-40 pointer-events-none">
        {!sidebarOpen && (
          <div className="flex justify-center pb-2 pointer-events-auto">
            <button
              type="button"
              onClick={toggleSidebar}
              className="glass-panel rounded-full px-4 py-2 flex items-center gap-2 text-sm text-on-surface border border-white/10 shadow-lg"
              aria-expanded={false}
              aria-controls="mobile-layers-sheet"
            >
              <Layers className="w-4 h-4 text-secondary-container" />
              Camadas
              <ChevronUp className="w-4 h-4 text-outline" />
            </button>
          </div>
        )}

        {sidebarOpen && (
          <div
            id="mobile-layers-sheet"
            className="glass-panel border-t border-white/10 rounded-t-xl pointer-events-auto max-h-[45vh] flex flex-col"
          >
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex items-center justify-center gap-2 py-2 text-xs text-outline border-b border-white/5"
              aria-expanded
              aria-controls="mobile-layers-sheet"
            >
              Recolher
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <LayerSidebar
              domain={activeDomain}
              activeTab={sidebarTab}
              onTabChange={setSidebarTab}
              mobile
            />
          </div>
        )}
      </div>
    </div>
  );
}
