import { Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import type { GlobeLayerDefinition } from '../../layers/types';
import { useAppStore } from '../../store/useAppStore';
import { getLayerVisualMeta } from '../../layers/visualMeta';
import { formatLayerCount } from '../../lib/format';

interface LayerToggleProps {
  layer: GlobeLayerDefinition;
}

export function LayerToggle({ layer }: LayerToggleProps) {
  const activeLayerIds = useAppStore((s) => s.activeLayerIds);
  const toggleLayer = useAppStore((s) => s.toggleLayer);
  const status = useAppStore((s) => s.layerStatus[layer.id] ?? 'idle');
  const counts = useAppStore((s) => s.layerCounts[layer.id]);
  const queryClient = useQueryClient();

  const isActive = activeLayerIds.includes(layer.id);
  const meta = getLayerVisualMeta(layer.id);

  return (
    <div className={`glass-panel rounded-lg p-3 transition-all ${isActive ? 'active-card' : ''}`}>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isActive}
          onChange={() => toggleLayer(layer.id)}
          disabled={!layer.disponivel}
          className="mt-1 accent-secondary-container w-4 h-4"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: layer.corAccent }}
            />
            <span className="font-medium text-on-surface text-sm">{layer.nomeExibicao}</span>
            {status === 'loading' && (
              <Loader2 className="w-3 h-3 animate-spin text-secondary-container ml-auto" />
            )}
          </div>
          <p className="text-xs text-on-surface-variant mt-1">{layer.descricaoCurta}</p>
          {isActive && counts && (
            <p className="font-label text-secondary-container mt-1">
              {formatLayerCount(counts.count)}
            </p>
          )}
          {isActive && meta && (
            <p className="text-[11px] text-outline mt-1 leading-snug">{meta.unidadePonto}</p>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2 mt-2 text-error text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>Indisponível</span>
              <button
                type="button"
                className="ml-auto text-secondary-container hover:underline flex items-center gap-1"
                onClick={(e) => {
                  e.preventDefault();
                  queryClient.invalidateQueries({ queryKey: ['layer', layer.id] });
                }}
              >
                <RotateCcw className="w-3 h-3" />
                Retry
              </button>
            </div>
          )}
          {status === 'empty' && isActive && (
            <p className="text-xs text-outline mt-1">Sem dados nesta região</p>
          )}
        </div>
      </label>
    </div>
  );
}
