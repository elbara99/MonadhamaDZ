# MVP Architecture — Solo Founder Edition

**Doc ID:** MVP-001
**Version:** 1.0
**Status:** Architecture Review — Approved for Implementation
**Classification:** Internal

---

## 1. Context

This document performs an architecture review of the enterprise Monadhama design (`architecture.md`) and produces a stripped-down **MVP architecture** buildable by a **single developer with AI assistance in under 3 months**.

**Constraint:** Every decision must answer: *"Does this ship the MVP in 3 months?"* If the answer is no, it is deferred.

**Principle:** The MVP is not a hack. It is a deliberate simplification with clear module boundaries so each component can be extracted into a microservice later without rewrite.

---

## 2. Deferred Technologies

Every technology in the enterprise stack that is **removed** from the MVP is listed below with rationale and reintroduction stage.

### 2.1 Infrastructure & Orchestration

| Technology | Removed | Why Not Needed | Reintroduce At |
|---|---|---|---|
| **Kubernetes** | Replaced with single VPS or PaaS | 1 developer cannot manage a K8s cluster; adds 10x operational overhead on day one | Stage 2 (2nd developer joins, need scaling) |
| **Istio Service Mesh** | Removed | No microservices = no need for service mesh | Stage 3 (when splitting monolith) |
| **Terraform** | Replaced with manual cloud console or PaaS | IaC for 1 server is overhead; a VPS can be provisioned in 5 minutes | Stage 2 (when infra grows beyond 3 servers) |
| **ArgoCD** | Removed | No K8s → no GitOps operator needed | Stage 2 (when moving to K8s) |
| **Helm** | Removed | No K8s → no chart manager | Stage 2 |
| **HashiCorp Vault** | Replaced with `.env` + encrypted secrets | 1 developer + 1 server = env vars are sufficient | Stage 2 (when adding multiple services) |
| **cert-manager** | Removed | Use PaaS-managed TLS or Caddy auto-TLS | Stage 2 |

### 2.2 Data Layer

| Technology | Removed | Why Not Needed | Reintroduce At |
|---|---|---|---|
| **Neo4j** | Replaced with PostgreSQL + JSONB + recursive CTEs | Neo4j licensing and ops overhead not justified for MVP's entity count (<20 types, <10K nodes) | Stage 2 (when graph queries become performance bottleneck or exceed 100K nodes) |
| **ClickHouse** | Removed | PostgreSQL can handle MVP time-series volume (<10M rows) | Stage 3 (when indicator data exceeds 100M rows or query latency >500ms) |
| **Apache Kafka** | Removed | No event sourcing needed; direct function calls within monolith suffice | Stage 2 (when data ingestion needs decoupling from API) |
| **Apache Spark** | Replaced with Polars/Pandas | Spark requires a cluster; MVP data volume (<50GB) fits in memory | Stage 3 (when data exceeds 500GB or needs distributed processing) |
| **Delta Lake** | Removed | Raw CSV/JSON + versioned DB tables suffice | Stage 3 (when data versioning and ACID on object storage become necessary) |
| **MinIO** | Removed | Use local filesystem or direct S3 client | Stage 2 (when file storage needs scale beyond single disk) |
| **Great Expectations** | Removed | Python assert-based validation in ingestion is sufficient for MVP | Stage 2 (when >10 data sources require automated quality monitoring) |
| **Apache Atlas** | Removed | No catalog needed for <20 data sources | Stage 3 |
| **Apache Airflow** | Replaced with APScheduler + simple job scripts | Airflow requires a database + workers + webserver; MVP has <5 scheduled jobs | Stage 2 (when job count exceeds 10 or DAG dependencies grow complex) |

### 2.3 AI & Vector

| Technology | Removed | Why Not Needed | Reintroduce At |
|---|---|---|---|
| **Qdrant** | Replaced with pgvector (PostgreSQL extension) | One less database to operate; pgvector handles 10K–100K embeddings easily | Stage 3 (when embedding count exceeds 1M or search latency degrades) |
| **LangGraph** | Simplified to direct LangChain calls | MVP has linear AI workflows, not complex graph-based orchestration | Stage 2 (when AI workflows need branching, looping, persistence) |
| **Triton Inference Server** | Removed | MVP uses cloud LLM APIs (OpenAI/Claude), no self-hosted inference | Stage 3 (when deploying open-weight models in-house) |
| **Multiple LLMs** | Reduced to 1 primary + 1 fallback | One model (GPT-4o or Claude 3.5) handles all MVP capabilities | Stage 2 (when Arabic/French specialization is needed) |
| **Self-hosted models** | Removed entirely | GPU server costs and complexity not justified for MVP | Stage 3 (when data sovereignty requires on-premise or volume exceeds API budget) |
| **MLflow** | Removed | No models to track in MVP; scoring is rule-based + LLM | Stage 2 (when training custom ML models) |
| **Feast (Feature Store)** | Removed | No ML feature engineering in MVP | Stage 3 |

### 2.4 Backend

| Technology | Removed | Why Not Needed | Reintroduce At |
|---|---|---|---|
| **Microservices (14 services)** | Collapsed into 1 modular monolith | Solo developer cannot operate 14 services; module boundaries preserve future extraction path | Stage 2–3 (service extraction per module when team grows) |
| **gRPC** | Removed | Internal-only inter-service protocol; monolith uses direct Python calls | Stage 2 (when services split across processes) |
| **Kong API Gateway** | Replaced with FastAPI middleware + Caddy | Gateway features (rate limit, auth) are built into monolith | Stage 3 (when traffic exceeds 1000 req/s or multiple API versions needed) |
| **OAuth 2.0 / Keycloak** | Replaced with fastapi-users + JWT | Keycloak is heavy (Java, separate DB); simple JWT handles MVP auth | Stage 3 (when LDAP/AD integration or SSO is required) |
| **ABAC** | Simplified to RBAC | <10 roles in MVP; RBAC with 4 roles (viewer, analyst, minister, admin) is sufficient | Stage 2 (when fine-grained permissions per province/ministry are needed) |
| **Celery** | Replaced with asyncio + background tasks | MVP async tasks fit within process | Stage 2 (when tasks exceed 30s or need retry queues) |
| **OpenTelemetry** | Removed | Structured logging + basic timing decorators suffice for 1 developer | Stage 2 |

### 2.5 Frontend

| Technology | Removed | Why Not Needed | Reintroduce At |
|---|---|---|---|
| **Next.js SSR** | Replaced with React + Vite (SPA) | SSR adds complexity; SPA with lazy loading is fine for <100 government users | Stage 2 (when SEO for public pages or initial load speed becomes critical) |
| **Mapbox GL JS** | Replaced with Leaflet + OpenStreetMap tiles | Free, simpler API; Mapbox requires paid token for production | Stage 2 (when advanced map features like 3D terrain, heatmaps are needed) |
| **deck.gl** | Removed | Leaflet handles MVP map needs (markers, choropleth, GeoJSON) | Stage 3 (when rendering 100K+ data points on map) |
| **D3.js** | Replaced with Chart.js + Recharts | D3 is powerful but verbose; Chart.js covers 90% of MVP chart needs (bar, line, radar, pie) | Stage 3 (when custom visualizations are needed) |
| **TanStack Query** | Retained (it is valuable even for MVP) | — | — |
| **WebSocket** | Replaced with polling (every 30s) | <50 concurrent users; polling is simpler to implement and debug | Stage 2 (when real-time alerts are needed) |
| **Service Worker / PWA** | Removed | Not needed for desktop-first government users | Stage 3 |
| **RTL layout** | Removed | MVP ships in English only; Arabic RTL added later | Stage 2 (when Arabic localization ships) |

### 2.6 Monitoring & DevOps

| Technology | Removed | Why Not Needed | Reintroduce At |
|---|---|---|---|
| **Prometheus + Grafana** | Removed | 1 developer monitors via `docker logs` + basic health endpoint | Stage 2 (when >3 services running) |
| **ELK Stack** | Removed | Structured logging to files + basic grep | Stage 2 |
| **Jaeger (Distributed Tracing)** | Removed | Monolith = no distributed traces needed | Stage 3 |
| **SonarQube** | Removed | AI code review + `ruff` linting is sufficient for solo developer | Stage 2 |
| **Harbor (Container Registry)** | Removed | Docker Hub or GHCR for single image | Stage 2 |
| **Playwright (E2E)** | Removed | Manual smoke testing for MVP | Stage 2 |
| **Multiple environments** | Reduced to 2: dev + production | Staging environment is overhead for solo developer; test in dev, deploy to prod | Stage 2 |

---

## 3. MVP Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         SINGLE VPS / PAAS                                 │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    MONADHAMA MONOLITH                              │   │
│  │                   (FastAPI + React SPA)                            │   │
│  │                                                                     │   │
│  │  ┌─────────────────────────────────────┐                            │   │
│  │  │  API LAYER                          │                            │   │
│  │  │  - FastAPI Routers                  │                            │   │
│  │  │  - Auth Middleware (JWT)            │                            │   │
│  │  │  - Rate Limiting                    │                            │   │
│  │  │  - Request Logging                  │                            │   │
│  │  └──────────┬──────────────────────────┘                            │   │
│  │             │                                                        │   │
│  │  ┌──────────▼──────────────────────────┐                            │   │
│  │  │  SERVICE LAYER                       │                            │   │
│  │  │  ┌─────────┐ ┌──────────┐ ┌───────┐ │                            │   │
│  │  │  │ Entity  │ │ Scoring  │ │Search │ │                            │   │
│  │  │  │ Service │ │ Engine   │ │Engine │ │                            │   │
│  │  │  └─────────┘ └──────────┘ └───────┘ │                            │   │
│  │  │  ┌─────────┐ ┌──────────┐ ┌───────┐ │                            │   │
│  │  │  │ AI      │ │ Decision │ │Report │ │                            │   │
│  │  │  │ Engine  │ │ Engine   │ │Engine │ │                            │   │
│  │  │  └─────────┘ └──────────┘ └───────┘ │                            │   │
│  │  │  ┌─────────┐ ┌──────────┐           │                            │   │
│  │  │  │ Data    │ │ User     │           │                            │   │
│  │  │  │Ingestion│ │ Service  │           │                            │   │
│  │  │  └─────────┘ └──────────┘           │                            │   │
│  │  └──────────┬──────────────────────────┘                            │   │
│  │             │                                                        │   │
│  │  ┌──────────▼──────────────────────────┐                            │   │
│  │  │  DATA ACCESS LAYER                   │                            │   │
│  │  │  - SQLAlchemy (PostgreSQL)           │                            │   │
│  │  │  - pgvector (embeddings)            │                            │   │
│  │  │  - Redis (cache)                    │                            │   │
│  │  │  - Filesystem (uploads/exports)     │                            │   │
│  │  └─────────────────────────────────────┘                            │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────┐  ┌──────────────────────┐                     │
│  │    PostgreSQL 16      │  │     Redis 7           │                     │
│  │    + pgvector         │  │    (Cache + Sessions) │                     │
│  └──────────────────────┘  └──────────────────────┘                     │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  STATIC FILES: React SPA build served by Caddy                    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
│
│  EXTERNAL SERVICES
│  ├── OpenAI / Anthropic API (LLM)
│  ├── SMTP Server (notifications)
│  └── Government SFTP/API (data ingestion)
```

---

## 4. MVP Folder Structure

```
monadhama/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app, middleware, startup
│   │   ├── config.py                  # Pydantic settings (env vars)
│   │   │
│   │   ├── models/                    # Pydantic + SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   ├── base.py               # SQLAlchemy Base + mixins
│   │   │   ├── user.py               # User model
│   │   │   ├── province.py           # Province, City, District
│   │   │   ├── health.py             # Hospital, health indicators
│   │   │   ├── education.py          # School, University
│   │   │   ├── infrastructure.py     # Road, project
│   │   │   ├── indicators.py         # CitizenIndicators, EconomicIndicators
│   │   │   ├── scores.py             # Score records
│   │   │   ├── decisions.py          # Decision records
│   │   │   └── ingestion.py          # Ingestion job tracking
│   │   │
│   │   ├── schemas/                   # Pydantic API schemas
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── entity.py
│   │   │   ├── indicator.py
│   │   │   ├── score.py
│   │   │   ├── decision.py
│   │   │   ├── search.py
│   │   │   └── ai.py
│   │   │
│   │   ├── routers/                   # API endpoints
│   │   │   ├── __init__.py
│   │   │   ├── auth.py               # POST /auth/login, /auth/register
│   │   │   ├── users.py              # GET/PUT /users/me
│   │   │   ├── provinces.py          # GET /provinces, /provinces/{code}
│   │   │   ├── cities.py             # GET /cities
│   │   │   ├── hospitals.py          # CRUD /hospitals
│   │   │   ├── schools.py            # CRUD /schools
│   │   │   ├── universities.py        # CRUD /universities
│   │   │   ├── roads.py              # CRUD /roads
│   │   │   ├── projects.py           # CRUD /projects
│   │   │   ├── indicators.py         # GET /indicators
│   │   │   ├── scores.py             # GET /scores
│   │   │   ├── search.py             # POST /search
│   │   │   ├── ai.py                 # POST /ai/query, /ai/analyze
│   │   │   ├── decisions.py          # POST /decisions/evaluate
│   │   │   ├── reports.py            # POST /reports/generate
│   │   │   ├── ingestion.py          # POST /ingestion/trigger
│   │   │   └── admin.py              # GET/POST /admin/*
│   │   │
│   │   ├── services/                  # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── auth.py               # JWT creation, password hashing
│   │   │   ├── entity_service.py      # Entity CRUD + relationships
│   │   │   ├── scoring_engine.py      # Score computation
│   │   │   ├── search_engine.py       # Hybrid search (pgvector + full-text)
│   │   │   ├── ai_engine.py           # LLM orchestration
│   │   │   ├── decision_engine.py     # Recommendation generation
│   │   │   ├── report_engine.py       # Report generation (HTML → PDF)
│   │   │   ├── data_ingestion.py      # Source ingestion + validation
│   │   │   ├── indicator_service.py   # Indicator computation
│   │   │   └── notification.py        # Email notifications
│   │   │
│   │   ├── repositories/              # Data access (SQLAlchemy)
│   │   │   ├── __init__.py
│   │   │   ├── base.py               # CRUD base class
│   │   │   ├── province_repo.py
│   │   │   ├── hospital_repo.py
│   │   │   ├── school_repo.py
│   │   │   ├── indicator_repo.py
│   │   │   ├── score_repo.py
│   │   │   └── decision_repo.py
│   │   │
│   │   ├── core/                      # Cross-cutting
│   │   │   ├── __init__.py
│   │   │   ├── config.py             # Settings
│   │   │   ├── database.py           # SQLAlchemy engine + session
│   │   │   ├── redis.py              # Redis client
│   │   │   ├── security.py           # JWT, password utils
│   │   │   ├── dependencies.py       # FastAPI Depends (get_db, get_current_user)
│   │   │   ├── middleware.py         # Logging, rate limiting
│   │   │   └── exceptions.py         # Custom exception handlers
│   │   │
│   │   └── tasks/                     # Background jobs (APScheduler)
│   │       ├── __init__.py
│   │       ├── scheduler.py          # Job scheduler setup
│   │       ├── score_calculation.py  # Daily score refresh
│   │       ├── data_refresh.py       # Periodic ingestion
│   │       └── trend_detection.py    # Periodic trend analysis
│   │
│   ├── migrations/                    # Alembic migrations
│   │   └── versions/
│   │
│   ├── scripts/                       # One-time data loading scripts
│   │   ├── seed_provinces.py
│   │   ├── seed_sample_data.py
│   │   └── load_initial_csv.py
│   │
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_provinces.py
│   │   ├── test_scoring.py
│   │   ├── test_search.py
│   │   └── test_ai.py
│   │
│   ├── alembic.ini
│   ├── pyproject.toml
│   └── Dockerfile
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── main.tsx                  # App entry
│   │   ├── App.tsx                   # Router setup
│   │   ├── api/                      # API client
│   │   │   ├── client.ts             # Axios/fetch wrapper
│   │   │   ├── auth.ts
│   │   │   ├── provinces.ts
│   │   │   ├── indicators.ts
│   │   │   ├── scores.ts
│   │   │   ├── search.ts
│   │   │   └── ai.ts
│   │   ├── components/               # Reusable UI
│   │   │   ├── Layout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── ScoreRadar.tsx
│   │   │   ├── ProvinceMap.tsx
│   │   │   ├── IndicatorCard.tsx
│   │   │   ├── KPIWidget.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── AIChat.tsx
│   │   │   └── Loading.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx         # Executive home
│   │   │   ├── Provinces.tsx         # Province list + map
│   │   │   ├── ProvinceDetail.tsx    # Single province view
│   │   │   ├── Compare.tsx           # Province comparison
│   │   │   ├── Reports.tsx           # Report generation
│   │   │   └── Admin.tsx             # Basic admin
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useQuery.ts
│   │   │   └── useLocalStorage.ts
│   │   ├── utils/
│   │   │   ├── format.ts
│   │   │   └── colors.ts
│   │   └── styles/
│   │       └── globals.css
│   │
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── docker-compose.yml                 # PostgreSQL + Redis + App
├── Dockerfile                         # Multi-stage: frontend build + backend
├── .env.example
├── .gitignore
├── README.md
└── AGENTS.md                          # AI coding assistant instructions
```

---

## 5. MVP Technology Stack

| Layer | Technology | Version | Why |
|---|---|---|---|
| **Runtime** | Python | 3.12 | AI ecosystem, FastAPI |
| **Web Framework** | FastAPI | 0.110+ | Async, auto-docs, Pydantic |
| **Database** | PostgreSQL | 16 | +pgvector extension, all-in-one |
| **Cache** | Redis | 7 | Sessions, hot cache, rate limiting |
| **ORM** | SQLAlchemy | 2.0 | Mature, async support |
| **Migrations** | Alembic | 1.13 | Schema versioning |
| **Auth** | python-jose + passlib | — | JWT, bcrypt hashing |
| **AI SDK** | LangChain | 0.2+ | RAG, prompt management |
| **LLM** | GPT-4o (OpenAI API) | — | Single model for all capabilities |
| **Embeddings** | text-embedding-3-small | — | 1536-dim, via OpenAI API |
| **Vector** | pgvector | 0.7+ | PostgreSQL native vector search |
| **Scheduler** | APScheduler | 3.10 | In-process job scheduling |
| **Validation** | Pydantic | 2.x | Schema validation everywhere |
| **HTTP Client** | httpx | 0.27+ | Async HTTP for API calls |
| **Data Processing** | Polars | 1.x | Fast DataFrame, CSV/Parquet |
| **Testing** | pytest | 8.x | Unit + integration |
| **Frontend** | React + Vite + TypeScript | 19 + 5.x | SPA, fast builds |
| **Charts** | Chart.js + react-chartjs-2 | 4.x | Simple, good defaults |
| **Maps** | Leaflet + react-leaflet | 1.9 + 4.x | Free, simple |
| **UI** | Tailwind CSS + Radix UI | 3.x + latest | Utility-first + accessible |
| **State** | TanStack Query | 5.x | Server state management |
| **Email** | smtplib + aiosmtplib | — | Simple email notifications |
| **Export** | WeasyPrint | 61+ | HTML → PDF report |
| **Server** | Caddy | 2.x | Auto-TLS, reverse proxy, static files |
| **Container** | Docker + Compose | latest | Single deployable unit |
| **Hosting** | Railway / Fly.io / Hetzner VPS | — | Minimal ops, good value |

### 5.1 Cost Comparison: MVP vs Enterprise

| Category | MVP (per month) | Enterprise (per month) |
|---|---|---|
| Server | $10–50 (1 VPS) | $5,000–20,000 (K8s cluster) |
| Database | Included | $500–2,000 (managed) |
| LLM API | $100–500 | $1,000–5,000 |
| LLM self-hosted | $0 | $3,000–8,000 (GPU) |
| Map service | $0 (Leaflet/OSM) | $500 (Mapbox) |
| Email | $0 (SMTP) | $100 (SendGrid) |
| Monitoring | $0 (logs) | $500–1,000 (Datadog) |
| **Total** | **$110–550/mo** | **$10,000–35,000/mo** |

---

## 6. MVP Module Boundaries (Future Microservice Extraction)

The monolith is organized so each module can be extracted into a standalone service without code rewrite. The boundaries are:

```
app/
├── services/
│   ├── entity_service.py      → Service: entity-svc        (Neo4j when extracted)
│   ├── scoring_engine.py      → Service: scoring-svc       (scale independently)
│   ├── search_engine.py        → Service: search-svc        (+ Elasticsearch when extracted)
│   ├── ai_engine.py            → Service: ai-svc            (+ GPU nodes when extracted)
│   ├── decision_engine.py     → Service: decision-svc      (workflow engine when extracted)
│   ├── report_engine.py       → Service: report-svc        (queued generation when extracted)
│   ├── data_ingestion.py      → Service: ingestion-svc     (+ Kafka when extracted)
│   ├── indicator_service.py   → Service: indicator-svc     (time-series DB when extracted)
│   └── notification.py        → Service: notification-svc  (multi-channel when extracted)
```

**Extraction pattern:**
1. Move the service into its own directory
2. Add a FastAPI app with the same router
3. Copy shared models or extract into a shared package
4. Point to the same database (or its dedicated DB)
5. Deploy as separate container behind reverse proxy

---

## 7. MVP PostgreSQL Schema (Simplified)

The entire MVP data model fits in one PostgreSQL database with these tables:

### 7.1 Core Tables

```sql
-- Users & auth
users (id UUID, email, hashed_password, name, role, created_at)

-- Administrative geography
provinces (code PK, name, name_ar, name_fr, population, area_km2, governor, geometry GeoJSON)
cities (id PK, code, name, province_code FK, population, lat, lng, type)

-- Health entities
hospitals (id PK, code, name, province_code FK, city_id FK, type, beds, doctors, lat, lng, status)

-- Education entities
schools (id PK, code, name, province_code FK, city_id FK, type, students, teachers, status)
universities (id PK, code, name, province_code FK, city_id FK, type, students, faculties)

-- Infrastructure
roads (id PK, code, name, province_code FK, type, length_km, condition, status)
investment_projects (id PK, code, name, province_code FK, sector, status, budget, progress)

-- Time-series indicators (single table with JSONB flexibility)
indicators (
    id BIGSERIAL PK,
    province_code FK,
    indicator_code VARCHAR(50),      -- 'health.beds_per_1000', 'education.literacy_rate'
    year INTEGER,
    quarter INTEGER,
    value DOUBLE PRECISION,
    source VARCHAR(100),
    confidence DECIMAL(3,2),
    UNIQUE(province_code, indicator_code, year, quarter, source)
) PARTITION BY RANGE (year);

-- Scores (materialized from indicators)
province_scores (
    province_code FK,
    score_date DATE,
    composite DECIMAL(5,2),
    health DECIMAL(5,2),
    education DECIMAL(5,2),
    economy DECIMAL(5,2),
    employment DECIMAL(5,2),
    investment DECIMAL(5,2),
    infrastructure DECIMAL(5,2),
    security DECIMAL(5,2),
    environment DECIMAL(5,2),
    transportation DECIMAL(5,2),
    water DECIMAL(5,2),
    agriculture DECIMAL(5,2),
    tourism DECIMAL(5,2),
    UNIQUE(province_code, score_date)
);

-- AI interaction log
ai_interactions (id UUID, user_id FK, query TEXT, response TEXT, tokens_used INT, latency_ms INT, created_at)

-- Decisions
decisions (id UUID, user_id FK, title, description, target_entity_type, target_entity_id, priority_score, confidence, status, evidence JSONB, created_at, resolved_at)

-- Data ingestion tracking
ingestion_jobs (id UUID, source_id, status, records_loaded, errors JSONB, started_at, completed_at)
```

### 7.2 pgvector Table

```sql
-- Entity embeddings for semantic search
CREATE EXTENSION vector;

CREATE TABLE embeddings (
    id UUID PK,
    entity_type VARCHAR(50),   -- 'province', 'hospital', 'school'
    entity_id UUID,
    chunk_index INTEGER,
    text_content TEXT,
    embedding vector(1536),     -- OpenAI embedding-3-small
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX ON embeddings (entity_type, entity_id);
```

---

## 8. MVP API Endpoints (Complete)

The MVP API is a subset of the enterprise API, focused on what a decision maker needs day one:

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register user |
| `POST` | `/api/v1/auth/login` | Login, get JWT |
| `POST` | `/api/v1/auth/refresh` | Refresh token |
| `GET` | `/api/v1/users/me` | Current user |
| `GET` | `/api/v1/provinces` | List provinces (paginated) |
| `GET` | `/api/v1/provinces/{code}` | Province detail |
| `GET` | `/api/v1/provinces/{code}/map` | Province GeoJSON |
| `GET` | `/api/v1/cities?province_code=` | Filter cities |
| `GET` | `/api/v1/hospitals?province_code=&type=` | Filter hospitals |
| `GET` | `/api/v1/schools?province_code=&type=` | Filter schools |
| `GET` | `/api/v1/projects?province_code=&status=` | Filter projects |
| `GET` | `/api/v1/indicators/{code}` | All indicators for province |
| `GET` | `/api/v1/indicators/{code}/{indicator_code}/history` | Time-series |
| `GET` | `/api/v1/scores/{code}` | Province scores |
| `GET` | `/api/v1/scores/rankings?dimension=` | Province rankings |
| `GET` | `/api/v1/scores/compare?codes=a,b,c` | Multi-province scores |
| `POST` | `/api/v1/search` | Hybrid search (text + semantic) |
| `POST` | `/api/v1/ai/query` | Natural language query |
| `POST` | `/api/v1/ai/analyze` | Deep analysis |
| `POST` | `/api/v1/ai/compare` | Compare provinces |
| `POST` | `/api/v1/decisions/evaluate` | Generate recommendation |
| `PUT` | `/api/v1/decisions/{id}/status` | Accept/reject |
| `GET` | `/api/v1/decisions` | List decisions |
| `POST` | `/api/v1/reports/generate` | Generate report |
| `GET` | `/api/v1/reports/{id}/download` | Download PDF |
| `POST` | `/api/v1/ingestion/trigger` | Manual ingestion trigger |
| `GET` | `/api/v1/ingestion/jobs` | Ingestion status |
| `GET` | `/api/v1/admin/health` | Health check |

**Total: 28 endpoints** (vs ~70 in enterprise)

---

## 9. MVP Development Order (Week-by-Week)

```
WEEK 1-2: Foundation
├── Day 1-2:   Project scaffolding (monorepo, Docker, CI, linting)
├── Day 3-4:   PostgreSQL schema + Alembic migrations
├── Day 5-6:   User model + JWT auth (register, login)
├── Day 7-10:  Province + City entity CRUD + seed data for 58 provinces
├── Day 11-14: Hospital + School + University entity CRUD

WEEK 3-4: Data & API Core
├── Day 15-17: Indicator model + bulk load from CSV/API
├── Day 18-21: Scoring engine (all 12 dimensions, normalized)
├── Day 22-24: Indicator + Score API endpoints
├── Day 25-28: Search engine (PostgreSQL full-text + pgvector)

WEEK 5-6: Frontend Foundation
├── Day 29-31: React SPA scaffold (Vite, Tailwind, routing, auth UI)
├── Day 32-35: Province list + detail page with scores
├── Day 36-38: Map view (Leaflet) with score choropleth
├── Day 39-42: Indicator charts + trend lines (Chart.js)

WEEK 7-8: AI Integration
├── Day 43-45: LangChain RAG pipeline (embed provinces → pgvector → query)
├── Day 46-48: Natural language query endpoint + AI Chat UI
├── Day 49-51: AI analyze + compare endpoints
├── Day 52-56: Decision engine (recommendation generation)

WEEK 9-10: Advanced Features
├── Day 57-59: Province comparison tool (frontend)
├── Day 60-62: Report generation (HTML template → PDF export)
├── Day 63-65: Background jobs (APScheduler: daily score refresh, trend detect)
├── Day 66-70: Data ingestion pipeline (CSV upload, ONS data import)

WEEK 11-12: Polish & Deploy
├── Day 71-73: Error handling + edge cases
├── Day 74-76: Performance (query optimization, caching)
├── Day 77-79: Admin panel (basic: users, ingestion monitoring)
├── Day 80-82: Documentation + API docs
├── Day 83-85: Deployment (Docker Compose → VPS/PaaS)
├── Day 86-90: Buffer for issues, feedback, iteration
```

---

## 10. MVP Milestones

| Week | Milestone | Deliverable | Verification |
|---|---|---|---|
| 2 | **Database seeded** | PostgreSQL with 58 provinces, cities, sample hospitals/schools | SQL query returns 58 provinces |
| 4 | **Scoring works** | Scores computed for all 58 provinces across 12 dimensions | API returns scores with breakdown |
| 6 | **Frontend shows data** | Province explorer with scores, map, charts | User can click a province and see its data |
| 8 | **AI answers questions** | Natural language query returns cited answers | "Show me provinces with low healthcare" → ranked list |
| 10 | **Decisions generated** | AI recommendations with evidence and scoring | "Recommend where to build hospitals" → ranked provinces |
| 12 | **MVP Live** | Deployed, authenticated, working end-to-end | Stakeholder demo: 5 scenarios |

---

## 11. Migration Path: MVP → Enterprise

Each migration stage is triggered by a specific threshold.

### Stage 1 → Stage 2 (Solo → Small Team, 2–3 developers)

| Trigger | Action | Module(s) Affected |
|---|---|---|
| 2nd developer hired | Extract first microservice: AI Service (needs GPU) | `ai_engine.py` → `ai-svc` |
| >10 data sources | Add Apache Airflow for scheduling | `data_ingestion.py` → Airflow DAGs |
| >50 users | Add Keycloak for SSO/LDAP | `auth.py` → Keycloak |
| Need Arabic/French | Add 2nd LLM (Claude or Mistral Ara) | `ai_engine.py` → multi-model router |
| >100K embeddings | Extract Qdrant or keep pgvector with tuning | `search_engine.py` → +Qdrant |

### Stage 2 → Stage 3 (Full Team, 5+ developers)

| Trigger | Action | Module(s) Affected |
|---|---|---|
| >500 users | Extract remaining microservices (entity, scoring, search, decision) | All `services/* → svc` |
| >100M indicator rows | Add ClickHouse for time-series | `indicator_service.py` → +ClickHouse |
| >1TB data | Add Delta Lake + Spark | `data_ingestion.py` → +Spark |
| >50K req/s | Add Kong API Gateway + K8s | Reverse proxy → Kong |
| Need performance | Add Redis cluster, read replicas | All → scale |
| Need on-premise | Deploy self-hosted LLMs | AI Service → GPU cluster |

### Stage 3 → Enterprise (Full Scale)

| Trigger | Action | Module(s) Affected |
|---|---|---|
| Multi-country | Isolate per-country namespaces | All → multi-tenant |
| >1PB data | Full data lake + lakehouse architecture | Data → Delta Lake |
| >99.99% uptime | Multi-region DR, Istio service mesh | Infra → K8s + Istio |
| Sovereign compliance | Air-gapped deployment, HSM | Security → full compliance |

### Migration Architecture Progression

```
MVP (Month 1-3)                      Stage 2 (Month 4-9)                  Stage 3 (Month 10-18)
┌─────────────────┐                ┌─────────────────────┐              ┌──────────────────────────┐
│ 1 Monolith       │               │ 3-5 Services         │             │ 14+ Services              │
│ 1 PostgreSQL     │  ───────►    │ PostgreSQL + Redis   │  ───────►   │ Neo4j + PG + ClickHouse   │
│ pgvector         │               │ pgvector → Qdrant    │             │ + Qdrant + Kafka + Spark  │
│ 1 LLM API        │               │ 2-3 LLM APIs        │             │ Self-hosted + APIs        │
│ Single VPS       │               │ 3-5 VPS / K8s light │             │ Full K8s + Istio          │
│ Docker Compose   │               │ Helm + ArgoCD       │             │ Terraform + GitOps        │
└─────────────────┘               └─────────────────────┘             └──────────────────────────┘
```

---

## 12. Solo Developer Tooling

### 12.1 AI Coding Stack
| Tool | Purpose |
|---|---|
| **Cursor / VS Code + Copilot** | AI-assisted coding |
| **Claude 3.5 Sonnet / GPT-4o** | Architecture discussions, code generation, debugging |
| **Claude Code / aider** | AI pair programming in terminal |
| **GitHub Copilot** | In-editor code completion |

### 12.2 Accelerators
| Practice | Benefit |
|---|---|
| Use `AGENTS.md` | Tell AI the project conventions once, reuse across sessions |
| Write tests pragmatically | Only test critical paths; skip tests for obvious CRUD |
| Use `pyproject.toml` | Single source of truth for dependencies |
| Use `docker compose up` | One command to start everything |
| Deploy on day 1 | Even if it serves "Hello World", deploy early to catch infra issues |
| Seed data scripts | Run `python scripts/seed.py` to get 58 provinces loaded in 2 seconds |

### 12.3 What NOT to Build in MVP
- Do NOT build a mobile app
- Do NOT build real-time collaboration
- Do NOT build multi-language (English only)
- Do NOT build complex permission system (4 roles max)
- Do NOT build self-hosted LLMs (API is cheaper and faster)
- Do NOT build custom login page (use simple form)
- Do NOT build audit log viewer (log to file)
- Do NOT build notification preferences
- Do NOT build data catalog or lineage UI
- Do NOT build admin dashboard (basic CLI + API)

---

## 13. Technical Debt Accepted

The MVP deliberately incurs these debts, each with a cleanup cost:

| Debt | Cost to Fix Later | When to Fix |
|---|---|---|
| JSONB fields instead of normalized tables | Moderate — extract columns | Stage 2 |
| Polling instead of WebSockets | Low — add WS stream | Stage 2 |
| Single PostgreSQL for all data | High — migrate to specialized DBs | Stage 3 |
| `ruff` ignores for complex type checking | Low — enable strict mode | Stage 2 |
| No load testing | Moderate — need to bench before launch | Stage 2 |
| Basic error handling in frontend | Low — add error boundaries | Stage 2 |
| No feature flags | Low — add LaunchDarkly or env vars | Stage 2 |

---

## 14. Docker Compose (Complete MVP)

```yaml
version: "3.9"

services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: monadhama
      POSTGRES_USER: monadhama
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U monadhama"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: Dockerfile
      target: backend
    environment:
      DATABASE_URL: postgresql+asyncpg://monadhama:${DB_PASSWORD}@postgres:5432/monadhama
      REDIS_URL: redis://redis:6379/0
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      JWT_SECRET: ${JWT_SECRET}
      ENVIRONMENT: production
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - uploads:/app/uploads
      - reports:/app/reports

  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - ./frontend/dist:/srv/frontend
    depends_on:
      - backend

volumes:
  pgdata:
  redisdata:
  uploads:
  reports:
  caddy_data:
```

---

## 15. Final Comparison: Enterprise vs MVP

| Dimension | Enterprise | MVP |
|---|---|---|
| **Team** | 14–38 people | 1 person + AI |
| **Timeline** | 18–36 months | 3 months |
| **Services** | 14 microservices | 1 modular monolith |
| **Databases** | 6 (Neo4j, PG, ClickHouse, Qdrant, Redis, Delta Lake) | 2 (PostgreSQL + Redis) |
| **Message Queue** | Kafka | None (direct calls) |
| **Orchestration** | Kubernetes | Docker Compose |
| **Service Mesh** | Istio | None |
| **Auth** | Keycloak (OAuth 2.0 + SAML) | fastapi-users (JWT) |
| **AI Models** | 6+ (self-hosted + APIs) | 1 API (GPT-4o) |
| **Infrastructure Cost** | $10K–35K/month | $110–550/month |
| **Lines of Code** | ~500,000 | ~15,000 |
| **Deploy Time** | 30 min (CI/CD) | 5 min (docker compose up) |
| **Uptime** | 99.9% | 99% (acceptable for MVP) |

---

**Document Owner:** Office of the CTO
**Last Updated:** 2026-06-29
**Status:** Approved — Ready for Implementation
