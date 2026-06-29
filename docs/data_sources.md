# Data Sources

**Doc ID:** DS-001
**Version:** 1.0
**Status:** Draft for Review
**Classification:** Confidential

---

## 1. Philosophy

Monadhama does not invent data. It integrates existing government data sources, international datasets, and open data platforms. Each source has a defined integration contract with ingestion format, schedule, and quality requirements.

## 2. Source Classification

| Category | Sensitivity | Update Frequency | Volume |
|---|---|---|---|
| Official Statistics | Public/Internal | Annual/Quarterly | GB |
| Administrative Data | Internal/Confidential | Real-time/Daily | TB |
| Geospatial Data | Public | Monthly/Yearly | TB |
| International Data | Public | Quarterly | GB |
| Sensor/IoT Data | Internal | Real-time | PB |
| Social/Survey Data | Public/Internal | Quarterly | GB |

## 3. Source Catalog

### 3.1 Official Government Sources

| Source | Provider | Type | Update | Coverage |
|---|---|---|---|---|
| National Census | National Statistics Office (ONS) | Demographics | Every 10 years | National |
| Population Registry | Ministry of Interior | Demographics | Continuous | National |
| Civil Registration | Ministry of Interior | Births, Deaths, Marriages | Monthly | National |
| Economic Survey | ONS | Economic indicators | Quarterly | National |
| Labor Force Survey | ONS | Employment | Quarterly | National |
| Consumer Price Index | ONS | Inflation | Monthly | National |
| National Accounts | Ministry of Finance | GDP, Growth | Quarterly | National |
| Budget Execution | Ministry of Finance | Spending | Monthly | National |
| Tax Registry | Ministry of Finance | Revenue | Quarterly | National |
| Customs Data | Ministry of Finance | Trade | Monthly | National |
| Health Statistics | Ministry of Health | Health indicators | Annual | Provincial |
| Hospital Registry | Ministry of Health | Hospital capacity | Quarterly | Facility |
| Disease Surveillance | Ministry of Health | Disease outbreaks | Daily | Provincial |
| Pharmaceutical Registry | Ministry of Health | Medicine availability | Monthly | National |
| Education Statistics | Ministry of Education | Schools, enrollment | Annual | Provincial |
| Exam Results | Ministry of Education | Student performance | Annual | Provincial |
| Higher Education Registry | Ministry of Higher Education | Universities | Annual | Institution |
| Research Output | Ministry of Higher Education | Publications | Annual | National |
| School Census | Ministry of Education | Infrastructure | Annual | School |
| Transport Statistics | Ministry of Transport | Traffic, accidents | Quarterly | Provincial |
| Road Registry | Ministry of Public Works | Road network | Annual | Segment |
| Railway Data | National Railway Company (SNTF) | Rail operations | Monthly | Network |
| Aviation Data | Civil Aviation Authority | Air traffic | Monthly | Airport |
| Maritime Data | Ministry of Transport | Port traffic | Monthly | Port |
| Water Statistics | Ministry of Water | Water resources | Quarterly | Hydrological |
| Dam Operations | National Water Agency (ANB) | Dam levels | Daily | Dam |
| Wastewater Data | Ministry of Water | Treatment | Quarterly | Facility |
| Agricultural Statistics | Ministry of Agriculture | Crops, livestock | Annual | Provincial |
| Irrigation Data | Ministry of Agriculture | Irrigated area | Annual | Zone |
| Food Security Index | Ministry of Agriculture | Food access | Quarterly | National |
| Energy Production | Ministry of Energy | Oil, gas, renewables | Monthly | Facility |
| Electricity Grid | National Electricity Company (Sonelgaz) | Grid operations | Real-time | Network |
| Renewable Energy | Ministry of Energy | Solar, wind | Monthly | Plant |
| Housing Census | Ministry of Housing | Housing stock | Annual | Provincial |
| Construction Permits | Ministry of Housing | Building activity | Monthly | Municipal |
| Social Housing Registry | Ministry of Housing | Housing demand | Quarterly | Provincial |
| Crime Statistics | Ministry of Interior | Crime incidents | Monthly | Provincial |
| Traffic Accidents | National Police | Road accidents | Monthly | Provincial |
| Prison Population | Ministry of Justice | Inmates | Quarterly | Facility |
| Court Case Registry | Ministry of Justice | Cases | Monthly | Court |
| Investment Declarations | National Investment Agency | FDI, domestic | Quarterly | Project |
| Public Investment Plan | Ministry of Planning | Budget allocation | Annual | Project |
| Project Progress | Ministry of Planning | Implementation | Quarterly | Project |
| Tourism Statistics | Ministry of Tourism | Arrivals, revenue | Monthly | Provincial |
| Hotel Registry | Ministry of Tourism | Accommodation | Annual | Establishment |
| Environmental Monitoring | Ministry of Environment | Air, water quality | Monthly | Station |
| Waste Management | Ministry of Environment | Collection, recycling | Quarterly | Municipal |
| Forest Registry | Ministry of Agriculture | Forest cover | Annual | Zone |
| Cultural Heritage Sites | Ministry of Culture | Sites, museums | Annual | Site |
| Digital Government Index | Ministry of Telecom | E-services | Annual | Province |
| Telecom Infrastructure | Ministry of Telecom | Coverage, speed | Quarterly | Province |
| Social Security Registry | National Social Security Fund (CNAS) | Contributors | Quarterly | National |
| Pension Registry | National Pension Fund (CNR) | Retirees | Quarterly | National |
| Civil Service Registry | Ministry of Civil Service | Public employees | Quarterly | National |
| Emergency Calls | Civil Protection | Incidents | Real-time | Incident |
| Weather Data | National Weather Office | Climate | Daily | Station |
| Satellite Imagery | Algerian Space Agency (ASAL) | Land use | Monthly | National |

### 3.2 International & Third-Party Sources

| Source | Provider | Type | Update |
|---|---|---|---|
| World Bank Indicators | World Bank | Development indicators | Annual |
| IMF Data | International Monetary Fund | Economic indicators | Quarterly |
| UNDP Data | United Nations | HDI, inequality | Annual |
| WHO Data | World Health Organization | Health indicators | Annual |
| UNESCO Data | UNESCO | Education indicators | Annual |
| ILO Data | International Labour Organization | Labor indicators | Annual |
| FAO Data | Food and Agriculture Organization | Agriculture indicators | Annual |
| UN Population Data | UN DESA | Population projections | Biennial |
| Global SDG Indicators | United Nations | Sustainable development | Annual |
| OpenStreetMap | Community | Geospatial | Continuous |
| Copernicus Data | European Space Agency | Satellite imagery | Daily |
| NASA Earth Data | NASA | Climate, land cover | Daily |
| Global Forest Watch | WRI | Forest change | Monthly |
| ACLED Data | ACLED | Conflict events | Weekly |
| Global Terrorism Database | START | Terrorism incidents | Annual |
| GSMA Mobile Data | GSMA | Mobile connectivity | Annual |
| Global Data Observatory | WHO | Health trends | Annual |

### 3.3 Derived & Computed Sources

| Source | Description | Method |
|---|---|---|
| Province Peer Groups | Clustering of similar provinces | ML clustering |
| Composite Indicators | Aggregated indices | Weighted scoring |
| Trend Analysis | Time-series patterns | Statistical |
| Anomaly Detection | Outlier identification | ML detection |
| Forecasted Indicators | Predictive estimates | Time-series models |
| Correlation Map | Cross-sector relationships | Graph analysis |

## 4. Data Integration Contracts

Each source has a formal contract:

```yaml
source_name: "Health Statistics — Ministry of Health"
source_id: "MOH-001"
provider: "Ministry of Health, Directorate of Planning"
contact: "planning@sante.gov.dz"
technical_contact: "it@sante.gov.dz"

delivery:
  format: "CSV (UTF-8)"
  protocol: "SFTP to designated server"
  schedule: "Quarterly, by 15th of month following quarter"
  encryption: "PGP"
  historical_backfill: "2010-01-01 onwards"

schema:
  - name: "province_code"
    type: "string"
    description: "ONS province code"
    required: true
  - name: "year"
    type: "integer"
    required: true
  - name: "beds_total"
    type: "integer"
    description: "Total hospital beds"
    required: true
  # ... additional fields

quality:
  completeness: ">= 95%"
  timeliness: "Within 30 days of quarter end"
  accuracy: "Verified against previous submission"
  uniqueness: "No duplicate records"
```

## 5. Data Ingestion Pipeline

```
Source → SFTP/API → Kafka → Quality Gate → Data Lake → Knowledge Graph
```

1. **Extraction:** SFTP pull, API poll, or webhook reception
2. **Validation:** Schema validation, type checking, range checking
3. **Quality Gate:** Great Expectations suite runs automated tests
4. **Transformation:** Normalization, deduplication, standardization
5. **Loading:** Delta Lake tables + Neo4j graph update
6. **Notification:** Alert on success/failure with details

## 6. Data Gap Management

When a data source is unavailable:

1. **Graceful degradation:** Use last known value with staleness flag
2. **Imputation:** Statistical imputation for missing indicators
3. **Alternative source:** Switch to secondary source if configured
4. **Alert:** Notify data engineering team and data stewards
5. **Confidence adjustment:** Reduce confidence score for affected indicators

## 7. Data Quality Metrics

| Metric | Target | Measurement |
|---|---|---|
| Completeness | >95% | % of expected fields populated |
| Timeliness | >90% | % of sources delivered on schedule |
| Accuracy | <1% error rate | Sampled verification |
| Consistency | <5% conflicts | Cross-source comparison |
| Uniqueness | <0.1% duplicates | Deduplication checks |
| Freshness | <30 days average | Age of latest data point |

---

**Document Owner:** Data Engineering Team
**Last Updated:** 2026-06-29
