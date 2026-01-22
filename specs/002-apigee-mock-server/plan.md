# Implementation Plan: Apigee Mock Management Server

**Branch**: `002-apigee-mock-server` | **Date**: 2026-01-22 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-apigee-mock-server/spec.md`

## Summary

Implement a standalone Express.js mock server that replicates the Apigee Edge Management API for local development. The mock server will serve JSON responses matching the exact API structure documented in `APIGEE_MNGMNT_API.yaml` (official OpenAPI spec), enabling developers to run the full dashboard stack without access to a real Apigee instance. Mock data will include 2 environments with 5-10 entities per type, featuring known differences and issues (expired certs, revoked apps, undeployed proxies) for comprehensive testing.

**API Reference**: `/APIGEE_MNGMNT_API.yaml` - Complete Apigee Edge Management API OpenAPI 3.0 spec

## Technical Context

**Language/Version**: TypeScript 5.3+ with Node.js 20 LTS
**Primary Dependencies**: Express.js 4.x, cors, morgan (logging)
**Storage**: JSON files (mock data), no database required
**Testing**: Jest with supertest for API endpoint testing
**Target Platform**: Linux/macOS/Windows (Docker container for consistency)
**Project Type**: Standalone service within existing monorepo (new `mock-server/` directory)
**Performance Goals**: <100ms response time for all endpoints
**Constraints**: Must match exact Apigee API response structures, Basic Auth with hardcoded credentials (mock/mock)
**Scale/Scope**: 2 environments × 9 entity types × 5-10 entities = ~90-180 mock entities total

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Read-Only Operations | ✅ PASS | Mock server is read-only by design (no write endpoints) |
| II. Database-First Architecture | ✅ PASS | Mock server replaces Apigee API, not database; dashboard still reads from PostgreSQL after refresh |
| III. Environment Isolation | ✅ PASS | Mock data will follow INSTANCE-ORG-ENV pattern with clear separation |
| IV. Comparison Accuracy | ✅ PASS | Mock data designed with known differences to verify comparison logic |
| V. Configuration as Code | ✅ PASS | Mock data stored in JSON configuration files, not hardcoded |

**Technology Compliance:**
| Constraint | Status | Notes |
|-----------|--------|-------|
| Express.js vs NestJS | ⚠️ DEVIATION | Spec requires Express.js (simpler for mock), constitution mandates NestJS for backend. **Justified**: Mock server is a development tool, not the main backend. Express.js reduces complexity for a stateless mock API. |
| Basic Auth | ✅ PASS | Matches constitution's "Auth (Apigee): Basic Authentication" |
| Docker Compose | ✅ PASS | Will integrate with existing docker-compose.yml |

**Gate Result**: PASS (deviation justified)

## Project Structure

### Documentation (this feature)

```text
specs/002-apigee-mock-server/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI spec)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# Existing structure (unchanged)
backend/                 # NestJS backend (port 3001)
frontend/                # React frontend (port 3002)
config/                  # Apigee configuration YAML

# New mock server (this feature)
mock-server/
├── src/
│   ├── index.ts                 # Express app entry point
│   ├── middleware/
│   │   ├── auth.ts              # Basic Auth middleware
│   │   └── logger.ts            # Request logging middleware
│   ├── routes/
│   │   ├── organizations.ts     # /v1/organizations endpoints
│   │   ├── environments.ts      # /v1/.../environments endpoints
│   │   ├── apps.ts              # /v1/.../apps endpoints
│   │   ├── apiProducts.ts       # /v1/.../apiproducts endpoints
│   │   ├── apiProxies.ts        # /v1/.../apis endpoints
│   │   ├── caches.ts            # /v1/.../caches endpoints
│   │   ├── kvms.ts              # /v1/.../keyvaluemaps endpoints
│   │   ├── targetServers.ts     # /v1/.../targetservers endpoints
│   │   ├── references.ts        # /v1/.../references endpoints
│   │   ├── keystores.ts         # /v1/.../keystores endpoints
│   │   └── virtualHosts.ts      # /v1/.../virtualhosts endpoints
│   └── data/
│       └── loader.ts            # JSON data loading utility
├── data/
│   ├── organizations.json       # Mock org data
│   ├── dev/                     # Dev environment mock data
│   │   ├── apps.json
│   │   ├── apiProducts.json
│   │   ├── apiProxies.json
│   │   ├── caches.json
│   │   ├── kvms.json
│   │   ├── targetServers.json
│   │   ├── references.json
│   │   ├── keystores.json
│   │   └── virtualHosts.json
│   └── staging/                 # Staging environment mock data
│       └── [same structure as dev/]
├── certs/                       # Pre-generated test certificates
│   ├── expired.pem              # Expired certificate
│   ├── expiring-soon.pem        # Expiring within 30 days
│   └── valid.pem                # Valid long-term certificate
├── tests/
│   ├── auth.test.ts             # Auth middleware tests
│   └── endpoints.test.ts        # API endpoint tests
├── package.json
├── tsconfig.json
└── Dockerfile

# Updated files
docker-compose.yml               # Add mock-server service
.env.example                     # Add MOCK_SERVER_PORT
config/apigee-config.yaml        # Add mock instance configuration
```

**Structure Decision**: New `mock-server/` directory at repository root, parallel to `backend/` and `frontend/`. This keeps the mock server isolated as a development tool while allowing shared Docker Compose orchestration.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Express.js instead of NestJS | Mock server is a stateless API stub with no business logic | NestJS adds unnecessary complexity (DI, modules) for simple route handlers returning static JSON |

## API Endpoints to Implement

Based on `APIGEE_MNGMNT_API.yaml` and existing `ApigeeService` usage in the dashboard backend:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/organizations` | GET | List all organizations |
| `/v1/organizations/{org}` | GET | Get organization details |
| `/v1/organizations/{org}/environments` | GET | List environments |
| `/v1/organizations/{org}/environments/{env}` | GET | Get environment details |
| `/v1/organizations/{org}/apps?expand=true` | GET | List all apps (expanded) |
| `/v1/organizations/{org}/apps/{appId}` | GET | Get single app details |
| `/v1/organizations/{org}/apiproducts?expand=true` | GET | List all API products |
| `/v1/organizations/{org}/apiproducts/{productName}` | GET | Get single product |
| `/v1/organizations/{org}/apis` | GET | List all API proxies |
| `/v1/organizations/{org}/apis/{apiName}` | GET | Get proxy details |
| `/v1/organizations/{org}/apis/{apiName}/deployments` | GET | Get deployment status |
| `/v1/organizations/{org}/environments/{env}/caches` | GET | List caches |
| `/v1/organizations/{org}/environments/{env}/caches/{cacheName}` | GET | Get cache details |
| `/v1/organizations/{org}/environments/{env}/keyvaluemaps` | GET | List KVMs |
| `/v1/organizations/{org}/environments/{env}/keyvaluemaps/{kvmName}` | GET | Get KVM details |
| `/v1/organizations/{org}/environments/{env}/targetservers` | GET | List target servers |
| `/v1/organizations/{org}/environments/{env}/targetservers/{name}` | GET | Get target server |
| `/v1/organizations/{org}/environments/{env}/references` | GET | List references |
| `/v1/organizations/{org}/environments/{env}/references/{refName}` | GET | Get reference |
| `/v1/organizations/{org}/environments/{env}/keystores` | GET | List keystores |
| `/v1/organizations/{org}/environments/{env}/keystores/{name}` | GET | Get keystore details |
| `/v1/organizations/{org}/environments/{env}/keystores/{name}/aliases/{alias}` | GET | Get certificate (PEM) |
| `/v1/organizations/{org}/environments/{env}/virtualhosts` | GET | List virtual hosts |
| `/v1/organizations/{org}/environments/{env}/virtualhosts/{vhName}` | GET | Get virtual host |

## Mock Data Design

**Organization**: `mock-org`
**Environments**: `dev`, `staging`

### Entity Distribution for Comparison Testing

| Entity Type | Dev Count | Staging Count | Matched | Different | Only Dev | Only Staging |
|-------------|-----------|---------------|---------|-----------|----------|--------------|
| Apps | 6 | 5 | 3 | 1 | 2 | 1 |
| API Products | 5 | 5 | 3 | 2 | 0 | 0 |
| API Proxies | 7 | 6 | 4 | 1 | 2 | 1 |
| Caches | 4 | 4 | 3 | 1 | 0 | 0 |
| KVMs | 5 | 4 | 2 | 1 | 2 | 1 |
| Target Servers | 5 | 5 | 4 | 1 | 0 | 0 |
| References | 4 | 4 | 3 | 1 | 0 | 0 |
| Keystores | 5 | 4 | 2 | 1 | 2 | 1 |
| Virtual Hosts | 3 | 3 | 2 | 1 | 0 | 0 |

### Issue Scenarios for Testing

| Issue Type | Entity | Environment | Details |
|------------|--------|-------------|---------|
| Expired Certificate | keystore: `payment-certs` | dev | Certificate expired 30 days ago |
| Expiring Soon | keystore: `api-gateway-certs` | staging | Expires in 15 days |
| Revoked App | app: `deprecated-partner-app` | dev | status: "revoked" |
| Undeployed Proxy | proxy: `legacy-api-v1` | staging | No deployment entries |
| Disabled Target Server | targetServer: `old-backend` | dev | isEnabled: false |

## Out of Scope Endpoints

The following endpoints exist in `APIGEE_MNGMNT_API.yaml` but are NOT used by the dashboard and will NOT be implemented in the mock server:

| Endpoint | Reason |
|----------|--------|
| `/organizations/{org}/developers` | Dashboard doesn't display developers |
| `/organizations/{org}/sharedflows` | Dashboard doesn't display shared flows |
| `/organizations/{org}/environments/{env}/flowhooks` | Dashboard doesn't display flow hooks |
| `/organizations/{org}/environments/{env}/stats/{dimension}` | Analytics not in scope |
| `/organizations/{org}/userroles` | User management not in scope |
| `/organizations/{org}/apis/{apiName}/revisions/{revision}` | Dashboard uses deployments, not individual revisions |
| `/organizations/{org}/environments/{env}/keyvaluemaps/{kvmName}/entries/{entryName}` | Dashboard fetches full KVM, not individual entries |

These can be added later if the dashboard expands to support these entity types.
