# AGENT.md — POLIINTEL Platform
## Plataforma de Inteligencia Electoral · Offline-First · Enterprise-Grade

Este documento es la **fuente única de verdad** (SSOT) de la arquitectura completa de POLIINTEL.

---

## Estado de Implementación

| Fase | Componente | Estado |
|------|-----------|--------|
| ✅ | Estructura de directorios | Completo |
| ✅ | Base de datos Supabase (migrations) | Completo |
| ✅ | RBAC + Perfiles + Organizaciones | Completo |
| ✅ | Campañas + Formularios + Recolección | Completo |
| ✅ | Sync Queue (offline) | Completo |
| ✅ | Analytics + ML Predictions schema | Completo |
| ✅ | RLS Policies | Completo |
| ✅ | Edge Functions (Deno) | Completo |
| ✅ | Frontend SPA (React + TypeScript) | Completo |
| ✅ | ML Engine API (FastAPI + Docker) | Completo |
| ✅ | CI/CD (GitHub Actions) | Completo |
| ✅ | Scripts de deployment | Completo |

---

## Plataforma de Despliegue

| Capa | Plataforma | Configuración |
|------|-----------|---------------|
| **Frontend SPA** | Cloudflare Pages | `web/public/_redirects`, build: `pnpm build`, dist: `web/dist` |
| **ML Engine API** | Render.com (Docker) | `render.yaml`, `ml_engine/Dockerfile` |
| **Base de Datos** | Supabase (PostgreSQL + PostGIS + RLS) | `supabase/` |
| **CI/CD** | GitHub Actions | `.github/workflows/ci.yml` |

**Supabase URL**: `https://fpkufahvkvxnnfujgcex.supabase.co`

---

## Estructura de Directorios

```
POLIINTEL/
├── AGENT.md                          # Este archivo (SSOT)
├── .env.example                      # Variables de entorno
├── .gitignore
├── render.yaml                       # Render.com Blueprint
├── pnpm-workspace.yaml
├── package.json                      # Root workspace
│
├── supabase/
│   ├── config.toml                   # project_id = fpkufahvkvxnnfujgcex
│   ├── migrations/                   # 16 migrations SQL
│   ├── seeds/                        # Demo data y staging transforms
│   └── functions/                    # Edge Functions (Deno)
│       ├── sync-batch/index.ts       # Batch sync de respuestas offline
│       ├── predict/index.ts          # Proxy ML con caching
│       └── geo-lookup/index.ts       # Resolución territorial por lat/lng
│
├── web/                              # Frontend SPA (React + TypeScript + Vite)
│   ├── src/
│   │   ├── lib/                      # supabase.ts, offline-db.ts, sync-engine.ts, geo.ts
│   │   ├── stores/                   # Zustand: auth, survey, sync
│   │   ├── hooks/                    # useOfflineSync, useGeoLocation, usePredictions
│   │   ├── components/               # layout/, map/, survey/, analytics/, ui/
│   │   └── pages/                    # Login, Dashboard, Field, Analytics, Map, Admin
│   └── public/_redirects             # Cloudflare Pages SPA routing
│
├── ml_engine/                        # Python ML API (FastAPI + Docker)
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py
│   ├── models/                       # sentiment.py, trend_predictor.py, geo_clustering.py
│   ├── routers/                      # health.py, predict.py, analyze.py
│   ├── schemas/requests.py
│   └── utils/db.py
│
├── scripts/
│   ├── import_geodata.sh             # Importar shapefiles RD → PostGIS
│   ├── setup_dev.sh                  # Setup entorno de desarrollo
│   └── deploy.sh                     # Script de deployment
│
└── .github/workflows/ci.yml          # CI: typecheck + build + docker + lint SQL
```

---

## Stack Tecnológico

### Frontend
- **React 18** + TypeScript + Vite 6
- **Zustand** para estado global (auth, survey, sync)
- **TanStack Query** para server state y caching
- **Dexie** (IndexedDB) para almacenamiento offline
- **React Leaflet** para mapas interactivos
- **Recharts** para gráficas de tendencias
- **PWA** con Workbox (offline-first)

### Backend / Database
- **Supabase** (PostgreSQL 15 + PostGIS + RLS + Auth + Storage)
- **Edge Functions** (Deno) para lógica serverless
- 15 tablas con RLS completo
- Funciones PostGIS: `find_territory_by_point`, `get_electoral_stats_by_area`

### ML Engine
- **FastAPI** + **uvicorn** (Python 3.12)
- **scikit-learn** + **statsmodels** para predicciones
- **TextBlob** + **NLTK** para análisis de sentimientos en español
- **DBSCAN** geoespacial para clustering de apoyo político
- Deployado en Docker via Render.com

---

## Variables de Entorno

### Frontend (`web/.env.local`)
```env
VITE_SUPABASE_URL=https://fpkufahvkvxnnfujgcex.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_key>
VITE_ML_ENGINE_URL=https://your-service.onrender.com
```

### ML Engine
```env
DATABASE_URL=postgresql://postgres:<password>@db.fpkufahvkvxnnfujgcex.supabase.co:5432/postgres
SUPABASE_URL=https://fpkufahvkvxnnfujgcex.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

---

## Flujo de Datos (Offline-First)

```
Mobile Collector
  → [GPS + Answers] → IndexedDB (Dexie)
  → [Online] → sync-engine.ts → Edge Function sync-batch
  → [PostGIS] → find_territory_by_point(lat, lng)
  → [Supabase] → survey_responses (with territory IDs)
  → [Trigger] → territory_stats (aggregate)
  → [ML Engine] → predictions → ml_predictions (cached 1h)
  → [Dashboard] → real-time updates via Supabase Realtime
```

---

## Endpoints ML Engine

| Método | Endpoint | Descripción |
|--------|---------|-------------|
| POST | `/api/v1/predict/vote-intention` | Intención de voto por candidato |
| POST | `/api/v1/predict/trend` | Pronóstico de tendencia (serie temporal) |
| POST | `/api/v1/predict/turnout` | Estimación de participación electoral |
| POST | `/api/v1/analyze/sentiment` | Análisis de sentimiento de respuestas |
| POST | `/api/v1/analyze/clustering` | Clustering geoespacial DBSCAN |
| POST | `/api/v1/analyze/anomalies` | Detección de anomalías en datos de campo |
| GET | `/health/` | Health check |
| GET | `/health/ready` | Readiness check |

---

## Deployment

### Cloudflare Pages (Frontend)
1. Conectar repositorio en Cloudflare Pages dashboard
2. Build command: `pnpm --filter @poliintel/web build`
3. Build output directory: `web/dist`
4. Root directory: `/`
5. Configurar variables de entorno en Cloudflare dashboard

### Render.com (ML Engine)
1. El `render.yaml` define el servicio automáticamente
2. Configurar env vars en Render dashboard:
   - `DATABASE_URL`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Supabase
1. Aplicar migraciones: `supabase db push` (o `supabase db reset` en local)
2. Deployar Edge Functions: `supabase functions deploy`
3. Configurar Storage buckets: `field-photos`, `signatures`

---

## Roles del Sistema

| Rol | Descripción |
|-----|-------------|
| `super_admin` | Acceso total al sistema |
| `org_admin` | Admin de organización política |
| `campaign_manager` | Gestor de campaña |
| `field_coordinator` | Coordinador de territorio |
| `data_collector` | Recolector de campo (app móvil) |
| `analyst` | Analista de datos/ML |
| `viewer` | Solo lectura |

---

## Contribución

1. Clonar el repositorio
2. Ejecutar `./scripts/setup_dev.sh`
3. Editar `.env.local` con credenciales de Supabase
4. `pnpm dev` para iniciar el frontend
5. `cd ml_engine && uvicorn main:app --reload` para el ML Engine

### CI/CD
- `typecheck-frontend`: TypeScript strict mode
- `build-frontend`: Vite production build
- `validate-docker`: Docker build del ML Engine
- `validate-migrations`: Supabase db lint