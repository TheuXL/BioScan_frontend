import { useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Viewer } from 'cesium';
import { getLayerById } from '../layers/registry';
import { useAppStore } from '../store/useAppStore';
import { useGlobeContext } from '../globe/GlobeContext';
import { renderLayerPoints, removeLayer } from '../globe/layerRenderer';
import { humanApiError } from '../api/client';
import {
  buildApiBboxQuery,
  buildGlimsBboxQuery,
  buildUsgsBboxQuery,
  GLOBE_DEFAULT_LIMIT,
  isWorldView,
  maxRenderedForZoom,
  selectPointsForViewport,
} from '../lib/globeLimits';
import { useVisibleBbox } from './useVisibleBbox';

function isViewerAlive(viewer: Viewer | null): viewer is Viewer {
  return Boolean(viewer && !viewer.isDestroyed() && viewer.scene);
}

function LayerQuery({ layerId }: { layerId: string }) {
  const layer = getLayerById(layerId);
  const { viewer } = useGlobeContext();
  const setLayerStatus = useAppStore((s) => s.setLayerStatus);
  const setLayerCount = useAppStore((s) => s.setLayerCount);
  const fireDateRange = useAppStore((s) => s.fireDateRange);
  const visibleBbox = useAppStore((s) => s.visibleBbox);
  const cameraHeight = useAppStore((s) => s.cameraHeight);
  const renderKeyRef = useRef('');

  const usesApiBbox = Boolean(layer?.supportsViewportFilter);
  const world = isWorldView(visibleBbox, cameraHeight);
  const renderLimit = maxRenderedForZoom(cameraHeight);

  const apiBboxQuery = useMemo(() => {
    if (!usesApiBbox || !visibleBbox || world) return undefined;
    if (layerId === 'sismos') return buildUsgsBboxQuery(visibleBbox);
    if (layerId === 'geleiras-glims') return buildGlimsBboxQuery(visibleBbox);
    return buildApiBboxQuery(visibleBbox);
  }, [usesApiBbox, visibleBbox, world, layerId]);

  const queryParams = {
    ...layer?.defaultQuery,
    ...(usesApiBbox
      ? {
          limit: world ? GLOBE_DEFAULT_LIMIT : Math.max(renderLimit, GLOBE_DEFAULT_LIMIT),
          ...apiBboxQuery,
        }
      : {}),
    ...(layerId === 'incendio-nasa' && fireDateRange
      ? { startDate: fireDateRange.startDate, endDate: fireDateRange.endDate }
      : {}),
  };

  const query = useQuery({
    queryKey: ['layer', layerId, queryParams],
    queryFn: () => layer!.fetchFn(queryParams),
    enabled: !!layer && isViewerAlive(viewer) && layer.disponivel,
    retry: 1,
    staleTime: usesApiBbox ? 30_000 : 120_000,
  });

  const visiblePoints = useMemo(() => {
    if (!query.data?.pontos) return [];
    if (usesApiBbox && apiBboxQuery) {
      return selectPointsForViewport(query.data.pontos, null, cameraHeight);
    }
    return selectPointsForViewport(query.data.pontos, visibleBbox, cameraHeight);
  }, [query.data?.pontos, usesApiBbox, apiBboxQuery, visibleBbox, cameraHeight]);

  useEffect(() => {
    if (!layer) return;
    if (query.isLoading) setLayerStatus(layerId, 'loading');
    else if (query.isError) setLayerStatus(layerId, 'error');
    else if (query.data) {
      if (visiblePoints.length === 0) setLayerStatus(layerId, 'empty');
      else setLayerStatus(layerId, 'success');
      setLayerCount(layerId, visiblePoints.length, query.data.totalMatching ?? query.data.count);
    }
  }, [
    query.isLoading,
    query.isError,
    query.data,
    visiblePoints.length,
    layer,
    layerId,
    setLayerStatus,
    setLayerCount,
  ]);

  useEffect(() => {
    if (!isViewerAlive(viewer) || !query.data) return;
    const activeViewer = viewer;

    const key = `${layerId}:${visiblePoints.length}:${visibleBbox?.minLatitude ?? ''}:${visibleBbox?.maxLongitude ?? ''}:${cameraHeight ?? ''}`;
    if (renderKeyRef.current === key && visiblePoints.length > 0) return;
    renderKeyRef.current = key;

    try {
      renderLayerPoints(activeViewer, layerId, visiblePoints);
    } catch (err) {
      console.warn(`[BioScan] Falha ao desenhar camada ${layerId}:`, err);
    }
  }, [viewer, query.data, layerId, visiblePoints, visibleBbox, cameraHeight]);

  useEffect(() => {
    if (query.isError) {
      console.warn(`[BioScan] Camada ${layerId}:`, humanApiError(query.error));
    }
  }, [query.isError, query.error, layerId]);

  useEffect(() => {
    return () => {
      if (!isViewerAlive(viewer)) return;
      try {
        removeLayer(viewer, layerId);
      } catch {
        /* ignore */
      }
    };
  }, [viewer, layerId]);

  return null;
}

export function useGlobeLayers() {
  const activeLayerIds = useAppStore((s) => s.activeLayerIds);
  const { viewer } = useGlobeContext();

  useVisibleBbox();

  useEffect(() => {
    if (!isViewerAlive(viewer)) return;
    const activeViewer = viewer;

    const activeSet = new Set(activeLayerIds);
    const toRemove: string[] = [];

    for (let i = 0; i < activeViewer.dataSources.length; i++) {
      const ds = activeViewer.dataSources.get(i);
      const name = ds.name ?? '';
      if (name.startsWith('bioscan-')) {
        const id = name.replace('bioscan-', '');
        if (!activeSet.has(id)) toRemove.push(id);
      }
    }

    for (const id of toRemove) {
      try {
        removeLayer(activeViewer, id);
      } catch {
        /* ignore */
      }
    }
  }, [activeLayerIds, viewer]);

  return (
    <>
      {activeLayerIds.map((id) => (
        <LayerQuery key={id} layerId={id} />
      ))}
    </>
  );
}

export function GlobeLayersHost() {
  return useGlobeLayers();
}
