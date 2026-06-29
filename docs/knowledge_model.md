# Knowledge Model

**Doc ID:** KM-001
**Version:** 2.0
**Status:** Draft for Review
**Classification:** Confidential

---

## 1. Overview

The Knowledge Model is the semantic backbone of Monadhama. It defines every entity, attribute, and relationship that the system understands about a nation. Built as a property graph model in Neo4j, it provides a unified representation of the entire state — provinces, cities, hospitals, schools, roads, investment projects, and citizen indicators — all connected by typed, directional relationships.

## 2. Entity Hierarchy

```
Country
├── Province (Wilaya)
│   ├── City (Commune/Daira)
│   │   ├── Hospital
│   │   ├── School
│   │   ├── University
│   │   ├── Police Station
│   │   ├── Court
│   │   └── Public Facility
│   ├── Road Network
│   ├── Railway
│   ├── Port
│   ├── Airport
│   ├── InvestmentProject
│   ├── AgriculturalZone
│   ├── WaterSource
│   ├── EnergyFacility
│   └── EnvironmentalZone
└── National-Level Entities
    ├── Ministry
    ├── GovernmentProgram
    └── NationalIndicator
```

## 3. Core Entity Definitions

### 3.1 Country

```
Country {
  id: UUID
  code: String (ISO 3166-1 alpha-3)
  name: String
  name_ar: String (Arabic)
  name_fr: String (French)
  official_languages: [String]
  currency: String (ISO 4217)
  timezone: String
  capital: String
  population: Integer
  area_km2: Float
  gdp_usd: Float
  government_type: String
  administrative_levels: [String]
  metadata: JSON
}
```

### 3.2 Province (Wilaya)

```
Province {
  id: UUID
  code: String (ISO 3166-2)
  name: String
  name_ar: String
  name_fr: String
  country_id: UUID → Country
  capital_city: String
  population: Integer
  population_density: Float
  area_km2: Float
  urban_population_pct: Float
  rural_population_pct: Float
  median_age: Float
  dependency_ratio: Float
  governor: String
  established_date: Date
  metadata: JSON
}
```

### 3.3 City

```
City {
  id: UUID
  code: String
  name: String
  name_ar: String
  name_fr: String
  province_id: UUID → Province
  city_type: Enum(Commune, Daira, City, District)
  population: Integer
  area_km2: Float
  latitude: Float
  longitude: Float
  elevation_m: Float
  is_capital: Boolean
  has_airport: Boolean
  has_railway_station: Boolean
  has_port: Boolean
  postal_code: String
  metadata: JSON
}
```

### 3.4 Hospital

```
Hospital {
  id: UUID
  code: String
  name: String
  name_ar: String
  name_fr: String
  province_id: UUID → Province
  city_id: UUID → City
  hospital_type: Enum(General, Specialist, University, Clinic, Maternity)
  ownership: Enum(Public, Private, Military)
  beds: Integer
  icu_beds: Integer
  emergency_room: Boolean
  specialties: [String]
  doctors_count: Integer
  nurses_count: Integer
  latitude: Float
  longitude: Float
  phone: String
  email: String
  website: String
  established_year: Integer
  status: Enum(Active, UnderConstruction, Closed)
  accreditation: [String]
  metadata: JSON
}
```

### 3.5 School

```
School {
  id: UUID
  code: String
  name: String
  name_ar: String
  name_fr: String
  province_id: UUID → Province
  city_id: UUID → City
  school_type: Enum(Primary, Middle, Secondary, Vocational, Combined)
  ownership: Enum(Public, Private)
  students_total: Integer
  teachers_total: Integer
  classrooms: Integer
  student_teacher_ratio: Float
  has_library: Boolean
  has_laboratory: Boolean
  has_canteen: Boolean
  has_sports_facility: Boolean
  has_internet: Boolean
  electricity: Boolean
  water: Boolean
  sanitation: Boolean
  latitude: Float
  longitude: Float
  phone: String
  established_year: Integer
  status: Enum(Active, UnderConstruction, Closed)
  metadata: JSON
}
```

### 3.6 University

```
University {
  id: UUID
  code: String
  name: String
  name_ar: String
  name_fr: String
  province_id: UUID → Province
  city_id: UUID → City
  university_type: Enum(Public, Private, Technical)
  students_total: Integer
  faculty_count: Integer
  administrative_staff: Integer
  faculties: [String]  // List of faculty/department names
  research_centers: [String]
  has_hospital: Boolean  // Teaching hospital
  has_library: Boolean
  has_dormitories: Boolean
  dormitory_capacity: Integer
  latitude: Float
  longitude: Float
  website: String
  established_year: Integer
  ranking_national: Integer
  metadata: JSON
}
```

### 3.7 Road

```
Road {
  id: UUID
  code: String
  name: String
  road_type: Enum(Highway, National, Provincial, Local, Rural)
  province_id: UUID → Province
  from_city_id: UUID → City
  to_city_id: UUID → City
  length_km: Float
  width_m: Float
  lanes: Integer
  surface_type: String(Asphalt, Concrete, Unpaved)
  condition: Enum(Excellent, Good, Fair, Poor, Critical)
  last_maintenance_date: Date
  maintenance_status: Enum(Planned, InProgress, Completed, Overdue)
  traffic_volume: String // daily average
  toll: Boolean
  lit: Boolean
  metadata: JSON
}
```

### 3.8 Investment Project

```
InvestmentProject {
  id: UUID
  code: String
  name: String
  name_ar: String
  name_fr: String
  province_id: UUID → Province
  sector: String
  project_type: Enum(Infrastructure, Industrial, Agricultural, Social, Technology, Energy, Tourism)
  status: Enum(Planned, InProgress, Completed, Suspended, Cancelled)
  total_budget_dzd: Float
  total_budget_usd: Float
  spent_to_date: Float
  start_date: Date
  expected_completion: Date
  actual_completion: Date
  contractor: String
  funding_source: String(National, ForeignDirect, PublicPrivate, InternationalLoan)
  progress_pct: Float
  jobs_created: Integer
  delay_days: Integer
  metadata: JSON
}
```

### 3.9 Citizen Indicators (Aggregated)

```
CitizenIndicators {
  id: UUID
  province_id: UUID → Province
  year: Integer
  quarter: Integer
  population: Integer
  birth_rate: Float
  death_rate: Float
  life_expectancy: Float
  infant_mortality_rate: Float
  maternal_mortality_rate: Float
  literacy_rate: Float
  unemployment_rate: Float
  youth_unemployment_rate: Float
  poverty_rate: Float
  gini_coefficient: Float
  internet_access_pct: Float
  electricity_access_pct: Float
  clean_water_access_pct: Float
  sanitation_access_pct: Float
  housing_ownership_pct: Float
  metadata: JSON
}
```

### 3.10 Economic Indicators

```
EconomicIndicators {
  id: UUID
  province_id: UUID → Province
  year: Integer
  quarter: Integer
  gdp_nominal: Float
  gdp_per_capita: Float
  gdp_growth_rate: Float
  inflation_rate: Float
  unemployment_rate: Float
  labor_force_participation: Float
  median_household_income: Float
  average_salary: Float
  minimum_wage: Float
  economic_activity_rate: Float
  main_industries: [String]
  metadata: JSON
}
```

### 3.11 Ministry

```
Ministry {
  id: UUID
  code: String
  name: String
  name_ar: String
  name_fr: String
  minister_name: String
  minister_title: String
  website: String
  address: String
  phone: String
  email: String
  responsibilities: [String]
  budget_annual_dzd: Float
  employee_count: Integer
  sub_agencies: [String]
  metadata: JSON
}
```

## 4. Relationship Types

| Relationship | Source | Target | Properties |
|---|---|---|---|
| BELONGS_TO | City | Province | — |
| BELONGS_TO | Province | Country | — |
| HAS_HOSPITAL | Province | Hospital | count: Integer |
| HAS_SCHOOL | Province | School | count: Integer |
| HAS_UNIVERSITY | Province | University | count: Integer |
| HAS_ROAD | Province | Road | total_km: Float |
| HAS_PROJECT | Province | InvestmentProject | count: Integer |
| CONNECTS | Road | City | type: Enum(from, to) |
| REPORTS_TO | Agency | Ministry | — |
| FUNDED_BY | InvestmentProject | Ministry | amount: Float |
| HAS_INDICATOR | Province | CitizenIndicators | year: Integer |
| HAS_ECONOMIC | Province | EconomicIndicators | year: Integer |
| COMPARED_TO | Province | Province | metrics: JSON |
| TRENDING | Indicator | Trend | direction: Enum, strength: Float |

## 5. Semantic Versioning for Entities

Every entity update is versioned. The version history enables:
- Temporal queries ("What was the hospital capacity in 2023?")
- Audit trails for data provenance
- Rollback capability

```
EntityVersion {
  entity_id: UUID
  entity_type: String
  version: Integer
  snapshot: JSON
  valid_from: Timestamp
  valid_to: Timestamp
  created_by: String
  change_reason: String
}
```

## 6. Entity Resolution

When data arrives from multiple sources, the Entity Resolution Service:
1. Normalizes all identifiers (government codes, names, coordinates)
2. Detects duplicates using fuzzy matching + ML-based deduplication
3. Creates a canonical entity with linked source records
4. Flags conflicting attributes for human review

## 7. Multi-Country Model

The knowledge model supports multiple countries through:
- A `country_id` field on every root-level entity
- Country-specific attribute extensions (e.g., `name_ar` for Arabic-speaking nations, `name_zh` for Chinese)
- Configurable administrative level hierarchy per country
- Isolated graph namespaces per deployment

---

**Document Owner:** Knowledge Engineering Team
**Last Updated:** 2026-06-29
