import {
  Color,
  Cartesian2,
  HorizontalOrigin,
  LabelStyle,
  VerticalOrigin,
  type CustomDataSource,
} from 'cesium';
import { formatClusterLabel } from '../layers/visualMeta';

const clusterCleanup = new Map<string, () => void>();

export function configureLayerClustering(
  ds: CustomDataSource,
  layerId: string,
  accentColor: string,
) {
  const existing = clusterCleanup.get(layerId);
  if (existing) {
    existing();
    clusterCleanup.delete(layerId);
  }

  ds.clustering.enabled = true;
  ds.clustering.pixelRange = 45;
  ds.clustering.minimumClusterSize = 3;

  const removeListener = ds.clustering.clusterEvent.addEventListener((entities, cluster) => {
    try {
      cluster.label.show = true;
      cluster.label.text = formatClusterLabel(layerId, entities.length);
      cluster.label.font = '11px JetBrains Mono, monospace';
      cluster.label.fillColor = Color.WHITE;
      cluster.label.style = LabelStyle.FILL_AND_OUTLINE;
      cluster.label.outlineWidth = 3;
      cluster.label.outlineColor = Color.fromCssColorString('#051424');
      cluster.label.verticalOrigin = VerticalOrigin.CENTER;
      cluster.label.horizontalOrigin = HorizontalOrigin.CENTER;
      cluster.label.pixelOffset = new Cartesian2(0, 0);

      cluster.billboard.show = true;
      cluster.billboard.color = Color.fromCssColorString(accentColor).withAlpha(0.75);
      cluster.billboard.width = Math.min(56, 28 + entities.length.toString().length * 4);
      cluster.billboard.height = 28;
    } catch {
      /* cluster entity já destruído durante actualização */
    }
  });

  clusterCleanup.set(layerId, removeListener);
}

export function removeClusterListener(layerId: string) {
  const remove = clusterCleanup.get(layerId);
  if (remove) {
    remove();
    clusterCleanup.delete(layerId);
  }
}
