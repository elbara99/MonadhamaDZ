# Security Architecture

**Doc ID:** SEC-001
**Version:** 1.0
**Status:** Draft for Review
**Classification:** Confidential — Security

---

## 1. Security Principles

- **Zero Trust:** No implicit trust. Every request authenticated, authorized, and encrypted.
- **Defense in Depth:** Multiple overlapping security controls at every layer.
- **Least Privilege:** Minimum access required for any operation.
- **Data Sovereignty:** All data remains under government control. No data leaves sovereign infrastructure.
- **Audit Everything:** Every access, modification, and decision logged immutably.
- **Secure by Default:** Security built in from design phase, not added later.

## 2. Security Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PUBLIC USERS                                │
├─────────────────────────────────────────────────────────────────────┤
│                      WAF (CloudFlare / ModSecurity)                  │
├─────────────────────────────────────────────────────────────────────┤
│                      LOAD BALANCER (TLS termination)                 │
├─────────────────────────────────────────────────────────────────────┤
│                        API GATEWAY (Kong)                            │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────────┐  │
│  │ AuthN      │ │ AuthZ      │ │ Rate Limit │ │ Audit Log        │  │
│  │ (OAuth2)   │ │ (ABAC)     │ │            │ │                  │  │
│  └────────────┘ └────────────┘ └────────────┘ └──────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│                         SERVICE MESH (Istio mTLS)                    │
├─────────────────────────────────────────────────────────────────────┤
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────────┐  │
│  │ App        │ │ App        │ │ App        │ │ App              │  │
│  │ Service    │ │ Service    │ │ Service    │ │ Service          │  │
│  │ (Sidecar)  │ │ (Sidecar)  │ │ (Sidecar)  │ │ (Sidecar)        │  │
│  └────────────┘ └────────────┘ └────────────┘ └──────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│                      DATA ACCESS LAYER                               │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────────┐  │
│  │ Encryption │ │ Column     │ │ Data       │ │ Backup           │  │
│  │ at Rest    │ │ Masking    │ │ Leak Prev  │ │ Encryption       │  │
│  └────────────┘ └────────────┘ └────────────┘ └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## 3. Authentication (AuthN)

### 3.1 Identity Provider
**Keycloak** — enterprise-grade identity and access management.

- OAuth 2.0 + OpenID Connect 1.0
- SAML 2.0 support for government federation
- LDAP/Active Directory integration for existing government directories
- Multi-factor authentication (TOTP, SMS, smart card)
- Passwordless authentication support (FIDO2/WebAuthn)

### 3.2 Token Strategy
| Token | Type | Lifetime | Storage |
|---|---|---|---|
| Access Token | JWT (RS256) | 15 minutes | Browser memory |
| Refresh Token | Opaque | 7 days | HTTP-only secure cookie |
| ID Token | JWT (RS256) | Session | Browser memory |
| Service Token | JWT (RS256) | 1 hour | Vault/dynamic |

### 3.3 Token Claims
```json
{
  "sub": "user-uuid",
  "iss": "https://auth.monadhama.dz/realms/monadhama",
  "aud": ["monadhama-api"],
  "roles": ["minister", "province_analyst"],
  "permissions": [
    "provinces:read",
    "provinces:DZ-16:read",
    "decisions:write",
    "reports:generate"
  ],
  "attributes": {
    "province_access": ["DZ-16", "DZ-31"],
    "clearance_level": 3,
    "ministry": "health"
  },
  "iat": 1719660000,
  "exp": 1719660900
}
```

## 4. Authorization (AuthZ)

### 4.1 Attribute-Based Access Control (ABAC)

ABAC over RBAC for fine-grained, context-aware permissions:

```
Policy: Analyst can only read provinces assigned to their ministry
Rule: user.attributes.ministry == resource.ministry

Policy: Minister can generate decisions for their province
Rule: resource.province_code IN user.attributes.province_access AND user.roles CONTAINS 'minister'
```

### 4.2 Permission Hierarchy

| Level | Scope | Example |
|---|---|---|
| L1 | Public | National statistics, open data |
| L2 | Government | Province indicators (aggregated) |
| L3 | Ministry | Ministry-specific detailed data |
| L4 | Classified | Individual records, PII |
| L5 | Top Secret | National security data |

### 4.3 Role Catalog

| Role | Description | Max Level |
|---|---|---|
| viewer | Read-only access | L2 |
| analyst | Read + generate reports | L3 |
| province_manager | Full access to assigned provinces | L3 |
| minister | Full access to ministry data | L4 |
| secretary_general | Cross-ministry oversight | L4 |
| administrator | System configuration | L2 (admin functions) |
| auditor | Read-only audit logs | L2 |
| super_admin | Emergency access, fully audited | L5 |

## 5. Encryption

### 5.1 In Transit
| Layer | Protocol | Cipher |
|---|---|---|
| External | TLS 1.3 | TLS_AES_256_GCM_SHA384 |
| Internal (service mesh) | mTLS 1.3 | TLS_AES_256_GCM_SHA384 |
| Database connections | TLS 1.3 | TLS_AES_256_GCM_SHA384 |
| Message queue (Kafka) | TLS 1.3 + SASL/SCRAM | TLS_AES_256_GCM_SHA384 |

### 5.2 At Rest
| Storage | Encryption | Key Management |
|---|---|---|
| Object Storage | AES-256, server-side | Vault + AWS KMS / HSM |
| Databases | TDE (AES-256) | Vault + HSM |
| Backups | AES-256 | Separate backup key |
| Secrets | Vault encrypted at rest | HSM root key |

### 5.3 Column-Level Encryption
Sensitive columns encrypted with per-tenant keys:
- Citizen PII (name, ID number, address)
- Government employee data
- Security-sensitive indicators

## 6. Audit Logging

### 6.1 Audit Events

| Event Category | Examples | Retention |
|---|---|---|
| Authentication | Login, logout, MFA, token refresh | 5 years |
| Authorization | Access denied, permission change | 5 years |
| Data Access | Entity read, indicator query | 3 years |
| Data Modification | Entity create, update, delete | 7 years |
| Decision | Generate, accept, reject, modify | 7 years |
| Administration | User create, role change, config change | 7 years |
| AI Interaction | Query, response, feedback | 3 years |
| Security | Rate limit hit, suspicious activity | 5 years |

### 6.2 Audit Record Format
```json
{
  "audit_id": "aud-20260629-001",
  "timestamp": "2026-06-29T14:30:00.123Z",
  "event_type": "data_access.read",
  "user_id": "user-uuid",
  "user_role": "analyst",
  "session_id": "session-uuid",
  "ip_address": "10.0.1.100",
  "user_agent": "Mozilla/5.0...",
  "resource": {
    "type": "entity.hospital",
    "id": "hospital-uuid",
    "province": "DZ-16"
  },
  "action": "GET /api/v1/entities/hospitals/hospital-uuid",
  "status": "success",
  "response_size": 2450,
  "geo_location": {
    "city": "Tizi Ouzou",
    "country": "DZ"
  },
  "correlation_id": "req-abc123",
  "immutable_hash": "sha256-previous_hash+payload"
}
```

### 6.3 Audit Chain Integrity
Audit logs form a hash chain for tamper evidence:
- Each record contains `sha256(previous_record_hash + current_payload)`
- Hashes periodically anchored to external timestamp service
- Immutable storage in append-only ClickHouse table

## 7. Network Security

| Control | Implementation |
|---|---|
| Network Segmentation | Kubernetes namespaces + network policies |
| Micro-segmentation | Istio authorization policies per service |
| WAF | ModSecurity with OWASP CRS |
| DDoS Protection | Rate limiting at gateway + cloud WAF |
| Intrusion Detection | Falco + OSSEC for container/runtime security |
| API Security | API key validation, schema validation, request sanitization |
| Secrets Management | HashiCorp Vault with dynamic secrets |
| Certificate Management | cert-manager with automated renewal |

## 8. Vulnerability Management

- **SAST:** SonarQube in CI pipeline
- **DAST:** OWASP ZAP against staging environment
- **SCA:** Trivy for container vulnerability scanning
- **Dependency scanning:** Dependabot + Snyk
- **Penetration testing:** Quarterly independent security assessment
- **Bug bounty:** Private program for vetted researchers
- **Patch management:** 48-hour SLA for critical CVEs

## 9. Incident Response

### 9.1 IR Plan
1. **Detection** — Automated alerts + SOC monitoring
2. **Containment** — Network isolation of affected services
3. **Eradication** — Patch, rotate credentials, remove threats
4. **Recovery** — Restore from verified clean backups
5. **Post-mortem** — Root cause analysis, preventive measures

### 9.2 Incident Severity

| Level | Description | Response Time |
|---|---|---|
| SEV-1 | Data breach, service outage | <15 minutes |
| SEV-2 | Potential compromise, data integrity issue | <1 hour |
| SEV-3 | Policy violation, misconfiguration | <4 hours |
| SEV-4 | Minor incident | <24 hours |

## 10. Compliance

| Standard | Scope |
|---|---|
| ISO 27001 | Information security management |
| SOC 2 Type II | Controls for security, availability, confidentiality |
| GDPR / Law 18-07 | Personal data protection (Algerian law) |
| NIST SP 800-53 | Security controls framework |
| OWASP ASVS | Application security verification |
| Local data sovereignty | Data residency within national borders |

## 11. AI Security

### 11.1 Model Security
| Threat | Mitigation |
|---|---|
| Prompt injection | Input sanitization, role boundary enforcement |
| Data poisoning | Data quality checks, provenance tracking |
| Model inversion | Differential privacy, output filtering |
| Adversarial examples | Input validation, robust training |
| Model theft | Access control, watermarking |
| Hallucination | Factual grounding, confidence thresholds |

### 11.2 Guardrails
- Output validation against source context
- PII redaction in all AI outputs
- Toxic content filter
- Politically sensitive topic handling
- Rate limiting per user to prevent abuse
- Audit trail for every AI interaction

## 12. Physical Security (On-Premise)

| Control | Implementation |
|---|---|
| Data Center Access | Biometric + smart card, 2-factor |
| Surveillance | CCTV with 90-day retention |
| Environmental | Fire suppression, climate control |
| Power | Dual redundant UPS + generators |
| Network | Dedicated fiber, no public internet dependency |

---

**Document Owner:** Security Team
**Last Updated:** 2026-06-29
