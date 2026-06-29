# Decision Engine

**Doc ID:** DE-001
**Version:** 1.0
**Status:** Draft for Review
**Classification:** Confidential

---

## 1. Purpose

The Decision Engine is the core differentiator of Monadhama. It transforms data and AI outputs into actionable, ranked, explainable recommendations tailored to government decision makers. It does not replace human judgment — it augments it with structured reasoning, evidence, and confidence scoring.

## 2. Architecture

```
[User Query / System Trigger]
            ↓
[Intent Detection] → What does the user want?
            ↓
[Entity Recognition] → Which entity/province/sector?
            ↓
[Context Retrieval] → Fetch relevant data
            ↓
[Scoring & Ranking] → Calculate priority scores
            ↓
[Recommendation Generation] → AI generates proposal
            ↓
[Confidence Scoring] → How reliable is this?
            ↓
[Explainability Layer] → Why was this recommended?
            ↓
[Human Approval / Override]
```

## 3. Component Details

### 3.1 Intent Detection

Classifies user input into one of the following intent types:

| Intent | Example | Priority |
|---|---|---|
| QUERY | "What is the unemployment rate in Oran?" | Immediate |
| COMPARE | "Compare healthcare between Setif and Annaba" | Immediate |
| ANALYZE | "Analyze education trends for the last 5 years" | High |
| RECOMMEND | "Which province needs infrastructure investment?" | High |
| FORECAST | "What will population growth look like by 2030?" | Medium |
| REPORT | "Generate a health sector report for Algiers" | Medium |
| ALERT | "What changed in the last 24 hours?" | Immediate |
| DRILL_DOWN | "Show me details of hospital capacity in Tizi Ouzou" | Immediate |

Implementation: Fine-tuned classification model (e.g., BERT-based) with fallback to LLM zero-shot classification.

### 3.2 Entity Recognition

Extracts and resolves entities from user input:

- **Province recognition:** Matches names, abbreviations, historical names
- **Sector recognition:** Maps to knowledge model sectors
- **Time range extraction:** Detects temporal scope
- **Metric extraction:** Identifies requested indicators

Uses a combination of:
- Gazetteer matching (exhaustive list of all entities)
- Fuzzy matching (Levenshtein, phonetic)
- LLM-based NER for complex queries
- Graph traversal for ambiguous entities ("the capital" → Algiers)

### 3.3 Context Retrieval

Retrieves relevant context from multiple stores:

| Source | Method | Latency |
|---|---|---|
| Knowledge Graph | Cypher query | <50ms |
| Vector Store | Semantic similarity | <100ms |
| Data Warehouse | SQL query | <200ms |
| Data Lake | Spark query | <2s |
| Historical Cache | Redis | <5ms |

The Context Retriever merges results, deduplicates, and ranks by relevance before passing to the next stage.

### 3.4 Scoring & Ranking

See also: `priority_scoring.md` for deep detail.

Each candidate recommendation receives a score based on:

- **Urgency:** How time-sensitive is the issue?
- **Impact:** How many citizens are affected?
- **Severity:** How critical is the problem?
- **Feasibility:** How actionable is the recommendation?
- **Cost-Benefit:** Estimated ROI
- **Political Alignment:** Consistency with government priorities
- **Risk Level:** Downside of inaction

### 3.5 Recommendation Generation

The generator creates structured recommendations:

```json
{
  "id": "rec-20260629-001",
  "type": "RESOURCE_ALLOCATION",
  "title": "Increase healthcare funding in Tamanrasset Province",
  "summary": "Tamanrasset Province shows a critical shortage of hospital beds (0.8 per 1,000 residents vs national average of 2.1) with a rapidly growing population (+3.2% annually).",
  "target_entity": {
    "type": "Province",
    "id": "prov-dz-11",
    "name": "Tamanrasset",
    "code": "DZ-11"
  },
  "sector": "Health",
  "priority_score": 87.3,
  "confidence": 0.84,
  "evidence": [
    {
      "source": "Ministry of Health — 2025 Annual Report",
      "metric": "Beds per 1,000 residents",
      "value": 0.8,
      "national_average": 2.1,
      "rank": 56
    },
    {
      "source": "National Statistics Office — 2025 Census",
      "metric": "Population growth rate",
      "value": 3.2,
      "national_average": 1.8
    }
  ],
  "expected_impact": {
    "metric": "Beds per 1,000 residents",
    "current": 0.8,
    "target": 1.5,
    "timeline": "24 months",
    "estimated_cost_dzd": 4500000000
  },
  "alternatives": [
    {
      "title": "Mobile health clinic program",
      "cost": 500000000,
      "timeline": "6 months",
      "tradeoff": "Temporary solution, lower long-term impact"
    }
  ],
  "generated_at": "2026-06-29T14:30:00Z",
  "expires_at": "2026-07-29T14:30:00Z"
}
```

### 3.6 Confidence Scoring

Each recommendation includes a confidence score (0.0 – 1.0) derived from:

| Factor | Weight | Source |
|---|---|---|
| Data freshness | 0.25 | Age of underlying data |
| Data completeness | 0.20 | % of expected data points available |
| Source reliability | 0.20 | Historical accuracy of source |
| Model confidence | 0.15 | AI model's internal confidence |
| Consistency | 0.10 | Agreement with related indicators |
| Human feedback | 0.10 | Past acceptance/rejection rate |

### 3.7 Explainability Layer

Every recommendation must answer:

1. **WHAT** is being recommended?
2. **WHY** is it being recommended?
3. **WHAT DATA** supports it?
4. **WHAT HAPPENS** if it is accepted?
5. **WHAT HAPPENS** if it is rejected?
6. **WHAT ARE** the alternatives?

The explainability layer generates:

- **Natural language explanation:** Readable by a minister without technical background
- **Data provenance chain:** Every data point traced to its source
- **Counterfactual analysis:** "If we allocate resources to X instead of Y..."
- **Sensitivity analysis:** "How would the score change if data point X was different?"

### 3.8 Human-in-the-Loop

| Action | System Behavior |
|---|---|
| Accept | Log decision, trigger workflow, update model |
| Reject with reason | Log rejection, adjust scoring weights |
| Modify | Accept modified version, learn from edit |
| Defer | Escalate to higher authority with recommendation |
| Request more data | Flag data gap in quality gate |

## 4. Workflow Engine

The Decision Engine includes a pluggable workflow engine for government processes:

```
Trigger → Approval Chain → Execution → Monitoring → Feedback
```

- Configurable approval chains (minister → cabinet → president)
- SLA tracking per decision
- Escalation for overdue decisions
- Post-decision monitoring and outcome tracking

## 5. Failure Handling

| Failure Mode | Mitigation |
|---|---|
| Insufficient data | Flag with "low confidence" warning, suggest data collection |
| Conflicting data | Surface conflict, present both sources, recommend verification |
| Outdated data | Show timestamp, adjust confidence score down |
| Model uncertainty | Request clarification from user, narrow scope |
| Infrastructure failure | Cache recent results, degraded mode with static data |

## 6. Performance Requirements

| Metric | Target |
|---|---|
| P50 latency (simple query) | <500ms |
| P99 latency (complex analysis) | <5s |
| Throughput | 100 requests/second |
| Recommendation generation | <3s per recommendation |
| Concurrent users | 500+ |
| Availability | 99.9% |

---

**Document Owner:** Decision Engine Team
**Last Updated:** 2026-06-29
