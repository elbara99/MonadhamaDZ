# AI Engine

**Doc ID:** AI-001
**Version:** 1.0
**Status:** Draft for Review
**Classification:** Confidential

---

## 1. Overview

The AI Engine is the intelligence layer of Monadhama. It orchestrates Large Language Models, traditional machine learning models, retrieval-augmented generation (RAG) pipelines, and statistical models to deliver all AI capabilities described in `ai_capabilities.md`.

## 2. Architecture

```
                         ┌──────────────────────┐
                         │   AI ORCHESTRATOR    │
                         │  (LangChain/LangGraph)│
                         └──────┬───────┬───────┘
                                │       │
                 ┌──────────────┘       └──────────────┐
                 ↓                                      ↓
┌────────────────────────────┐    ┌────────────────────────────┐
│     RETRIEVAL LAYER       │    │      REASONING LAYER       │
│  ┌────────┐┌────────┐     │    │  ┌────────┐┌────────┐      │
│  │Vector  ││Graph   │     │    │  │LLM     ││ML      │      │
│  │Store   ││DB      │     │    │  │Gateway ││Pipeline│      │
│  └────────┘└────────┘     │    │  └────────┘└────────┘      │
│  ┌────────┐┌────────┐     │    │  ┌────────┐┌────────┐      │
│  │BM25    ││Metadata│     │    │  │Rules   ││Stat    │      │
│  │Search  ││Filter  │     │    │  │Engine  ││Models  │      │
│  └────────┘└────────┘     │    │  └────────┘└────────┘      │
└────────────────────────────┘    └────────────────────────────┘
                                │
                                ↓
┌────────────────────────────────────────────────────────────────┐
│                      OUTPUT LAYER                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │Response  │ │Report    │ │Visual    │ │Recommendation    │  │
│  │Generator │ │Generator │ │Generator │ │Generator         │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

## 3. AI Orchestrator (LangGraph)

The orchestrator manages multi-step AI workflows as directed graphs:

```python
# Conceptual workflow graph
Workflow:
  ParseQuery → ClassifyIntent
  → if QUERY: Retrieve → GenerateAnswer → FormatResponse
  → if ANALYZE: Retrieve → RetrieveTimeSeries → StatisticalAnalysis → LLMInterpret → GenerateReport
  → if RECOMMEND: Retrieve → Score → Rank → LLMGenerate → Explain → FormatRecommendation
  → if FORECAST: Retrieve → TimeSeriesModel → LLMInterpret → GenerateForecast
  → if COMPARE: MultiRetrieve → AlignMetrics → LLMCompare → GenerateComparison
```

## 4. Retrieval-Augmented Generation (RAG) Pipeline

### 4.1 Hybrid Search

```
Query → Query Expansion → Hybrid Search
                           ├── Vector Search (semantic)
                           ├── BM25 Search (keyword)
                           └── Graph Traversal (relationships)
                  ↓
           Fusion → Reciprocal Rank Fusion → Dedup → Re-ranking
                  ↓
           Context Assembly → LLM Generation
```

### 4.2 Embedding Model

| Component | Model | Dimensions |
|---|---|---|
| Text embeddings | multilingual-e5-large | 1024 |
| Arabic optimized | arbert-embeddings | 768 |
| French optimized | camembert-embeddings | 768 |
| Code/Entity ids | custom embedding | 256 |

### 4.3 Chunking Strategy

| Content Type | Chunk Size | Overlap |
|---|---|---|
| Government reports | 512 tokens | 50 |
| Statistical tables | Row-level | None |
| Legal documents | Section-level | 100 |
| News articles | Paragraph | 50 |
| Entity descriptions | Document-level | None |

## 5. LLM Strategy

### 5.1 Model Selection

| Capability | Primary Model | Fallback |
|---|---|---|
| Arabic reasoning | GPT-4o / Claude 3.5 | Mistral Ara |
| French reasoning | Claude 3.5 / GPT-4o | Mistral |
| English reasoning | GPT-4o / Claude 3.5 | Llama 3 |
| Code generation | GPT-4o | Claude 3.5 |
| Classification | Fine-tuned BERT | LLM zero-shot |
| Summarization | Claude 3 Haiku | GPT-4o mini |
| Embeddings | multilingual-e5-large | Ada-002 |

### 5.2 Model Hosting

| Deployment | Model | Infrastructure |
|---|---|---|
| Self-hosted | Llama 3 70B | 4× A100 80GB |
| Self-hosted | Mistral Ara | 2× A100 80GB |
| Self-hosted | multilingual-e5-large | 1× A100 80GB |
| Self-hosted | Fine-tuned BERT | CPU/GPU |
| Sovereign cloud API | GPT-4o | Azure OpenAI |
| Sovereign cloud API | Claude | AWS Bedrock |

### 5.3 Prompt Architecture

Every AI interaction follows a structured prompt template:

```
System: [Role definition + constraints + output format]
Context: [Retrieved data + instructions]
Conversation: [Previous turns]
User: [Current query]
```

System prompts are versioned, tested, and stored in a prompt registry.

## 6. ML Pipeline

### 6.1 Model Registry

All models tracked in MLflow:

| Model | Type | Task |
|---|---|---|
| province-classifier | XGBoost | Province peer grouping |
| anomaly-detector | Isolation Forest | Anomalous indicator detection |
| trend-forecaster | Prophet | Time series forecasting |
| resource-optimizer | Linear Programming | Budget allocation |
| risk-scorer | Gradient Boosting | Risk prediction |
| entity-matcher | Sentence-BERT | Entity resolution |
| intent-classifier | BERT | Query intent |
| recommendation-reranker | LambdaMART | Recommendation ranking |

### 6.2 Training Pipeline

```
Feature Store → Data Split → Train → Evaluate → Register → Deploy
                  ↑                                   ↓
              Feature Engineering               Model Monitor
```

- **Feature Store:** Feast — centralized feature management
- **Training:** Distributed (PySpark + GPU)
- **Evaluation:** Holdout set + A/B testing in shadow mode
- **Deployment:** Seldon Core / KServe on Kubernetes
- **Monitoring:** Model drift detection + data drift detection

## 7. AI Capability Mapping

See `ai_capabilities.md` for full detail. Each capability maps to a pipeline:

| Capability | Pipeline | Models | Latency |
|---|---|---|---|
| Natural Language Search | Hybrid RAG | Embedding + LLM | <2s |
| Question Answering | RAG + Graph | Embedding + LLM + Cypher | <3s |
| Automatic Reports | Multi-step RAG | LLM + Statistical | <10s |
| Executive Summaries | Extractive + Abstractive | BERT + LLM | <5s |
| Trend Detection | Time Series + LLM | Prophet + LLM | <5s |
| Risk Detection | ML + LLM | Anomaly Detector + LLM | <3s |
| Recommendations | Scoring + LLM | XGBoost + LLM | <5s |
| Province Comparison | Multi-RAG + LLM | Embedding + LLM | <4s |
| Historical Analysis | Time Series + LLM | Prophet + LLM | <5s |
| Future Forecasts | Time Series + LLM | Prophet + LLM | <5s |

## 8. Evaluation Framework

### 8.1 Quality Metrics

| Metric | Target | Method |
|---|---|---|
| Answer accuracy | >90% | Human evaluation |
| Hallucination rate | <3% | Automated fact-checking |
| Relevance score | >4.5/5 | User feedback |
| Citation accuracy | >95% | Source verification |
| Response time | <3s P95 | Monitoring |
| Task completion | >85% | End-to-end testing |

### 8.2 A/B Testing

New models or prompts are evaluated in shadow mode:
1. Both systems generate responses
2. Responses compared for quality, accuracy, latency
3. Human raters evaluate blind samples
4. Gradual rollout with automated rollback

## 9. Safety & Guardrails

### 9.1 Content Filtering
- Toxic content detection
- PII redaction
- Politically sensitive topic handling
- Factual grounding enforcement

### 9.2 Guardrails
- Output validation against retrieved context
- Confidence threshold enforcement (min 0.3)
- Human escalation for low-confidence decisions
- Rate limiting per user/role
- Audit log for all AI interactions

### 9.3 Jailbreak Prevention
- Input sanitization
- Prompt injection detection
- Role boundary enforcement
- Context window isolation

## 10. Observability

| Tool | Purpose |
|---|---|
| LangSmith | LLM tracing, evaluation |
| Prometheus + Grafana | Model performance metrics |
| MLflow | Experiment tracking, model registry |
| OpenTelemetry | Distributed tracing |
| ELK Stack | Log aggregation for AI interactions |
| Custom dashboard | Real-time AI performance monitoring |

---

**Document Owner:** AI Engineering Team
**Last Updated:** 2026-06-29
