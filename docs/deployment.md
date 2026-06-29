# Deployment Architecture

**Doc ID:** DEP-001
**Version:** 1.0
**Status:** Draft for Review
**Classification:** Confidential

---

## 1. Deployment Philosophy

- **Infrastructure as Code:** All infrastructure defined in Terraform + Helm
- **Immutable Deployments:** Every deployment creates new containers, never mutates running ones
- **GitOps:** ArgoCD syncs cluster state from Git repository
- **Canary Deployments:** Gradual rollout with automated rollback
- **Multi-Environment:** Dev → Staging → Production promotion

## 2. Environment Strategy

| Environment | Purpose | Kubernetes | Data | GPUs |
|---|---|---|---|---|
| dev | Development, unit tests | Single node | Synthetic + sampled | 1× A100 |
| staging | Integration, load tests | 3 nodes | Sampled production (anonymized) | 2× A100 |
| production | Live government deployment | 20+ nodes | Full production | 4× A100 |

## 3. Kubernetes Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        CONTROL PLANE                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ API     │ │ Scheduler│ │ CM      │ │ ETCD    │ │ CoreDNS │           │
│  │ Server  │ │          │ │         │ │         │ │         │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
├──────────────────────────────────────────────────────────────────────────┤
│                         WORKER NODES                                     │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────────┐ │
│  │  Node Pool: Application         │  │  Node Pool: Data                │ │
│  │  - API Gateway                  │  │  - Neo4j                        │ │
│  │  - Microservices                │  │  - PostgreSQL                   │ │
│  │  - AI Service                   │  │  - ClickHouse                   │ │
│  │  - Search Service               │  │  - Kafka                        │ │
│  └─────────────────────────────────┘  │  - Redis                        │ │
│  ┌─────────────────────────────────┐  │  - Qdrant                       │ │
│  │  Node Pool: GPU                 │  └─────────────────────────────────┘ │
│  │  - LLM Inference                │  ┌─────────────────────────────────┐ │
│  │  - ML Training                  │  │  Node Pool: Storage             │ │
│  │  - Batch Processing             │  │  - MinIO                       │ │
│  └─────────────────────────────────┘  │  - Data Lake workers           │ │
│  ┌─────────────────────────────────┐  └─────────────────────────────────┘ │
│  │  Node Pool: Monitoring          │                                      │
│  │  - Prometheus + Grafana         │                                      │
│  │  - ELK Stack                    │                                      │
│  │  - Jaeger                       │                                      │
│  └─────────────────────────────────┘                                      │
└──────────────────────────────────────────────────────────────────────────┘
```

## 4. CI/CD Pipeline

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  CODE    │ → │  BUILD   │ → │  TEST    │ → │  PACKAGE │ → │  DEPLOY  │
│  Push    │   │  Image   │   │  Unit +  │   │  Helm    │   │  (Argo)  │
│          │   │          │   │  Integr. │   │  Chart   │   │          │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
                                                  │
                                                  ↓
                                          ┌──────────────┐
                                          │  CONTAINER   │
                                          │  REGISTRY    │
                                          │  (Harbor)    │
                                          └──────────────┘
```

### 4.1 CI Pipeline (GitHub Actions)

```yaml
stages:
  - lint: ruff, mypy (Python); ESLint, Prettier (TypeScript)
  - test: pytest (unit + integration), vitest (frontend)
  - build: docker build, tag, push to Harbor
  - security: Trivy scan, SonarQube analysis
  - deploy-staging: ArgoCD sync to staging
  - e2e: Playwright E2E tests against staging
  - deploy-production: Manual approval → ArgoCD sync to production
  - smoke: Health check + critical path tests against production
```

### 4.2 CD Pipeline (ArgoCD)

- **Sync Policy:** Automated (staging), Manual (production)
- **Prune:** Automatic removal of deleted resources
- **Self-Heal:** Automatic drift correction
- **Rollback:** One-click rollback to previous version
- **Progressive Delivery:** Canary deployments with traffic splitting

## 5. Container Strategy

| Component | Base Image | Size Target |
|---|---|---|
| Python services | python:3.12-slim | <200MB |
| Node.js services | node:20-alpine | <150MB |
| GPU inference | nvidia/cuda:12.4-runtime | <2GB |
| Spark jobs | bitnami/spark:3.5 | <500MB |

## 6. Service Mesh (Istio)

| Feature | Configuration |
|---|---|
| mTLS | STRICT mode, mutual TLS for all services |
| Traffic splitting | Canary deployments: 90/10, 50/50, 100/0 |
| Circuit breaking | Max connections: 100, Max pending: 30 |
| Timeouts | Default: 30s, AI endpoints: 120s |
| Retries | 2 retries with 200ms base timeout |
| Rate limiting | Per-source, per-destination |

## 7. Database Operations

### 7.1 Backup Schedule

| Database | Full | Incremental | Retention |
|---|---|---|---|
| Neo4j | Daily (00:00 UTC) | CDC stream | 30 days full, 7 days incremental |
| PostgreSQL | Daily (01:00 UTC) | WAL continuous | 30 days full, 7 days WAL |
| ClickHouse | Daily (02:00 UTC) | — | 14 days |
| Qdrant | Daily (03:00 UTC) | — | 7 days |
| Redis | RDB every 6h | AOF continuous | 3 days |

### 7.2 Disaster Recovery

```
Primary Region (Algiers) ──async replication──→ DR Region (Oran)
                                                          │
                    ┌─────────────────────────────────────┘
                    ↓
              DNS Failover → API Gateway directs to DR
```

- **RPO:** <15 minutes (async replication)
- **RTO:** <4 hours (full DR failover)
- **Testing:** Quarterly DR drills

## 8. Monitoring & Observability

### 8.1 Metrics (Prometheus + Grafana)

| Dashboard | Focus |
|---|---|
| Service Health | CPU, memory, request rate, error rate, latency |
| Database | Connection pools, query latency, cache hit ratio |
| Kafka | Lag per consumer group, throughput |
| AI | Model latency, token usage, error rate |
| Business | Queries per day, decisions per day, active users |
| Security | Failed auth attempts, rate limit hits, audit volume |

### 8.2 Logging (ELK)

| Log Source | Index Pattern | Retention |
|---|---|---|
| Application | `monadhama-app-*` | 30 days |
| AI interactions | `monadhama-ai-*` | 90 days |
| Audit | `monadhama-audit-*` | 5 years |
| Security | `monadhama-security-*` | 1 year |
| Infrastructure | `monadhama-infra-*` | 14 days |

### 8.3 Tracing (OpenTelemetry + Jaeger)

- All services instrumented with OpenTelemetry SDK
- Sampling rate: 100% for errors, 10% for normal traffic
- Trace context propagated via HTTP headers and Kafka message headers

### 8.4 Alerting

| Alert | Condition | Severity |
|---|---|---|
| Service down | Health check fails for 1 minute | Critical |
| API latency spike | P99 > 1s for 5 minutes | Warning |
| Error rate spike | 5xx > 1% for 5 minutes | Critical |
| Disk space | >85% used | Warning |
| Certificate expiry | <30 days | Warning |
| Data ingestion failure | Pipeline failed | Critical |
| Model drift | Accuracy drops >5% | Warning |

## 9. Scaling Policies

| Service | Metric | Min | Max | CPU Threshold |
|---|---|---|---|---|
| API Gateway | CPU | 3 | 10 | 70% |
| Entity Service | CPU + Memory | 3 | 8 | 70% |
| AI Service | CPU + Queue | 3 | 20 | 60% |
| Search Service | CPU + QPS | 3 | 10 | 70% |
| Decision Service | CPU | 3 | 6 | 70% |
| Neo4j | Memory | 3 | 5 | 80% |
| PostgreSQL | Connection count | 3 | 7 | 80% |

## 10. Network Architecture

```
[Internet / GovNet]
        ↓
[WAF / DDoS Protection]
        ↓
[Load Balancer] → TLS termination
        ↓
[API Gateway] → Kong
        ↓
[Service Mesh] → Istio
        ↓
[Services] → Encrypted mTLS
```

- **Ingress:** NGINX Ingress Controller with TLS termination
- **Egress:** Restricted via network policy (allow-list only)
- **Internal DNS:** CoreDNS with cluster DNS
- **Service Discovery:** Kubernetes DNS + Consul (for legacy)

---

**Document Owner:** DevOps Team
**Last Updated:** 2026-06-29
