import type { RespostaCamadaGloboV1 } from '../api/types/globe';

export type LayerDataMode = 'pontoGloboV1' | 'geoJson' | 'series';
export type LayerStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';
export type AppDomain = 'fire' | 'ocean' | 'climate' | 'forests';

export interface GlobeLayerDefinition {
  id: string;
  dominio: AppDomain | 'outros';
  nomeExibicao: string;
  descricaoCurta: string;
  mode: LayerDataMode;
  endpoint: string;
  defaultQuery?: Record<string, string | number>;
  corAccent: string;
  disponivel: boolean;
  requiresMongo?: boolean;
  requiresOpenAq?: boolean;
  supportsTimeFilter?: boolean;
  supportsViewportFilter?: boolean;
  fetchFn: (query?: Record<string, string | number>) => Promise<RespostaCamadaGloboV1>;
}

export type SidebarTab = 'layers' | 'analysis' | 'monitoring';
