# Database Design

**Doc ID:** DB-001
**Version:** 1.0
**Status:** Draft for Review
**Classification:** Confidential

---

## 1. Multi-Model Database Strategy

Monadhama uses multiple database technologies optimized for different access patterns:

| Store | Technology | Purpose | Data Model |
|---|---|---|---|
| Knowledge Graph | Neo4j 5.x | Entities, relationships, hierarchies | Property Graph |
| Data Warehouse | PostgreSQL 16 + Citus | Structured indicators, metrics | Relational |
| Vector Store | Qdrant | Semantic search embeddings | Vector |
| Time Series | ClickHouse | High-volume time-series analytics | Columnar |
| Cache | Redis 7 | Hot data, sessions, rate limits | Key-Value |
| Data Lake | Delta Lake (Iceberg) | Raw/refined data, ML training | Tabular |
| Document Store | MongoDB (optional) | Unstructured reports, documents | Document |

## 2. Neo4j Knowledge Graph Schema

### 2.1 Node Labels & Properties

(See `knowledge_model.md` for full entity definitions)

### 2.2 Indexes

```cypher
CREATE INDEX province_code FOR (p:Province) ON (p.code);
CREATE INDEX province_name FOR (p:Province) ON (p.name);
CREATE INDEX hospital_type FOR (h:Hospital) ON (h.hospital_type);
CREATE INDEX school_type FOR (s:School) ON (s.school_type);
CREATE INDEX entity_status FOR (e) ON (e.status) WHERE e.status IS NOT NULL;
CREATE INDEX entity_coordinates FOR (e) ON (e.latitude, e.longitude);
```

### 2.3 Constraints

```cypher
CREATE CONSTRAINT province_id_unique FOR (p:Province) REQUIRE p.code IS UNIQUE;
CREATE CONSTRAINT country_code_unique FOR (c:Country) REQUIRE c.code IS UNIQUE;
CREATE CONSTRAINT entity_id_unique FOR (e) REQUIRE e.id IS UNIQUE;
```

### 2.4 Common Queries

```cypher
// Get province with all hospitals
MATCH (p:Province {code: 'DZ-16'})-[:HAS_HOSPITAL]->(h:Hospital)
RETURN p, collect(h) AS hospitals

// Compare two provinces across indicators
MATCH (p1:Province {code: 'DZ-16'})-[:HAS_INDICATOR]->(i1:CitizenIndicators {year: 2025})
MATCH (p2:Province {code: 'DZ-31'})-[:HAS_INDICATOR]->(i2:CitizenIndicators {year: 2025})
RETURN p1.name, i1.unemployment_rate, p2.name, i2.unemployment_rate

// Find provinces needing healthcare investment
MATCH (p:Province)-[:HAS_INDICATOR]->(i:CitizenIndicators {year: 2025})
MATCH (p)-[:HAS_HOSPITAL]->(h:Hospital)
WITH p, i, count(h) AS hospital_count
WHERE i.beds_per_1000 < 1.5 AND hospital_count < 3
RETURN p.name, i.beds_per_1000, hospital_count
ORDER BY i.beds_per_1000 ASC
```

## 3. PostgreSQL Warehouse Schema

### 3.1 Dimension Tables

```sql
CREATE TABLE dim_province (
    id UUID PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    name_ar VARCHAR(200),
    name_fr VARCHAR(200),
    country_code VARCHAR(3) NOT NULL,
    capital_city VARCHAR(200),
    population INTEGER,
    area_km2 DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE dim_time (
    date_key DATE PRIMARY KEY,
    year INTEGER NOT NULL,
    quarter INTEGER NOT NULL,
    month INTEGER NOT NULL,
    day INTEGER NOT NULL,
    is_holiday BOOLEAN DEFAULT FALSE,
    fiscal_year INTEGER
);

CREATE TABLE dim_indicator (
    id UUID PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    name_ar VARCHAR(200),
    name_fr VARCHAR(200),
    category VARCHAR(100) NOT NULL,
    unit VARCHAR(50),
    higher_is_better BOOLEAN,
    data_type VARCHAR(50),
    source VARCHAR(200)
);

CREATE TABLE dim_source (
    id UUID PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(200) NOT NULL,
    provider VARCHAR(200),
    update_frequency VARCHAR(50),
    reliability_score DECIMAL(3,2)
);
```

### 3.2 Fact Tables

```sql
CREATE TABLE fact_province_indicators (
    id BIGSERIAL,
    province_id UUID REFERENCES dim_province(id),
    indicator_id UUID REFERENCES dim_indicator(id),
    time_id DATE REFERENCES dim_time(date_key),
    value DECIMAL(20,4),
    source_id UUID REFERENCES dim_source(id),
    confidence DECIMAL(3,2),
    quality_score DECIMAL(3,2),
    data_version INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (province_id, indicator_id, time_id, source_id, data_version)
) PARTITION BY RANGE (time_id);

CREATE TABLE fact_project_progress (
    id BIGSERIAL,
    project_id UUID,
    province_id UUID REFERENCES dim_province(id),
    time_id DATE REFERENCES dim_time(date_key),
    progress_pct DECIMAL(5,2),
    spent_amount DECIMAL(18,2),
    budget_amount DECIMAL(18,2),
    delay_days INTEGER,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
) PARTITION BY RANGE (time_id);

CREATE TABLE fact_decision_outcomes (
    id BIGSERIAL,
    decision_id UUID,
    user_id UUID,
    decision_type VARCHAR(100),
    province_id UUID REFERENCES dim_province(id),
    accepted BOOLEAN,
    confidence DECIMAL(3,2),
    processing_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.3 Materialized Views

```sql
CREATE MATERIALIZED VIEW mv_province_composite_scores AS
SELECT
    p.code,
    p.name,
    CURRENT_DATE as computed_at,
    -- Dimension scores computed from fact table
    AVG(CASE WHEN i.category = 'health' THEN f.value * i.weight END) AS health_score,
    AVG(CASE WHEN i.category = 'education' THEN f.value * i.weight END) AS education_score,
    AVG(CASE WHEN i.category = 'economy' THEN f.value * i.weight END) AS economy_score,
    -- ... additional dimensions
    AVG(f.value * i.weight) AS composite_score
FROM dim_province p
JOIN fact_province_indicators f ON p.id = f.province_id
JOIN dim_indicator i ON f.indicator_id = i.id
WHERE f.time_id >= CURRENT_DATE - INTERVAL '1 year'
GROUP BY p.code, p.name;
```

### 3.4 Citus Distribution

```sql
-- Distribute fact tables across worker nodes
SELECT create_distributed_table('fact_province_indicators', 'province_id');
SELECT create_distributed_table('fact_project_progress', 'province_id');

-- Colocate related tables
SELECT create_reference_table('dim_indicator');
SELECT create_reference_table('dim_source');
```

## 4. ClickHouse Time-Series Schema

```sql
CREATE TABLE indicator_time_series (
    province_code String,
    indicator_code String,
    timestamp DateTime,
    value Float64,
    source String,
    quality Float32
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (province_code, indicator_code, timestamp);

-- Aggregating materialized view for hourly averages
CREATE MATERIALIZED VIEW indicator_hourly_mv
ENGINE = AggregatingMergeTree()
PARTITION BY toYYYYMM(hour)
ORDER BY (province_code, indicator_code, hour)
AS SELECT
    province_code,
    indicator_code,
    toStartOfHour(timestamp) AS hour,
    avgState(value) AS avg_value,
    minState(value) AS min_value,
    maxState(value) AS max_value,
    countState(value) AS sample_count
FROM indicator_time_series
GROUP BY province_code, indicator_code, hour;
```

## 5. Qdrant Vector Store Schema

```python
# Collection: knowledge_embeddings
{
    "collection_name": "knowledge_embeddings",
    "vectors": {
        "size": 1024,  # multilingual-e5-large
        "distance": "Cosine"
    },
    "payload_schema": {
        "entity_id": "keyword",
        "entity_type": "keyword",
        "entity_name": "text",
        "entity_name_ar": "text",
        "entity_name_fr": "text",
        "province_code": "keyword",
        "sector": "keyword",
        "language": "keyword",
        "source": "keyword",
        "timestamp": "datetime",
        "chunk_index": "integer"
    }
}

# Collection: query_cache
{
    "collection_name": "query_cache",
    "vectors": {
        "size": 1024,
        "distance": "Cosine"
    },
    "payload_schema": {
        "query": "text",
        "response": "text",
        "language": "keyword",
        "timestamp": "datetime",
        "hits": "integer"
    }
}
```

## 6. Redis Cache Schema

```
# Session
session:{user_id} → { token, roles, permissions, expires }
TTL: 15 minutes

# Hot entity cache
entity:{type}:{id} → { JSON entity data }
TTL: 5 minutes

# Query result cache
search:{query_hash} → { JSON results }
TTL: 1 hour

# Score cache
scores:province:{code} → { JSON scores }
TTL: 1 hour

# Rate limiting
ratelimit:{user_id}:{endpoint} → { count, window_start }
TTL: sliding window

# Leaderboard
leaderboard:{dimension} → SortedSet(province_code → score)
TTL: 1 hour
```

## 7. Data Lake (Delta Lake) Schema

```
s3://monadhama-data/
└── gold/
    └── fact_indicators/
        ├── _delta_log/
        ├── year=2025/
        │   ├── month=01/
        │   │   └── part-00001.snappy.parquet
        │   └── month=02/
        └── year=2026/
```

Delta table schema for gold layer:

```sql
CREATE TABLE gold.fact_indicators (
    province_code STRING,
    indicator_code STRING,
    value DOUBLE,
    source STRING,
    quality_score DOUBLE,
    ingestion_timestamp TIMESTAMP,
    batch_id STRING
)
USING DELTA
PARTITIONED BY (year INT, month INT)
LOCATION 's3://monadhama-data/gold/fact_indicators';
```

## 8. Backup & Recovery

| Database | Backup Strategy | RPO | RTO |
|---|---|---|---|
| Neo4j | Daily full + CDC to object store | 1 hour | 4 hours |
| PostgreSQL | WAL streaming + daily pg_dump | 5 minutes | 1 hour |
| ClickHouse | Incremental backups to S3 | 1 hour | 2 hours |
| Qdrant | Snapshot to S3 | 1 hour | 1 hour |
| Redis | AOF persistence + RDB snapshots | 1 minute | 10 minutes |
| Delta Lake | Time travel (30 day history) | 0 (immutable) | Minutes |

## 9. Migration Strategy

- **Schema migrations:** Alembic (PostgreSQL), Liquibase (Neo4j)
- **Data migrations:** Apache Spark jobs for large-scale transforms
- **Backward compatibility:** Old schema versions served during migration window
- **Rollback:** Automated rollback plan with data validation

---

**Document Owner:** Data Engineering Team
**Last Updated:** 2026-06-29
