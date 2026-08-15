import { useEffect, useRef, useCallback } from 'react';
import {
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  defined,
  Cartesian2,
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { useCesiumViewer } from './useCesiumViewer';
import { extractPointFromEntity } from './layerRenderer';
import { flyToCoordinates } from './camera';
import { pickGlobeCoordinates } from './camera';
import { useAppStore } from '../store/useAppStore';
import { useGlobeContext } from './GlobeContext';

export function CesiumGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setViewer } = useGlobeContext();
  const viewerRef = useCesiumViewer(containerRef, setViewer);
  const selectPoint = useAppStore((s) => s.selectPoint);
  const setPickedLocation = useAppStore((s) => s.setPickedLocation);

  const handleSelect = useCallback(
    (point: Parameters<typeof selectPoint>[0]) => {
      selectPoint(point);
      if (point && viewerRef.current) {
        flyToCoordinates(viewerRef.current, point.lat, point.lon);
      }
    },
    [selectPoint, viewerRef],
  );

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((movement: { position: Cartesian2 }) => {
      if (viewer.isDestroyed()) return;
      const picked = viewer.scene.pick(movement.position);
      if (defined(picked) && typeof picked === 'object' && picked !== null && 'id' in picked) {
        const entity = picked.id;
        if (entity && typeof entity === 'object' && 'properties' in entity) {
          const result = extractPointFromEntity(entity as never);
          if (result) {
            handleSelect(result.point);
            return;
          }
        }
      }
      selectPoint(null);
      const coords = pickGlobeCoordinates(viewer, movement.position.x, movement.position.y);
      if (coords) setPickedLocation(coords);
    }, ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      if (!handler.isDestroyed()) handler.destroy();
    };
  }, [viewerRef, handleSelect, selectPoint, setPickedLocation]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0"
      aria-label="Globo terrestre interactivo"
    />
  );
}
