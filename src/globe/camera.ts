import {
  Cartesian3,
  Cartographic,
  Cartesian2,
  Math as CesiumMath,
  type Viewer,
} from 'cesium';

export function flyToCoordinates(
  viewer: Viewer,
  lat: number,
  lon: number,
  height = 2_000_000,
) {
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(lon, lat, height),
    duration: 1.2,
  });
}

export function getVisibleBbox(viewer: Viewer) {
  const rect = viewer.camera.computeViewRectangle();
  if (!rect) return null;

  return {
    minLatitude: CesiumMath.toDegrees(rect.south),
    maxLatitude: CesiumMath.toDegrees(rect.north),
    minLongitude: CesiumMath.toDegrees(rect.west),
    maxLongitude: CesiumMath.toDegrees(rect.east),
  };
}

export function pickGlobeCoordinates(viewer: Viewer, screenX: number, screenY: number) {
  const ray = viewer.camera.getPickRay(new Cartesian2(screenX, screenY));
  if (!ray) return null;
  const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
  if (!cartesian) return null;
  const cartographic = Cartographic.fromCartesian(cartesian);
  return {
    lat: CesiumMath.toDegrees(cartographic.latitude),
    lon: CesiumMath.toDegrees(cartographic.longitude),
  };
}
