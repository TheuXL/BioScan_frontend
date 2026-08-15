export interface PontoGloboV1 {
  lat: number;
  lon: number;
  tipo: string;
  momento: string | null;
  origem: string;
  idFonte: string;
  severidade: string | number | null;
  titulo?: string;
  detalhes?: Record<string, unknown>;
}

export interface RespostaCamadaGloboV1 {
  schemaVersion: '1.0';
  camada: string;
  count: number;
  totalMatching?: number;
  offset?: number;
  limit?: number;
  hasMore?: boolean;
  pontos: PontoGloboV1[];
}

export interface GlobeIndexCamada {
  id: string;
  metodoHttp?: string;
  caminho: string;
  requisitosMongo?: boolean;
  parametrosQuery?: string[];
}

export interface GlobeIndexResponse {
  schemaVersion: string;
  descricao?: string;
  camadas: GlobeIndexCamada[];
  limiteGlobo?: {
    padrao: number;
    min: number;
    max: number;
    offset?: boolean;
    nota?: string;
  };
}

export interface BioscanMeta {
  fromBioScanCache?: boolean;
  note?: string;
}
