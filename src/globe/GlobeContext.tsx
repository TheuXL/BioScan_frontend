import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Viewer } from 'cesium';

interface GlobeContextValue {
  viewer: Viewer | null;
  setViewer: (viewer: Viewer | null) => void;
}

const GlobeContext = createContext<GlobeContextValue | null>(null);

export function GlobeProvider({ children }: { children: ReactNode }) {
  const [viewer, setViewerState] = useState<Viewer | null>(null);
  const setViewer = useCallback((v: Viewer | null) => setViewerState(v), []);

  return (
    <GlobeContext.Provider value={{ viewer, setViewer }}>{children}</GlobeContext.Provider>
  );
}

export function useGlobeContext() {
  const ctx = useContext(GlobeContext);
  if (!ctx) throw new Error('useGlobeContext must be used within GlobeProvider');
  return ctx;
}
