# Backend Architecture

**Doc ID:** BE-001
**Version:** 1.0
**Status:** Draft for Review
**Classification:** Confidential

---

## 1. Architecture Pattern

Microservices architecture with event-driven communication and API gateway routing.

## 2. Service Map

```
┌──────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY (Kong)                            │
│  Auth · Rate Limiting · Routing · Caching · Transformation          │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Decision │ │   AI     │ │  Search  │ │  Report  │ │ User     │  │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │ │ Service  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Entity   │ │ Scoring  │ │ Alert    │ │ Notific- │ │ Audit    │  │
│  │ Service  │ │ Service  │ │ Service  │ │ ation    │ │ Service  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ Data     │ │ Ingestion│ │ Quality  │ │ Catalog  │              │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

## 3. Service Specifications

### 3.1 User Service
**Purpose:** User management, authentication, roles, permissions
**Tech:** FastAPI + PostgreSQL
**Endpoints:**
- `POST /users/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /users/me`
- `PUT /users/{id}/roles`
- `GET /users/{id}/permissions`

### 3.2 Entity Service
**Purpose:** CRUD operations on government entities
**Tech:** FastAPI + Neo4j
**Endpoints:**
- `GET /entities/{type}/{id}`
- `GET /entities/{type}?filter=...`
- `GET /entities/{id}/relationships`
- `GET /entities/{id}/timeline`
- `POST /entities/search`

### 3.3 Search Service
**Purpose:** Unified search across all data stores
**Tech:** FastAPI + Qdrant + Elasticsearch
**Endpoints:**
- `POST /search/query`
- `POST /search/semantic`
- `POST /search/hybrid`
- `GET /search/suggestions?q=...`

### 3.4 AI Service
**Purpose:** AI model orchestration and inference
**Tech:** FastAPI + LangChain + GPU inference
**Endpoints:**
- `POST /ai/query` — Natural language query
- `POST /ai/analyze` — Deep analysis
- `POST /ai/summarize` — Summarization
- `POST /ai/compare` — Multi-entity comparison
- `POST /ai/generate` — Report generation
- `POST /ai/forecast` — Forecasting
- `GET /ai/capabilities` — Available capabilities

### 3.5 Decision Service
**Purpose:** Decision engine orchestration
**Tech:** FastAPI + PostgreSQL + workflow engine
**Endpoints:**
- `POST /decisions/evaluate` — Generate recommendation
- `GET /decisions/{id}` — Get recommendation
- `PUT /decisions/{id}/status` — Accept/reject/defer
- `GET /decisions/history` — Decision history
- `GET /decisions/pending` — Pending approvals

### 3.6 Scoring Service
**Purpose:** Priority score computation
**Tech:** FastAPI + PostgreSQL + MLflow models
**Endpoints:**
- `GET /scores/province/{id}` — Province score
- `GET /scores/province/{id}/dimension/{dim}` — Dimension breakdown
- `GET /scores/compare?ids=...` — Multi-province comparison
- `GET /scores/rankings?dimension=...` — Province rankings
- `GET /scores/trends/{id}` — Score history

### 3.7 Report Service
**Purpose:** Report generation, template management, export
**Tech:** FastAPI + WeasyPrint + Jinja2
**Endpoints:**
- `POST /reports/generate` — Generate report
- `GET /reports/{id}` — Get report
- `GET /reports/{id}/download?format=pdf`
- `GET /reports/templates` — List templates
- `POST /reports/templates` — Create template

### 3.8 Alert Service
**Purpose:** Alert management based on risk detection
**Tech:** FastAPI + Kafka + PostgreSQL
**Endpoints:**
- `GET /alerts` — List alerts
- `GET /alerts/{id}` — Alert details
- `PUT /alerts/{id}/acknowledge` — Acknowledge
- `PUT /alerts/{id}/resolve` — Resolve
- `GET /alerts/config` — Alert configuration

### 3.9 Notification Service
**Purpose:** Multi-channel notifications
**Tech:** FastAPI + WebSocket + email/SMS gateway
**Endpoints:**
- `POST /notifications/send` — Send notification
- `GET /notifications` — User notifications
- `PUT /notifications/{id}/read` — Mark read
- `PUT /notifications/preferences` — User preferences

### 3.10 Audit Service
**Purpose:** Audit logging, compliance, and forensics
**Tech:** FastAPI + Kafka + ClickHouse
**Endpoints:**
- `POST /audit/log` — Log event
- `GET /audit/search` — Search audit log
- `GET /audit/export` — Export audit trail
- `GET /audit/stats` — Audit statistics

### 3.11 Data Service
**Purpose:** Data lake and warehouse abstraction
**Tech:** FastAPI + Presto/Trino + Delta Lake
**Endpoints:**
- `POST /data/query` — SQL query on warehouse
- `GET /data/datasets` — Available datasets
- `GET /data/datasets/{id}/schema` — Dataset schema
- `GET /data/datasets/{id}/profile` — Data profile
- `POST /data/export` — Export data

### 3.12 Ingestion Service
**Purpose:** Data ingestion management
**Tech:** FastAPI + Airflow API + Kafka
**Endpoints:**
- `POST /ingestion/sources` — Register source
- `POST /ingestion/trigger` — Trigger ingestion
- `GET /ingestion/jobs` — Job status
- `GET /ingestion/jobs/{id}/logs` — Job logs
- `GET /ingestion/history` — Ingestion history

### 3.13 Quality Service
**Purpose:** Data quality monitoring
**Tech:** FastAPI + Great Expectations
**Endpoints:**
- `GET /quality/datasets` — Dataset quality scores
- `GET /quality/datasets/{id}/report` — Quality report
- `GET /quality/checks` — Available quality checks
- `POST /quality/checks/run` — Run quality check

### 3.14 Catalog Service
**Purpose:** Data catalog and lineage
**Tech:** FastAPI + Apache Atlas
**Endpoints:**
- `GET /catalog/search` — Search catalog
- `GET /catalog/entities/{id}` — Entity metadata
- `GET /catalog/entities/{id}/lineage` — Data lineage
- `GET /catalog/glossary` — Business glossary

## 4. Common Service Template

Every microservice follows this template:

```
/services/{service_name}/
├── src/
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration (pydantic-settings)
│   ├── models/              # Pydantic models
│   ├── routers/             # API endpoints
│   ├── services/            # Business logic
│   ├── repositories/        # Data access layer
│   ├── messaging/           # Kafka producers/consumers
│   ├── middleware/          # Auth, logging, tracing
│   └── dependencies/        # FastAPI dependencies
├── tests/
│   ├── unit/
│   └── integration/
├── Dockerfile
├── pyproject.toml
└── README.md
```

## 5. Inter-Service Communication

| Pattern | Protocol | Use Case |
|---|---|---|
| Synchronous | gRPC (internal) | Service-to-service queries |
| Synchronous | REST | External API, simple queries |
| Asynchronous | Kafka | Event-driven workflows |
| Streaming | WebSocket | Real-time updates, notifications |
| Scheduled | Airflow DAGs | Batch processing, ETL |

## 6. API Standards

- **Protocol:** REST over HTTPS (external), gRPC (internal)
- **Versioning:** `/api/v1/`, `/api/v2/`
- **Format:** JSON (request/response), Protocol Buffers (internal)
- **Errors:** RFC 7807 Problem Details
- **Documentation:** OpenAPI 3.1 + Stoplight Elements
- **Rate Limiting:** Per-user, per-endpoint (Kong)
- **Caching:** ETags + Redis for hot data

## 7. Error Handling Standard

```json
{
  "type": "https://api.monadhama.dz/errors/data-not-found",
  "title": "Data Not Found",
  "status": 404,
  "detail": "No hospital records found for province code 'XX-999'",
  "instance": "/api/v1/entities/hospital?province=XX-999",
  "correlation_id": "req-abc123",
  "timestamp": "2026-06-29T14:30:00Z"
}
```

## 8. Performance Targets

| Metric | Target |
|---|---|
| P50 API latency | <100ms |
| P99 API latency | <500ms |
| Concurrent requests | 5000+ |
| Service startup | <10s |
| Health check interval | 5s |
| Graceful shutdown | <30s |

## 9. Deployment

All services are:
- Containerized (Docker)
- Orchestrated (Kubernetes)
- Auto-scaled (HPA based on CPU/memory/custom metrics)
- Health-checked (liveness + readiness probes)
- Configurable via ConfigMaps + Vault secrets
- Monitored (Prometheus metrics + structured logging)

---

**Document Owner:** Backend Engineering Team
**Last Updated:** 2026-06-29
