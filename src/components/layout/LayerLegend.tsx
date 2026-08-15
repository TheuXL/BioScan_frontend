import { Info } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { useAppStore } from '../../store/useAppStore';
import { getLayerById } from '../../layers/registry';
import { getLayerVisualMeta } from '../../layers/visualMeta';

export function LayerLegend() {
  const activeLayerIds = useAppStore((s) => s.activeLayerIds);

  if (activeLayerIds.length === 0) return null;

  return (
    <div className="absolute bottom-36 left-4 md:left-[calc(20rem+1rem)] z-30 pointer-events-none max-w-xs">
      <div className="pointer-events-auto flex flex-col gap-2">
        {activeLayerIds.map((id) => {
          const layer = getLayerById(id);
          const meta = getLayerVisualMeta(id);
          if (!layer || !meta) return null;

          return (
            <GlassCard key={id} className="p-3 text-xs">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: layer.corAccent }}
                />
                <span className="font-medium text-on-surface">{layer.nomeExibicao}</span>
              </div>
              <ul className="space-y-1.5 text-on-surface-variant leading-relaxed">
                <li className="flex gap-2">
                  <Info className="w-3.5 h-3.5 text-secondary-container shrink-0 mt-0.5" />
                  <span>{meta.unidadePonto}</span>
                </li>
                <li className="pl-5">
                  <span className="font-label text-secondary-container">{meta.legendaCluster}</span>
                </li>
                <li className="pl-5 text-outline">{meta.dicaZoom}</li>
              </ul>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
