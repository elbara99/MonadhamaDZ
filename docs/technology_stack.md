# Technology Stack

**Doc ID:** TECH-001
**Version:** 1.0
**Status:** Draft for Review
**Classification:** Confidential

---

## 1. Stack Overview

| Layer | Primary | Alternative | Rationale |
|---|---|---|---|
| Frontend | Next.js 15 + TypeScript | Remix | SSR, RSC, streaming, ecosystem |
| Backend | FastAPI (Python 3.12) | Go, Rust | Async, Pydantic validation, AI ecosystem |
| Graph DB | Neo4j 5.x | Amazon Neptune | Best-in-class graph queries, Cypher |
| Vector DB | Qdrant | Pinecone, Milvus | Self-hostable, high performance |
| Time Series | ClickHouse | TimescaleDB | Columnar, 10-100x faster aggregation |
| Data Warehouse | PostgreSQL 16 + Citus | CockroachDB | Mature, extension ecosystem |
| Data Lake | Delta Lake (Apache Iceberg) | Apache Hudi | ACID, time travel, schema evolution |
| Object Storage | MinIO | S3, GCS, Azure Blob | S3-compatible, on-premise |
| Stream Processing | Apache Kafka + Kafka Connect | Redpanda | Event sourcing, CDC, ecosystem |
| Batch Processing | Apache Spark | Dask | Distributed ETL, ML training |
| Orchestration | Kubernetes (k3s/k8s) | Nomad | Industry standard, service mesh |
| Service Mesh | Istio | Linkerd | mTLS, traffic management, observability |
| API Gateway | Kong | Envoy, AWS API Gateway | Plugin ecosystem, performance |
| Identity | Keycloak | Auth0, Azure AD | Open source, OIDC, SAML, LDAP |
| Secrets | HashiCorp Vault | AWS Secrets Manager | Dynamic secrets, HSM integration |
| Monitoring | Prometheus + Grafana | Datadog, New Relic | Self-hosted, extensible |
| Logging | ELK Stack (Elasticsearch + Logstash + Kibana) | Loki + Grafana | Full-text search, kibana dashboards |
| Tracing | OpenTelemetry + Jaeger | Datadog APM | Vendor-neutral, multi-language |
| Workflow | Apache Airflow | Prefect, Dagster | Mature, extensive operator library |
| AI Framework | LangChain + LangGraph | LlamaIndex | Orchestration, multi-step workflows |
| ML Platform | MLflow | Kubeflow | Model registry, experiment tracking |
| GPU Inference | NVIDIA Triton Inference Server | vLLM | High-throughput, multi-model |
| CI/CD | GitHub Actions + ArgoCD | GitLab CI | Native GitHub integration |
| IaC | Terraform + Helm | Pulumi | Multi-cloud, state management |
| Container Registry | Harbor | ECR, GCR | Vulnerability scanning, on-premise |
| CDN | Cloudflare (if public deployed) | — | DDoS, WAF, edge caching |

## 2. Programming Languages

| Language | Version | Use |
|---|---|---|
| Python | 3.12+ | Backend services, AI/ML, data processing |
| TypeScript | 5.x | Frontend (Next.js), API types |
| Rust | 1.75+ | Performance-critical services (future) |
| Go | 1.22+ | Infrastructure tooling (future) |
| SQL | — | Data warehouse queries |
| Cypher | — | Knowledge graph queries |

## 3. Python Backend Stack

| Package | Purpose |
|---|---|
| FastAPI | Web framework |
| Pydantic v2 | Data validation |
| SQLAlchemy 2.0 + asyncpg | PostgreSQL ORM |
| neo4j-driver | Graph database driver |
| qdrant-client | Vector store client |
| clickhouse-driver | Time-series client |
| redis-py | Cache client |
| aiokafka | Async Kafka producer/consumer |
| LangChain + LangGraph | AI orchestration |
| sentence-transformers | Embedding models |
| Hugging Face transformers | LLM integration |
| Apache Spark (PySpark) | Data processing |
| Great Expectations | Data quality |
| Alembic | Database migrations |
| pytest + pytest-asyncio | Testing |
| prometheus-client | Metrics |
| open-telemetry-api | Distributed tracing |
| celery + redis | Background task processing |

## 4. AI Model Requirements

### 4.1 Self-Hosted Models
| Model | Parameters | VRAM | GPUs | Purpose |
|---|---|---|---|---|
| Llama 3 70B | 70B | 140GB | 4× A100 80GB | Arabic/English reasoning |
| Mistral Ara | 7B | 16GB | 1× A100 80GB | Arabic-optimized |
| multilingual-e5-large | 335M | 2GB | CPU/GPU | Embeddings |
| BERT (fine-tuned) | 110M | 1GB | CPU | Classification, NER |
| Prophet | — | — | CPU | Time series forecasting |

### 4.2 Cloud API Models (Sovereign Cloud)
| Model | Provider | Purpose |
|---|---|---|
| GPT-4o | Azure OpenAI | Complex reasoning |
| Claude 3.5 Sonnet | AWS Bedrock | Complex reasoning |
| Claude 3 Haiku | AWS Bedrock | Fast summarization |
| GPT-4o mini | Azure OpenAI | Classification |

## 5. Infrastructure Requirements

### 5.1 Minimum Production Cluster
| Component | Spec | Count |
|---|---|---|
| Compute nodes | 32 vCPU, 128GB RAM | 10–20 |
| GPU nodes | 8× A100 80GB | 2–4 |
| Storage nodes | 16 vCPU, 64GB RAM, NVMe | 3–5 |
| Control plane | 8 vCPU, 32GB RAM | 3 |
| Object storage | 100TB+ (MinIO) | Clustered |
| Network | 25 Gbps | Full mesh |

### 5.2 Estimated Resource per Service
| Service | CPU | RAM | Storage | Replicas |
|---|---|---|---|---|
| API Gateway | 2 | 4GB | — | 3 |
| Entity Service | 2 | 4GB | — | 3 |
| AI Service | 8 | 32GB | — | 3–5 |
| Decision Service | 4 | 8GB | — | 3 |
| Search Service | 4 | 8GB | — | 3 |
| Neo4j | 8 | 32GB | 500GB | 3 |
| PostgreSQL | 8 | 64GB | 2TB | 3 |
| ClickHouse | 8 | 32GB | 2TB | 3 |
| Kafka | 4 | 16GB | 1TB | 3 |
| Redis | 4 | 16GB | 100GB | 3 |
| Qdrant | 4 | 16GB | 500GB | 3 |

## 6. Development Tools

| Tool | Purpose |
|---|---|
| Poetry | Python dependency management |
| pnpm | Node.js package management |
| Docker + Docker Compose | Local development |
| DevContainers | Standardized dev environments |
| pre-commit | Code quality hooks |
| Ruff | Python linting |
| mypy | Python type checking |
| ESLint + Prettier | TypeScript linting/formatting |
| Husky + lint-staged | Git hooks |

---

**Document Owner:** Engineering Team
**Last Updated:** 2026-06-29
