# Research: Apigee Real-Time Monitoring Dashboard

**Date**: 2026-01-20
**Status**: Complete
**Branch**: `001-apigee-monitor-dashboard`

## Overview

This document captures research decisions for the Apigee Monitor Dashboard implementation. Most technology choices are mandated by the project constitution, so research focuses on best practices and integration patterns.

---

## 1. Apigee Management API Integration

### Decision
Use Apigee Edge Management API v1 with Basic Authentication via axios HTTP client.

### Rationale
- Apigee Edge (not Apigee X/hybrid) uses Management API v1
- Basic Auth is the standard authentication method for Edge
- axios provides promise-based HTTP with interceptors for auth headers

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| Official Google API client | Designed for Apigee X (GCP), not Edge |
| node-fetch | Less feature-rich, no interceptors |
| OAuth2 | Not supported by Apigee Edge Management API |

### API Endpoints Required
```text
Organization Level:
  GET /v1/organizations/{org}/apps
  GET /v1/organizations/{org}/apps/{app}
  GET /v1/organizations/{org}/apiproducts
  GET /v1/organizations/{org}/apiproducts/{product}
  GET /v1/organizations/{org}/apis
  GET /v1/organizations/{org}/apis/{api}/deployments

Environment Level:
  GET /v1/organizations/{org}/environments/{env}/caches
  GET /v1/organizations/{org}/environments/{env}/keyvaluemaps
  GET /v1/organizations/{org}/environments/{env}/keyvaluemaps/{kvm}/entries
  GET /v1/organizations/{org}/environments/{env}/targetservers
  GET /v1/organizations/{org}/environments/{env}/references
  GET /v1/organizations/{org}/environments/{env}/keystores
  GET /v1/organizations/{org}/environments/{env}/keystores/{keystore}/certs
  GET /v1/organizations/{org}/environments/{env}/virtualhosts
```

---

## 2. Database Schema Strategy

### Decision
Use PostgreSQL with JSONB columns for entity-specific attributes, plus typed columns for common fields.

### Rationale
- JSONB enables flexible storage of varying entity structures (9 types)
- Typed columns (name, status, timestamps) enable efficient queries
- raw_response JSONB preserves original API data for debugging
- Constitution mandates PostgreSQL + TypeORM

### Schema Pattern
```sql
-- Each entity table follows this pattern:
CREATE TABLE {entity_type} (
    id UUID PRIMARY KEY,
    environment_id UUID REFERENCES environments(id),
    name VARCHAR(255) NOT NULL,
    -- entity-specific typed columns --
    raw_response JSONB,           -- full API response
    fetched_at TIMESTAMP,
    UNIQUE(environment_id, name)  -- prevent duplicates
);
```

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| Single polymorphic table | Harder to query, index, and validate |
| Separate typed columns per field | Too rigid for varying entity structures |
| MongoDB | Constitution mandates PostgreSQL |

---

## 3. Comparison Algorithm

### Decision
Name-based matching with deep JSON comparison for differences.

### Rationale
- Entities are uniquely identified by name within an environment
- Deep comparison ensures nested structures (KVM entries, certs) are compared
- Constitution Principle IV requires deterministic, accurate results

### Algorithm
```text
1. Load entities for env1 and env2 from database
2. Create name→entity maps for both environments
3. For each unique name across both maps:
   a. If exists in both: deep compare → matched-identical OR matched-different
   b. If only in env1: only-in-env1
   c. If only in env2: only-in-env2
4. Sort results by comparison status, then name
```

### Deep Comparison Rules
- Ignore fields: `id`, `fetched_at`, `raw_response`, `environment_id`
- Compare JSONB fields recursively
- For arrays: compare as sets (order-insensitive) OR ordered (configurable)
- Highlight specific differing keys in nested structures

---

## 4. Frontend State Management

### Decision
TanStack Query (React Query) for server state, React Context for UI state.

### Rationale
- TanStack Query handles caching, refetching, loading states automatically
- Avoids Redux boilerplate for what is primarily server-derived data
- React Context sufficient for UI state (selected env, view mode, entity type)

### Query Keys Structure
```typescript
// Hierarchical query keys for cache invalidation
const queryKeys = {
  config: ['config'],
  environments: ['environments'],
  entities: (env: string, type: string) => ['entities', env, type],
  comparison: (env1: string, env2: string, type: string) =>
    ['comparison', env1, env2, type],
};
```

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| Redux + RTK Query | Overkill for this app size; more boilerplate |
| Zustand | Good for client state, but Query better for server state |
| SWR | TanStack Query has better devtools and mutation support |

---

## 5. Parallel Refresh Strategy

### Decision
Promise.allSettled for concurrent environment refresh with per-environment error isolation.

### Rationale
- SC-003 requires 60-second refresh for 4 environments
- FR-013 requires partial success when one environment fails
- Promise.allSettled captures both successes and failures without short-circuiting

### Implementation Pattern
```typescript
async refreshAll(): Promise<RefreshResult> {
  const environments = await this.configService.getEnvironments();

  const results = await Promise.allSettled(
    environments.map(env => this.refreshEnvironment(env))
  );

  return {
    success: results.filter(r => r.status === 'fulfilled').length,
    failed: results
      .filter(r => r.status === 'rejected')
      .map((r, i) => ({ env: environments[i], error: r.reason })),
    refreshedAt: new Date(),
  };
}
```

---

## 6. Configuration Loading

### Decision
YAML configuration with environment variable interpolation at startup.

### Rationale
- Constitution Principle V mandates YAML config
- FR-015 requires credentials from environment variables
- js-yaml + custom interpolation provides clean solution

### Config Structure
```yaml
instances:
  - name: "PROD"
    management_url: "https://api.enterprise.apigee.com/v1"
    org: "prod-org"
    credentials:
      username: "${APIGEE_PROD_USERNAME}"
      password: "${APIGEE_PROD_PASSWORD}"
    environments:
      - "staging"
      - "production"
```

### Environment Variable Pattern
```text
APIGEE_{INSTANCE}_USERNAME
APIGEE_{INSTANCE}_PASSWORD
```

---

## 7. Issue Detection Logic

### Decision
Date-based expiration checks with configurable thresholds.

### Rationale
- FR-010 requires highlighting expired/expiring certificates and revoked credentials
- 30-day warning threshold is industry standard for certificate expiration
- Status field checks for revoked apps/credentials

### Detection Rules
| Issue | Detection Logic | Severity |
|-------|-----------------|----------|
| Expired Certificate | `expiresAt < now` | Critical (red) |
| Expiring Soon | `expiresAt < now + 30 days` | Warning (orange) |
| Revoked App | `status === 'revoked'` | Critical (red) |
| Revoked Credential | `credential.status === 'revoked'` | Critical (red) |
| Expired Credential | `credential.expiresAt < now` | Critical (red) |
| Undeployed Proxy | `deployedRevisions.length === 0` | Info (gray) |

---

## Summary

All technology decisions align with the project constitution. No NEEDS CLARIFICATION items remain. The implementation can proceed to Phase 1 (data model and contracts).
