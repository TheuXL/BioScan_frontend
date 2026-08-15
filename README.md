# BioScan Frontend

Cliente web do BioScan — globo 3D interactivo com camadas ambientais (fogo, oceano, clima, florestas).

## Stack

- React 19 + TypeScript + Vite
- CesiumJS (globo 3D)
- Tailwind CSS v4
- TanStack Query + Zustand

## Pré-requisitos

- Node.js 20+
- Backend BioScan em `http://localhost:3000` (para dados reais)

## Instalação

```bash
npm install
cp .env.example .env
```

Opcional: definir `VITE_CESIUM_ION_TOKEN` no `.env` para imagens base de maior qualidade (conta gratuita em [cesium.com/ion](https://cesium.com/ion/)). Sem token, usa mapa escuro CARTO.

## Desenvolvimento

```bash
npm run dev
```

Abre `http://localhost:5173`. O proxy Vite encaminha `/api` e `/health` para o backend.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Pré-visualizar build |

## Camadas MVP

| Camada | Endpoint | Requisitos |
|--------|----------|------------|
| Sismos | `GET /api/globe/sismos` | — |
| Lixo marinho EPA | `GET /api/ocean/epa` | — |
| Incêndios NASA | `GET /api/fire/nasa` | Mongo + MAP_KEY |
| Espécies ameaçadas | `GET /api/globe/especies-ameacadas` | Mongo |

Documentação completa em [`docs/Arquitetura.md`](docs/Arquitetura.md) e [`docs/Endpoits.md`](docs/Endpoits.md).
