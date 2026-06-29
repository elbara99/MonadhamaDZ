# Province Intelligence Engine

**Doc ID:** PIE-001
**Version:** 2.0
**Status:** Architecture Specification
**Classification:** Confidential

---

## 1. Executive Overview

The Province Intelligence Engine (PIE) is the core reasoning and analysis layer of Monadhama. It transforms raw government data into actionable province intelligence — scores, insights, risks, opportunities, recommendations, and executive summaries — for every Algerian wilaya.

PIE is designed as an **ontology-driven intelligence platform** in the tradition of Palantir Foundry, SIGMA, and government C4ISR systems. It does not replace the AI Engine or Data Engine — it sits **between** them, providing structured, explainable, and auditable intelligence products.

### 1.1 Design Principles

| Principle | Rationale |
|---|---|
| **Ontology-first** | Every insight traces to a modelled entity, indicator, or relationship |
| **Explainability by default** | No score or recommendation appears without a chain of evidence |
| **Independence from AI** | All core scores use deterministic, transparent models — LLMs augment, never replace |
| **Future-proof data contracts** | Source data can be swapped from mock to real without changing the engine |
| **Configurable sovereignty** | Weights, thresholds, and priorities are government-configurable, never hardcoded |
| **Audit traceability** | Every intelligence product carries a provenance record to its source data |
| **Evidence-grounded** | No intelligence output exists without traceable evidence from source indicators |

### 1.2 Position in the Architecture

```
Presentation Layer (React SPA)
        ↕ API Gateway
Application Layer
  ├── Decision Engine
  ├── AI Engine (LLM + RAG)
  ├── Search Engine
  ├── Report Engine
  └── REPORT ENGINE ─── reads from ───┐
                                       ↓
                          ┌──────────────────────────┐
                          │ PROVINCE INTELLIGENCE    │
                          │ ENGINE (PIE)             │
                          │                           │
                          │  • Executive Summary Gen  │
                          │  • Scoring Engine          │
                          │  • Insights Engine         │
                          │  • Risk Engine             │
                          │  • Opportunity Engine       │
                          │  • Recommendation Engine   │
                          │  • Evidence Engine         │
                          │  • Similarity Engine       │
                          │  • Timeline Engine         │
                          │  • Explainability Engine   │
                          └──────────┬────────────────┘
                                     ↓
Knowledge Layer (Neo4j Graph + Vector Store)
        ↕
Data Layer (Delta Lake + Kafka + Spark)
        ↕
Government Data Sources
```

---

## 2. Data Flow Architecture

### 2.1 End-to-End Intelligence Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          INGESTION PHASE                                              │
│                                                                                       │
│  [Ministry CSVs] ──→ [Kafka Ingestion] ──→ [Quality Gate] ──→ [Bronze Lake]          │
│  [API Polling]   ──→ [Airflow Pipeline] ──→ [Quality Gate] ──→ [Bronze Lake]          │
│  [CDC Stream]    ──→ [Debezium → Kafka] ──→ [Quality Gate] ──→ [Bronze Lake]          │
│                                                                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                          TRANSFORMATION PHASE                                         │
│                                                                                       │
│  [Bronze Lake] ──→ [Spark ETL] ──→ [Silver Lake] ──→ [Spark ETL] ──→ [Gold Lake]     │
│                                           ↓                                           │
│                                    [Knowledge Graph] ←── [Entity Resolution]          │
│                                                                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                          INTELLIGENCE PHASE (PIE)                                     │
│                                                                                       │
│  [Gold Lake] ──→ [Feature Computation] ──→ [Dimension Scoring] ──→ [Composite Score] │
│       ↓                          ↓                    ↓                               │
│  [Trend Detection]         [Anomaly Detection]   [Peer Grouping]                       │
│       ↓                          ↓                    ↓                               │
│  [Insight Generator] ───→ [Risk Detector] ────→ [Opportunity Engine]                  │
│       ↓                          ↓                    ↓                               │
│  [Executive Summary Gen.] ←── [Recommendation Engine]                                  │
│       ↓                          ↓                    ↓                               │
│  [Evidence Engine] ──────→ [Explainability Layer] ←── (wraps every output)            │
│       ↓                                                                                │
│  [Timeline Service] ←─── (indexes all events)                                          │
│                                                                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                          SERVING PHASE                                                 │
│                                                                                       │
│  [PIE Output Store] ──→ [Cache Layer (Redis)] ──→ [REST API] ──→ [Presentation]      │
│  [PIE Event Bus]    ──→ [Kafka] ──→ [AI Engine] ──→ [LLM-Augmented Products]          │
│  [PIE Graph Sync]   ──→ [Neo4j] ──→ [Knowledge Graph Updates]                         │
│                                                                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Event Schema for PIE Topics

| Kafka Topic | Publisher | Consumers | Payload |
|---|---|---|---|
| `pie.score.updated` | Scoring Engine | AI Engine, Presentation, Search | `{ province_id, dimension, score, trend, confidence, timestamp }` |
| `pie.insight.generated` | Insight Engine | AI Engine, Notification, Timeline | `{ province_id, insight_id, type, severity, evidence, timestamp }` |
| `pie.risk.detected` | Risk Engine | Decision Engine, Alert System | `{ province_id, risk_id, severity, confidence, indicators, timestamp }` |
| `pie.opportunity.identified` | Opportunity Engine | Decision Engine, Report Engine | `{ province_id, opportunity_id, potential, confidence, timestamp }` |
| `pie.recommendation.ready` | Recommendation Engine | Presentation, Notification | `{ province_id, rec_id, priority, evidence_hash, timestamp }` |
| `pie.timeline.event` | Timeline Engine | Presentation, Report Engine | `{ province_id, event_type, description, date, confidence, timestamp }` |
| `pie.similarity.updated` | Similarity Engine | Search, Comparison | `{ province_id, peers: [{id, similarity_score, factors}], timestamp }` |
| `pie.explainability.ready` | Explainability Engine | All downstream | `{ intelligence_id, type, chain_of_evidence, data_lineage }` |
| `pie.summary.generated` | Executive Summary Gen | Presentation, AI Engine, Notification | `{ province_id, overall_score, classification, confidence, timestamp }` |
| `pie.evidence.registered` | Evidence Engine | All services | `{ evidence_id, intelligence_id, source_hashes, validation_status }` |
| `pie.evolution.updated` | Timeline Engine | Presentation, Report Engine | `{ province_id, window, trajectory, improvement_rate, regression_rate }` |
| `pie.cross_province.updated` | Similarity Engine | Presentation, Search | `{ province_id, peers: [...], competitors: [...], outliers: [...] }` |

### 2.3 Intelligence Product Lifecycle

Every intelligence product (score, insight, risk, recommendation, summary) follows this lifecycle:

```
DRAFT → VALIDATED → PUBLISHED → STALE → ARCHIVED

DRAFT:      Initial computation, not yet quality-checked
VALIDATED:  Passed automated consistency, confidence, and evidence checks
PUBLISHED:  Visible to end users via API
STALE:      Source data has changed; recomputation pending
ARCHIVED:   Superseded by newer version; kept for audit trail

EVIDENCE_PENDING:  Output generated but evidence chain incomplete (not publishable)
EVIDENCE_FAILED:   Evidence references could not be resolved (requires human review)
```

---

## 3. Internal Architecture

### 3.1 Service Map

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│                          PROVINCE INTELLIGENCE ENGINE                                │
│                                                                                      │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │   FEATURE SERVICE   │  │   SCORING ENGINE    │  │     TREND ENGINE            │  │
│  │                     │  │                     │  │                              │  │
│  │ • Indicator Compute  │  │ • Normalization     │  │ • Mann-Kendall test         │  │
│  │ • Derived Metrics    │  │ • Dimension Scores   │  │ • Theil-Sen slope          │  │
│  │ • Aggregation Engine │  │ • Province Intel.    │  │ • Change point detection   │  │
│  │ • Missing Data Handler│  │   Score (PIS)       │  │ • EWMA streaming           │  │
│  └──────────┬──────────┘  │ • Confidence-adjusted │  └──────────────┬──────────────┘  │
│             ↓             └──────────┬──────────┘                 ↓                 │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │   SIMILARITY ENGINE │  │   INSIGHT ENGINE    │  │  EXECUTIVE SUMMARY GEN.     │  │
│  │                     │  │                     │  │                              │  │
│  │ • Similar provinces  │  │ • Rule-based rules   │  │ • Overall Assessment        │  │
│  │ • Competing provinces│  │ • Anomaly detector   │  │ • Strengths & Challenges    │  │
│  │ • Emerging/Declining │  │ • Indicator corr.    │  │ • Priority Sectors          │  │
│  │ • Outlier detection  │  │ • Explanation gen.   │  │ • Recent Changes            │  │
│  └──────────┬──────────┘  └──────────┬──────────┘  └──────────────┬──────────────┘  │
│             ↓                        ↓                             ↓                 │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │   RISK ENGINE       │  │ OPPORTUNITY ENGINE  │  │   RECOMMENDATION ENGINE     │  │
│  │                     │  │                     │  │                              │  │
│  │ • 10 risk categories │  │ • 10 opportunity cat.│  │ • Priority ranking          │  │
│  │ • Severity scoring   │  │ • Potential scoring  │  │ • Impact estimation         │  │
│  │ • Trend analysis     │  │ • Gap analysis       │  │ • Evidence assembly         │  │
│  │ • Evidence linking   │  │ • Benchmark compare  │  │ • Confidence calibration    │  │
│  └──────────┬──────────┘  └──────────┬──────────┘  └──────────────┬──────────────┘  │
│             ↓                        ↓                             ↓                 │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │   TIMELINE ENGINE   │  │  EVIDENCE ENGINE    │  │   EXPLAINABILITY ENGINE    │  │
│  │                     │  │                     │  │                              │  │
│  │ • Event extraction   │  │ • Evidence registry  │  │ • L1: Executive Summary     │  │
│  │ • Health Evolution   │  │ • Source verification│  │ • L2: Human Explanation     │  │
│  │ • 30d/90d/1yr/5yr    │  │ • Validation pipeline│  │ • L3: Indicator Breakdown   │  │
│  │ • Trajectory analysis│  │ • Audit linkage      │  │ • L4: Raw Evidence Lineage  │  │
│  └──────────┬──────────┘  └──────────┬──────────┘  └──────────────┬──────────────┘  │
│             ↓                        ↓                             ↓                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐   │
│  │                       ONTOLOGY & CONFIG SERVICE                               │   │
│  │                                                                              │   │
│  │  Manages: dimension definitions, indicator catalogs, weight configs,         │   │
│  │  threshold policies, peer group definitions, source reliability registry,    │   │
│  │  evidence validation rules, intelligence product lifecycles                  │   │
│  └────────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Service Descriptions

#### Feature Service

**Purpose:** Compute every raw and derived indicator for each province from the Gold layer.

**Inputs:**
- Gold layer fact tables (Delta Lake)
- Knowledge graph entity counts and attributes
- Time-series indicator data

**Computation types:**

| Type | Examples | Method |
|---|---|---|
| Direct aggregation | Population, area, bed count | SQL aggregation per province |
| Ratio computation | Beds per 1,000, student-teacher ratio | Division of two aggregated values |
| Index computation | Economic diversity index, infrastructure quality index | Composite of sub-indicators |
| Spatial computation | Average distance to nearest hospital, road density | GIS operations on geospatial data |
| Temporal aggregation | Quarterly average, YoY change, rolling 12-month | Window functions over time series |
| Derived indicators | GDP per capita growth rate, dependency ratio change | Arithmetic on existing indicators |

**Output:**
```json
{
  "province_id": "DZ-16",
  "timestamp": "2026-06-29T14:30:00Z",
  "indicators": {
    "population": { "value": 2988145, "unit": "persons", "source": "ONS-2025", "freshness": "2025-Q4" },
    "beds_per_1000": { "value": 2.1, "unit": "ratio", "source": "MOH-2025", "freshness": "2025-Q3" },
    "unemployment_rate": { "value": 8.5, "unit": "percent", "source": "ONS-2025", "freshness": "2025-Q4" },
    "literacy_rate": { "value": 92.3, "unit": "percent", "source": "MOE-2025", "freshness": "2025-Q2" },
    "gdp_per_capita": { "value": 4250000, "unit": "DZD", "source": "MOF-2025", "freshness": "2025-Q4" },
    "water_access_pct": { "value": 89.5, "unit": "percent", "source": "MOW-2025", "freshness": "2025-Q3" },
    "internet_access_pct": { "value": 78.2, "unit": "percent", "source": "MOT-2025", "freshness": "2025-Q4" }
  }
}
```

#### Scoring Engine

**Purpose:** Compute normalized 0–100 scores for each of the 12 dimensions, the composite score, and the unified Province Intelligence Score.

**Methodology:** (See `priority_scoring.md` sections 3–4 for the full formula, indicator catalog, and weight configuration)

**Extended scoring features:**

| Feature | Description |
|---|---|
| **Benefit/Cost normalization** | Indicators automatically classified as higher-better or lower-better |
| **Z-score handling** | Outlier-sensitive indicators use z-score normalization |
| **Recency weighting** | Older data penalized via recency factor α (0.50–1.00) |
| **Reliability weighting** | Lower-quality sources penalized via reliability factor β (0.40–1.00) |
| **Missing data rules** | See section 5.1 |
| **Confidence interval** | Every score includes a 95% confidence interval based on source quality and completeness |
| **Score components** | Each score breaks down into: indicator contributions, data freshness badge, completeness percentage |

**12 Dimension Scores:** Health, Education, Economy, Employment, Investment, Infrastructure, Security, Environment, Transportation, Water, Agriculture, Tourism — each computed as per `priority_scoring.md`.

**Province Intelligence Score (PIS):**

A unified 0–100 score that synthesizes all 12 dimension scores into a single intelligence metric.

**Calculation formula:**
```
PIS = Σ(w_i × D_i) × C_f × T_f × M_f

Where:
- w_i = configurable weight for dimension i (default: see Section 8.1)
- D_i = normalized score (0–100) for dimension i
- C_f = Confidence Factor (0.70–1.00)
- T_f = Trend Momentum Factor (0.90–1.10)
- M_f = Missing Data Penalty (0.50–1.00)
```

**Confidence effect on PIS:**
```
C_f = 1.00 - (1.00 - Avg_Confidence) × 0.50

When Avg_Confidence = 0.95 → C_f = 0.975  (minimal penalty)
When Avg_Confidence = 0.70 → C_f = 0.850  (moderate penalty)
When Avg_Confidence = 0.40 → C_f = 0.700  (severe penalty)
```

Lower confidence regresses the PIS toward the national mean, preventing over-interpretation of unreliable data.

**Trend momentum effect:**
```
T_f = 1.00 + (Net_Improving_Dimensions - Net_Declining_Dimensions) × 0.01

Where:
- Net_Improving = count of dimensions with "improving" trend
- Net_Declining = count of dimensions with "declining" trend

Range: 0.90 (widespread decline) to 1.10 (widespread improvement)
```

**Missing data penalty:**
```
M_f = 1.00 - (Missing_Indicator_Count / Total_Expected_Indicators) × 0.50

When 0% missing → M_f = 1.00
When 20% missing → M_f = 0.90
When 50% missing → M_f = 0.75
When 80% missing → M_f = 0.60
When 100% missing → M_f = 0.50 (PIS not computed, returns null)
```

**PIS classification:**
| Range | Classification |
|---|---|
| 85–100 | Leading |
| 70–84 | Strong |
| 50–69 | Developing |
| 30–49 | Emerging |
| 0–29 | Critical |
| null | Insufficient Data |

**Score change tracking:**

```json
{
  "dimension": "health",
  "current_score": 71.2,
  "previous_score": 68.5,
  "change": 2.7,
  "change_pct": 3.9,
  "trend": "improving",
  "trend_confidence": 0.87,
  "drivers": [
    { "indicator": "beds_per_1000", "contribution": 1.8 },
    { "indicator": "infant_mortality", "contribution": -0.5 }
  ]
}
```

**Province Intelligence Score output:**

```json
{
  "province_id": "DZ-16",
  "pis": 68.5,
  "pis_classification": "developing",
  "pis_confidence": 0.84,
  "pis_confidence_interval": [62.3, 74.7],
  "pis_trend": "improving",
  "pis_components": {
    "weighted_dimension_sum": 71.8,
    "confidence_factor": 0.95,
    "trend_momentum_factor": 1.04,
    "missing_data_penalty": 0.97,
    "indicators_used": 47,
    "indicators_total": 58,
    "completeness_pct": 81.0
  },
  "dimension_breakdown": {
    "health": { "score": 71.2, "weight": 0.10, "contribution": 7.12 },
    "education": { "score": 68.9, "weight": 0.10, "contribution": 6.89 },
    "economy": { "score": 74.5, "weight": 0.12, "contribution": 8.94 },
    "employment": { "score": 45.3, "weight": 0.10, "contribution": 4.53 },
    "investment": { "score": 62.1, "weight": 0.08, "contribution": 4.97 },
    "infrastructure": { "score": 74.8, "weight": 0.10, "contribution": 7.48 },
    "security": { "score": 82.0, "weight": 0.06, "contribution": 4.92 },
    "environment": { "score": 38.7, "weight": 0.08, "contribution": 3.10 },
    "transportation": { "score": 65.4, "weight": 0.08, "contribution": 5.23 },
    "water": { "score": 70.2, "weight": 0.08, "contribution": 5.62 },
    "agriculture": { "score": 44.8, "weight": 0.06, "contribution": 2.69 },
    "tourism": { "score": 52.1, "weight": 0.04, "contribution": 2.08 }
  },
  "last_updated": "2026-06-29T14:30:00Z",
  "evidence_id": "ev-dz-16-pis-20260629-001"
}
```

#### Trend Engine

**Purpose:** Detect statistically significant trends in every indicator and dimension score.

**Methods:**

| Method | Use Case | Sensitivity |
|---|---|---|
| Mann-Kendall test | Primary trend detection for all indicators | Configurable p-value threshold |
| Theil-Sen slope estimator | Robust trend magnitude (outlier-resistant) | Alternative to linear regression |
| Seasonal decomposition (STL) | Monthly/quarterly indicators with seasonality | Automatic period detection |
| Change point detection (PELT) | Identifying structural breaks (e.g., policy change) | Configurable penalty |
| EWMA (Exponential Weighted Moving Average) | Real-time trend detection for streaming data | Smoothing factor configurable |

**Trend classifications:**
```json
{
  "direction": "improving" | "declining" | "stable" | "volatile",
  "magnitude": "critical" | "significant" | "moderate" | "negligible",
  "statistical_significance": 0.95,
  "change_points": [
    { "date": "2025-01-01", "type": "structural_break", "likely_cause": "New healthcare policy enacted" }
  ]
}
```

#### Insight Engine

**Purpose:** Generate explainable, evidence-based insights about every province.

**Insight types:**

| Type | Description | Triggers |
|---|---|---|
| `trend` | Notable change in a dimension or indicator | Trend significance > threshold |
| `anomaly` | Unexpected value deviating from historical pattern | Z-score > 2.5 or < -2.5 |
| `correlation` | Two indicators moving together | Pearson correlation > 0.7 or < -0.7 |
| `comparison` | Province performing differently from peers | > 1 SD from peer group mean |
| `threshold_breach` | Indicator crossing a critical threshold | Value crosses configured red line |
| `emerging_pattern` | New pattern detected across multiple indicators | ML anomaly detection signal |

**Insight generation pipeline:**
```
[Feature Values] + [Trends] + [Peer Groups]
        ↓
[Rule Engine] — applies 200+ configurable insight rules
        ↓
[Anomaly Detector] — Isolation Forest / Z-score on residuals
        ↓
[Correlation Analyzer] — pairwise indicator correlation over time
        ↓
[Ranking & Deduplication] — relevance score, remove duplicates
        ↓
[Explanation Generator] — assembles natural-language explanation with evidence
        ↓
[Evidence Registration] — each insight registered with Evidence Engine
```

**Insight output:**

```json
{
  "id": "ins-dz-16-2026-002",
  "province_id": "DZ-16",
  "type": "trend",
  "title": {
    "ar": "تحسن ملحوظ في مؤشرات الصحة بالجزائر العاصمة",
    "en": "Significant improvement in Algiers health indicators",
    "fr": "Amélioration significative des indicateurs de santé à Alger"
  },
  "summary": {
    "ar": "ارتفعت نتيجة الصحة في الجزائر العاصمة بنسبة 3.9% خلال العام الماضي، مدفوعة بزيادة عدد الأطباء لكل 1,000 نسمة وانخفاض معدل وفيات الرضع.",
    "en": "Algiers health score improved 3.9% over the past year, driven by increased doctors per 1,000 residents and reduced infant mortality.",
    "fr": "Le score de santé d'Alger s'est amélioré de 3,9% au cours de l'année écoulée, grâce à l'augmentation du nombre de médecins pour 1 000 habitants et à la réduction de la mortalité infantile."
  },
  "severity": "positive",
  "confidence": 0.92,
  "supporting_indicators": [
    {
      "name": "doctors_per_1000",
      "current_value": 3.2,
      "previous_value": 2.8,
      "change_pct": 14.3,
      "trend": "improving",
      "contribution_pct": 42
    },
    {
      "name": "infant_mortality",
      "current_value": 12.4,
      "previous_value": 14.1,
      "change_pct": -12.1,
      "trend": "improving",
      "contribution_pct": 31
    }
  ],
  "generated_at": "2026-06-29T14:30:00Z",
  "data_freshness": "2025-Q4",
  "source_count": 3,
  "evidence_ids": ["ev-dz-16-ins-20260629-001", "ev-dz-16-ins-20260629-002"]
}
```

#### Executive Summary Generator

**Purpose:** Synthesize all PIE intelligence products into a concise, actionable executive summary for each province — the single source of truth for decision makers.

**Position in pipeline:** Consumes outputs from Scoring Engine, Insight Engine, Risk Engine, Opportunity Engine, Recommendation Engine, Timeline Engine, and Similarity Engine. Produces the unified province profile served to the frontend.

**Inputs:**
- All 12 dimension scores and the Province Intelligence Score
- Active insights (top 10 by severity/confidence)
- Active risks (top 5 by severity)
- Active opportunities (top 5 by potential)
- Pending recommendations (top 5 by priority)
- Recent timeline events (last 20)
- Peer group and cross-province intelligence
- Province metadata (population, area, administrative classification, cluster membership)

**Generation methodology per field:**

| Field | Method | Logic |
|---|---|---|
| Overall Assessment | Algorithmic classification | `PIS × 0.4 + (1 - ActiveRiskCount/10) × 30 + TrendMomentum × 30` → classified as Leading (≥85), Strong (70–84), Developing (50–69), Emerging (30–49), Critical (<30) |
| Executive Summary | Template-driven synthesis | Selects 2–3 sentence templates based on: top positive driver, top negative driver, overall trajectory, data quality. Fills with specific values from each engine. |
| Major Strengths | Rank-based selection | Top 3 dimensions where `score > national_average + 5 AND trend ∈ [improving, stable]`. Includes score, national rank, trend, and top contributing indicators. |
| Major Challenges | Rank-based selection | Bottom 3 dimensions where `score < national_average - 5 OR trend ∈ [declining, volatile]`. Includes score, gap to national average, trend, and root indicators. |
| Priority Sectors | Opportunity × Gap cross-ranking | Ranks sectors by `Opportunity_Potential × (1 - Current_Dimension_Score/100)`. Top 3 become priority sectors. Includes opportunity score, current baseline, and recommended action type. |
| Recent Changes | Event filtering and ranking | Filters timeline for last 365 days. Selects top 5 by `|score_change| × confidence`. Includes date, type, dimension, magnitude, and driver summary. |
| Opportunities | Filtered ranking from Opportunity Engine | Top 3 where `Potential > 60 AND Feasibility > 50 AND Confidence > 0.65`. Includes potential score, confidence, and required enabling conditions. |
| Risks | Filtered ranking from Risk Engine | Top 3 where `Severity > 60 AND Confidence > 0.70`. Includes severity score, trend direction (escalating/stable/mitigating), and linked indicators. |
| Confidence | Multi-layer weighted average | `0.40 × Avg(Score Confidences) + 0.25 × Avg(Risk Confidences) + 0.20 × Avg(Opportunity Confidences) + 0.15 × Data_Completeness` → High (≥0.85), Medium (≥0.65), Low (<0.65) |
| Data Freshness | Minimum recency across sources | `MIN(last_update_timestamp)` across all contributing indicators → classified as: Today, This Week, This Month, This Quarter, This Year, >1 Year |
| Source Count | Distinct source registry query | `COUNT(DISTINCT source_id)` across all indicators referenced in the summary. Includes breakdown by source type (ministry, international org, survey). |

**Output schema:**

```json
{
  "province_id": "DZ-16",
  "province_name": "Algiers",
  "generated_at": "2026-06-29T14:30:00Z",
  "valid_until": "2026-06-30T14:30:00Z",
  "pis": 68.5,
  "pis_classification": "developing",
  "pis_trend": "improving",
  "overall_assessment": {
    "label": { "ar": "مستقر", "en": "Stable", "fr": "Stable" },
    "score": 68.5,
    "classification": "developing",
    "trend": "improving"
  },
  "executive_summary": {
    "ar": "الجزائر العاصمة في وضع مستقر مع تحسن ملحوظ في قطاعي الصحة والبنية التحتية. يمثل ارتفاع البطالة بين الشباب التحدي الأكبر. تتوفر فرص استثمارية في السياحة والطاقة المتجددة. درجة ثقة البيانات: عالية.",
    "en": "Algiers is in a stable position with notable improvement in health and infrastructure. Rising youth unemployment is the primary challenge. Investment opportunities exist in tourism and renewable energy. Data confidence: High.",
    "fr": "Alger est dans une position stable avec une amélioration notable de la santé et des infrastructures. La hausse du chômage des jeunes constitue le principal défi. Des opportunités d'investissement existent dans le tourisme et les énergies renouvelables. Confiance des données : Élevée."
  },
  "major_strengths": [
    {
      "dimension": "health",
      "score": 71.2,
      "national_rank": 3,
      "trend": "improving",
      "key_factors": ["doctor_density", "infant_mortality_reduction"]
    },
    {
      "dimension": "infrastructure",
      "score": 74.8,
      "national_rank": 2,
      "trend": "improving",
      "key_factors": ["internet_coverage", "electricity_reliability"]
    }
  ],
  "major_challenges": [
    {
      "dimension": "employment",
      "score": 45.3,
      "gap_to_national": -8.2,
      "trend": "declining",
      "root_indicators": ["youth_unemployment_25.4%", "informal_employment_38%"]
    },
    {
      "dimension": "environment",
      "score": 38.7,
      "gap_to_national": -12.4,
      "trend": "declining",
      "root_indicators": ["air_quality_index_165", "waste_recycling_rate_12%"]
    }
  ],
  "priority_sectors": [
    {
      "sector": "renewable_energy",
      "opportunity_score": 82,
      "current_dimension_score": 38.7,
      "gap_to_target": 43.3,
      "recommended_focus": "strategic_investment",
      "key_enablers": ["High solar irradiance", "Available land", "Government incentives"]
    },
    {
      "sector": "tourism",
      "opportunity_score": 76,
      "current_dimension_score": 52.1,
      "gap_to_target": 23.9,
      "recommended_focus": "policy_reform",
      "key_enablers": ["UNESCO heritage sites", "Coastline", "Airport connectivity"]
    }
  ],
  "recent_changes": [
    {
      "date": "2026-06-15",
      "type": "improvement",
      "dimension": "health",
      "magnitude": 3.9,
      "description": {
        "ar": "تحسن نتيجة الصحة بمقدار 3.9 نقاط",
        "en": "Health score improved by 3.9 points",
        "fr": "Le score de santé s'est amélioré de 3,9 points"
      },
      "drivers": ["doctors_per_1000: +14.3%", "infant_mortality: -12.1%"]
    }
  ],
  "opportunities": [
    {
      "id": "opp-dz-16-2026-003",
      "name": "renewable_energy",
      "potential": 82,
      "confidence": 0.79,
      "enabling_factors": ["High solar irradiance", "Available land", "Government incentives"]
    }
  ],
  "risks": [
    {
      "id": "risk-dz-16-2026-002",
      "category": "unemployment_risk",
      "severity": 78,
      "confidence": 0.88,
      "trend": "escalating"
    }
  ],
  "metadata": {
    "confidence": 0.84,
    "confidence_label": "high",
    "data_freshness": "2025-Q4",
    "freshness_classification": "this_quarter",
    "source_count": 12,
    "source_breakdown": {
      "ministry_sources": 8,
      "international_sources": 3,
      "survey_sources": 1
    },
    "indicators_used": 47,
    "indicators_total": 58,
    "completeness_pct": 81.0,
    "evidence_ids": ["ev-dz-16-exec-20260629-001"]
  }
}
```

#### Risk Engine

**Purpose:** Detect, classify, and track emerging risks for each province.

**Risk categories:**

| Risk Category | Example Indicators Monitored | Threshold |
|---|---|---|
| `healthcare_capacity` | Bed occupancy, doctor shortage, ICU availability | Occupancy > 85% |
| `water_stress` | Dam levels, groundwater depletion, rainfall deviation | Dam < 40% capacity |
| `unemployment_risk` | Youth unemployment, informal employment, job loss rate | Youth unemployment > 30% |
| `infrastructure_pressure` | Road condition, electricity outages, internet downtime | Condition index < 50 |
| `environmental_degradation` | Air quality, deforestation, waste accumulation | AQI > 150 |
| `economic_decline` | GDP contraction, investment drop, inflation spike | GDP growth < 1% |
| `food_insecurity` | Agricultural output, water for irrigation, grain reserves | Output drop > 15% |
| `social_unrest` | Crime rate, protest frequency, income inequality | Gini > 0.45 |
| `education_gap` | Enrollment decline, dropout rate, teacher shortage | Dropout > 10% |
| `natural_disaster` | Seismic activity, flood risk, drought index | Exceeds historical 95th percentile |

**Risk scoring formula:**
```
Risk_Score = (Indicator_Severity × 0.4) + (Trend_Worsening × 0.3) + (Proximity_To_Threshold × 0.2) + (Historical_Frequency × 0.1)
```

**Risk output:**

```json
{
  "id": "risk-dz-11-2026-001",
  "province_id": "DZ-11",
  "category": "healthcare_capacity",
  "risk": {
    "ar": "خطر انهيار النظام الصحي — تجاوز طاقة الاستيعاب القصوى لوحدات العناية المركزة",
    "en": "Healthcare system collapse risk — ICU capacity exceeded",
    "fr": "Risque d'effondrement du système de santé — capacité de soins intensifs dépassée"
  },
  "severity": "critical",
  "severity_score": 91,
  "confidence": 0.88,
  "current_status": "Immediate attention required",
  "indicators": [
    {
      "name": "icu_occupancy_rate",
      "value": 98.0,
      "threshold": 85.0,
      "deviation_pct": 15.3
    },
    {
      "name": "beds_per_1000",
      "value": 0.8,
      "threshold": 1.5,
      "deviation_pct": -46.7
    }
  ],
  "trend": "worsening",
  "trend_confidence": 0.91,
  "first_detected": "2026-03-15T08:00:00Z",
  "last_updated": "2026-06-29T14:30:00Z",
  "evidence_sources": ["MOH-2025", "ONS-2025", "WHO-HAI-2025"],
  "evidence_ids": ["ev-dz-11-risk-20260629-001"],
  "recommended_actions": [
    {
      "action": "Emergency funding for ICU expansion",
      "estimated_impact": "Would reduce occupancy to 72% within 12 months",
      "confidence": 0.76
    }
  ]
}
```

#### Opportunity Engine

**Purpose:** Identify and score development opportunities for each province.

**Opportunity categories:**

| Opportunity | Detection Method | Key Signals |
|---|---|---|
| `tourism_potential` | Benchmark vs comparable provinces | Heritage sites, coastline, infrastructure gap |
| `agricultural_growth` | Soil quality + water access + climate data | Arable land utilization < 60%, water access improving |
| `industrial_investment` | Economic zone analysis + infrastructure | Transport access, energy availability, workforce |
| `renewable_energy` | Solar/wind potential + current adoption | Irradiance > threshold, current adoption < 10% |
| `technology_hub` | Education + connectivity + workforce | University density, internet penetration, youth % |
| `mineral_extraction` | Geological data + global demand | Known deposits, exploration licenses, infrastructure |
| `fisheries_aquaculture` | Coastline + current production | Coastline length, current output vs capacity |
| `logistics_center` | Geographic position + transport infrastructure | Transport hub potential, warehousing gap |
| `education_excellence` | University performance + research output | Rankings, publication count, industry partnerships |
| `healthcare_services` | Medical tourism potential | Cost advantage, quality gap, proximity to demand |

**Opportunity scoring:**
```
Opportunity_Potential = (Resource_Availability × 0.3) + (Market_Demand × 0.25) + (Infrastructure_Readiness × 0.2) + (Policy_Alignment × 0.15) + (Peer_Success_Signal × 0.1)
```

#### Recommendation Engine

**Purpose:** Generate evidence-based executive recommendations for decision makers.

**Design principles:**
- Recommendations are **proposals**, never presented as facts
- Every recommendation must include: reason, supporting evidence, confidence range, expected impact
- Recommendations are ranked by priority (combination of urgency × impact × confidence)
- Human decision makers always have the final say

**Recommendation types:**

| Type | Description | Priority Formula |
|---|---|---|
| `immediate_intervention` | Requires urgent executive action | `Risk_Severity × 0.6 + Time_Sensitivity × 0.4` |
| `strategic_investment` | Long-term development opportunity | `Opportunity_Potential × 0.5 + Economic_Impact × 0.3 + Feasibility × 0.2` |
| `policy_change` | Regulatory or administrative adjustment | `Gap_to_Benchmark × 0.4 + Implementation_Ease × 0.3 + Impact_Scope × 0.3` |
| `resource_reallocation` | Budget or personnel redistribution | `Efficiency_Gain × 0.5 + Urgency × 0.3 + Disruption_Risk × 0.2` |
| `data_collection` | Need for better data before action | `Data_Gap_Severity × 0.5 + Decision_Importance × 0.5` |

**Recommendation output:**

```json
{
  "id": "rec-dz-33-2026-001",
  "province_id": "DZ-33",
  "type": "immediate_intervention",
  "title": {
    "ar": "استثمار عاجل في البنية التحتية للطرق في إليزي",
    "en": "Urgent road infrastructure investment in Illizi",
    "fr": "Investissement urgent dans les infrastructures routières d'Illizi"
  },
  "reason": {
    "ar": "12% فقط من الطرق معبدة، و3 قرى غير قابلة للوصول خلال موسم الأمطار، مما يحد من الوصول إلى الخدمات الأساسية.",
    "en": "Only 12% of roads are paved; 3 villages inaccessible during rainy season, limiting access to essential services.",
    "fr": "Seulement 12% des routes sont goudronnées ; 3 villages inaccessibles en saison des pluies, limitant l'accès aux services essentiels."
  },
  "supporting_evidence": [
    {
      "indicator": "road_paved_pct",
      "value": 12.0,
      "national_average": 68.0,
      "gap": -56.0,
      "source": "MPW-2025",
      "evidence_id": "ev-dz-33-rec-001-ind-01"
    },
    {
      "indicator": "road_condition_index",
      "value": 28,
      "national_average": 62,
      "gap": -34,
      "source": "MPW-2025",
      "evidence_id": "ev-dz-33-rec-001-ind-02"
    }
  ],
  "confidence": {
    "overall": 0.79,
    "evidence_quality": 0.85,
    "data_completeness": 0.72,
    "historical_accuracy": 0.81
  },
  "expected_impact": {
    "improvement_in_score": "+15 to +25 points (infrastructure dimension)",
    "affected_population": "52,952 residents",
    "economic_benefit": "Improved market access, reduced transport costs",
    "timeline": "18–24 months for 50% completion"
  },
  "alternatives_considered": [
    {
      "option": "Mobile road maintenance units",
      "pros": "Lower initial cost",
      "cons": "Does not address unpaved roads",
      "dismissal_reason": "Insufficient scope"
    }
  ],
  "priority_score": 87,
  "generated_at": "2026-06-29T14:30:00Z",
  "expires_at": "2026-09-29T14:30:00Z",
  "evidence_ids": ["ev-dz-33-rec-20260629-001"]
}
```

#### Similarity Engine & Cross-Province Intelligence

**Purpose:** Automatically discover province relationships — similarity, competition, emergence, decline, and outlier patterns — and explain each classification.

**Methodology:**

```
Step 1: Normalize all 12 dimension scores to z-scores
Step 2: Compute weighted Euclidean distance between every province pair
         (weights match the dimension weights from Priority Scoring)
Step 3: For each province, rank all other provinces by distance
Step 4: Apply cross-province classification logic:
        - Similar: Top-N closest by multi-dimension distance (default 3)
        - Competing: Similar overall score but opposing trend directions ≥ 3 dimensions
        - Emerging: Bottom quartile PIS but improving trend in ≥ 5 dimensions
        - Declining: Top quartile PIS but declining trend in ≥ 5 dimensions
        - Outlier: > 2 SD from cluster centroid in ≥ 2 dimensions
Step 5: Factor analysis identifies which dimensions drive each relationship
Step 6: Dynamic regrouping when scores or trends change significantly
```

**Cross-province classification logic in detail:**

| Classification | Detection Criteria | Business Meaning |
|---|---|---|
| **Similar** | Weighted Euclidean distance < threshold AND same cluster archetype | Natural peer group — share characteristics and challenges |
| **Competing** | PIS difference < 5 AND ≥ 3 dimensions with opposing trends AND same cluster archetype | Direct competitor — rival for investment, talent, or policy attention |
| **Emerging** | PIS in bottom quartile AND ≥ 5 dimensions with "improving" trend | Rising province — low baseline but strong momentum; potential future peer |
| **Declining** | PIS in top quartile AND ≥ 5 dimensions with "declining" trend | Eroding position — high baseline but losing ground; requires intervention |
| **Outlier** | Euclidean distance to cluster centroid > 2 SD in ≥ 2 dimensions | Unique profile — does not fit any archetype; needs individual analysis |

**Similarity formula:**
```
Similarity_Score(A, B) = 1 / (1 + Σ(w_i × |z_ai - z_bi|))

Where:
- w_i = weight of dimension i
- z_ai = z-score of province A in dimension i
- Similarity_Score ranges from 0 (completely different) to 1 (identical)
```

**Output:**

```json
{
  "province_id": "DZ-16",
  "province_name": "Algiers",
  "pis": 68.5,
  "pis_classification": "developing",
  "cluster_membership": "Coastal Economic Hubs",
  "cluster_size": 5,
  "cross_province": {
    "similar": [
      {
        "province_id": "DZ-31",
        "province_name": "Oran",
        "similarity_score": 0.87,
        "primary_factors": [
          { "dimension": "economy", "contribution_pct": 32 },
          { "dimension": "infrastructure", "contribution_pct": 24 },
          { "dimension": "health", "contribution_pct": 18 }
        ]
      }
    ],
    "competing": [
      {
        "province_id": "DZ-23",
        "province_name": "Annaba",
        "pis_difference": 2.1,
        "competing_dimensions": ["employment", "investment", "tourism"],
        "advantage_direction": "Algiers leads in employment, Annaba leads in investment"
      }
    ],
    "emerging": [
      {
        "province_id": "DZ-44",
        "province_name": "Aïn Defla",
        "pis": 32.1,
        "improving_dimensions": ["agriculture", "infrastructure", "transportation", "education", "water"],
        "improvement_magnitude": "+8.2 across 5 dimensions",
        "projected_peer_timeline": "18–24 months at current trajectory"
      }
    ],
    "declining": [
      {
        "province_id": "DZ-06",
        "province_name": "Béjaïa",
        "pis": 72.4,
        "declining_dimensions": ["economy", "employment", "environment", "tourism", "agriculture"],
        "decline_magnitude": "-12.4 across 5 dimensions",
        "intervention_urgency": "high"
      }
    ],
    "outliers": [
      {
        "province_id": "DZ-01",
        "province_name": "Adrar",
        "deviation": "3.1 SD from cluster centroid",
        "outlier_dimensions": ["security", "agriculture"],
        "explanation": "Uncharacteristically high security and agriculture for a Southern Resource cluster member"
      }
    ]
  },
  "updated_at": "2026-06-29T14:30:00Z",
  "evidence_id": "ev-dz-16-cross-20260629-001"
}
```

**Cluster taxonomy (dynamic labels):**

| Cluster Archetype | Typical Provinces | Characteristics |
|---|---|---|
| Coastal Economic Hubs | Algiers, Oran, Annaba | High economy, infrastructure, investment |
| Interior Agricultural Belt | Sétif, Bordj Bou Arréridj, Mila | High agriculture, medium other scores |
| Highland Transition | Tiaret, Djelfa, Médéa | Medium-low across all dimensions |
| Southern Resource | Ouargla, Béchar, Adrar | High energy/mining, low health/education |
| Deep South | Tamanrasset, Illizi, Djanet | Low across all, high security |
| Mountain Cultural | Tizi Ouzou, Béjaïa, Jijel | High education, medium tourism potential |
| Industrial Corridor | Skikda, Mostaganem, Boumerdès | High employment, medium infrastructure |

#### Timeline Engine & Province Health Evolution

**Purpose:** Create a chronological intelligence timeline of major changes for each province and maintain a multi-window health evolution history.

**Event sources:**
- Score changes exceeding significance thresholds
- Risk detection events
- Opportunity identification events
- Indicator changes (e.g., new hospital opening, population milestone)
- Government project milestones (from InvestmentProject entities)
- External events (policy changes, natural events)
- Cross-province reclassification events

**Province Health Evolution windows:**

| Window | Snapshot Frequency | Purpose |
|---|---|---|
| 30 days | Daily | Recent developments, emerging trends, short-term volatility detection |
| 90 days | Weekly | Quarterly performance tracking, policy impact monitoring |
| 1 year | Monthly | Annual comparison, strategic direction, budget cycle alignment |
| 5 years | Quarterly | Long-term development trajectory, structural change detection |

**Evolution metrics per window:**

| Metric | Calculation | Interpretation |
|---|---|---|
| Start PIS | Score at beginning of window | Baseline |
| Current PIS | Score at end of window | Current state |
| Net change | End - Start | Absolute improvement/regression |
| Change rate | Net change / Window months | Velocity of change |
| Trajectory | Linear regression over window | Projected PIS in 12 months |
| Volatility | Std dev of daily/weekly PIS | Stability of development path |
| Improving dimensions | Count of dimensions with positive trend | Breadth of improvement |
| Declining dimensions | Count of dimensions with negative trend | Breadth of decline |
| Regime change | Change point detected within window | Structural break (policy, crisis, investment) |

**Timeline output:**

```json
{
  "province_id": "DZ-16",
  "pis": 68.5,
  "pis_trend": "improving",
  "evolution": {
    "30_days": {
      "start_pis": 67.8,
      "current_pis": 68.5,
      "net_change": 0.7,
      "change_rate_per_month": 0.7,
      "trajectory": "+2.1 (12mo projected)",
      "volatility": 0.4,
      "improving_dimensions": 5,
      "declining_dimensions": 2,
      "regime_change_detected": false
    },
    "90_days": {
      "start_pis": 66.2,
      "current_pis": 68.5,
      "net_change": 2.3,
      "change_rate_per_month": 0.77,
      "trajectory": "+4.8 (12mo projected)",
      "volatility": 0.8,
      "improving_dimensions": 7,
      "declining_dimensions": 3,
      "regime_change_detected": true,
      "regime_change_date": "2026-04-15",
      "likely_cause": "New healthcare investment"
    },
    "1_year": {
      "start_pis": 64.1,
      "current_pis": 68.5,
      "net_change": 4.4,
      "change_rate_per_month": 0.37,
      "trajectory": "+5.8 (12mo projected)",
      "volatility": 1.2,
      "improving_dimensions": 8,
      "declining_dimensions": 4,
      "regime_change_detected": true,
      "regime_change_date": "2025-11-01",
      "likely_cause": "Metro line extension completion"
    },
    "5_years": {
      "start_pis": 58.2,
      "current_pis": 68.5,
      "net_change": 10.3,
      "change_rate_per_month": 0.17,
      "trajectory": "+4.2 (12mo projected)",
      "volatility": 3.1,
      "improving_dimensions": 9,
      "declining_dimensions": 3,
      "regime_changes": [
        { "date": "2023-06-01", "cause": "Economic reform package" },
        { "date": "2025-11-01", "cause": "Metro line extension" }
      ]
    }
  },
  "summary": {
    "recent_improvements": ["health", "infrastructure"],
    "recent_declines": ["employment", "environment"],
    "notable_milestones": ["New hospital (2025-11)", "Metro line extension (2025-08)"],
    "long_term_trajectory": "improving",
    "trajectory_confidence": 0.82,
    "intervention_recommended": false
  },
  "events": [
    {
      "date": "2026-03-15",
      "type": "score_change",
      "severity": "significant",
      "title": { "ar": "ارتفاع نتيجة الصحة من 68 إلى 71", "en": "Health score increased from 68 to 71", "fr": "Le score de santé est passé de 68 à 71" },
      "details": { "ar": "مدفوع بانخفاض وفيات الرضع وزيادة عدد الأطباء", "en": "Driven by reduced infant mortality and increased doctors", "fr": "Grâce à la réduction de la mortalité infantile et à l'augmentation du nombre de médecins" },
      "confidence": 0.92,
      "evidence_id": "ev-dz-16-tl-20260629-001"
    },
    {
      "date": "2025-11-01",
      "type": "project_milestone",
      "severity": "positive",
      "title": { "ar": "افتتاح مستشفى جامعي جديد (400 سرير)", "en": "New university hospital opened (400 beds)", "fr": "Nouvel hôpital universitaire ouvert (400 lits)" },
      "details": { "ar": "تم افتتاح مستشفى جامعي في الضاحية الشرقية للعاصمة بطاقة 400 سرير.", "en": "University hospital opened in eastern suburb with 400-bed capacity.", "fr": "Hôpital universitaire inauguré dans la banlieue est avec une capacité de 400 lits." },
      "source": "MOH-Project-DB"
    }
  ],
  "evidence_id": "ev-dz-16-evol-20260629-001"
}
```

#### Evidence Engine

**Purpose:** Guarantee that every intelligence product in PIE is grounded in traceable, verifiable evidence. No score, insight, risk, opportunity, recommendation, executive summary, or explanation may exist without at least one registered evidence record.

**Design principle:** Evidence is the atomic unit of trust in PIE. All AI-generated or computed outputs must reference evidence IDs. The Evidence Engine is the gatekeeper — it validates, stores, and serves evidence for audit and explainability.

**Evidence record schema:**

```json
{
  "evidence_id": "ev-dz-16-pis-20260629-001",
  "evidence_type": "score_composite",
  "status": "validated",
  "province_id": "DZ-16",
  "intelligence_product": {
    "type": "province_intelligence_score",
    "id": "pis-dz-16-2026-q2",
    "generated_at": "2026-06-29T14:30:00Z"
  },
  "sources": [
    {
      "source_id": "ONS-2025",
      "source_name": "Office National des Statistiques",
      "source_type": "national_statistics_office",
      "reliability_score": 0.95,
      "freshness": "2025-Q4",
      "datasets_used": ["population_census_2025", "employment_survey_q4_2025"]
    },
    {
      "source_id": "MOH-2025",
      "source_name": "Ministry of Health",
      "source_type": "government_ministry",
      "reliability_score": 0.92,
      "freshness": "2025-Q3",
      "datasets_used": ["hospital_capacity_2025", "healthcare_personnel_2025"]
    }
  ],
  "indicators_referenced": [
    {
      "indicator_id": "pop_density",
      "value": 2988145,
      "source_id": "ONS-2025",
      "normalized_contribution": 0.08
    },
    {
      "indicator_id": "beds_per_1000",
      "value": 2.1,
      "source_id": "MOH-2025",
      "normalized_contribution": 0.12
    }
  ],
  "validation": {
    "status": "passed",
    "checked_at": "2026-06-29T14:31:00Z",
    "checks_performed": [
      "source_reliability_check",
      "indicator_freshness_check",
      "value_consistency_check",
      "duplicate_detection"
    ],
    "confidence_threshold_met": true,
    "completeness_threshold_met": true
  },
  "lineage": {
    "feature_pipeline_version": "2.1.0",
    "scoring_model_version": "2026-v2",
    "gold_layer_snapshot": "s3://monadhama-data/gold/snapshot=2026-06-29/",
    "computation_hash": "sha256:abc123def456..."
  },
  "created_at": "2026-06-29T14:31:00Z",
  "expires_at": "2026-07-29T14:31:00Z"
}
```

**Evidence types:**

| Type | Description | Validation Required |
|---|---|---|
| `score_dimension` | Evidence for a single dimension score | Source references, indicator values, weight application |
| `score_composite` | Evidence for the Province Intelligence Score | All dimension evidence IDs, weight config version |
| `trend` | Evidence for a trend classification | Time-series data, statistical test results |
| `insight` | Evidence for an AI insight | Supporting indicator list, correlation/rule reference |
| `risk` | Evidence for a detected risk | Threshold configuration, indicator deviations |
| `opportunity` | Evidence for an identified opportunity | Benchmark data, gap analysis, feasibility assessment |
| `recommendation` | Evidence for an executive recommendation | Risk/opportunity evidence IDs, impact model |
| `summary` | Evidence for an executive summary | All evidence IDs referenced in the summary |
| `evolution` | Evidence for health evolution metrics | Historical score snapshots, change point analysis |
| `cross_province` | Evidence for cross-province classification | Peer group definitions, distance computations |

**Evidence validation pipeline:**

```
Intelligence Product Generated
        ↓
[Evidence Registration] — Evidence Engine creates evidence record with DRAFT status
        ↓
[Source Resolution] — Each source_id resolved against Source Registry
        ↓
[Indicator Verification] — Each indicator value checked against Feature Service
        ↓
[Freshness Check] — All data points within configured freshness threshold
        ↓
[Confidence Gate] — Aggregate confidence ≥ minimum threshold for the intelligence type
        ↓
[Completeness Gate] — Required fields populated, no nulls in mandatory fields
        ↓
[Hash Verification] — Computation hash matches expected output
        ↓
        ↓ (all checks pass)                 ↓ (any check fails)
   [VALIDATED status]                   [FAILED status]
        ↓                                        ↓
[Evidence stored + published]         [Alert sent to quality team]
        ↓                                        ↓
[Intelligence product released]        [Product held in DRAFT until resolved]
```

**Evidence coupling rules:**

| Intelligence Product | Minimum Evidence Required | Auto-generated | Human-overridable |
|---|---|---|---|
| Dimension score | 1 evidence record per dimension | Yes | No |
| Province Intelligence Score | 12 dimension evidence records + 1 composite | Yes | No |
| Insight | 1 evidence record with ≥ 2 indicator references | Yes | Yes (override confidence) |
| Risk | 1 evidence record with ≥ 2 indicator references + threshold config | Yes | Yes (override severity) |
| Opportunity | 1 evidence record with benchmark source | Yes | Yes (override potential) |
| Recommendation | 1 evidence record referencing ≥ 1 risk/opportunity evidence ID | Yes | No (recommendations are advisory) |
| Executive Summary | All evidence IDs referenced by included intelligence products | Yes | No |
| Timeline event | 1 evidence record per event | Yes | Yes (add manual events) |
| Cross-province relation | 1 evidence record with distance computations | Yes | No |
| Health evolution | 1 evidence record per window | Yes | No |

**Guarantee:** The PIE API will reject any endpoint response that claims `PUBLISHED` status without a corresponding evidence record in `VALIDATED` status. This is enforced at the API gateway level.

#### Explainability Engine

**Purpose:** Wrap every intelligence product with a multi-level chain of evidence — from a one-sentence executive rationale down to the raw data point. Every recommendation supports drilling down through all four levels.

**Explainability layers:**

| Level | Name | Description | Consumer | Included In |
|---|---|---|---|---|
| **L1** | Executive Summary | One-sentence explanation of why a score, risk, or recommendation exists. Answers: "What happened and why at a glance?" | Executive dashboard, notification | API response summary field |
| **L2** | Human Explanation | Paragraph-length natural-language explanation referencing specific indicators, trends, and comparisons. Answers: "What should I understand about this result?" | Province detail page, report | Full API response |
| **L3** | Indicator Breakdown | Structured breakdown showing which indicators drove the result, their normalized scores, contributions, and confidence. Answers: "Which specific metrics produced this result?" | Analytics view, comparison tool | Expandable detail in API |
| **L4** | Raw Evidence Lineage | Full provenance from raw data point through transformation pipeline — source documents, timestamps, quality scores, computational hashes. Answers: "Can I verify the underlying data?" | Audit trail, admin panel, compliance review | Separate endpoint / admin API |

**Drill-down contract:** Every intelligence endpoint that returns L1 must include a `drill_down` object with links to L2, L3, and L4:

```json
{
  "explainability": {
    "l1": {
      "executive": {
        "ar": "انخفاض نتيجة الصحة بسبب نقص الأطباء وارتفاع معدل وفيات الرضع.",
        "en": "Health score decline due to doctor shortage and elevated infant mortality.",
        "fr": "Baisse du score de santé due à une pénurie de médecins et à une mortalité infantile élevée."
      },
      "generated_at": "2026-06-29T14:30:00Z"
    },
    "l2": {
      "human_explanation": {
        "ar": "انخفضت نتيجة الصحة في ولاية إليزي بمقدار 4.2 نقاط خلال الربع الأخير. السبب الرئيسي هو انخفاض عدد الأطباء لكل 1,000 نسمة من 0.8 إلى 0.6، وهو أقل بكثير من المتوسط الوطني البالغ 1.8. بالإضافة إلى ذلك، ارتفع معدل وفيات الرضع من 18.2 إلى 21.5 لكل 1,000 مولود حي. هذه المؤشرات تشير إلى ضغط متزايد على النظام الصحي في المنطقة.",
        "en": "Illizi's health score dropped 4.2 points in the last quarter. The primary cause is a decline in doctors per 1,000 residents from 0.8 to 0.6, significantly below the national average of 1.8. Additionally, infant mortality rose from 18.2 to 21.5 per 1,000 live births. These indicators suggest increasing strain on the regional health system.",
        "fr": "Le score de santé d'Illizi a chuté de 4,2 points au cours du dernier trimestre. La cause principale est une baisse du nombre de médecins pour 1 000 habitants, passant de 0,8 à 0,6, bien en dessous de la moyenne nationale de 1,8. De plus, la mortalité infantile est passée de 18,2 à 21,5 pour 1 000 naissances vivantes."
      },
      "key_drivers": [
        { "indicator": "doctors_per_1000", "direction": "negative", "contribution_pct": 58 },
        { "indicator": "infant_mortality", "direction": "negative", "contribution_pct": 32 },
        { "indicator": "bed_occupancy_rate", "direction": "negative", "contribution_pct": 10 }
      ]
    },
    "l3": {
      "indicators": [
        {
          "indicator_id": "doctors_per_1000",
          "value": 0.6,
          "weight": 0.15,
          "normalized_score": 22,
          "contribution": -15.3,
          "national_average": 1.8,
          "percentile": 8,
          "source": {
            "id": "MOH-2025",
            "type": "government_ministry",
            "freshness": "2025-Q3",
            "quality_score": 0.92
          },
          "explanation": {
            "ar": "أدنى كثافة أطباء في البلاد — 33% فقط من المتوسط الوطني",
            "en": "Lowest doctor density in the country — 33% of national average",
            "fr": "La plus faible densité médicale du pays — 33% de la moyenne nationale"
          }
        }
      ],
      "confidence_interval": [62.1, 70.3],
      "completeness_pct": 78
    },
    "l4": {
      "data_lineage": [
        {
          "stage": "raw_source",
          "location": "s3://monadhama-data/bronze/source=MOH-001/year=2025/month=07/doctors_per_wilaya.parquet",
          "format": "parquet",
          "schema_version": "2.1",
          "record_count": 5800,
          "verified_at": "2026-06-29T10:00:00Z",
          "verified_by": "DataQualityPipeline-v2.1.0",
          "quality_score": 0.97
        },
        {
          "stage": "cleaned",
          "location": "s3://monadhama-data/silver/entity=healthcare_personnel/year=2025/doctors.parquet",
          "format": "delta",
          "quality_score": 0.95,
          "transformations_applied": ["null_filtering", "duplicate_removal", "type_normalization"]
        },
        {
          "stage": "aggregated",
          "location": "s3://monadhama-data/gold/dim_health_indicators/year=2025/dim_health_indicators.parquet",
          "format": "delta",
          "quality_score": 0.97,
          "transformations_applied": ["province_aggregation", "ratio_computation", "outlier_capping"]
        }
      ],
      "audit_trail": {
        "computation_hash": "sha256:abc123def456...",
        "pipeline_version": "scoring-engine-v2.1.0",
        "config_version": "weight-config-2026-v2",
        "executed_at": "2026-06-29T14:30:00Z",
        "execution_time_ms": 2345
      }
    },
    "drill_down": {
      "l2_url": "/api/v1/provinces/DZ-33/explain/score-health/l2",
      "l3_url": "/api/v1/provinces/DZ-33/explain/score-health/l3",
      "l4_url": "/api/v1/admin/provinces/DZ-33/explain/score-health/l4"
    }
  }
}
```

**Explainability guarantees:**
- Every number in L1 and L2 is computed, not generated by LLM
- L3 always includes confidence intervals and completeness percentages
- L4 always includes computation hash for reproducibility
- The `drill_down` object is mandatory on every intelligence endpoint
- If L4 data is not available (e.g., lineage not yet indexed), the response returns `null` with a reason — never stale or fabricated lineage

#### Ontology & Config Service

**Purpose:** Manage the semantic model and all configurable parameters of PIE. Acts as the single source of truth for dimension definitions, indicator catalogs, weight configurations, threshold policies, and the source reliability registry.

**Scope:**
- Dimension definitions (which indicators belong to which dimension)
- Indicator definitions (unit, normalization method, benefit/cost classification)
- Entity relationships (province → hospital, province → school, etc.)
- Threshold policies (which thresholds apply to which province category)
- Evidence validation rules (confidence thresholds, freshness requirements)
- Intelligence product lifecycle policies
- Source reliability registry

---

## 4. Scoring Methodology

### 4.1 Full Indicator Catalog by Dimension

See `priority_scoring.md` section 4 for the complete catalog. PIE extends this with:

**Extended indicators beyond `priority_scoring.md`:**

| Dimension | Additional Indicators | Source |
|---|---|---|
| Health | ICU beds per 100K, Primary care facilities per 10K, Telemedicine coverage | MOH |
| Education | Digital literacy rate, STEM enrollment %, Research publication count | MOE, MHE |
| Economy | SME density, Startup formation rate, Ease of doing business score | MOC, computed |
| Employment | Gig economy participants, Female labor force participation, Skills gap index | MOL, computed |
| Investment | Patent filings, R&D spending, Venture capital deals | MOF, computed |
| Infrastructure | 5G coverage, Smart city initiatives, Building permit processing time | MOT, MOH |
| Security | Cyber incidents, Border crossing efficiency, Community policing coverage | MOI, MOD |
| Environment | Carbon footprint per capita, Recycling infrastructure score, Green building adoption | MOE |
| Transportation | Traffic congestion index, Public transit ridership, Bike lane coverage | MOT, computed |
| Water | Desalination capacity, Groundwater recharge rate, Water pricing affordability | MOW |
| Agriculture | Organic farming adoption, Agri-tech adoption, Post-harvest loss % | MOA |
| Tourism | Event tourism capacity, Ecotourism sites, Digital tourism presence | MOT |

### 4.2 Missing Data Rules

| Scenario | Handling Method | Confidence Penalty |
|---|---|---|
| All indicators available | Normal computation | None |
| < 30% of indicators missing | Impute from national average of peer group | -0.05 per missing |
| 30–50% missing | Impute + flag as "partial score" | -0.15 per missing |
| 50–70% missing | Score not computed; use previous value if available | -0.30 |
| > 70% missing | Score not computed; return "insufficient data" | N/A |

### 4.3 Confidence in Scores

```
Confidence = Σ(w_i × β_i × α_i) × Completeness_Factor

Where:
- w_i = indicator weight within dimension
- β_i = source reliability factor (see priority_scoring.md section 7)
- α_i = data recency factor (see priority_scoring.md section 7)
- Completeness_Factor = (% indicators available) / (total indicators)
```

### 4.4 Province Intelligence Score Weight Configuration

Default weights for the 12 dimensions in the PIS composite:

| Dimension | Default Weight | Rationale |
|---|---|---|
| Health | 0.10 | Core human development indicator |
| Education | 0.10 | Long-term human capital |
| Economy | 0.12 | Highest weight — primary policy focus area |
| Employment | 0.10 | Direct citizen welfare impact |
| Investment | 0.08 | Future economic capacity |
| Infrastructure | 0.10 | Enabling factor for all other dimensions |
| Security | 0.06 | Baseline requirement |
| Environment | 0.08 | Increasing national priority |
| Transportation | 0.08 | Economic connectivity |
| Water | 0.08 | Critical resource in Algerian context |
| Agriculture | 0.06 | Regional importance varies |
| Tourism | 0.04 | Niche sector, lower base weight |

All weights are configurable via the Ontology & Config Service admin API. Weight changes trigger automatic PIS recomputation.

---

## 5. Ontology & Configuration Service

### 5.1 Configurable Parameters

All parameters below are stored in a central configuration store (PostgreSQL + Redis cache) and exposed through an admin API. Changes take effect on the next computation cycle.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `dimension_weights` | JSON map | See section 4.4 | Weights for each of 12 dimensions |
| `indicator_weights` | JSON map (per dimension) | See `priority_scoring.md` | Weights within each dimension |
| `recency_factors` | JSON map (age→factor) | See `priority_scoring.md` | Score penalty for old data |
| `reliability_factors` | JSON map (source→factor) | See `priority_scoring.md` | Score penalty for low-quality sources |
| `trend_thresholds` | JSON | `{ improving: 5, declining: -5, critical: -15 }` | % change for trend classification |
| `risk_thresholds` | JSON (per category) | Per-category configuration | Values that trigger risk detection |
| `peer_group_count` | Integer | 3 | Number of similar provinces to return |
| `anomaly_sensitivity` | Float | 2.5 | Z-score threshold for anomaly detection |
| `insight_max_per_province` | Integer | 10 | Maximum active insights per province |
| `recalculation_interval` | String (cron) | `0 2 * * *` (daily at 2 AM) | How often PIE recomputes |
| `pis_confidence_threshold` | Float | 0.50 | Minimum confidence to compute PIS |
| `evidence_validation_enabled` | Boolean | true | Enable/disable evidence validation gate |
| `explainability_levels` | Integer | 4 | Maximum explainability depth served |
| `evolution_windows_days` | Integer[] | [30, 90, 365, 1825] | Health evolution window sizes |
| `cross_province_outlier_sd` | Float | 2.0 | Standard deviation threshold for outlier detection |

### 5.2 Ontology Registry

The Ontology Service maintains the semantic model of every entity, indicator, and relationship that PIE understands. It is the source of truth for:

- Dimension definitions (which indicators belong to which dimension)
- Indicator definitions (unit, normalization method, benefit/cost classification)
- Entity relationships (province → hospital, province → school, etc.)
- Threshold policies (which thresholds apply to which province category)
- Evidence type definitions and validation rules
- Cross-province classification criteria and thresholds

---

## 6. Required Services & Deployment

### 6.1 Microservices

| Service | Language | Replicas | Resources | Dependencies |
|---|---|---|---|---|
| Feature Service | Python (PySpark) | 3–10 | 4 CPU, 16GB RAM | Delta Lake, Time-series DB |
| Scoring Engine | Python + Pandas | 3–5 | 2 CPU, 8GB RAM | Feature Service |
| Trend Engine | Python (statsmodels) | 2–3 | 2 CPU, 8GB RAM | Feature Service |
| Similarity Engine | Python (scikit-learn) | 2–3 | 4 CPU, 16GB RAM | Scoring Engine |
| Insight Engine | Python + scikit-learn | 3–5 | 4 CPU, 16GB RAM | Scoring + Trend + Similarity |
| Executive Summary Gen | Python | 2–3 | 2 CPU, 8GB RAM | All engines |
| Risk Engine | Python | 3–5 | 2 CPU, 8GB RAM | Scoring + Trend |
| Opportunity Engine | Python | 2–3 | 2 CPU, 8GB RAM | Feature + Similarity |
| Recommendation Engine | Python | 3–5 | 4 CPU, 16GB RAM | Risk + Opportunity + Scoring |
| Timeline Engine | Python | 2–3 | 2 CPU, 8GB RAM | All other engines + Knowledge Graph |
| Evidence Engine | Python + Go | 3–5 | 4 CPU, 8GB RAM | All engines, Source Registry |
| Explainability Engine | Python | 3–5 | 4 CPU, 8GB RAM | All engines, Evidence Engine |
| Ontology & Config Service | Go | 2–3 | 1 CPU, 4GB RAM | PostgreSQL |

### 6.2 Data Stores

| Store | Technology | Purpose | Size Estimate |
|---|---|---|---|
| **Primary database** | PostgreSQL (Citus) | Configuration, recommendations, user actions | ~500GB/year |
| **Knowledge graph** | Neo4j | Entity relationships, ontology | ~50GB |
| **Time-series** | ClickHouse | Indicator values over time | ~2TB/year |
| **Cache** | Redis | Hot scores, frequent API responses | ~10GB |
| **Vector store** | Qdrant | Embeddings for insight similarity | ~5GB |
| **Evidence store** | PostgreSQL (separate instance) | Evidence records, validation results, lineage data | ~1TB/year |
| **Object storage** | MinIO / S3 | Data lake (Delta Lake format) | ~10TB/year |
| **Message queue** | Kafka | Event bus for PIE topics | 30 days retention |

### 6.3 Computation Schedule

| Job | Schedule | Trigger | SLA |
|---|---|---|---|
| Feature computation | Every 4 hours | Cron + on data arrival | <10 minutes |
| Score + PIS computation | Daily (02:00) | Cron | <5 minutes (58 provinces × 12 dimensions) |
| Trend detection | Daily (02:30) | After score computation | <3 minutes |
| Similarity + cross-province | Daily (02:45) | After score computation | <3 minutes |
| Insight generation | Daily (03:00) | After trend detection | <5 minutes |
| Executive summary gen | Daily (03:15) | After insight generation | <2 minutes |
| Risk detection | Every 6 hours | Cron | <3 minutes |
| Opportunity detection | Daily (04:00) | Cron | <3 minutes |
| Recommendation generation | Daily (05:00) | After risk + opportunity | <5 minutes |
| Health evolution update | Daily (05:30) | After score recomputation | <2 minutes |
| Evidence validation | On each event | Event-driven | <10 seconds |
| Timeline update | On each event | Event-driven | <30 seconds |
| Explainability index | On each event | Event-driven | <5 seconds |
| Cache warm | Daily (06:00) | Cron | <2 minutes |

---

## 7. Future API Interfaces

### 7.1 REST API (v1, Future)

```
# Province Intelligence
GET    /api/v1/provinces/{code}/intelligence-score
GET    /api/v1/provinces/{code}/executive-summary
GET    /api/v1/provinces/{code}/profile
GET    /api/v1/provinces/{code}/scores
GET    /api/v1/provinces/{code}/insights
GET    /api/v1/provinces/{code}/risks
GET    /api/v1/provinces/{code}/opportunities
GET    /api/v1/provinces/{code}/recommendations
GET    /api/v1/provinces/{code}/timeline
GET    /api/v1/provinces/{code}/evolution
GET    /api/v1/provinces/{code}/similar
GET    /api/v1/provinces/{code}/cross-province
GET    /api/v1/provinces/{code}/evidence
GET    /api/v1/provinces/{code}/explain/{intelligence_id}
GET    /api/v1/provinces/{code}/explain/{intelligence_id}/l2
GET    /api/v1/provinces/{code}/explain/{intelligence_id}/l3
GET    /api/v1/provinces/{code}/explain/{intelligence_id}/l4

# Comparative
POST   /api/v1/compare
POST   /api/v1/rankings

# Intelligence discovery
GET    /api/v1/discover/similar
GET    /api/v1/discover/competing
GET    /api/v1/discover/emerging
GET    /api/v1/discover/declining
GET    /api/v1/discover/outliers

# Evidence
GET    /api/v1/evidence/{evidence_id}
POST   /api/v1/evidence/validate
GET    /api/v1/evidence/sources
GET    /api/v1/evidence/sources/{source_id}

# Configuration
GET    /api/v1/admin/ontology/dimensions
PUT    /api/v1/admin/ontology/dimensions/{id}/weights
GET    /api/v1/admin/ontology/thresholds
PUT    /api/v1/admin/ontology/thresholds/{category}
GET    /api/v1/admin/config
PUT    /api/v1/admin/config

# Bulk / Batch
POST   /api/v1/batch/refresh  (triggers full recomputation)
GET    /api/v1/batch/status/{job_id}
```

### 7.2 GraphQL API (v2, Future)

```graphql
# Domain types
type Province {
  id: ID!
  code: String!
  name: String!
  pis: ProvinceIntelligenceScore!
  profile: ExecutiveSummary!
  scores: ProvinceScores!
  insights(filter: InsightFilter): [Insight!]!
  risks(severity: RiskSeverity): [Risk!]!
  opportunities(potential: Float): [Opportunity!]!
  recommendations(priority: Float): [Recommendation!]!
  timeline(year: Int): [TimelineEvent!]!
  evolution: HealthEvolution!
  similar(limit: Int): [PeerProvince!]!
  crossProvince: CrossProvinceIntelligence!
  evidence: [EvidenceRecord!]!
}

type ProvinceIntelligenceScore {
  pis: Float!
  classification: String!
  confidence: Float!
  confidenceInterval: [Float!]!
  trend: Trend!
  components: PISComponents!
  dimensionBreakdown: [DimensionContribution!]!
  evidenceId: ID!
}

type PISComponents {
  weightedDimensionSum: Float!
  confidenceFactor: Float!
  trendMomentumFactor: Float!
  missingDataPenalty: Float!
  indicatorsUsed: Int!
  indicatorsTotal: Int!
  completenessPct: Float!
}

type CrossProvinceIntelligence {
  similar: [PeerProvince!]!
  competing: [CompetingProvince!]!
  emerging: [EmergingProvince!]!
  declining: [DecliningProvince!]!
  outliers: [OutlierProvince!]!
}

type HealthEvolution {
  window30d: EvolutionWindow!
  window90d: EvolutionWindow!
  window1yr: EvolutionWindow!
  window5yr: EvolutionWindow!
  summary: EvolutionSummary!
}

type EvolutionWindow {
  startPis: Float!
  currentPis: Float!
  netChange: Float!
  changeRatePerMonth: Float!
  trajectory: String!
  volatility: Float!
  improvingDimensions: Int!
  decliningDimensions: Int!
  regimeChangeDetected: Boolean!
  regimeChangeDate: String
  likelyCause: String
}

type EvidenceRecord {
  evidenceId: ID!
  evidenceType: String!
  status: EvidenceStatus!
  provinceId: String!
  sources: [DataSource!]!
  indicatorsReferenced: [IndicatorReference!]!
  validation: EvidenceValidation!
  lineage: DataLineage!
  createdAt: String!
  expiresAt: String!
}

type Explainability {
  l1: L1Executive!
  l2: L2HumanExplanation
  l3: L3IndicatorBreakdown
  l4: L4RawLineage
  drillDown: DrillDownLinks!
}

# Queries
type Query {
  province(code: String!): Province
  provinces(filter: ProvinceFilter): [Province!]!
  rankings(dimension: String, year: Int): [ProvinceRank!]!
  compare(provinceCodes: [String!]!): ComparisonResult!
  explain(intelligenceId: ID!, level: Int): Explainability!
  evidence(id: ID!): EvidenceRecord!
  discoverSimilar(code: String!): [PeerProvince!]!
  discoverCompeting(code: String!): [CompetingProvince!]!
  discoverEmerging: [EmergingProvince!]!
  discoverDeclining: [DecliningProvince!]!
  discoverOutliers: [OutlierProvince!]!
  searchProvinces(query: String!): [Province!]!
}

# Subscriptions (real-time)
type Subscription {
  scoreUpdated(provinceCode: String): ScoreUpdate!
  riskDetected(provinceCode: String): RiskAlert!
  recommendationReady(provinceCode: String): Recommendation!
  evidenceValidated(provinceCode: String): EvidenceValidationEvent!
  crossProvinceChanged(provinceCode: String): CrossProvinceUpdate!
}
```

### 7.3 Webhook Events

Consumers can subscribe to PIE events via webhooks:

```json
{
  "webhook_id": "wh-001",
  "events": [
    "pie.risk.critical",
    "pie.score.significant_change",
    "pie.evidence.validation_failed",
    "pie.cross_province.reclassified",
    "pie.evolution.regime_change"
  ],
  "target_url": "https://executive-dashboard.gov.dz/webhooks/pie",
  "secret": "whsec_...",
  "retry_policy": { "max_retries": 3, "backoff_seconds": 60 }
}
```

---

## 8. Integration with Existing Systems

### 8.1 Data Engine Integration

```
Data Engine (Gold Layer) ──→ Feature Service ──→ PIE Pipeline
                                ↕
                        Kafka Events (pie.*)
                                ↕
                        [Knowledge Graph Sync]
                                ↕
                        [Vector Store Sync]
                                ↕
                        [Evidence Engine Sync]
```

PIE reads from the Gold layer of the Data Engine. It does not ingest raw data directly. This ensures:
- All data entering PIE has passed quality gates
- Data is already normalized to the ontology
- PIE is decoupled from ingestion infrastructure
- Evidence Engine validates Gold layer snapshots against Source Registry

### 8.2 AI Engine Integration

```
PIE Intelligence Products ──→ AI Engine RAG Context
                                    ↓
                            LLM-Augmented Outputs
                            (e.g., natural language reports,
                             conversational insights,
                             executive briefings)
                                    
PIE Evidence Records ──→ AI Engine Grounding Context
                                    ↓
                            Hallucination Guardrails
                            (every AI claim must cite evidence_id)
```

The AI Engine consumes PIE outputs as structured context for RAG. This means:
- LLMs never compute scores or detect risks — they only explain and augment
- All factual content in AI responses is grounded in PIE's evidence chain
- Hallucination risk is dramatically reduced
- AI responses must cite `evidence_id` for every factual claim

### 8.3 Frontend Integration

The existing React frontend will consume PIE through:
1. The REST API (v1) for 85% of use cases
2. GraphQL subscriptions (v2) for real-time dashboard updates
3. WebSocket events for live alerting
4. Explainability drill-down endpoints for detail expansion
5. Evidence API for audit/compliance views

---

## 9. Future Real Data Integration

The Province Intelligence Engine is designed to accept real government data without architectural changes:

### 9.1 Data Contract

PIE expects data in the Gold layer format defined in `data_engine.md` section 4.1. The contract includes:

| Table | Schema | Required | Update Frequency |
|---|---|---|---|
| `fact_health_indicators` | province_id, year, quarter, metric, value, source_id | Yes | Quarterly |
| `fact_economic_indicators` | province_id, year, quarter, metric, value, source_id | Yes | Quarterly |
| `fact_education_indicators` | province_id, year, quarter, metric, value, source_id | Yes | Quarterly |
| `dim_province` | province_id, name, population, area | Yes | Annually |
| `dim_hospital` | province_id, beds, staff, type | Yes | Annually |
| `dim_school` | province_id, students, teachers, level | Yes | Annually |
| `dim_investment_project` | province_id, budget, status, sector, progress | Yes | Monthly |
| `dim_road` | province_id, length_km, condition, type | Yes | Annually |
| Source registry | source_id, name, type, reliability_score | Yes | As needed |
| Evidence registry | evidence_id, intelligence_id, source_hashes, status | Yes | Continuous |

### 9.2 Mock-to-Real Transition Plan

```
Phase 0 (Current): Mock data → Gold layer tables → PIE computes with mocked indicators
Phase 1: Real data from 3 ministries (Health, Education, ONS) → PIE runs in shadow mode
         comparing mock vs real outputs → tuning weights and thresholds
Phase 2: Real data replaces mock for validated sources → PIE feeds frontend in production
Phase 3: All 12 ministries onboarded → PIE at full capacity
Phase 4: Real-time streaming data → PIE transition to event-driven computation
```

### 9.3 Shadow Mode Architecture

During Phase 1, PIE runs in shadow mode:
```
Mock Data → PIE (Shadow) → Output stored but not served
Real Data → PIE (Primary) → Output validated by domain experts
                            → Differences logged for analysis
                            → Weights and thresholds adjusted
                            → Evidence Engine validates all outputs
```

---

## 10. Performance Targets

| Metric | Target | Measurement |
|---|---|---|
| Full pipeline (all 58 provinces) | < 15 minutes | End-to-end cron job duration |
| Per-province PIS computation | < 2 seconds | API response time, cache hit |
| Executive summary generation per province | < 1 second | After all intelligence products are ready |
| Insight generation per province | < 5 seconds | Batch computation |
| Risk detection latency | < 30 seconds | From new data arrival |
| Evidence validation per record | < 10 seconds | Source resolution + indicator verification |
| Similarity + cross-province recomputation | < 3 minutes | All 58 provinces |
| Recommendation generation | < 5 minutes | All provinces |
| Health evolution update | < 2 minutes | All provinces |
| Cache hit rate | > 95% | Redis cache |
| API P99 response time | < 200ms | Cached intelligence products |
| API P99 response time (uncached) | < 3 seconds | Computed on demand |
| Explainability L4 retrieval | < 500ms | From evidence store |

---

## 11. Security & Audit

### 11.1 Data Classification

| PIE Product | Classification | Access Control |
|---|---|---|
| Province Intelligence Score | Official | All authenticated users |
| Executive Summary | Official-Sensitive | Province-specific role + Minister |
| Scores (dimensions) | Official | All authenticated users |
| Insights | Official-Sensitive | Province-specific role + Minister |
| Risks | Confidential | Executive + Security Council |
| Opportunities | Official-Sensitive | Province-specific role + Minister |
| Recommendations | Confidential | Decision makers only |
| Timeline | Official | All authenticated users |
| Evolution data | Official-Sensitive | Province-specific role |
| Cross-province intelligence | Official-Sensitive | Executive + analysts |
| Evidence records | Source-dependent | Per-source ACL + audit role |
| Raw evidence (L4) | Source-dependent | Per-source ACL + compliance role |

### 11.2 Audit Trail

Every PIE operation is logged:
```
{
  "audit_id": "audit-20260629-001",
  "timestamp": "2026-06-29T14:30:00Z",
  "operation": "score.compute",
  "service": "ScoringEngine",
  "province_id": "DZ-16",
  "inputs_hash": "sha256:abc123...",
  "output_hash": "sha256:def456...",
  "config_version": "2026-v1",
  "evidence_id": "ev-dz-16-pis-20260629-001",
  "computation_time_ms": 1234,
  "trigger": "scheduled",
  "user": null,
  "evidence_validated": true
}
```

---

## 12. Future Evolution

| Version | Scope | Timeline |
|---|---|---|
| v1.0 | Current specification — deterministic scoring, rule-based insights | Now |
| v1.5 | ML-based anomaly detection, improved trend models, expanded indicator catalog | +3 months |
| v2.0 | Predictive scoring (forecast PIS 12 months ahead), LLM-augmented explanations | +6 months |
| v2.5 | What-if simulation engine, scenario planning, automated policy impact analysis | +12 months |
| v3.0 | National-scale integration — all ministries, real-time streaming, executive war room | +18 months |

---

## 13. Future AI Integration Extension Points

PIE is designed with explicit extension points for AI capabilities. These extension points require **no architectural changes** — they consume PIE outputs through defined contracts.

### 13.1 LLM Integration

**Contract:** PIE → JSON intelligence products → LLM context window

**Extension point:** The Explainability Engine's L1 and L2 fields are the LLM interface. The LLM receives structured PIE outputs and produces natural-language augmentations:

```
PIE Executive Summary JSON ──→ LLM Prompt Template ──→ Augmented Executive Briefing
PIE Risk JSON            ──→ LLM Prompt Template ──→ Risk Narrative with Recommendations
PIE Evolution JSON       ──→ LLM Prompt Template ──→ Development Storyline
```

**Guarantees:**
- LLM never modifies scores, risks, or evidence
- LLM output always downgraded if it conflicts with evidence
- Every LLM-augmented output includes evidence_id citations
- Hallucination guardrails: factual claims verified against PIE evidence before output

### 13.2 Knowledge Graph Integration

**Contract:** PIE → Ontology Service → Neo4j Knowledge Graph

**Extension point:** Every entity, indicator, and relationship in PIE's ontology is synchronized to the Knowledge Graph:

```
Ontology Service ──→ Neo4j Sync ──→ Knowledge Graph
      ↓                                    ↓
Indicator definitions                Entity relationship queries
Dimension definitions                 Cross-entity insights
Source registry                       Provenance traversal
Evidence records                      Evidence graph queries
```

**Capabilities unlocked:**
- Graph traversal: "Show all hospitals near roads with condition < 30 in Illizi"
- Entity resolution: "Link all schools to their nearest hospital for emergency planning"
- Impact analysis: "If this road project is funded, which 8 schools gain access?"

### 13.3 Digital Twin Integration

**Contract:** PIE → Province State Snapshot → Digital Twin

**Extension point:** The Executive Summary and Evolution outputs define the current state of each province. These snapshots are the Digital Twin's ground truth:

```
PIE Executive Summary ──→ Digital Twin State Store
PIE Evolution Windows ──→ Digital Twin Historical State
PIE Scores + Trends   ──→ Digital Twin Health Metrics
PIE Risks             ──→ Digital Twin Stress Indicators
```

**Capabilities unlocked:**
- Real-time province state visualization
- Historical state replay (windowing)
- Stress testing: "What happens to water score if dam levels drop 20%?"
- Policy simulation: "Apply a new education policy across all provinces and observe impact"

### 13.4 Scenario Simulation Integration

**Contract:** PIE → Config Service → Simulation Engine

**Extension point:** The Ontology & Config Service exposes all weights, thresholds, and parameters. A simulation engine can modify these and request recomputation:

```
Simulation Engine ──→ Config Service (override) ──→ PIE Recomputation ──→ Simulated Output
```

**Capabilities unlocked:**
- Weight sensitivity analysis: "What if economy weight is 0.15 instead of 0.12?"
- Threshold testing: "Would a lower unemployment threshold trigger earlier intervention?"
- Investment impact: "What is the projected PIS change if health budget increases 20%?"
- Policy comparison: "Run 3 policy scenarios side by side"

**Contract format:**
```json
{
  "simulation_id": "sim-2026-001",
  "scenario_name": "Health budget increase 20%",
  "overrides": {
    "config": { "health_weight": 0.15 },
    "indicators": {
      "DZ-16": { "health_budget": { "value": 12000000000, "source": "simulation" } }
    }
  },
  "expected_output": ["PIS", "health_score", "recommendations"]
}
```

### 13.5 Forecasting Integration

**Contract:** PIE → Feature Service (historical) + Evolution Windows → Forecasting Models

**Extension point:** The Feature Service stores all historical indicator data. The Evolution Engine computes multi-window trajectories. Forecasting models consume both:

```
Feature Service (Time-series) ──→ ML Forecasting Model ──→ Predicted Indicators
Evolution Windows (Trajectory) ──→ ML Forecasting Model ──→ Predicted PIS
                                       ↓
                              PIE Scoring Engine (recomputed with predicted values)
                                       ↓
                              Forward-looking Intelligence Products
```

**Capabilities unlocked:**
- 12-month PIS forecast with confidence intervals
- Early warning: "PIS projected to drop below 50 in 6 months at current trajectory"
- Budget planning: "Projected education score in 2027 based on current enrollment trends"
- Risk prediction: "Probability of healthcare capacity risk in next quarter"

### 13.6 Decision Engine Integration

**Contract:** PIE → Recommendations + Risks → Decision Engine

**Extension point:** The Recommendation Engine produces structured recommendations. The Decision Engine consumes them with full evidence chains:

```
Recommendation Engine ──→ Decision Engine Queue
Risk Engine           ──→ Decision Engine Alerts
Executive Summary     ──→ Decision Engine Context
      ↓
Decision Engine
  ├── Accepts/rejects/defers recommendations
  ├── Assigns to decision makers
  ├── Tracks implementation status
  └── Monitors post-decision impact (via PIE recomputation)
```

**Contract format:**
```json
{
  "decision_input": {
    "recommendation_id": "rec-dz-33-2026-001",
    "province_id": "DZ-33",
    "type": "immediate_intervention",
    "priority_score": 87,
    "evidence_ids": ["ev-dz-33-rec-20260629-001"],
    "explainability": {
      "l1": { ... },
      "l2": { ... },
      "l3": { ... },
      "l4": { ... }
    }
  },
  "decision_state": "pending" | "accepted" | "rejected" | "deferred" | "implementing" | "completed",
  "decision_maker": null | user_id,
  "decision_notes": null | string,
  "implementation_tracking": {
    "milestones": [],
    "progress_pct": 0,
    "last_updated": null
  }
}
```

---

## 14. Architecture Review

### 14.1 Strengths

| Area | Strength |
|---|---|
| **Deterministic scoring** | All core scores are computed through transparent, reproducible formulas — no black-box ML. Any score can be manually verified with a calculator. |
| **Explainability-by-default** | Four-level explainability (L1–L4) is not optional — it is enforced at the API gateway level. Every endpoint must return L1 and provide drill-down links for L2–L4. |
| **Evidence gate** | The Evidence Engine acts as a mandatory validation gate. No intelligence product can be published without a validated evidence record. This is the strongest trust mechanism in the architecture. |
| **Ontology-driven** | All definitions, weights, thresholds, and relationships are managed through the Ontology & Config Service. No hardcoded business logic exists in any service. |
| **Decoupled services** | 13 services communicate through Kafka events and defined data contracts. Any service can be replaced, upgraded, or scaled independently. |
| **Cross-province intelligence** | Beyond simple similarity, the engine discovers competing, emerging, declining, and outlier provinces — providing strategic context beyond individual province analysis. |
| **Health evolution** | Multi-window (30d/90d/1yr/5yr) historical tracking with trajectory projection enables both tactical and strategic decision making. |
| **Configurable sovereignty** | All weights, thresholds, and policies are government-configurable via the Ontology & Config admin API. No algorithmic decisions are hardcoded. |
| **Future-proof data contracts** | PIE reads from a defined Gold layer. Source data can be swapped from mock to real without changing a single service. Shadow mode enables parallel validation. |
| **AI extension points** | LLM, Knowledge Graph, Digital Twin, Simulation, Forecasting, and Decision Engine are all designed as consumers of PIE outputs — no architectural changes needed. |

### 14.2 Weaknesses

| Area | Weakness | Mitigation |
|---|---|---|
| **Data quality dependency** | PIE's intelligence quality is directly bounded by the quality of input data. Garbage in, garbage out. | Evidence Engine catches quality issues at validation time. Missing data penalties are transparent. |
| **Cold start for new provinces** | New provinces have no historical data for trend detection, evolution windows, or trajectory projection. | Initial scores use national averages with wide confidence intervals. History accumulates over time. |
| **Computation latency for full pipeline** | Full pipeline (all 58 provinces, all services) takes up to 15 minutes. Not real-time. | Event-driven computation for critical paths (risks, evidence validation). Daily batch for full pipeline. |
| **Weight configuration complexity** | 12 dimension weights + per-dimension indicator weights = 80+ configurable parameters. Risk of configuration errors. | Validation rules prevent out-of-range weights. Config versioning enables rollback. Shadow mode detects anomalous outputs. |
| **Cross-province classification sensitivity** | Small score changes near cluster boundaries can trigger reclassification, causing perception of volatility. | Classification changes require ≥ 2 consecutive computation cycles with consistent results before taking effect. |
| **Evolution trajectory linearity assumption** | Trajectory projection assumes linear trend continuation, which may miss nonlinear shifts. | Regime change detection flags structural breaks. Trajectory confidence decreases with window length. |
| **Evidence storage growth** | Evidence records for every intelligence product × 58 provinces × daily recomputation could reach 1TB+/year. | Evidence retention policies with automatic archival of records > 12 months old. Separate evidence store instance. |
| **Language complexity** | All intelligence products must be generated in Arabic, French, and English — tripling storage and computation for text fields. | Template-based generation for L1/L2 text. Translation pipeline for dynamic content. Storage in normalized format with language as partition key. |

### 14.3 Missing Enterprise Features

| Feature | Priority | Description | Suggested Addition |
|---|---|---|---|
| **Data quality dashboard** | High | Real-time visibility into data completeness, freshness, source reliability, and quality trends per province and per dimension | Add Data Quality Monitor service that consumes Evidence Engine validation results |
| **ML model monitoring** | Medium | For v1.5 ML components (anomaly detection, forecasting), track prediction drift, accuracy, and feature importance | Add Model Registry and Monitor with automated retraining triggers |
| **A/B testing framework** | Medium | Allow running two weight/threshold configurations in parallel and comparing outputs | Add Experiment Runner service that provisions shadow PIE instances |
| **Cost optimization** | Low | Track computation cost per province per service and recommend resource allocation | Add Cost Analyzer that reads Spark execution logs and ClickHouse query metrics |
| **User feedback loop** | Medium | Allow decision makers to rate intelligence products (helpful/not helpful, accurate/inaccurate) | Add Feedback Service with per-evidence rating and automated model retraining triggers |
| **Natural language query** | Low | Allow executives to ask questions in Arabic ("Why is unemployment rising in Tizi Ouzou?") | AI Engine integration → LLM generates SQL → Query Engine returns results → PIE summarizes |
| **Automated report generation** | Medium | Generate scheduled PDF/HTML intelligence briefings for each province | Add Report Generator that composes PIE outputs into templated documents |
| **Alert fatigue management** | Low | Prioritize and deduplicate alerts when multiple risks/insights fire simultaneously | Add Alert Router with severity-based suppression, grouping, and escalation policies |

### 14.4 Scalability Concerns

| Concern | Current Limit | Scaling Strategy |
|---|---|---|
| **Neo4j write throughput** | ~1,000 writes/second | Batch graph sync operations. Use write-back queue during peak computation. |
| **ClickHouse storage growth** | ~2TB/year for time-series + ~1TB/year for evolution snapshots | Implement automatic data tiering: hot (SSD, 90 days), warm (HDD, 1 year), cold (S3, 5+ years). |
| **Kafka partition count** | 12 PIE topics × partition count | Monitor consumer lag. Add partitions per topic as province count increases. Consider topic compaction for stateful events. |
| **Evidence store query performance** | Evidence records grow by ~500K/day | Partition by province_id + month. Add TTL-based archival. Use read replicas for explainability L4 queries. |
| **Redis cache memory** | ~10GB for hot data | Increase Redis cluster size. Implement LFU eviction with dynamic key prioritization based on access frequency. |
| **Full pipeline duration** | ~15 minutes for 58 provinces | Parallelize per-province computation. Add Spark cluster autoscaling. Migrate to event-driven computation for high-priority provinces. |
| **API gateway throughput** | ~1,000 req/s target | Horizontal scaling. Add CDN caching for executive summaries (which change at most daily). |

### 14.5 Future Improvements (Roadmap)

| Improvement | Phase | Estimated Effort | Impact |
|---|---|---|---|
| **Predictive scoring** — forecast PIS 12 months ahead with ML | v2.0 | 3 months | High — enables proactive rather than reactive governance |
| **What-if simulation** — modify indicators/weights and recompute on demand | v2.5 | 4 months | High — policy impact analysis before implementation |
| **Automated weight tuning** — optimize dimension weights against historical outcomes | v2.5 | 2 months | Medium — removes manual weight configuration burden |
| **Real-time event-driven computation** — recompute on data arrival instead of daily batch | v3.0 | 6 months | High — eliminates latency between data collection and intelligence |
| **Multi-ministry data federation** — onboard all 12+ ministries to PIE Gold layer | v3.0 | 8 months | High — full national coverage |
| **Cross-national benchmarking** — compare Algerian provinces to peer regions in MENA | v3.0+ | 6 months | Medium — strategic context beyond national borders |
| **Automated evidence expiry and regeneration** — proactive recalculation before intelligence products go stale | v2.0 | 2 months | Medium — maintains data freshness automatically |
| **Executive war room** — real-time PIE dashboard with alerting, drill-down, and collaboration | v3.0 | 4 months | High — transforms PIE into a command center |

---

**Document Owner:** AI Architecture Team
**Last Updated:** 2026-06-29
**Version:** 2.0 — Enhanced with Executive Summary Generator, Province Intelligence Score, Evidence Engine, Cross-Province Intelligence, Health Evolution, 4-Level Explainability, AI Integration Extension Points, and Architecture Review
