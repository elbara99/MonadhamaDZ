# Data Engine

**Doc ID:** DENG-001
**Version:** 1.0
**Status:** Draft for Review
**Classification:** Confidential

---

## 1. Overview

The Data Engine is responsible for ingesting, validating, transforming, storing, and serving all data within Monadhama. It is designed for petabyte-scale, real-time and batch processing, with rigorous quality controls at every stage.

## 2. Pipeline Architecture

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  SOURCES     │ → │  INGESTION   │ → │  QUALITY     │ → │  CATALOG     │
│ (200+)       │   │  LAYER       │   │  GATE        │   │  & LINEAGE   │
└──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
                           │                                     │
                           ↓                                     ↓
                    ┌──────────────┐                    ┌──────────────┐
                    │  DATA LAKE   │                    │  KNOWLEDGE   │
                    │  (Raw/Refd)  │                    │   GRAPH      │
                    └──────────────┘                    └──────────────┘
                           │                                     │
                           ↓                                     ↓
                    ┌──────────────┐                    ┌──────────────┐
                    │  WAREHOUSE   │                    │  VECTOR      │
                    │  (Analytics) │                    │  STORE       │
                    └──────────────┘                    └──────────────┘
```

## 3. Ingestion Layer

### 3.1 Ingestion Patterns

| Pattern | Technology | Use Case |
|---|---|---|
| Batch SFTP | Apache Airflow + SSH | Ministry CSV/Excel files |
| API Polling | Airflow HTTP Hook + REST | Open data APIs |
| CDC Streaming | Debezium + Kafka Connect | Database replication |
| Webhook Receiver | FastAPI endpoint + Kafka | Real-time event feeds |
| File Upload UI | Presigned URL + S3 | Manual uploads |
| IoT Ingestion | MQTT Bridge + Kafka | Sensor network data |
| Satellite Data | GDAL + Airflow | GeoTIFF, NetCDF |

### 3.2 Kafka Event Schema

Every ingested record produces a Kafka event:

```json
{
  "event_id": "uuid",
  "source_id": "MOH-001",
  "source_type": "batch_sftp",
  "schema_version": "1.0",
  "records_count": 15234,
  "ingestion_timestamp": "2026-06-29T10:00:00Z",
  "checksum": "sha256-hash",
  "status": "received",
  "metadata": {
    "filename": "health_stats_2026_q1.csv",
    "file_size_bytes": 2456789,
    "delivery_protocol": "sftp"
  }
}
```

## 4. Data Lake Architecture

### 4.1 Lake Structure

```
s3://monadhama-data/
├── bronze/         # Raw ingested data, immutable
│   ├── source=MOH-001/
│   │   ├── year=2026/
│   │   │   └── month=06/
│   │   │       └── health_stats_2026_q1.parquet
│   └── source=ONS-001/
├── silver/         # Cleaned, validated, deduplicated
│   ├── entity=hospital/
│   │   └── year=2026/
│   └── entity=population/
├── gold/           # Aggregated, joined, business-ready
│   ├── dim_province/
│   ├── dim_hospital/
│   ├── fact_health_indicators/
│   └── fact_economic_indicators/
└── metadata/
    ├── data_catalog/
    ├── schema_registry/
    └── quality_reports/
```

### 4.2 Storage Format

- **Format:** Delta Lake (Parquet + transaction log)
- **Compression:** Zstandard (zstd)
- **Partitioning:** By date, source, entity type
- **Versioning:** Time-travel queries supported
- **Optimization:** Z-ordering, bloom filters, compaction

## 5. Data Quality Framework

### 5.1 Quality Checks (Great Expectations)

| Check | Description | Action on Failure |
|---|---|---|
| Schema Validation | Column names, types, nullability | Reject, alert |
| Completeness | Required fields populated | Warn, flag |
| Uniqueness | No duplicate primary keys | Reject duplicates |
| Range Validation | Values within expected bounds | Warn, flag outliers |
| Referential Integrity | Foreign key references valid | Reject orphans |
| Freshness Check | Data is within expected time window | Warn if stale |
| Distribution Check | Statistical profile matches expectation | Flag anomalies |
| Cross-Source Consistency | Values match across sources | Flag conflicts |

### 5.2 Quality Score

Each dataset receives a quality score (0–100):

```json
{
  "dataset_id": "hospital_capacity_2026_q1",
  "completeness": 97.2,
  "accuracy": 98.5,
  "timeliness": 95.0,
  "consistency": 96.1,
  "uniqueness": 99.9,
  "overall_score": 97.3,
  "blocking_issues": 0,
  "warnings": 2
}
```

## 6. Transformation Layer

### 6.1 ETL Jobs (Apache Spark)

| Job | Schedule | Description |
|---|---|---|
| `bronze_to_silver_health` | Per source arrival | Clean, normalize, deduplicate health data |
| `bronze_to_silver_education` | Per source arrival | Clean, normalize, deduplicate education data |
| `silver_to_gold_dimensions` | Daily | Build dimension tables |
| `silver_to_gold_facts` | Daily | Build fact tables |
| `compute_indicators` | Daily | Compute derived indicators |
| `update_knowledge_graph` | Near-real-time | Sync graph from gold layer |
| `update_vector_store` | On change | Generate and store embeddings |
| `data_quality_report` | Daily | Generate quality metrics |

### 6.2 Transformation Rules

- **Standardization:** All currencies to DZD, all dates to ISO 8601, all codes to ONS standard
- **Normalization:** Entity names to Arabic + French + English
- **Geocoding:** All facilities get lat/lng coordinates
- **Aggregation:** Raw data aggregated to province, national levels
- **Derivation:** Computed indicators from raw metrics

## 7. Data Serving Layer

| Store | Technology | Query Pattern | Latency |
|---|---|---|---|
| Knowledge Graph | Neo4j | Entity + relationship queries | <50ms |
| Data Warehouse | PostgreSQL (Citus) | SQL analytics | <200ms |
| Vector Store | Qdrant | Semantic search | <100ms |
| Time Series | ClickHouse | Time-range aggregates | <10ms |
| Cache | Redis | Hot data, sessions | <1ms |
| Data Lake | Delta Lake + Presto | Ad-hoc, large scans | <10s |

## 8. Data Governance

### 8.1 Data Catalog

Apache Atlas-based catalog with:
- Business glossary (Arabic, French, English)
- Technical metadata
- Data lineage (source → transformation → consumption)
- Ownership and stewardship contacts
- Sensitivity classification
- Usage tracking

### 8.2 Data Lineage

Every data point is traceable:

```
[Source File] → [Bronze Table] → [Silver Table] → [Gold Table] → [Knowledge Graph] → [API Response]
```

Lineage is automatically captured and stored in the catalog.

### 8.3 Retention Policy

| Tier | Retention | Storage |
|---|---|---|
| Bronze (raw) | Indefinite | Cheapest object storage |
| Silver (cleaned) | 5 years | Standard |
| Gold (aggregated) | 10 years | Fast |
| Graph snapshots | Indefinite | Hot |
| Temporary | 30 days | Ephemeral |

## 9. Data Security

- **At rest:** AES-256 encryption
- **In transit:** TLS 1.3
- **Column-level:** Sensitive columns encrypted with per-tenant keys
- **Masking:** Dynamic data masking for non-privileged users
- **Audit:** All data access logged with user, query, timestamp
- **Anonymization:** PII stripped in silver+ layers

## 10. Performance Targets

| Metric | Target |
|---|---|
| Ingestion throughput | 100 MB/s per pipeline |
| New data to query-ready | <5 minutes (real-time), <4 hours (batch) |
| Data freshness (P95) | <1 hour for critical, <1 day for standard |
| Quality gate processing | <10 seconds per dataset |
| Catalog update latency | <1 minute |
| Lake compaction SLA | Daily |

---

**Document Owner:** Data Engineering Team
**Last Updated:** 2026-06-29
