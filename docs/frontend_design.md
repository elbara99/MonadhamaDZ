# Frontend Architecture

**Doc ID:** FE-001
**Version:** 1.0
**Status:** Draft for Review
**Classification:** Confidential

---

## 1. Philosophy

Monadhama's frontend is not a dashboard. It is an **intelligence terminal** — a high-density information environment designed for rapid decision making. The UI provides multiple cognitive modes: scanning, focused analysis, comparison, and decision. Every screen prioritizes clarity, context, and action over decoration.

## 2. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 15 (React 19) | SSR, streaming, server components |
| Language | TypeScript 5.x | Type safety |
| State Management | Zustand + TanStack Query | Lightweight, server-state focus |
| UI Components | Radix UI + Tailwind CSS | Accessible, composable, unstyled |
| Maps & GIS | Mapbox GL JS + deck.gl | High-performance geo visualization |
| Charts | D3.js + visx | Custom, high-density data viz |
| Forms | React Hook Form + Zod | Schema-based validation |
| Testing | Vitest + Playwright | Unit + E2E testing |
| Build | Turbopack | Fast dev builds |
| PWA | Service Worker + IndexedDB | Offline capability |

## 3. Application Shell

```
┌──────────────────────────────────────────────────────────────────┐
│  TOP BAR                                                         │
│  [Monadhama Logo] [Search (Cmd+K)] [Notifications] [User Menu]  │
├──────────────────────────────────────────────────────────────────┤
│  SIDE      │  MAIN CONTENT AREA                                 │
│  NAV       │                                                    │
│            │  ┌──────────────────────────────────────────────┐  │
│  [Home]    │  │                                              │  │
│  [Provinces]│  │         Context-Dependent Content            │  │
│  [Sectors] │  │                                              │  │
│  [Projects]│  └──────────────────────────────────────────────┘  │
│  [Reports] │                                                    │
│  [Decisions]│  ┌──────────────────────────────────────────────┐  │
│  [Alerts]  │  │  SECONDARY PANEL (Context, Details, Actions) │  │
│  [Admin]   │  └──────────────────────────────────────────────┘  │
│            │                                                    │
└────────────┴──────────────────────────────────────────────────────┘
```

## 4. Route Structure

| Route | Page | Access |
|---|---|---|
| `/` | Home — Executive Briefing | All authenticated |
| `/provinces` | Province Explorer | All |
| `/provinces/{code}` | Province Detail | All |
| `/provinces/{code}/{sector}` | Sector Detail for Province | All |
| `/provinces/compare` | Province Comparison Tool | All |
| `/sectors/{sector}` | Sector National Overview | All |
| `/projects` | Investment Project Explorer | Analysts+ |
| `/projects/{id}` | Project Detail | Analysts+ |
| `/reports` | Report Library | Analysts+ |
| `/reports/generate` | Report Generator | Analysts+ |
| `/reports/{id}` | Report Viewer | Analysts+ |
| `/decisions` | Decision Center | Ministers+ |
| `/decisions/pending` | Pending Decisions | Ministers+ |
| `/decisions/{id}` | Decision Detail | Ministers+ |
| `/alerts` | Alert Center | All |
| `/search` | Search Results | All |
| `/admin` | System Administration | Administrators |
| `/admin/sources` | Data Source Management | Administrators |
| `/admin/users` | User Management | Administrators |

## 5. Core UI Components

### 5.1 Executive Home
- **KPI Cards:** 12 sector scores for selected province
- **Alert Feed:** Real-time critical alerts
- **Province Map:** GeoJSON heatmap of composite scores
- **Trend Ticker:** Auto-scrolling key indicator changes
- **Quick Actions:** Search, compare, generate report
- **Decision Queue:** Pending recommendations count

### 5.2 Province Explorer
- **Map View:** Color-coded province map with hover info
- **Table View:** Sortable province list with key metrics
- **Comparison Mode:** Side-by-side province comparison
- **Detail Panel:** Full entity details on selection

### 5.3 Province Detail Page
```
┌──────────────────────────────────────────────────────────────────┐
│ BREADCRUMB: Home > Provinces > Tizi Ouzou                       │
├──────────────────────────────────────────────────────────────────┤
│ HEADER: Name, Code, Population, Area, Governor                   │
├──────────┬───────────────────────────────────────────────────────┤
│ SCORE    │ QUICK STATS                                           │
│ RADAR    │ [Health: 72] [Education: 65] [Economy: 58] ...       │
│ CHART    │                                                       │
├──────────┴───────────────────────────────────────────────────────┤
│ 12 DIMENSION CARDS (expandable)                                  │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│ │ Health   │ │Education │ │ Economy  │ │Employmnt │            │
│ │ Score:72 │ │ Score:65 │ │ Score:58 │ │ Score:61 │            │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│ │Investmnt │ │Infrastr. │ │Security  │ │Environm. │            │
│ │ Score:44 │ │ Score:55 │ │ Score:78 │ │ Score:82 │            │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│ │Transport │ │ Water    │ │Agricult. │ │ Tourism  │            │
│ │ Score:51 │ │ Score:73 │ │ Score:60 │ │ Score:35 │            │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
├──────────────────────────────────────────────────────────────────┤
│ AI INSIGHTS PANEL                                                │
│ "Tizi Ouzou ranks 3rd nationally in education but 48th in       │
│  investment. Key concern: road quality index at 42/100..."     │
├──────────────────────────────────────────────────────────────────┤
│ RELATED: Hospitals, Schools, Roads, Projects in this province   │
│ MAP                                                              │
└──────────────────────────────────────────────────────────────────┘
```

### 5.4 Decision Center
- **Queue:** List of pending AI-generated recommendations
- **Detail:** Full recommendation with evidence, trade-offs, alternatives
- **Action:** Accept, Reject (with reason), Modify, Defer, Request Info
- **History:** Past decisions with outcomes
- **Stats:** Acceptance rate, impact metrics

### 5.5 Search Interface
- **Global Command Bar:** `Cmd+K` modal for instant search
- **Search Types:** Natural language, entity, indicator, document
- **Results:** Grouped by category with previews
- **Filters:** Province, sector, time range, data type
- **History:** Recent searches with ability to save

## 6. Responsive Design

| Breakpoint | Target | Layout |
|---|---|---|
| < 768px | Mobile | Single column, bottom nav |
| 768–1024px | Tablet | Two column |
| 1024–1920px | Desktop | Full shell |
| > 1920px | Large display | Extended with side panels |

## 7. Performance Targets

| Metric | Target |
|---|---|
| First Contentful Paint | <1.5s |
| Time to Interactive | <3s |
| Largest Contentful Paint | <2.5s |
| Cumulative Layout Shift | <0.1 |
| First Input Delay | <100ms |
| Bundle size (initial) | <200KB |
| Lighthouse Performance | >90 |

## 8. Accessibility

- WCAG 2.1 AA compliance (AAA for government-critical)
- Full keyboard navigation
- Screen reader optimized (ARIA labels, landmarks)
- High contrast mode
- Focus indicators
- RTL layout support for Arabic

## 9. Internationalization

| Feature | Implementation |
|---|---|
| Languages | Arabic, French, English |
| RTL/LTR | Dynamic based on language |
| Number formats | Arabic (١٢٣) and Western (123) |
| Date formats | Per locale |
| Currency | DZD with locale formatting |
| Translation strings | ICU MessageFormat via react-intl |

## 10. Offline Strategy

- Service Worker caches recent entity data
- IndexedDB stores scores and indicators for offline analysis
- Background sync for decision actions when connectivity resumes
- Graceful degradation with stale-while-revalidate

## 11. State Management

```
Global State (Zustand):
  - Auth: user, tokens, roles, permissions
  - UI: sidebar open/close, theme, preferences
  - Notifications: feed, unread count

Server State (TanStack Query):
  - Entities, scores, indicators, search results
  - Automatic cache invalidation
  - Optimistic updates for decisions

Local State (React useState):
  - Form inputs, dropdowns, toggles
  - UI-specific state
```

## 12. Security

- CSP headers enforced
- XSS prevention (React sanitization + DOMPurify for AI output)
- CSRF protection
- Content Security Policy
- Subresource Integrity for CDN assets
- Authentication token stored in HTTP-only cookie

---

**Document Owner:** Frontend Engineering Team
**Last Updated:** 2026-06-29
