# Government Data Strategy — Monadhama

**Doc ID:** GDS-001
**Version:** 1.0
**Status:** Internal — Data Architecture
**Classification:** Confidential

---

## 1. Executive Summary

Monadhama is only as trustworthy as its data foundation. Without a rigorous data strategy, every AI insight, every priority score, and every decision recommendation is built on sand.

This document defines how data enters the system, how it is validated, how it is maintained, how it is traced, and — most critically — how every value can be **proven trustworthy** to a government decision maker who stakes national resources on the platform's output.

The strategy covers 24 government domains, 150+ data source types, a quality framework with 6 dimensions, and a lineage model that traces every data point to its origin.

---

## 2. Data Domains

### 2.1 Domain Catalog

Each domain is assigned a Domain ID (`DOM-XX`) for cross-referencing across the platform.

| ID | Domain | Criticality | Update Frequency | Core Entities |
|---|---|---|---|---|
| DOM-01 | Population | Critical | Annual (census), Monthly (registry) | Citizens, Households, Migration, Density |
| DOM-02 | Economy | Critical | Quarterly | GDP, Sectors, Inflation, Trade Balance |
| DOM-03 | Employment | Critical | Quarterly | Labor Force, Unemployment, Jobs, Wages |
| DOM-04 | Education | High | Annual | Schools, Universities, Enrollment, Literacy |
| DOM-05 | Healthcare | Critical | Quarterly | Hospitals, Beds, Diseases, Mortality |
| DOM-06 | Infrastructure | High | Annual | Roads, Bridges, Utilities, Public Buildings |
| DOM-07 | Agriculture | High | Annual (seasonal) | Crops, Livestock, Irrigation, Food Security |
| DOM-08 | Environment | Medium | Monthly | Air Quality, Forests, Waste, Biodiversity |
| DOM-09 | Climate | Medium | Daily/Seasonal | Temperature, Rainfall, Drought, Emissions |
| DOM-10 | Transportation | High | Monthly | Traffic, Public Transit, Logistics, Accidents |
| DOM-11 | Justice | High | Monthly | Courts, Cases, Legal Aid, Prisons |
| DOM-12 | Crime & Security | High | Monthly | Incidents, Police, Border Security, Cyber |
| DOM-13 | Energy | Critical | Monthly | Production, Consumption, Grid, Renewables |
| DOM-14 | Finance & Budget | Critical | Quarterly | National Budget, Revenue, Spending, Debt |
| DOM-15 | Housing | Medium | Annual | Housing Stock, Prices, Construction, Social Housing |
| DOM-16 | Digital Transformation | Medium | Annual | E-Government, Connectivity, Digital Literacy |
| DOM-17 | Tourism | Medium | Monthly | Arrivals, Revenue, Hotels, Cultural Sites |
| DOM-18 | Water | Critical | Monthly (real-time for dams) | Resources, Dams, Distribution, Quality |
| DOM-19 | Industry | High | Quarterly | Production, Manufacturing, Industrial Zones |
| DOM-20 | Trade | High | Monthly | Exports, Imports, Customs, Balance of Trade |
| DOM-21 | Social Development | Medium | Annual | Poverty, Inequality, Social Programs, Pensions |
| DOM-22 | Government Projects | Critical | Quarterly | Public Investment, Infrastructure Projects |
| DOM-23 | Public Procurement | High | Monthly | Tenders, Contracts, Vendors, Compliance |
| DOM-24 | Local Government | Medium | Annual | Municipalities, Local Budgets, Services |
| DOM-25 | Civil Protection | High | Real-time/Daily | Emergency Response, Disasters, Fire, Rescue |
| DOM-26 | Telecommunications | Medium | Quarterly | Coverage, Bandwidth, Subscribers, Pricing |
| DOM-27 | Elections | Low (Periodic) | Event-based | Voter Registration, Turnout, Results |
| DOM-28 | Culture & Heritage | Low | Annual | Museums, Monuments, Archives, Cultural Events |

### 2.2 Domain Deep Dives

#### DOM-01: Population

**Why it matters:** Population is the denominator for nearly every indicator. Without accurate population data, per-capita metrics are meaningless, resource allocation is blind, and policy impact cannot be measured.

**Core entities:**
- Citizen (individual record, anonymized at aggregate level)
- Household (size, composition, location)
- Population Estimate (province-level, updated annually)
- Population Projection (5-year, 10-year, 25-year horizons)
- Migration Flow (inter-province, international)
- Birth Registration (daily/monthly counts)
- Death Registration (daily/monthly counts)
- Demographic Profile (age pyramid, gender ratio, dependency ratio)

**Frequency:**
- National census: Every 10 years (last: 2022, next: 2032)
- Annual estimates: Each July
- Vital statistics (births/deaths): Monthly, from civil registry
- Migration data: Quarterly, from border control and administrative records

**Primary sources:**
- Office National des Statistiques (ONS) — census, surveys, estimates
- Ministry of Interior — civil registration, national ID registry
- Ministry of Foreign Affairs — diaspora registration
- UN DESA — population projections (cross-reference)

#### DOM-02: Economy

**Why it matters:** Economic data determines budget allocation, investment strategy, and social policy. It is the most scrutinized domain in government.

**Core entities:**
- Gross Domestic Product (nominal, real, per capita)
- GDP by Sector (hydrocarbons, construction, services, agriculture, manufacturing)
- Economic Growth Rate (quarterly, annual)
- Inflation Rate (CPI, food inflation, core inflation)
- Balance of Trade (exports, imports, by product category)
- Foreign Exchange Reserves
- External Debt
- Foreign Direct Investment (by sector, by country)
- Domestic Investment
- Business Registry (enterprises, by size, by sector)
- Informal Economy Estimate

**Frequency:**
- GDP: Quarterly (with annual revision)
- Inflation: Monthly
- Trade: Monthly
- FDI: Quarterly
- Business registry: Continuous

**Primary sources:**
- Ministry of Finance — national accounts, budget execution
- Bank of Algeria — monetary data, reserves, inflation
- ONS — economic surveys, CPI
- National Investment Agency — FDI data
- IMF — Article IV consultations (cross-reference)
- World Bank — economic indicators (cross-reference)

#### DOM-03: Employment

**Why it matters:** Employment is the most politically sensitive indicator. Youth unemployment, in particular, drives social stability.

**Core entities:**
- Labor Force (total, by gender, by age group)
- Employment (by sector, by formal/informal, by province)
- Unemployment (total, youth, long-term, by education level)
- Underemployment
- Labor Force Participation Rate
- Average Wage (by sector, by province)
- Minimum Wage
- Job Creation (by sector, by province)
- Job Vacancies
- Vocational Training (enrollment, completion, placement)
- Informal Employment Estimate

**Frequency:**
- Labor force survey: Quarterly
- Administrative data (social security): Monthly
- Employment agency registrations: Monthly

**Primary sources:**
- ONS — Labor Force Survey (Enquête Emploi)
- Ministry of Labor — administrative data
- National Social Security Fund (CNAS) — contributor registry
- National Employment Agency (ANEM) — job seeker registry
- ILO — cross-reference

#### DOM-04: Education

**Why it matters:** Education is the primary driver of long-term economic development and social mobility.

**Core entities:**
- School (primary, middle, secondary by name, location, capacity)
- University (public, private, by faculty, by enrollment)
- Student Enrollment (by level, by gender, by province)
- Teacher Count (by qualification, by subject)
- Student-Teacher Ratio
- Literacy Rate (by age group, by gender, by province)
- Graduation Rate (by level, by province)
- Exam Performance (BAC results, by school, by province)
- School Infrastructure (electricity, water, internet, sanitation)
- Vocational Training Center (capacity, programs, placement rate)
- Research Output (publications, patents by university)

**Frequency:**
- Enrollment: Annual (October census)
- Exam results: Annual (July)
- Infrastructure: Annual
- Literacy: Every 5 years (survey-based)

**Primary sources:**
- Ministry of Education — school registry, enrollment, exams
- Ministry of Higher Education — university registry, enrollment
- Ministry of Vocational Training — training center data
- ONS — literacy survey
- UNESCO — cross-reference

#### DOM-05: Healthcare

**Why it matters:** Healthcare quality directly affects citizen trust in government. The COVID-19 pandemic revealed the critical need for real-time health data.

**Core entities:**
- Hospital (CHU, EHS, district hospital, by beds, by specialty)
- Clinic (polyclinic, maternity, by capacity)
- Primary Healthcare Center (dispensary, by services)
- Hospital Bed Capacity (total, ICU, by province)
- Medical Personnel (doctors, nurses, specialists, by province)
- Disease Registry (communicable, non-communicable, by province)
- Vaccination Coverage (by vaccine, by age group, by province)
- Maternal Mortality Rate (by province)
- Infant Mortality Rate (by province)
- Life Expectancy (by gender, by province)
- Pharmaceutical Stock (essential medicines availability)
- Health Insurance Coverage

**Frequency:**
- Hospital capacity: Quarterly
- Disease surveillance: Weekly (reportable diseases), Daily (outbreaks)
- Personnel registry: Annual
- Mortality statistics: Annual

**Primary sources:**
- Ministry of Health — hospital registry, disease surveillance, personnel
- ONS — mortality, life expectancy
- WHO — cross-reference
- INSP (National Institute of Public Health) — disease surveillance
- Pharmaceutical regulatory agency — medicine registry

#### DOM-06: Infrastructure

**Why it matters:** Infrastructure quality determines economic connectivity and quality of life. Poor infrastructure is the most common citizen complaint.

**Core entities:**
- Road (by type: highway, national, provincial, local; by condition)
- Bridge (by location, condition, load capacity)
- Public Building (school, hospital, administrative — by condition)
- Port (commercial, fishing, by capacity)
- Airport (international, domestic, by passenger volume)
- Railway (by segment, by electrification, by passenger/freight)
- Public Housing (by type, by condition, by occupancy)
- Public Park and Green Space
- Sports Facility (stadium, sports hall, by capacity)
- Waste Management Facility (landfill, recycling plant, transfer station)

**Frequency:**
- Road condition: Annual (visual survey), Every 5 years (detailed assessment)
- Building condition: Annual (visual), Every 10 years (structural)
- Port/airport traffic: Monthly

**Primary sources:**
- Ministry of Public Works — road registry, bridge registry
- Ministry of Housing — building registry, housing census
- Ministry of Transport — port/airport/railway data
- GIS analysis — satellite imagery for road condition assessment
- OpenStreetMap — community-contributed infrastructure data (cross-reference)

#### DOM-07 through DOM-28

*[Each domain follows the same structure. To conserve document length, remaining domains are summarized in the domain catalog above. Detailed deep-dives for all 28 domains are maintained in the Monadhama Data Catalog — see `/docs/data/domain-registry/`. The pattern established above applies uniformly.]*

---

## 3. Data Quality Framework

### 3.1 Quality Dimensions

Every dataset ingested into Monadhama is scored across six dimensions. Each dimension receives a score of 0.0–1.0, and the six scores are composited into an overall **Data Trust Score**.

#### 3.1.1 Accuracy

**Definition:** The degree to which data correctly reflects the real-world phenomenon it represents.

**Measurement:**
- Cross-reference with authoritative source: Compare a random sample (n≥100 or 5%, whichever is larger) against the source of truth
- Outlier detection: Flag values exceeding 3 standard deviations from historical mean
- Logical consistency: Check for impossible values (e.g., female mortality rate for prostate cancer, birth rate > 500 per 1,000)
- Inter-source validation: When two sources report the same metric, compute divergence

**Scoring:**
```
Accuracy = 1.0 - (error_count / sample_size)
Accuracy ≥ 0.99: Pass
Accuracy ≥ 0.95: Warning
Accuracy < 0.95: Reject
```

**Example rule:** Population figures from ONS must not diverge from Ministry of Interior registry by more than 2% at the province level. Any divergence > 2% triggers manual review.

#### 3.1.2 Completeness

**Definition:** The proportion of expected data points that are actually present.

**Measurement:**
- Field-level: For each record, what % of required fields are populated?
- Record-level: For each dataset, what % of expected records are present?
- Temporal: For time-series data, what % of expected time periods are covered?
- Geographic: For spatial data, what % of geographic units are covered?

**Scoring:**
```
Completeness = populated_required_fields / total_required_fields
Completeness ≥ 0.98: Pass
Completeness ≥ 0.90: Warning
Completeness < 0.90: Flag for imputation or rejection
```

#### 3.1.3 Freshness

**Definition:** The age of the data relative to the expected update schedule.

**Measurement:**
- Days since last update
- Comparison to expected update cadence (e.g., quarterly data should be < 120 days old)
- Staleness score: (actual_age_days / expected_max_age_days), capped at 2.0

**Scoring:**
```
Freshness = max(0, 1.0 - (staleness_score - 1.0))
Freshness ≥ 0.9: Current
Freshness ≥ 0.7: Acceptable
Freshness ≥ 0.4: Stale — flag in UI
Freshness < 0.4: Expired — do not use for decisions
```

**Example:** If quarterly GDP data is expected within 90 days of quarter end, and the latest data is 150 days old:
- Staleness = 150/90 = 1.67
- Freshness = max(0, 1 - (1.67 - 1)) = 0.33
- Status: Expired — do not use for AI recommendations

#### 3.1.4 Consistency

**Definition:** The degree to which data is internally consistent and consistent across related datasets.

**Measurement:**
- Internal consistency: Sum of provincial populations ≈ national population (±1%)
- Cross-temporal consistency: Year-over-year changes within expected bounds
- Cross-source consistency: Values agree with alternative sources within tolerance
- Format consistency: Data types, units, and codes match schema specifications

**Scoring:**
```
Consistency = 1.0 - (inconsistency_count / total_checks)
```

#### 3.1.5 Reliability

**Definition:** The historical trustworthiness of the data source.

**Measurement:**
- Source track record: % of past submissions that passed quality checks
- Collection methodology score (see table below)
- Frequency of corrections/retractions
- Independence from political pressure (subjective, assessed quarterly)

**Collection Methodology Scoring:**

| Method | Score | Examples |
|---|---|---|
| Official census or full enumeration | 1.0 | National census, business registry |
| Scientifically designed survey | 0.9 | Labor force survey, MICS |
| Administrative registry (mandatory) | 0.85 | Civil registration, tax records |
| Administrative registry (voluntary) | 0.70 | Professional association data |
| Satellite-derived estimate | 0.65 | Nightlight-based GDP proxy |
| Modeled/Imputed data | 0.50 | Statistical imputation |
| Expert estimate | 0.40 | Ministry official's best guess |
| Media/News report | 0.25 | Unverified reporting |
| Social media/Crowdsourced | 0.15 | Unstructured public data |

**Scoring:**
```
Reliability = source_track_record × methodology_score
```

#### 3.1.6 Traceability

**Definition:** The ability to trace every data point back to its original source.

**Measurement:**
- Source documented: Is the original source recorded?
- Collection method documented: Is the methodology recorded?
- Transformations documented: Are all ETL steps logged?
- Timestamp chain: Is every modification timestamped?
- Owner documented: Is the data steward identified?

**Scoring:**
```
Traceability = (documented_chain_links / total_expected_links)
```

### 3.2 Composite Data Trust Score

```
Data_Trust_Score = (Accuracy × 0.25) + (Completeness × 0.15) + (Freshness × 0.20) + (Consistency × 0.10) + (Reliability × 0.20) + (Traceability × 0.10)
```

**Interpretation:**
| Score | Label | Use |
|---|---|---|
| ≥ 0.90 | Trusted | Can be used for decisions and AI training |
| 0.75–0.89 | Conditional | Can be used with warning label |
| 0.50–0.74 | Caution | Can be displayed but not used for AI recommendations |
| < 0.50 | Untrusted | Not displayed to users; logged for admin review |

---

## 4. Metadata Standard

Every dataset, every indicator, and every individual value in Monadhama carries the following metadata envelope. This is non-negotiable — no data enters the system without it.

### 4.1 Dataset-Level Metadata

```yaml
dataset_id: "ONS-POP-2025-ANNUAL"
dataset_name: "Population Estimates by Province 2025"
domain: "DOM-01"
subdomain: "Population Estimates"

source:
  organization: "Office National des Statistiques"
  department: "Demography Division"
  source_type: "Official Statistics"
  collection_method: "Census-based projection with administrative data adjustment"
  contact: "demographie@ons.dz"
  data_license: "Open Government License — Algeria"
  terms_of_use: "Attribution required. Not for commercial redistribution."

temporal:
  reference_date: "2025-07-01"
  time_coverage_start: "2025-01-01"
  time_coverage_end: "2025-12-31"
  update_frequency: "Annual"
  next_expected_update: "2026-07-01"

geographic:
  coverage: "National, Provincial (58 wilayas)"
  lowest_admin_level: "Wilaya"
  coordinate_system: "WGS84"

quality:
  data_trust_score: 0.94
  accuracy_score: 0.98
  completeness_score: 1.0
  freshness_score: 0.92
  consistency_score: 0.95
  reliability_score: 0.90
  traceability_score: 0.95
  last_quality_check: "2026-06-15"
  quality_check_method: "Cross-reference with Ministry of Interior registry"
  known_issues: "Southern provinces (DZ-33, DZ-37) have higher estimation uncertainty due to nomadic populations"

provenance:
  ingested_at: "2026-06-20T14:30:00Z"
  ingested_by: "monadhama-ingestion-service"
  original_filename: "population_province_2025.xlsx"
  original_format: "XLSX"
  record_count: 58
  pipeline_version: "pipeline/ons-population/v2.3"
  checksum: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

stewardship:
  data_owner: "ONS Demography Division"
  data_steward: "Dr. Fatima Benaissa"
  data_custodian: "Ministry of Digital Transition"
  approving_authority: "National Statistics Council"

access:
  classification: "PUBLIC"
  access_restriction: "None"
  can_be_used_for_ai: true
  can_be_shared_cross_ministry: true
```

### 4.2 Indicator-Level Metadata

Every indicator value displayed in the UI carries a minimal metadata payload:

```json
{
  "indicator": "population",
  "value": 45606000,
  "unit": "persons",
  "province": "NATIONAL",
  "year": 2025,
  "source": "ONS Annual Population Estimates",
  "source_id": "ONS-POP-2025-ANNUAL",
  "confidence": 0.94,
  "last_updated": "2026-06-20",
  "status": "verified",
  "methodology": "Census-based projection with administrative adjustment",
  "revision_history": [
    {"date": "2026-06-20", "change": "+12,000", "reason": "Birth registration reconciliation"}
  ]
}
```

### 4.3 Value-Level Provenance

For AI-generated outputs and derived indicators, every value in a response carries a provenance fingerprint:

```json
{
  "value": 2.1,
  "unit": "beds_per_1000",
  "province": "DZ-31",
  "provenance": [
    {
      "source": "Ministry of Health — Hospital Registry 2025",
      "dataset_id": "MOH-HOSP-2025",
      "value": 3056,
      "unit": "total_beds",
      "accessed": "2026-06-15"
    },
    {
      "source": "ONS — Population Estimate 2025",
      "dataset_id": "ONS-POP-2025-ANNUAL",
      "value": 1454566,
      "unit": "population",
      "accessed": "2026-06-15"
    }
  ],
  "computation": "total_beds / population × 1000",
  "computed_at": "2026-06-15T10:00:00Z"
}
```

---

## 5. Update Strategy

### 5.1 Ingestion Methods

Data enters Monadhama through one of six channels. Each channel has a defined SLA and quality validation path.

#### 5.1.1 Manual Upload

| Attribute | Specification |
|---|---|
| **When used** | One-time data loads, pilot data, data from sources with no electronic delivery |
| **Format** | CSV (UTF-8), XLSX, JSON, Parquet |
| **Interface** | Admin web UI (drag-and-drop) + CLI script |
| **Validation** | Schema check → quality gate → preview → confirmation |
| **SLA** | Available within 15 minutes of upload |
| **Governance** | Requires data steward approval for production data |
| **Example** | Historical province data from a ministry that only has PDF reports |

#### 5.1.2 API Integration

| Attribute | Specification |
|---|---|
| **When used** | Government open data portals, international organizations, real-time feeds |
| **Protocol** | REST (JSON/XML), SOAP (legacy), GraphQL |
| **Authentication** | API key, OAuth 2.0 client credentials, mTLS |
| **Scheduling** | Airflow-managed periodic polling, webhook for event-driven |
| **Retry** | Exponential backoff: 30s → 2m → 10m → 30m → 2h, max 5 retries |
| **Failure** | Alert after 3 consecutive failures, disable after 5 |
| **SLA** | Varies by endpoint: real-time to daily |
| **Example** | World Bank API, ONS open data portal |

#### 5.1.3 SFTP / Secure File Transfer

| Attribute | Specification |
|---|---|
| **When used** | Ministry data deliveries, batch exports from government systems |
| **Protocol** | SFTP (preferred), FTPS, SCP |
| **Schedule** | Pull-based (Monadhama initiates), Push-based (ministry sends) |
| **File pattern** | Glob-based file matching (e.g., `health_stats_*.csv`) |
| **Post-processing** | Archive processed files, quarantine failed files |
| **SLA** | Within 1 hour of file arrival |
| **Example** | Monthly health statistics from Ministry of Health |

#### 5.1.4 Database Replication (CDC)

| Attribute | Specification |
|---|---|
| **When used** | Direct connection to government operational databases |
| **Technology** | Debezium + Kafka Connect for CDC (Change Data Capture) |
| **Supported DB** | PostgreSQL, Oracle, SQL Server, MySQL |
| **Initial load** | Full table snapshot, then continuous CDC |
| **Latency** | < 1 second from source commit to Monadhama availability |
| **Governance** | Requires formal data-sharing MOU with source ministry |
| **SLA** | Real-time for critical systems |
| **Example** | Birth registration database, tax payment system |

#### 5.1.5 Web Scraping / PDF Extraction

| Attribute | Specification |
|---|---|
| **When used** | Government publishes data only as PDFs or HTML tables |
| **Technology** | Apache Tika for PDF, Playwright for JS-rendered pages, Camelot for PDF tables |
| **Quality risk** | HIGH — this is the least reliable ingestion method |
| **Validation** | Every extracted dataset requires manual spot-check before production use |
| **Fallback** | Flag as "extracted — not verified" until approved |
| **SLA** | Within 24 hours of publication |
| **Example** | Budget documents published only as PDFs on ministry websites |

#### 5.1.6 IoT / Sensor Networks

| Attribute | Specification |
|---|---|
| **When used** | Environmental sensors, dam level monitors, traffic cameras, smart city sensors |
| **Protocol** | MQTT, AMQP, HTTP/2 streaming |
| **Middleware** | Kafka for stream buffering and replay |
| **Processing** | Real-time aggregation window (5-minute, 1-hour, daily) |
| **Storage** | ClickHouse for time-series, reduced-resolution after 90 days |
| **SLA** | < 1 minute from sensor reading to dashboard |
| **Example** | Dam water level sensors, air quality monitoring stations |

### 5.2 Update Frequency Matrix

| Frequency | Domains | Mechanism | SLA |
|---|---|---|---|
| Real-time (< 1 min) | DOM-25 Civil Protection, DOM-13 Energy (grid) | CDC, IoT, Webhook | 99.9% uptime |
| Daily | DOM-12 Crime, DOM-01 Vital Statistics | API, SFTP | Within 2 hours |
| Weekly | DOM-05 Disease Surveillance | API, Manual | Within 24 hours |
| Monthly | DOM-10 Transportation, DOM-17 Tourism, DOM-20 Trade, DOM-18 Water | SFTP, API | Within 48 hours |
| Quarterly | DOM-02 Economy, DOM-03 Employment, DOM-14 Finance, DOM-22 Projects | API, SFTP | Within 7 days |
| Annual | DOM-01 Census, DOM-04 Education, DOM-07 Agriculture | Manual, SFTP | Within 30 days |
| Event-based | DOM-27 Elections, ad-hoc surveys | Manual | Within 24 hours of event |

---

## 6. Data Lineage

### 6.1 Lineage Model

Every value in Monadhama carries a complete lineage chain from source to display. The lineage system answers three questions:

1. **Where did this number come from?** — Original source document, database, or API call
2. **What transformations were applied?** — Every ETL step logged with parameters
3. **Who touched it?** — Every human reviewer, every automated pipeline, timestamps

### 6.2 Lineage Architecture

```
[Source System] → [Extraction] → [Validation] → [Transformation] → [Storage] → [API] → [UI Display]
       ↓               ↓              ↓               ↓                ↓          ↓           ↓
   Source ID       Job ID        Check ID         Transform ID     Table ID    Query ID   Session ID
   Timestamp       Duration      Results          Parameters       Row ID      Params     User ID
   Checksum        Records       Score             Code Version     Version     Cache Key  Timestamp
```

Each arrow in the lineage chain generates a lineage event stored in the lineage store (ClickHouse):

```json
{
  "lineage_id": "lin-a1b2c3d4",
  "event_type": "transformation",
  "source_ids": ["dat-20260601-001", "dat-20260601-002"],
  "output_id": "ind-bed-per-capita-DZ-31-2025",
  "transform_id": "etl-health-beds-per-capita/v1",
  "transform_code_version": "git-sha-abc123",
  "parameters": {
    "formula": "beds_total / population * 1000",
    "population_dataset": "ONS-POP-2025-ANNUAL",
    "beds_dataset": "MOH-HOSP-2025"
  },
  "executed_at": "2026-06-15T10:00:00Z",
  "execution_time_ms": 234,
  "executed_by": "monadhama-pipeline-batch",
  "verified_by": null,
  "notes": null
}
```

### 6.3 User-Facing Lineage

When a decision maker sees a number in the UI, they can click a "View Sources" button to see:

```
Indicator: Hospital beds per 1,000 residents — Oran Province
Value: 2.1

Source chain:
┌──────────────────────────────────────────────────────────┐
│ ① Ministry of Health — Hospital Registry 2025             │
│   Total beds: 3,056  ✓ Verified 2026-01-15               │
│   https://data.sante.gov.dz/registry/hospitals           │
├──────────────────────────────────────────────────────────┤
│ ② ONS — Population Estimate 2025                          │
│   Population: 1,454,566  ✓ Verified 2026-02-01            │
│   https://www.ons.dz/population/estimates-2025           │
├──────────────────────────────────────────────────────────┤
│ ③ Computation: 3,056 / 1,454,566 × 1,000 = 2.1          │
│   Executed: 2026-06-15 10:00:00 UTC                      │
│   Pipeline: health-beds-per-capita/v1                    │
└──────────────────────────────────────────────────────────┘
Confidence: 0.94  |  Last updated: 2026-06-15  |  Next update: 2026-09-15
```

### 6.4 Immutable Lineage Log

The lineage store is append-only with hash chaining for tamper evidence:

```
Lineage Block n:
  ├── Previous Block Hash: sha256(Block n-1)
  ├── Events: [...]
  └── Block Hash: sha256(prev_hash + events)
```

This creates an immutable chain that can be audited independently.

---

## 7. Missing Data Strategy

### 7.1 Data States

Every data point in Monadhama exists in exactly one of these states:

| State | Definition | UI Treatment |
|---|---|---|
| **Available** | Data present and within freshness SLA | Display normally |
| **Stale** | Data present but beyond freshness SLA | Display with warning icon + "Data may be outdated" |
| **Missing** | No data exists for this indicator/time/place | Show "No data available" with ghost placeholder |
| **Incomplete** | Partial data (e.g., 40 of 58 provinces) | Display available data with "X of Y provinces reporting" |
| **Conflicting** | Multiple sources disagree beyond tolerance | Display both values with "Sources conflict" and divergence |
| **Imputed** | Value estimated from related data | Display with italic + "Estimated" badge + imputation method |
| **Rejected** | Failed quality checks, not displayed | Not visible in user-facing views; logged for admin |
| **Pending** | Ingestion in progress or awaiting validation | Show skeleton/loading state |

### 7.2 Behavioral Rules by State

#### 7.2.1 Missing Data

**Detection:**
- No record for (province, indicator, time) in the indicators table
- Source confirmed the data does not exist (not just not yet ingested)

**Behavior:**
- Score engine: Exclude from dimension score; reduce dimension weight proportionally
- AI engine: Do not generate recommendations based on missing indicator
- UI: Show `—` with tooltip "This indicator is not yet available for this province"
- Dashboard: Do not include this province in rankings for this dimension
- Admin: Log missing data gap; notify data steward

**Example:** If hospital bed data is missing for Illizi (DZ-33):
- Illizi's Health dimension score is computed from available indicators only
- UI shows "3 of 5 indicators available" on the Health dimension card
- AI engine does not rank Illizi on healthcare without acknowledging the data gap

#### 7.2.2 Outdated Data

**Detection:**
- Data age exceeds 1.5× the expected update cadence
- Freshness score < 0.4

**Behavior:**
- Score engine: Reduce confidence score by 50%; apply freshness penalty α
- AI engine: Only use for trend detection if historical; exclude from current recommendations
- UI: Orange warning badge "Data from 2024 — may not reflect current conditions"
- Dashboard: Show with reduced opacity
- Admin: Generate data freshness alert; escalate to data steward

#### 7.2.3 Incomplete Data

**Detection:**
- Completeness score < 0.90
- Some geographic units missing, some time periods missing, or some fields missing

**Behavior:**
- National aggregates: Compute from available data but annotate with reporting gap
- Provincial comparisons: Exclude provinces with incomplete data from rankings for that dimension
- UI: "X of 58 provinces reporting — national figure may be incomplete"
- Score engine: Apply reliability penalty β = completeness_score

#### 7.2.4 Conflicting Data

**Detection:**
- Two or more sources report different values for the same (indicator, province, time)
- Divergence exceeds expected tolerance (typically ±5% for demographic data, ±10% for economic data)

**Resolution protocol:**
1. Log the conflict with both values and sources
2. Run automated reconciliation: check for unit errors, time period misalignment, definition differences
3. If reconciliation succeeds: use reconciled value, document the resolution
4. If reconciliation fails: escalate to data steward for manual adjudication
5. Data steward selects authoritative value, documents reasoning, sets conflict as resolved

**Behavior during conflict:**
- UI: Show both values with "Source conflict — under review" badge
- Score engine: Use most authoritative source based on reliability score; reduce confidence
- AI engine: Do not use conflicting metric for recommendations
- Decision engine: Flag any decision that depends on conflicting data

### 7.3 Imputation Framework

Imputation is used ONLY for:
1. Computing aggregate scores at national level when provincial data is partially missing
2. Historical backfill for trend analysis
3. Never for decision-critical indicators

**Methods (in order of preference):**
| Method | When Used | Examples |
|---|---|---|
| Last observation carried forward | Short gaps (< 1 cycle) | Quarterly GDP, 1 quarter missing |
| Linear interpolation | Evenly spaced time series | Annual population, 1 year missing |
| Peer group mean | Geographic gaps | Province with similar economic profile |
| Regression imputation | Correlated indicators | Estimate unemployment from GDP and education data |
| Seasonal adjustment | Periodic data with seasonal patterns | Tourism arrivals, monthly |

**Imputation is always flagged:**

```json
{
  "value": 18.5,
  "indicator": "unemployment_rate",
  "province": "DZ-33",
  "year": 2025,
  "status": "imputed",
  "imputation_method": "peer_group_mean",
  "peer_group": ["DZ-11", "DZ-37", "DZ-56"],
  "confidence_adjustment": -0.15,
  "original_confidence": 0.85,
  "adjusted_confidence": 0.70,
  "note": "Estimated from 3 peer provinces with similar economic profile"
}
```

---

## 8. Government Trust Layer

This is the most important architectural layer in Monadhama. It is the system of record that proves to every decision maker, auditor, and citizen that the numbers shown are trustworthy.

### 8.1 The Trust Contract

Every data point displayed in Monadhama makes an implicit promise:

> "This number is accurate as of [date], sourced from [organization], validated on [date], with confidence [score]. Any limitations are documented below."

The Trust Layer ensures this promise is always kept.

### 8.2 Trust Badges

Every displayed value carries one of the following badges:

| Badge | Meaning | Color |
|---|---|---|
| **Verified** | Data has been cross-checked against an authoritative source | Green checkmark |
| **Official** | Direct from government statistical system | Blue checkmark |
| **Estimated** | Computed or modeled, not directly measured | Amber calculator |
| **Imputed** | Filled in due to missing data, with noted method | Amber dashed border |
| **Unverified** | Pending human review; may still be accurate | Gray clock |
| **Conflict** | Multiple sources disagree; under review | Red exclamation |
| **Stale** | Beyond expected update date | Orange warning |

### 8.3 Trust Panel

Every number in the UI is clickable to reveal the Trust Panel:

```
┌──────────────────────────────────────────────────────────────┐
│  ⓘ  Unemployment Rate: 12.4%                                │
├──────────────────────────────────────────────────────────────┤
│  Status:        ✓ Verified                                   │
│  Source:        ONS Labor Force Survey Q1 2026               │
│  Dataset ID:    ONS-LFS-2026Q1                               │
│  Last Updated:  2026-04-15                                   │
│  Next Update:   2026-07-15                                   │
│  Confidence:    0.91  (High)                                 │
│                                                              │
│  ── Validation ──                                             │
│  ✓ Cross-referenced with CNAS contributor data               │
│  ✓ Within expected range (10-15% for this province)          │
│  ✓ No outlier flags triggered                                │
│                                                              │
│  ── Limitations ──                                            │
│  • Does not include informal sector estimate (+8-12%)        │
│  • Survey sample: 2,400 households (MoE ±2.1%)              │
│                                                              │
│  ── Revision History ──                                       │
│  2026-04-15: Initial publication (12.4%)                     │
│  2026-01-15: Q4 2025 revised from 13.1% to 12.8%            │
│              Reason: Seasonal adjustment update              │
│                                                              │
│  [View Full Lineage] [Download Source Data] [Report Issue]   │
└──────────────────────────────────────────────────────────────┘
```

### 8.4 Trust by Data Category

| Data Category | Trust Requirement | Verification Method |
|---|---|---|
| Official statistics | Highest | Every figure cross-referenced with published source |
| Derived indicators | High | Formula verified, inputs traced, logic documented |
| AI-generated insights | Medium | Source grounding verified, confidence scored, human review encouraged |
| Forecasts | Medium | Model documented, assumptions listed, confidence intervals shown |
| Real-time data | High | Sensor calibration verified, anomaly detection running |
| User-submitted data | Low | Source identity verified, flagged as unverified until reviewed |

### 8.5 Trust Escalation

If the Trust Layer detects an issue:

| Issue | Action |
|---|---|
| Data Trust Score < 0.50 | Do not display to users. Log for admin review. |
| Accuracy drop > 0.05 | Alert data steward. Flag all dependent indicators. |
| Source unavailable > 2 cycles | Escalate to data governance committee. |
| AI confidence < 0.30 | Do not surface recommendation. Request human analysis. |
| Data conflict unresolved > 7 days | Escalate to ministry-level data stewards. |

### 8.6 Government Data Quality Seal

Monadhama periodically computes a **Government Data Quality Index (GDQI)** — a single number (0–100) representing the overall health of the government's data ecosystem:

```
GDQI = weighted_average(Data_Trust_Score for all active datasets)
      × data_coverage_pct (how many expected datasets are actually flowing)
      × timeliness_factor (how many are on schedule)
      × 100
```

This index is displayed on the admin dashboard and tracked over time. It answers the question: "Is our data foundation getting better or worse?"

---

## 9. Future Evolution: National Data Platform

The data architecture described in this document is designed to evolve into a **National Data Platform (NDP)** — the government's single source of truth for all data, accessible across all ministries, with proper governance, security, and quality controls.

### 9.1 Current State (MVP)

```
[Ministry A] → [Siloed Data] → [Monadhama MVP] → [Single Use Case]
[Ministry B] → [Siloed Data]                          ↑
[Ministry C] → [Siloed Data]    One-way ingestion, ministry data ownership not formalized
```

### 9.2 Phase 2: Data Sharing Agreements

```
[Ministry A] ←→ [Data Sharing MOU] ←→ [Monadhama]
[Ministry B] ←→ [Data Sharing MOU] ←→ [Monadhama]
[Ministry C] ←→ [Data Sharing MOU] ←→ [Monadhama]

    ↓ Each ministry retains ownership of its data
    ↓ Monadhama provided as-a-service back to ministries
    ↓ Data quality responsibilities formalized in SLAs
```

**New capabilities:**
- Formal data-sharing MOUs with each ministry
- Data ownership and usage rights documented per dataset
- Monadhama becomes a data service provider to ministries
- Ministries can query Monadhama for their own data + authorized cross-ministry data

### 9.3 Phase 3: National Data Infrastructure

```
                          ┌──────────────────────────┐
                          │   NATIONAL DATA PLATFORM │
                          │                          │
[Ministry A] ←→ [Data Lake] → [Data Catalog] → [Data Marketplace]
[Ministry B] ←→ [Data Lake] → [Quality]       → [API Gateway]
[Ministry C] ←→ [Data Lake] → [Lineage]       → [Access Control]
                          │                          │
                          └──────────────────────────┘
                                    ↓
                          [Monadhama Intelligence Layer]
                          [Other Government Applications]
                          [Open Data Portal (Public)]
```

**New capabilities:**
- Cross-ministry data discovery via data catalog
- Data marketplace: ministries can request access to each other's data
- Standardized data-sharing APIs
- Public open data portal (subset, anonymized)
- Data-as-a-Service for all government applications

### 9.4 Phase 4: Sovereign Data Ecosystem

```
                    ┌────────────────────────────────────┐
                    │    ALGERIAN SOVEREIGN DATA CLOUD   │
                    │                                    │
  ┌─────────────┐   │  ┌──────────┐  ┌──────────────┐   │
  │ Government  │──▶│  │ Data Lake│  │ AI/ML        │   │
  │ Ministries  │   │  │ (Unified)│  │ Platform     │   │
  └─────────────┘   │  └──────────┘  └──────────────┘   │
  ┌─────────────┐   │  ┌──────────┐  ┌──────────────┐   │
  │ Public       │──▶│  │ Data     │  │ Decision     │   │
  │ Enterprises │   │  │ Catalog  │  │ Support      │   │
  └─────────────┘   │  └──────────┘  └──────────────┘   │
  ┌─────────────┐   │  ┌──────────┐  ┌──────────────┐   │
  │ Academic     │──▶│  │ Open     │  │ Citizen      │   │
  │ Institutions│   │  │ Data     │  │ Portal       │   │
  └─────────────┘   │  └──────────┘  └──────────────┘   │
  ┌─────────────┐   │  ┌──────────┐  ┌──────────────┐   │
  │ International│──▶│  │ Interop │  │ Cross-Border │   │
  │ Partners    │   │  │ Gateway  │  │ Data Sharing │   │
  └─────────────┘   │  └──────────┘  └──────────────┘   │
                    └────────────────────────────────────┘
```

**New capabilities:**
- All government data in a single sovereign data cloud
- Data science platform for government analysts
- AI model training on national data (privacy-preserving)
- Cross-border data sharing with partner nations
- Citizen data portal (individuals can access their own data)
- Private sector access (anonymized, API-based, fee-for-use)

### 9.5 Enabling Conditions

| Condition | Current Status | Target |
|---|---|---|
| Data sharing legal framework | Law 18-07 (personal data protection) exists but no comprehensive data sharing law | National Data Governance Law |
| Data standards | Fragmented per ministry | Unified National Data Standards |
| Data literacy | Low in most ministries | National Data Literacy Program |
| Technical infrastructure | Disparate legacy systems | Sovereign data cloud |
| Data culture | Protective, siloed | Collaborative, evidence-based |
| Funding | Project-based | Sustainable national budget line |

### 9.6 International Data Interoperability

As Monadhama expands to other countries (see `future_versions.md`), the data architecture supports:

- **SDG indicator alignment:** Every indicator mapped to UN SDG framework
- **GSIM (Generic Statistical Information Model):** Compliance with international statistical standards
- **DDI (Data Documentation Initiative):** Metadata standard for social science data
- **SDMX (Statistical Data and Metadata Exchange):** For cross-border statistical data exchange
- **INSPIRE:** For geospatial data interoperability (European standard, adopted by many nations)
- **Fiscal Transparency:** Alignment with IMF Fiscal Transparency Code

---

## 10. Appendices

### 10.1 Data Domain Registry Index

| Domain | Subdomains | Entity Count | Primary Ministry |
|---|---|---|---|
| DOM-01 | 7 | 12 | Interior / ONS |
| DOM-02 | 9 | 18 | Finance / Bank of Algeria |
| DOM-03 | 11 | 15 | Labor / ONS |
| DOM-04 | 9 | 20 | Education / Higher Education |
| DOM-05 | 10 | 22 | Health |
| DOM-06 | 9 | 16 | Public Works / Housing |
| DOM-07 | 8 | 14 | Agriculture |
| DOM-08 | 6 | 12 | Environment |
| DOM-09 | 4 | 8 | Environment / Weather Office |
| DOM-10 | 6 | 14 | Transport |
| DOM-11 | 5 | 10 | Justice |
| DOM-12 | 6 | 12 | Interior / Defense |
| DOM-13 | 5 | 12 | Energy |
| DOM-14 | 6 | 16 | Finance |
| DOM-15 | 5 | 10 | Housing |
| DOM-16 | 4 | 8 | Digital Transition |
| DOM-17 | 4 | 10 | Tourism / Culture |
| DOM-18 | 5 | 10 | Water |
| DOM-19 | 4 | 8 | Industry |
| DOM-20 | 4 | 8 | Trade / Customs |
| DOM-21 | 5 | 12 | Social Development |
| DOM-22 | 4 | 10 | Planning / Finance |
| DOM-23 | 4 | 8 | Finance / Treasury |
| DOM-24 | 3 | 8 | Interior |
| DOM-25 | 4 | 6 | Interior / Civil Protection |
| DOM-26 | 4 | 8 | Telecommunications |
| DOM-27 | 3 | 6 | Interior (Elections) |
| DOM-28 | 3 | 6 | Culture |

### 10.2 Data Trust Score Computation — Reference Implementation

```python
def compute_data_trust_score(accuracy, completeness, freshness, consistency, reliability, traceability):
    weights = {
        'accuracy': 0.25,
        'completeness': 0.15,
        'freshness': 0.20,
        'consistency': 0.10,
        'reliability': 0.20,
        'traceability': 0.10,
    }
    
    score = (
        weights['accuracy'] * accuracy +
        weights['completeness'] * completeness +
        weights['freshness'] * freshness +
        weights['consistency'] * consistency +
        weights['reliability'] * reliability +
        weights['traceability'] * traceability
    )
    
    if score >= 0.90:
        label = "Trusted"
    elif score >= 0.75:
        label = "Conditional"
    elif score >= 0.50:
        label = "Caution"
    else:
        label = "Untrusted"
    
    return {
        'score': round(score, 2),
        'label': label,
        'dimensions': {
            'accuracy': round(accuracy, 2),
            'completeness': round(completeness, 2),
            'freshness': round(freshness, 2),
            'consistency': round(consistency, 2),
            'reliability': round(reliability, 2),
            'traceability': round(traceability, 2),
        }
    }
```

---

**Document Owner:** Office of the Chief Data Architect
**Last Updated:** 2026-06-29
**Status:** Approved for Implementation
**Review Cycle:** Quarterly
**Related Documents:**
- `data_engine.md` — Pipeline implementation
- `data_sources.md` — Source catalog
- `knowledge_model.md` — Entity definitions
- `priority_scoring.md` — Score computation
- `database_design.md` — Storage architecture
