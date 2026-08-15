import { useMemo } from 'react';
import { getLayersByDomain } from '../layers/registry';
import { useAppStore } from '../store/useAppStore';
import type { AppDomain } from '../layers/types';

export function useIsLayerActive(layerId: string): boolean {
  return useAppStore((s) => s.activeLayerIds.includes(layerId));
}

export function useActiveDomainLayers(domain: AppDomain) {
  const activeLayerIds = useAppStore((s) => s.activeLayerIds);
  return useMemo(
    () => getLayersByDomain(domain).filter((layer) => activeLayerIds.includes(layer.id)),
    [domain, activeLayerIds],
  );
}

export function useHasActiveDomainLayers(domain: AppDomain): boolean {
  return useActiveDomainLayers(domain).length > 0;
}

export function useLayerCount(layerId: string) {
  return useAppStore((s) => s.layerCounts[layerId]);
}
