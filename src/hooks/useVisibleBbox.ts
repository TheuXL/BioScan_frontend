import { useEffect } from 'react';
import { Cartographic, type Viewer } from 'cesium';
import { useGlobeContext } from '../globe/GlobeContext';
import { getVisibleBbox } from '../globe/camera';
import { useAppStore } from '../store/useAppStore';

function roundBbox(bbox: ReturnType<typeof getVisibleBbox>) {
  if (!bbox) return null;
  return {
    minLatitude: Math.round(bbox.minLatitude * 10) / 10,
    maxLatitude: Math.round(bbox.maxLatitude * 10) / 10,
    minLongitude: Math.round(bbox.minLongitude * 10) / 10,
    maxLongitude: Math.round(bbox.maxLongitude * 10) / 10,
  };
}

function isViewerAlive(viewer: Viewer | null): viewer is Viewer {
  return Boolean(viewer && !viewer.isDestroyed() && viewer.scene);
}

export function useVisibleBbox() {
  const { viewer } = useGlobeContext();
  const setVisibleBbox = useAppStore((s) => s.setVisibleBbox);
  const setCameraHeight = useAppStore((s) => s.setCameraHeight);

  useEffect(() => {
    if (!isViewerAlive(viewer)) return;
    const activeViewer = viewer;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const update = () => {
      if (cancelled || !isViewerAlive(activeViewer)) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (cancelled || !isViewerAlive(activeViewer)) return;
        try {
          setVisibleBbox(roundBbox(getVisibleBbox(activeViewer)));
          const carto = Cartographic.fromCartesian(activeViewer.camera.positionWC);
          setCameraHeight(carto.height);
        } catch {
          /* viewer a destruir / câmara indisponível */
        }
      }, 350);
    };

    activeViewer.camera.moveEnd.addEventListener(update);
    update();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      if (!isViewerAlive(activeViewer)) return;
      try {
        activeViewer.camera.moveEnd.removeEventListener(update);
      } catch {
        /* ignore */
      }
    };
  }, [viewer, setVisibleBbox, setCameraHeight]);
}
