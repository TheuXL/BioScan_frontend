import {
  Layers,
  BarChart3,
  Radio,
  Waves,
  Thermometer,
  TreePine,
  Flame,
} from 'lucide-react';
import { LayerToggle } from '../layers/LayerToggle';
import { AnalysisTab } from './AnalysisTab';
import { MonitoringTab } from './MonitoringTab';
import { getLayersByDomain, getDomainLabel } from '../../layers/registry';
import type { AppDomain, SidebarTab } from '../../layers/types';

const TAB_ICONS = {
  layers: Layers,
  analysis: BarChart3,
  monitoring: Radio,
};

const DOMAIN_ICONS: Record<AppDomain, typeof Flame> = {
  fire: Flame,
  ocean: Waves,
  climate: Thermometer,
  forests: TreePine,
};

const TAB_LABELS: Record<SidebarTab, string> = {
  layers: 'Camadas',
  analysis: 'Análise',
  monitoring: 'Monitoramento',
};

interface LayerSidebarProps {
  domain: AppDomain;
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  mobile?: boolean;
}

export function LayerSidebar({ domain, activeTab, onTabChange, mobile = false }: LayerSidebarProps) {
  const layers = getLayersByDomain(domain);
  const DomainIcon = DOMAIN_ICONS[domain];

  const sidebarClass = mobile
    ? 'flex flex-col p-4 overflow-y-auto min-h-0'
    : 'hidden md:flex fixed left-0 top-16 bottom-0 w-80 z-40 flex-col p-4 bg-surface-container/80 backdrop-blur-xl border-r border-secondary/20';

  return (
    <aside className={sidebarClass}>
      <div className="flex items-center gap-4 p-2 mb-4">
        <div className="w-10 h-10 rounded bg-secondary-container/10 flex items-center justify-center border border-secondary-container/30">
          <DomainIcon className="w-5 h-5 text-secondary-container" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-on-surface">Camadas ambientais</h2>
          <p className="font-label text-on-surface-variant">
            {getDomainLabel(domain)} · Monitoramento global
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 mb-4">
        {(['layers', 'analysis', 'monitoring'] as SidebarTab[]).map((tab) => {
          const Icon = TAB_ICONS[tab];
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={`flex items-center gap-3 rounded-lg px-4 py-2 font-label-md transition-all border-l-4 ${
                activeTab === tab
                  ? 'bg-secondary-container/20 text-secondary-container border-secondary-container'
                  : 'text-on-surface-variant border-transparent hover:bg-surface-bright/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {TAB_LABELS[tab]}
            </button>
          );
        })}
      </nav>

      {activeTab === 'layers' && (
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-0">
          {layers.length === 0 ? (
            <p className="text-sm text-on-surface-variant px-2">
              Nenhuma camada de globo neste domínio. Consulte os painéis laterais.
            </p>
          ) : (
            layers.map((layer) => <LayerToggle key={layer.id} layer={layer} />)
          )}
        </div>
      )}

      {activeTab === 'analysis' && <AnalysisTab domain={domain} />}

      {activeTab === 'monitoring' && <MonitoringTab />}
    </aside>
  );
}
