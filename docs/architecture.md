# System Architecture

**Doc ID:** ARCH-001
**Version:** 1.0
**Status:** Draft for Review
**Classification:** Confidential

---

## 1. Architectural Philosophy

Monadhama follows a **layered, event-driven, microservices architecture** designed for:
- **Horizontal scalability** — Each layer scales independently
- **Fault isolation** — Failure in one layer does not cascade
- **Replaceable components** — Any service can be swapped without affecting others
- **Security boundary enforcement** — Layers enforce strict access control
- **Multi-tenant readiness** — Country isolation is handled at the data and API layers

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│  (React SPA, Mobile, Executive Briefing Terminal, API Console) │
├─────────────────────────────────────────────────────────────────┤
│                         API GATEWAY                              │
│              (Authentication · Rate Limiting · Routing)          │
├─────────────────────────────────────────────────────────────────┤
│                        APPLICATION LAYER                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ Decision │ │   AI     │ │  Search  │ │   Report Gen     │  │
│  │  Engine  │ │  Engine  │ │  Engine  │ │   Engine         │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                        KNOWLEDGE LAYER                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ Knowl.   │ │  Entity  │ │ Relation│ │   Vector Store   │  │
│  │  Graph   │ │ Registry │ │  Store  │ │   (Embeddings)   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                        DATA LAYER                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ Ingestor │ │  ETL     │ │ Quality  │ │   Data Lake      │  │
│  │ Pipeline │ │  Engine  │ │ Gate     │ │   (Raw + Refined)│  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                        INFRASTRUCTURE LAYER                       │
│  (Kubernetes · Service Mesh · Object Storage · Message Queue)   │
└─────────────────────────────────────────────────────────────────┘
```

## 3. Layer Descriptions

### 3.1 Infrastructure Layer
- **Orchestration:** Kubernetes (EKS/AKS/GKE or on-premise equivalent)
- **Service Mesh:** Istio for mTLS, traffic management, observability
- **Message Queue:** Apache Kafka for event streaming
- **Object Storage:** MinIO (on-premise) or S3-compatible storage
- **Secrets Management:** HashiCorp Vault
- **Monitoring:** Prometheus + Grafana + ELK Stack
- **CI/CD:** ArgoCD + GitHub Actions

### 3.2 Data Layer
- **Ingestion Pipeline:** Apache Kafka + Kafka Connect for real-time streaming; Apache Airflow for batch scheduling
- **ETL Engine:** Apache Spark for distributed data processing
- **Quality Gate:** Great Expectations for data quality validation at every stage
- **Data Lake:** Delta Lake / Apache Iceberg format on object storage
- **Data Warehouse:** PostgreSQL (structured), ClickHouse (analytics), Neo4j (graph)
- **Data Catalog:** Apache Atlas for metadata management and data lineage

### 3.3 Knowledge Layer
- **Knowledge Graph:** Neo4j — stores all government entities, their attributes, and relationships
- **Entity Registry:** Custom service — manages entity lifecycle, identity, and versioning
- **Relation Store:** Time-series edge store for dynamic relationships
- **Vector Store:** Pinecone / Qdrant / Milvus — stores embeddings for semantic search
- **GraphQL Federation:** Unified query interface across knowledge stores

### 3.4 Application Layer
- **Decision Engine:** Recommendation system that combines rules, scoring, and AI
- **AI Engine:** Orchestrates LLM calls, RAG pipelines, and ML models
- **Search Engine:** Hybrid search (BM25 + vector) for natural language queries
- **Report Generation Engine:** Templated + AI-generated reports with citations

### 3.5 API Gateway
- **Gateway:** Kong / Envoy / AWS API Gateway
- **Authentication:** OAuth 2.0 + OIDC via Keycloak
- **Authorization:** Attribute-Based Access Control (ABAC)
- **Rate Limiting:** Per-tenant, per-endpoint
- **Observability:** OpenTelemetry for distributed tracing

### 3.6 Presentation Layer
- **Web App:** React + TypeScript + Next.js (SSR for performance)
- **Mobile:** React Native (future phase)
- **Executive Terminal:** High-density information display for decision rooms
- **API Console:** Interactive API documentation (OpenAPI 3.1 + Swagger)

## 4. Data Flow Architecture

```
[Data Sources] → [Kafka] → [Spark ETL] → [Quality Gate]
                                                    ↓
                                    ┌───────────────┴───────────────┐
                                    ↓                               ↓
                            [Data Lake (Raw)]              [Data Lake (Refined)]
                                    ↓                               ↓
                            [Knowledge Graph]              [Vector Store]
                                    ↓                               ↓
                                    └───────────────┬───────────────┘
                                                    ↓
                                            [Application Layer]
                                                    ↓
                                              [API Gateway]
                                                    ↓
                                            [Presentation Layer]
```

## 5. Event-Driven Communication

All inter-service communication uses asynchronous events through Kafka topics:

| Topic | Publisher | Consumers | Schema |
|---|---|---|---|
| `raw.data.ingested` | Data Ingestion | ETL Engine | Avro |
| `entity.updated` | Knowledge Layer | AI Engine, Search | Avro |
| `decision.requested` | Presentation | Decision Engine | Avro |
| `decision.generated` | Decision Engine | Presentation | Avro |
| `alert.triggered` | AI Engine | Notification, Presentation | Avro |
| `model.trained` | AI Engine | Model Registry | Avro |

## 6. Scalability Design

| Component | Scaling Strategy | Replicas |
|---|---|---|
| API Gateway | Horizontal (per region) | 3+ |
| Application Services | Horizontal (per service) | 3-20 |
| Kafka | Cluster (3+ brokers) | 3-7 |
| Neo4j | Read replicas + sharding | 3-5 |
| PostgreSQL | Read replicas + Citus | 3-7 |
| Vector Store | Sharded | 3-5 |
| Spark | Dynamic executors | 5-50 |

## 7. Deployment Topology

### 7.1 Development
- Single Kubernetes cluster
- MinIO for storage
- Small service replicas
- Development LLM endpoints

### 7.2 Staging
- Production-like topology
- Synthetic data + sampled production data
- Full monitoring stack
- Load testing infrastructure

### 7.3 Production (Government Data Center)
- 3 availability zones
- Sovereign cloud or on-premise
- Air-gapped option for classified data
- Disaster recovery across regions
- Full HSM integration for encryption

## 8. Architecture Decision Records

ADRs are stored in `/docs/decisions/`. Key architectural decisions include:

- **ADR-001:** Use of event-driven architecture over request-response for data pipelines
- **ADR-002:** Neo4j as primary knowledge graph store
- **ADR-003:** Delta Lake format for data lake storage
- **ADR-004:** RAG-based AI architecture with hybrid search
- **ADR-005:** ABAC over RBAC for fine-grained government permissions
- **ADR-006:** Istio service mesh for mTLS and observability

---

**Document Owner:** Architecture Team
**Last Updated:** 2026-06-29
