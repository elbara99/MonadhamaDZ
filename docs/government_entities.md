# Government Entities

**Doc ID:** GE-001
**Version:** 1.0
**Status:** Draft for Review
**Classification:** Confidential

---

## 1. Purpose

This document catalogs all government entity types modeled in the Monadhama knowledge graph. Each entity type includes its definition, attributes, relationships, and data sources.

## 2. Entity Catalog

### 2.1 Administrative Entities

| Entity | Cardinality | Description |
|---|---|---|
| Country | 1 | Sovereign nation (Algeria) |
| Province | 58 | First-level administrative division (Wilaya) |
| District | 547 | Second-level division (Daira) |
| Commune | 1,541 | Third-level division (Baladiyah) |
| City | 100+ | Urban centers (may overlap with communes) |
| Village | 10,000+ | Rural settlements |

### 2.2 Health Entities

| Entity | Count (Target) | Description |
|---|---|---|
| University Hospital (CHU) | 29 | Major teaching hospitals |
| General Hospital (EHS) | 183 | Public general hospitals |
| Local Hospital | 300+ | District-level hospitals |
| Maternity Clinic | 200+ | Maternal health facilities |
| Polyclinic | 1,500+ | Multi-specialty clinics |
| Basic Health Center | 5,000+ | Primary care facilities |
| Private Clinic | 500+ | Private healthcare |
| Pharmacy | 12,000+ | Community pharmacies |
| Blood Bank | 50+ | Blood collection centers |
| Mental Health Facility | 30+ | Psychiatric hospitals |
| Rehabilitation Center | 50+ | Physical rehab |

### 2.3 Education Entities

| Entity | Count (Target) | Description |
|---|---|---|
| Primary School | 18,000+ | École primaire |
| Middle School | 6,000+ | Collège d'enseignement moyen (CEM) |
| Secondary School | 3,000+ | Lycée |
| Vocational School | 800+ | Centre de formation professionnelle |
| Kindergarten | 2,000+ | Preschools |
| University | 115 | Public universities and centers |
| University Center | 50+ | Centres universitaires |
| Higher School (ENS, ENP, etc.) | 30+ | Écoles supérieures |
| Research Center | 100+ | Research institutions |
| Institute | 200+ | Technical institutes |
| Teacher Training Center | 50+ | Formation des enseignants |

### 2.4 Infrastructure Entities

| Entity | Count (Target) | Description |
|---|---|---|
| Road Segment | 150,000+ | Sections of road network |
| Highway | 2,000+ km | Autoroutes |
| National Road | 30,000+ km | Routes nationales |
| Provincial Road | 50,000+ km | Chemins wilayaux |
| Railway Station | 220+ | Train stations |
| Railway Line | 4,500+ km | Rail network |
| Airport | 35+ | Commercial, military, regional |
| Seaport | 15+ | Commercial, fishing |
| Dam | 80+ | Water storage dams |
| Water Treatment Plant | 200+ | Potable water treatment |
| Wastewater Plant | 150+ | Sewage treatment |
| Power Plant | 60+ | Electricity generation |
| Substation | 500+ | Electrical substations |
| Telecom Tower | 15,000+ | Mobile/cellular towers |
| Bridge | 5,000+ | Major bridges |
| Tunnel | 100+ | Road/rail tunnels |
| Bus Station | 500+ | Intercity bus terminals |
| Metro Station | 30+ | Algiers metro |
| Tramway Station | 100+ | Tram stops |

### 2.5 Security & Justice Entities

| Entity | Count (Target) | Description |
|---|---|---|
| Police Station | 800+ | Sûreté nationale |
| Gendarmerie Station | 600+ | Gendarmerie nationale |
| Border Post | 50+ | Land border crossings |
| Court (Tribunal) | 250+ | Judicial courts |
| Appeals Court | 48+ | Cours d'appel |
| Supreme Court | 1 | Cour suprême |
| Prison | 60+ | Correctional facilities |
| Civil Protection Station | 600+ | Protection civile |
| Customs Office | 100+ | Customs posts |

### 2.6 Economic Entities

| Entity | Count (Target) | Description |
|---|---|---|
| Investment Project | 5,000+ | Public investment projects |
| Industrial Zone | 100+ | Zones industrielles |
| Free Trade Zone | 5+ | Zones franches |
| Agriculture Zone | 1,000+ | Zones agricoles |
| Irrigation Perimeter | 500+ | Périmètres irrigués |
| Market | 2,000+ | Public markets |
| Bank Branch | 3,000+ | Banking institutions |
| Post Office | 3,500+ | Algérie Poste |
| Tax Office | 200+ | Tax collection centers |
| Chamber of Commerce | 58+ | Per province |
| Tourism Zone | 100+ | Tourist development zones |
| Hotel | 1,500+ | Classified hotels |
| Cultural Site | 500+ | Museums, monuments, ruins |

### 2.7 Environmental Entities

| Entity | Count (Target) | Description |
|---|---|---|
| National Park | 10+ | Parcs nationaux |
| Nature Reserve | 50+ | Réserves naturelles |
| Forest | 1,000+ | Major forest areas |
| Water Source | 500+ | Springs, wells |
| River | 50+ | Major rivers (Oued) |
| Lake | 20+ | Natural and artificial lakes |
| Wetland | 50+ | Ramsar sites |
| Air Quality Station | 50+ | Monitoring stations |
| Weather Station | 200+ | Meteorological stations |
| Waste Landfill | 300+ | Sanitary and uncontrolled |
| Recycling Facility | 50+ | Sorting/recycling centers |
| Seismic Station | 30+ | Earthquake monitoring |

### 2.8 Citizen & Social Entities

| Entity | Count (Target) | Description |
|---|---|---|
| Social Security Office | 200+ | CNAS offices |
| Pension Office | 100+ | CNR offices |
| Employment Agency | 400+ | ANEM agencies |
| Social Housing Project | 1,000+ | Housing developments |
| Public Park | 500+ | Urban parks |
| Sports Complex | 200+ | Major sports facilities |
| Stadium | 100+ | Stadia |
| Library | 500+ | Public libraries |
| Cultural Center | 600+ | Maisons de la culture |
| Youth Center | 1,000+ | Centres de jeunes |
| Mosque | 15,000+ | Religious institutions |
| Cemetery | 5,000+ | Cemeteries |

## 3. Entity Relationships

### 3.1 Hierarchical

```
Country ──BELONGS_TO── Province ──BELONGS_TO── District ──BELONGS_TO── Commune
                                                                  │
                                                                  ├──HAS_HOSPITAL── Hospital
                                                                  ├──HAS_SCHOOL─── School
                                                                  └──HAS_ROAD──── Road
```

### 3.2 Administrative

```
Ministry ──OVERSEES── Agency
Ministry ──HAS_BUDGET── BudgetLine
Province ──REPORTS_TO── Ministry
Governor ──APPOINTED_BY── President
Project ──FUNDED_BY── Ministry
Project ──IMPLEMENTED_BY── Contractor
```

### 3.3 Geographic

```
Road ──CONNECTS── City (from)
Road ──CONNECTS── City (to)
Hospital ──LOCATED_IN── Commune
School ──SERVES── District
Dam ──ON_RIVER── River
River ──FLOWS_THROUGH── Province
```

### 3.4 Temporal

```
Entity ──HAS_VERSION── EntityVersion (valid_from → valid_to)
Province ──HAS_INDICATOR── CitizenIndicators (year, quarter)
Project ──HAS_MILESTONE── ProjectMilestone (date, status)
```

## 4. Entity Lifecycle States

| State | Description | Visibility |
|---|---|---|
| Proposed | Entity identified, not yet active | Internal |
| Active | Entity operational, data flowing | Public |
| UnderConstruction | Entity being built/established | Public |
| Suspended | Temporarily inactive | Internal |
| Closed | Entity permanently closed/dismantled | Public |
| Historical | Entity no longer exists, data archived | Public |

## 5. Entity Resolution Rules

When integrating data from multiple sources:

1. **Government code takes priority** over names for matching
2. **Coordinates** (lat/lng) used for spatial matching when code absent
3. **Name matching** with fuzzy threshold (0.85+) and manual review for conflicts
4. **Temporal conflicts** resolved by latest timestamp unless overridden manually
5. **Authority hierarchy**: Official government statistics > Administrative data > International data > Estimated

## 6. Provincial Data Coverage

| Data Domain | Province Coverage | Update Frequency |
|---|---|---|
| Demographics | 58/58 | Annual |
| Health Facilities | 58/58 | Quarterly |
| Education Facilities | 58/58 | Annual |
| Roads | 58/58 | Annual |
| Investment Projects | 58/58 | Quarterly |
| Crime Statistics | 58/58 | Monthly |
| Agriculture | 58/58 | Annual |
| Water Resources | 58/58 | Quarterly |
| Energy | 58/58 | Monthly |

---

**Document Owner:** Knowledge Engineering Team
**Last Updated:** 2026-06-29
