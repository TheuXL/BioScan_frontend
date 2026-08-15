import {
  CustomDataSource,
  Entity,
  Cartesian3,
  type Viewer,
} from 'cesium';
import type { PontoGloboV1 } from '../api/types/globe';
import { entityFromPoint } from './colors';
import { configureLayerClustering, removeClusterListener } from './clustering';
import { getLayerById } from '../layers/registry';

const dataSources = new Map<string, CustomDataSource>();

function isViewerAlive(viewer: Viewer | null | undefined): viewer is Viewer {
  return Boolean(viewer && !viewer.isDestroyed() && viewer.scene);
}

function isValidPoint(p: PontoGloboV1): boolean {
  return (
    Number.isFinite(p.lat) &&
    Number.isFinite(p.lon) &&
    p.lat >= -90 &&
    p.lat <= 90 &&
    p.lon >= -180 &&
    p.lon <= 180
  );
}

export function getOrCreateDataSource(viewer: Viewer, layerId: string): CustomDataSource | null {
  if (!isViewerAlive(viewer)) return null;

  let ds = dataSources.get(layerId);
  if (!ds) {
    ds = new CustomDataSource(`bioscan-${layerId}`);
    viewer.dataSources.add(ds);
    const layer = getLayerById(layerId);
    configureLayerClustering(ds, layerId, layer?.corAccent ?? '#00F1FE');
    dataSources.set(layerId, ds);
  }
  return ds;
}

export function renderLayerPoints(
  viewer: Viewer,
  layerId: string,
  pontos: PontoGloboV1[],
) {
  if (!isViewerAlive(viewer)) return;

  const ds = getOrCreateDataSource(viewer, layerId);
  if (!ds) return;

  const clusteringWasEnabled = ds.clustering.enabled;
  ds.clustering.enabled = false;

  try {
    ds.entities.removeAll();

    const seen = new Set<string>();
    for (let i = 0; i < pontos.length; i++) {
      const p = pontos[i]!;
      if (!isValidPoint(p)) continue;

      const baseId = `${layerId}:${p.idFonte || `${p.lat},${p.lon}`}`;
      let entityId = baseId;
      if (seen.has(entityId)) entityId = `${baseId}#${i}`;
      seen.add(entityId);

      const opts = entityFromPoint(p, layerId);
      ds.entities.add(
        new Entity({
          ...opts,
          id: entityId,
          position: Cartesian3.fromDegrees(p.lon, p.lat),
        }),
      );
    }
  } finally {
    if (isViewerAlive(viewer) && clusteringWasEnabled) {
      ds.clustering.enabled = true;
    }
  }
}

export function removeLayer(viewer: Viewer, layerId: string) {
  const ds = dataSources.get(layerId);
  if (!ds) return;

  removeClusterListener(layerId);
  dataSources.delete(layerId);

  if (isViewerAlive(viewer)) {
    try {
      viewer.dataSources.remove(ds, true);
    } catch {
      /* already destroyed */
    }
  }
}

export function clearAllLayers(viewer: Viewer) {
  for (const layerId of [...dataSources.keys()]) {
    removeLayer(viewer, layerId);
  }
}

export function extractPointFromEntity(entity: Entity): {
  point: PontoGloboV1;
  layerId: string;
} | null {
  const props = entity.properties;
  if (!props) return null;

  try {
    const point = props.bioscanPoint?.getValue() as PontoGloboV1 | undefined;
    const layerId = props.bioscanLayerId?.getValue() as string | undefined;
    if (!point || !layerId) return null;
    return { point, layerId };
  } catch {
    return null;
  }
}
