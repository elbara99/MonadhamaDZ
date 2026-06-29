# API Design

**Doc ID:** API-001
**Version:** 1.0
**Status:** Draft for Review
**Classification:** Confidential

---

## 1. Design Principles

- **Resource-Oriented:** Every API endpoint maps to a resource or action
- **Consistent Naming:** Plural nouns, kebab-case for multi-word resources
- **Idempotent:** PUT and DELETE are idempotent
- **Versioned:** URL-path versioning (`/api/v1/`)
- **Paginated:** All list endpoints support cursor-based pagination
- **Filterable:** Consistent query parameter filters
- **Predictable Errors:** RFC 7807 Problem Details for all errors

## 2. Base URL

```
Production:  https://api.monadhama.dz/api/v1
Staging:     https://api.staging.monadhama.dz/api/v1
Development: https://api.dev.monadhama.dz/api/v1
```

## 3. Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer <access_token>
```

- Token format: JWT (OIDC-compliant)
- Token expiry: 15 minutes (access), 7 days (refresh)
- Issuer: Keycloak realm per deployment

## 4. Common Request Patterns

### 4.1 Pagination

```
GET /api/v1/entities/hospitals?cursor=eyJpZCI6MTAwfQ&limit=50
```

Response:
```json
{
  "data": [...],
  "pagination": {
    "next_cursor": "eyJpZCI6MTUwfQ",
    "prev_cursor": null,
    "limit": 50,
    "total": 1523
  }
}
```

### 4.2 Filtering

```
GET /api/v1/entities/hospitals?province_code=DZ-16&type=public&status=active
```

### 4.3 Field Selection

```
GET /api/v1/entities/provinces/DZ-16?fields=name,population,area_km2
```

### 4.4 Includes (Related Resources)

```
GET /api/v1/entities/provinces/DZ-16?include=hospitals,schools
```

## 5. API Endpoints

### 5.1 Entity API

| Method | Path | Description |
|---|---|---|
| GET | `/entities/provinces` | List all provinces |
| GET | `/entities/provinces/{code}` | Get province details |
| GET | `/entities/cities` | List cities (filterable by province) |
| GET | `/entities/cities/{code}` | Get city details |
| GET | `/entities/hospitals` | List hospitals |
| GET | `/entities/hospitals/{id}` | Get hospital details |
| GET | `/entities/schools` | List schools |
| GET | `/entities/schools/{id}` | Get school details |
| GET | `/entities/universities` | List universities |
| GET | `/entities/universities/{id}` | Get university details |
| GET | `/entities/roads` | List roads |
| GET | `/entities/roads/{id}` | Get road details |
| GET | `/entities/projects` | List investment projects |
| GET | `/entities/projects/{id}` | Get project details |
| GET | `/entities/{type}/{id}/relationships` | Get entity relationships |
| GET | `/entities/{type}/{id}/timeline` | Get entity version history |

### 5.2 Indicators API

| Method | Path | Description |
|---|---|---|
| GET | `/indicators/provinces/{code}` | All indicators for province |
| GET | `/indicators/provinces/{code}/{dimension}` | Dimension-specific indicators |
| GET | `/indicators/provinces/{code}/{dimension}/history` | Time-series indicators |
| GET | `/indicators/compare?ids=...&dimensions=...` | Cross-province comparison |
| GET | `/indicators/rankings/{dimension}` | Province ranking by dimension |
| GET | `/indicators/categories` | Available indicator categories |
| GET | `/indicators/search?q=...` | Search indicators |

### 5.3 Scores API

| Method | Path | Description |
|---|---|---|
| GET | `/scores/provinces/{code}` | Composite + dimension scores |
| GET | `/scores/provinces/{code}/breakdown` | Detailed score breakdown |
| GET | `/scores/provinces/{code}/history` | Score history over time |
| GET | `/scores/compare?ids=...` | Multi-province score comparison |
| GET | `/scores/rankings` | Overall province rankings |
| GET | `/scores/rankings/{dimension}` | Dimension-specific rankings |
| GET | `/scores/config` | Current scoring configuration |

### 5.4 Search API

| Method | Path | Description |
|---|---|---|
| POST | `/search/query` | Natural language search |
| POST | `/search/semantic` | Semantic similarity search |
| POST | `/search/hybrid` | Hybrid (keyword + semantic) search |
| GET | `/search/suggestions?q=...` | Autocomplete suggestions |
| GET | `/search/recent` | Recent searches |
| POST | `/search/feedback` | Submit search feedback |

**POST /search/query**
```json
{
  "query": "What is the unemployment rate in Oran?",
  "language": "en",
  "filters": {
    "year": 2025,
    "province": "DZ-31"
  },
  "max_results": 5,
  "include_sources": true
}
```

### 5.5 AI API

| Method | Path | Description |
|---|---|---|
| POST | `/ai/query` | Natural language question |
| POST | `/ai/analyze` | Deep analysis request |
| POST | `/ai/summarize` | Summarize content |
| POST | `/ai/compare` | Compare entities |
| POST | `/ai/forecast` | Generate forecast |
| POST | `/ai/generate` | Generate report/recommendation |
| POST | `/ai/translate` | Translate content |
| GET | `/ai/capabilities` | Available capabilities |
| POST | `/ai/feedback` | Submit AI feedback |

**POST /ai/query**
```json
{
  "query": "Which provinces need urgent healthcare investment?",
  "context": {
    "user_role": "minister_of_health",
    "language": "en"
  },
  "constraints": {
    "max_sources": 10,
    "include_confidence": true,
    "include_explanation": true
  }
}
```

### 5.6 Decisions API

| Method | Path | Description |
|---|---|---|
| POST | `/decisions/evaluate` | Generate decision recommendation |
| GET | `/decisions/{id}` | Get decision details |
| PUT | `/decisions/{id}/status` | Update decision status |
| GET | `/decisions/pending` | Pending decisions for user |
| GET | `/decisions/history` | Decision history |
| GET | `/decisions/stats` | Decision statistics |
| POST | `/decisions/{id}/feedback` | Submit decision feedback |

**POST /decisions/evaluate**
```json
{
  "trigger": {
    "type": "manual",
    "query": "Where should we build new hospitals?"
  },
  "context": {
    "user_role": "minister_of_health",
    "province": null,
    "budget_constraint": 5000000000
  }
}
```

### 5.7 Reports API

| Method | Path | Description |
|---|---|---|
| POST | `/reports/generate` | Generate new report |
| GET | `/reports/{id}` | Get report metadata |
| GET | `/reports/{id}/download?format=pdf` | Download report |
| GET | `/reports` | List generated reports |
| DELETE | `/reports/{id}` | Delete report |
| GET | `/reports/templates` | List report templates |

**POST /reports/generate**
```json
{
  "template_id": "province-health-report",
  "parameters": {
    "province_code": "DZ-16",
    "year": 2025,
    "compare_to_national": true,
    "include_recommendations": true
  },
  "output_format": "pdf",
  "language": "fr"
}
```

### 5.8 Alerts API

| Method | Path | Description |
|---|---|---|
| GET | `/alerts` | List alerts (filterable) |
| GET | `/alerts/{id}` | Alert details |
| PUT | `/alerts/{id}/acknowledge` | Acknowledge alert |
| PUT | `/alerts/{id}/resolve` | Resolve alert |
| GET | `/alerts/config` | Alert configuration |
| PUT | `/alerts/config` | Update alert configuration |

### 5.9 Data Ingestion API

| Method | Path | Description |
|---|---|---|
| POST | `/ingestion/sources` | Register data source |
| GET | `/ingestion/sources` | List registered sources |
| PUT | `/ingestion/sources/{id}` | Update source config |
| POST | `/ingestion/trigger/{source_id}` | Trigger ingestion |
| GET | `/ingestion/jobs` | List ingestion jobs |
| GET | `/ingestion/jobs/{id}` | Job details and status |

### 5.10 Administration API

| Method | Path | Description |
|---|---|---|
| GET | `/admin/health` | System health |
| GET | `/admin/metrics` | System metrics |
| GET | `/admin/services` | Service status |
| POST | `/admin/cache/clear` | Clear cache |
| GET | `/admin/usage` | Usage statistics |
| GET | `/admin/audit` | Audit log search |

## 6. WebSocket Events

| Event | Direction | Description |
|---|---|---|
| `alert.new` | Server → Client | New alert triggered |
| `decision.update` | Server → Client | Decision status changed |
| `data.updated` | Server → Client | Entity data updated |
| `score.updated` | Server → Client | Province score recalculated |
| `ingestion.complete` | Server → Client | Data ingestion finished |
| `notification` | Server → Client | User notification |

## 7. Rate Limiting

| Tier | Requests/min | Burst |
|---|---|---|
| Free/Read-only | 60 | 10 |
| Standard | 300 | 50 |
| Enterprise | 1000 | 200 |
| Internal service | Unlimited | Unlimited |

## 8. API Versioning Strategy

- **Major versions** (`/api/v1/`, `/api/v2/`): Breaking changes
- **Minor changes**: Backward-compatible additions
- **Deprecation**: 6-month deprecation notice with `Sunset` header
- **Version discovery**: `GET /api/versions` returns available versions

## 9. SDK & Client Libraries

Future SDKs will be generated from OpenAPI spec:

- Python (`monadhama-sdk-py`)
- JavaScript/TypeScript (`monadhama-sdk-js`)
- Java (`monadhama-sdk-java`)
- .NET (`monadhama-sdk-dotnet`)

---

**Document Owner:** API Team
**Last Updated:** 2026-06-29
