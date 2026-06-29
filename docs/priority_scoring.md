# Priority Scoring Engine

**Doc ID:** PSE-001
**Version:** 1.0
**Status:** Draft for Review
**Classification:** Confidential

---

## 1. Overview

The Priority Scoring Engine computes normalized, explainable scores for every province across 12 dimensions. These scores enable decision makers to instantly understand where attention is needed and why.

## 2. Scoring Dimensions

| # | Dimension | Weight* | Description |
|---|---|---|---|
| 1 | Health | 12% | Healthcare access, quality, outcomes |
| 2 | Education | 11% | Education access, quality, attainment |
| 3 | Economy | 12% | Economic output, diversity, stability |
| 4 | Employment | 10% | Job availability, quality, youth employment |
| 5 | Investment | 8% | Investment climate, infrastructure spending |
| 6 | Infrastructure | 10% | Roads, utilities, connectivity |
| 7 | Security | 9% | Crime rates, safety, justice access |
| 8 | Environment | 7% | Air quality, waste management, conservation |
| 9 | Transportation | 7% | Transport network quality, accessibility |
| 10 | Water | 6% | Water access, quality, infrastructure |
| 11 | Agriculture | 5% | Agricultural output, food security |
| 12 | Tourism | 3% | Tourism infrastructure, attractiveness |

*Weights are configurable per country and can be adjusted by the government.

## 3. Scoring Formula

Each dimension score is calculated as:

```
Dimension_Score = Σ(wi × ni) × α × β
```

Where:
- `wi` = weight of indicator `i` within the dimension
- `ni` = normalized value of indicator `i` (0–100 scale)
- `α` = recency factor (penalizes old data)
- `β` = reliability factor (penalizes low-quality data)

### 3.1 Normalization

Indicators are normalized to a 0–100 scale using:

- **Benefit indicators** (higher is better): `normalized = ((value - min) / (max - min)) × 100`
- **Cost indicators** (lower is better): `normalized = 100 - ((value - min) / (max - min)) × 100`
- **Z-score normalization** for outlier-sensitive indicators
- **Percentile ranking** for comparative indicators

### 3.2 Composite Score

```
Composite_Score = Σ(Dimension_i × Weight_i)
```

The composite score is 0–100 where:
- **0–39:** Critical — Immediate attention required
- **40–59:** Warning — Below acceptable threshold
- **60–74:** Fair — Acceptable but improvable
- **75–89:** Good — Above average performance
- **90–100:** Excellent — Best practice level

## 4. Indicator Catalog by Dimension

### 4.1 Health Score
| Indicator | Weight | Source |
|---|---|---|
| Beds per 1,000 residents | 15% | Ministry of Health |
| Doctors per 1,000 residents | 15% | Ministry of Health |
| Infant mortality rate (per 1,000) | 15% | National Statistics Office |
| Life expectancy | 10% | National Statistics Office |
| Vaccination coverage (%) | 10% | Ministry of Health |
| Maternal mortality rate | 10% | Ministry of Health |
| Hospital accessibility (avg km) | 10% | GIS Analysis |
| ICU beds per 100,000 | 8% | Ministry of Health |
| Disease prevalence rate | 7% | Ministry of Health |

### 4.2 Education Score
| Indicator | Weight | Source |
|---|---|---|
| Literacy rate (%) | 20% | National Statistics Office |
| School enrollment rate (%) | 15% | Ministry of Education |
| Student-teacher ratio | 15% | Ministry of Education |
| Secondary completion rate | 15% | Ministry of Education |
| School infrastructure quality | 10% | Ministry of Education |
| University enrollment | 10% | Ministry of Higher Education |
| Internet access in schools | 10% | Ministry of Education |
| Vocational training capacity | 5% | Ministry of Labor |

### 4.3 Economy Score
| Indicator | Weight | Source |
|---|---|---|
| GDP per capita | 25% | Ministry of Finance |
| GDP growth rate | 20% | Ministry of Finance |
| Economic diversity index | 15% | Computed |
| Inflation rate | 10% | Bank of Algeria |
| Business density | 10% | Ministry of Commerce |
| Export volume | 10% | Ministry of Commerce |
| Foreign direct investment | 10% | National Investment Agency |

### 4.4 Employment Score
| Indicator | Weight | Source |
|---|---|---|
| Unemployment rate | 30% | National Statistics Office |
| Youth unemployment rate | 25% | National Statistics Office |
| Labor force participation | 15% | National Statistics Office |
| Informal employment rate | 10% | Ministry of Labor |
| Job creation rate | 10% | Ministry of Labor |
| Average wage | 10% | National Statistics Office |

### 4.5 Investment Score
| Indicator | Weight | Source |
|---|---|---|
| Investment per capita | 25% | Ministry of Finance |
| Active projects count | 20% | Ministry of Planning |
| Private investment volume | 15% | National Investment Agency |
| Project completion rate | 15% | Ministry of Planning |
| Investment approval time | 10% | Computed |
| PPP projects | 10% | Ministry of Finance |
| Project budget utilization | 5% | Ministry of Finance |

### 4.6 Infrastructure Score
| Indicator | Weight | Source |
|---|---|---|
| Road quality index | 20% | Ministry of Public Works |
| Electricity access (%) | 15% | Ministry of Energy |
| Internet penetration | 15% | Ministry of Telecom |
| Clean water access (%) | 15% | Ministry of Water |
| Sanitation access (%) | 10% | Ministry of Housing |
| Housing quality index | 10% | Ministry of Housing |
| Public building condition | 10% | Ministry of Interior |
| Waste management coverage | 5% | Ministry of Environment |

### 4.7 Security Score
| Indicator | Weight | Source |
|---|---|---|
| Crime rate (per 100,000) | 30% | Ministry of Interior |
| Police per 100,000 | 15% | Ministry of Interior |
| Case resolution rate | 15% | Ministry of Justice |
| Prison overcrowding | 10% | Ministry of Justice |
| Traffic accident rate | 10% | Ministry of Transport |
| Domestic violence reports | 10% | Ministry of Interior |
| Border security incidents | 10% | Ministry of Defense |

### 4.8 Environment Score
| Indicator | Weight | Source |
|---|---|---|
| Air quality index | 25% | Ministry of Environment |
| Forest cover (%) | 15% | Ministry of Agriculture |
| Waste recycling rate | 15% | Ministry of Environment |
| CO2 emissions per capita | 10% | Ministry of Environment |
| Protected areas (%) | 10% | Ministry of Environment |
| Water pollution index | 10% | Ministry of Water |
| Renewable energy share | 10% | Ministry of Energy |
| Green space per capita | 5% | GIS Analysis |

### 4.9 Transportation Score
| Indicator | Weight | Source |
|---|---|---|
| Road network density | 20% | GIS Analysis |
| Public transport coverage | 20% | Ministry of Transport |
| Average commute time | 15% | National Statistics Office |
| Railway connectivity | 15% | Ministry of Transport |
| Airport access | 10% | Ministry of Transport |
| Port infrastructure | 10% | Ministry of Transport |
| Transport safety rating | 10% | Ministry of Transport |

### 4.10 Water Score
| Indicator | Weight | Source |
|---|---|---|
| Water access rate (%) | 25% | Ministry of Water |
| Water quality index | 20% | Ministry of Water |
| Water supply reliability | 15% | Ministry of Water |
| Dam capacity utilization | 15% | Ministry of Water |
| Wastewater treatment | 10% | Ministry of Water |
| Irrigation coverage | 10% | Ministry of Agriculture |
| Water loss rate | 5% | Ministry of Water |

### 4.11 Agriculture Score
| Indicator | Weight | Source |
|---|---|---|
| Agricultural output value | 25% | Ministry of Agriculture |
| Arable land utilization | 20% | Ministry of Agriculture |
| Crop diversity index | 15% | Ministry of Agriculture |
| Irrigation access | 15% | Ministry of Agriculture |
| Fertilizer use efficiency | 10% | Ministry of Agriculture |
| Livestock production | 10% | Ministry of Agriculture |
| Food self-sufficiency | 5% | Ministry of Agriculture |

### 4.12 Tourism Score
| Indicator | Weight | Source |
|---|---|---|
| Tourist arrivals | 25% | Ministry of Tourism |
| Hotel capacity | 20% | Ministry of Tourism |
| Tourism infrastructure | 20% | Ministry of Tourism |
| Cultural heritage sites | 15% | Ministry of Culture |
| Tourism revenue | 10% | Ministry of Finance |
| International connectivity | 10% | Ministry of Transport |

## 5. Explainability for Scores

Every score includes a breakdown:

```json
{
  "province_id": "prov-dz-16",
  "province_name": "Tizi Ouzou",
  "composite_score": 62.4,
  "composite_label": "Fair",
  "dimension_scores": {
    "health": {
      "score": 71.2,
      "label": "Fair",
      "drivers": [
        {"indicator": "Beds per 1,000", "value": 1.8, "contribution": "+2.1"},
        {"indicator": "Infant mortality", "value": 18.5, "contribution": "-3.4"}
      ],
      "data_freshness": "2025-Q4",
      "data_completeness": 0.92
    },
    "education": { ... }
  },
  "top_priorities": [
    "Infrastructure investment required — road quality index is 42/100",
    "Healthcare staffing shortage — 0.9 doctors per 1,000 residents"
  ],
  "comparison": {
    "vs_national_average": -4.2,
    "vs_peers": "Bottom 30% of provinces",
    "best_performer": "Algiers (84.1)",
    "worst_performer": "Tamanrasset (38.7)"
  },
  "trend": "Declining (-2.1 over 2 years)",
  "generated_at": "2026-06-29T14:30:00Z"
}
```

## 6. Trend Detection

Scores are tracked over time to identify:

- **Improving:** Score increased >5% year-over-year
- **Stable:** Score within ±5% year-over-year
- **Declining:** Score decreased >5% year-over-year
- **Critical decline:** Score decreased >15% year-over-year

Trend confidence uses the Mann-Kendall test for statistical significance.

## 7. Recency & Reliability Factors

### Recency Factor (α)
| Data Age | α |
|---|---|
| <3 months | 1.0 |
| 3–6 months | 0.95 |
| 6–12 months | 0.85 |
| 1–2 years | 0.70 |
| >2 years | 0.50 |

### Reliability Factor (β)
| Source Type | β |
|---|---|
| Official government statistics | 1.0 |
| Official government administrative data | 0.95 |
| International organization data | 0.90 |
| Survey data | 0.80 |
| Modeled/estimated data | 0.70 |
| Media/unverified | 0.40 |

## 8. Configurable Weights

The Algerian government can adjust dimension weights through the system configuration:

```json
{
  "country_id": "DZA",
  "version": "2026-v1",
  "weights": {
    "health": 0.12,
    "education": 0.11,
    "economy": 0.12,
    "employment": 0.10,
    "investment": 0.08,
    "infrastructure": 0.10,
    "security": 0.09,
    "environment": 0.07,
    "transportation": 0.07,
    "water": 0.06,
    "agriculture": 0.05,
    "tourism": 0.03
  },
  "effective_date": "2026-01-01",
  "approved_by": "Council of Ministers"
}
```

---

**Document Owner:** Data Science Team
**Last Updated:** 2026-06-29
