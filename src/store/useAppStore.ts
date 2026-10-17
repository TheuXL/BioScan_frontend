import { create } from 'zustand';
import type { PontoGloboV1 } from '../api/types/globe';
import type { AppDomain, LayerStatus, SidebarTab } from '../layers/types';

import type { VisibleBbox } from '../lib/globeLimits';

interface AppState {
  activeDomain: AppDomain;
  activeLayerIds: string[];
  selectedPoint: PontoGloboV1 | null;
  pickedLocation: { lat: number; lon: number } | null;
  visibleBbox: VisibleBbox | null;
  cameraHeight: number | null;
  fireDateRange: { startDate: string; endDate: string } | null;
  layerStatus: Record<string, LayerStatus>;
  layerCounts: Record<string, { count: number; totalMatching?: number }>;
  ui: {
    sidebarOpen: boolean;
    detailOpen: boolean;
    sidebarTab: SidebarTab;
  };
  setDomain: (domain: AppDomain) => void;
  toggleLayer: (id: string) => void;
  selectPoint: (p: PontoGloboV1 | null) => void;
  setPickedLocation: (loc: { lat: number; lon: number } | null) => void;
  setVisibleBbox: (bbox: VisibleBbox | null) => void;
  setCameraHeight: (height: number | null) => void;
  setFireDateRange: (range: { startDate: string; endDate: string } | null) => void;
  setLayerStatus: (id: string, status: LayerStatus) => void;
  setLayerCount: (id: string, count: number, totalMatching?: number) => void;
  setSidebarTab: (tab: SidebarTab) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleDetail: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeDomain: 'fire',
  activeLayerIds: [],
  selectedPoint: null,
  pickedLocation: null,
  visibleBbox: null,
  cameraHeight: null,
  fireDateRange: null,
  layerStatus: {},
  layerCounts: {},
  ui: { sidebarOpen: false, detailOpen: true, sidebarTab: 'layers' },

  setDomain: (domain) =>
    set(() => ({
      activeDomain: domain,
      selectedPoint: null,
    })),

  toggleLayer: (id) =>
    set((s) => {
      const active = s.activeLayerIds.includes(id);
      const layerPointTypes: Record<string, string> = {
        'incendio-nasa': 'incendio',
        sismos: 'sismo',
        'eventos-naturais': 'evento_natural',
        'lixo-marinho-epa': 'lixo_marinho',
        'geleiras-glims': 'geleira',
        'estacoes-openaq': 'estacao_ar',
        'especies-ameacadas': 'ameacada_gbif',
      };
      const deselectType = layerPointTypes[id];
      const clearPoint = active && s.selectedPoint?.tipo === deselectType;

      return {
        activeLayerIds: active
          ? s.activeLayerIds.filter((x) => x !== id)
          : [...s.activeLayerIds, id],
        selectedPoint: clearPoint ? null : s.selectedPoint,
        ui: { ...s.ui, detailOpen: true },
      };
    }),

  selectPoint: (p) =>
    set((s) => ({
      selectedPoint: p,
      pickedLocation: p ? null : s.pickedLocation,
      ui: {
        ...s.ui,
        detailOpen: p !== null ? true : s.ui.detailOpen,
        sidebarOpen: p !== null ? false : s.ui.sidebarOpen,
      },
    })),

  setPickedLocation: (loc) =>
    set((s) => ({
      pickedLocation: loc,
      selectedPoint: loc ? null : s.selectedPoint,
      ui: {
        ...s.ui,
        detailOpen: loc !== null ? true : s.ui.detailOpen,
        sidebarOpen: loc !== null ? false : s.ui.sidebarOpen,
      },
    })),

  setVisibleBbox: (bbox) => set({ visibleBbox: bbox }),

  setCameraHeight: (height) => set({ cameraHeight: height }),

  setFireDateRange: (range) => set({ fireDateRange: range }),

  setLayerStatus: (id, status) =>
    set((s) => ({
      layerStatus: { ...s.layerStatus, [id]: status },
    })),

  setLayerCount: (id, count, totalMatching) =>
    set((s) => ({
      layerCounts: { ...s.layerCounts, [id]: { count, totalMatching } },
    })),

  setSidebarTab: (tab) =>
    set((s) => ({
      ui: { ...s.ui, sidebarTab: tab },
    })),

  setSidebarOpen: (open) =>
    set((s) => ({
      ui: { ...s.ui, sidebarOpen: open },
    })),

  toggleSidebar: () =>
    set((s) => ({
      ui: { ...s.ui, sidebarOpen: !s.ui.sidebarOpen },
    })),

  toggleDetail: () =>
    set((s) => ({
      ui: { ...s.ui, detailOpen: !s.ui.detailOpen },
    })),
}));
