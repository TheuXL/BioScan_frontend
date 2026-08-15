import { useEffect, useRef, type RefObject } from 'react';
import { Viewer, Ion, Color, UrlTemplateImageryProvider, createWorldImageryAsync } from 'cesium';

export function useCesiumViewer(
  containerRef: RefObject<HTMLDivElement | null>,
  onReady?: (viewer: Viewer | null) => void,
) {
  const viewerRef = useRef<Viewer | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const token = import.meta.env.VITE_CESIUM_ION_TOKEN;
    if (token) Ion.defaultAccessToken = token;

    const viewer = new Viewer(container, {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      baseLayer: false,
      terrain: undefined,
      skyAtmosphere: false,
      msaaSamples: 2,
    });

    viewer.scene.backgroundColor = Color.fromCssColorString('#05070A');
    viewer.scene.globe.baseColor = Color.fromCssColorString('#051424');
    viewer.scene.globe.enableLighting = true;
    viewer.scene.fog.enabled = false;

    if (token) {
      void createWorldImageryAsync().then((provider) => {
        viewer.imageryLayers.addImageryProvider(provider);
      });
    } else {
      viewer.imageryLayers.addImageryProvider(
        new UrlTemplateImageryProvider({
          url: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          credit: '© CARTO',
        }),
      );
    }

    viewerRef.current = viewer;
    onReady?.(viewer);

    const ro = new ResizeObserver(() => {
      viewer.resize();
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      onReady?.(null);
      if (!viewer.isDestroyed()) {
        viewer.destroy();
      }
      viewerRef.current = null;
    };
  }, [containerRef, onReady]);

  return viewerRef;
}
