# Implementation Plan: Apigee Real-Time Monitoring Dashboard

**Branch**: `001-apigee-monitor-dashboard` | **Date**: 2026-01-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-apigee-monitor-dashboard/spec.md`

## Summary

Build a real-time monitoring dashboard that enables Apigee integration engineers to compare entity configurations across multiple Apigee Edge instances, organizations, and environments. The system follows a database-first architecture where data is fetched from Apigee on-demand (refresh), stored in PostgreSQL, and served to the React frontend for side-by-side comparison with visual diff indicators.

## Technical Context

**Language/Version**: TypeScript 5.4+ with Node.js 20 LTS
**Primary Dependencies**:
- Backend: NestJS 10+, TypeORM, @nestjs/config, js-yaml, axios
- Frontend: React 18+, TanStack Query, TanStack Table, Tailwind CSS
**Storage**: PostgreSQL 15+ with JSONB columns for flexible entity storage
**Testing**: Jest (backend), Vitest + React Testing Library (frontend)
**Target Platform**: Docker Compose (local development), modern web browsers
**Project Type**: Web application (frontend + backend monorepo)
**Performance Goals**:
- Comparison results within 5 seconds (SC-001)
- Drill-down within 2 seconds (SC-007)
- Refresh 4 environments in 60 seconds (SC-003)
**Constraints**:
- Read-only Apigee operations (Constitution Principle I)
- Database-first reads (Constitution Principle II)
- 500 entities per environment (SC-005)
**Scale/Scope**: 2-4 instances, 4+ environments, ~500 entities per env

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Implementation Alignment |
|-----------|--------|-------------------------|
| I. Read-Only Operations | ✅ PASS | FR-012 explicitly forbids write operations; only GET calls to Apigee APIs |
| II. Database-First Architecture | ✅ PASS | FR-006 requires local persistence; reads served from PostgreSQL per spec |
| III. Environment Isolation | ✅ PASS | FR-014 mandates INSTANCE-ORG-ENV pattern throughout |
| IV. Comparison Accuracy | ✅ PASS | FR-004 defines four comparison states; FR-009 requires deep nested comparison |
| V. Configuration as Code | ✅ PASS | FR-011 requires external YAML config; FR-015 uses env vars for credentials |

**Technology Constraints Check**:
| Constraint | Status | Notes |
|------------|--------|-------|
| React 18+ with TypeScript | ✅ PASS | Using React 18+ |
| NestJS with TypeScript | ✅ PASS | Using NestJS 10+ |
| PostgreSQL with JSONB | ✅ PASS | Using PostgreSQL 15+ with JSONB |
| TypeORM | ✅ PASS | Using TypeORM for ORM |
| YAML config | ✅ PASS | Using js-yaml for config parsing |
| Docker Compose | ✅ PASS | Deployment via Docker Compose |
| Basic Authentication | ✅ PASS | Apigee API calls use Basic Auth |

**Gate Result**: ✅ ALL GATES PASS - Proceeding to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/001-apigee-monitor-dashboard/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI specs)
│   └── openapi.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   │   ├── config.module.ts
│   │   ├── config.service.ts
│   │   └── config.controller.ts
│   ├── database/
│   │   ├── database.module.ts
│   │   └── entities/
│   │       ├── instance.entity.ts
│   │       ├── environment.entity.ts
│   │       ├── app.entity.ts
│   │       ├── api-product.entity.ts
│   │       ├── api-proxy.entity.ts
│   │       ├── cache.entity.ts
│   │       ├── kvm.entity.ts
│   │       ├── target-server.entity.ts
│   │       ├── reference.entity.ts
│   │       ├── keystore.entity.ts
│   │       └── virtual-host.entity.ts
│   ├── apigee/
│   │   ├── apigee.module.ts
│   │   └── apigee.service.ts
│   ├── refresh/
│   │   ├── refresh.module.ts
│   │   ├── refresh.controller.ts
│   │   └── refresh.service.ts
│   ├── entities/
│   │   ├── entities.module.ts
│   │   ├── entities.controller.ts
│   │   └── entities.service.ts
│   └── compare/
│       ├── compare.module.ts
│       ├── compare.controller.ts
│       └── compare.service.ts
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── Dockerfile
├── package.json
├── tsconfig.json
└── nest-cli.json

frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── NavBar/
│   │   ├── EnvSelector/
│   │   ├── EntityTypeSelector/
│   │   ├── ComparisonView/
│   │   ├── SingleEnvView/
│   │   ├── EntityDetails/
│   │   └── common/
│   ├── hooks/
│   │   ├── useEnvironments.ts
│   │   ├── useEntities.ts
│   │   ├── useComparison.ts
│   │   └── useRefresh.ts
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   ├── environment.types.ts
│   │   ├── entity.types.ts
│   │   └── comparison.types.ts
│   └── utils/
│       ├── comparison.utils.ts
│       └── format.utils.ts
├── test/
├── Dockerfile
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js

config/
└── apigee-config.yaml

docker-compose.yml
.env.example
```

**Structure Decision**: Web application monorepo with separate `backend/` and `frontend/` directories per constitution mandate. Follows NestJS module-per-feature pattern (config, refresh, entities, compare) and React component-based architecture.

## Complexity Tracking

> No constitution violations requiring justification. All complexity is inherent to the feature requirements.

| Area | Justification |
|------|---------------|
| 9 Entity Types | Required by FR-003; Apigee has these distinct resource types |
| JSONB Storage | Required for flexible entity attributes that vary by type |
| Parallel Refresh | Required by SC-003 (60s for 4 envs) and FR-013 (partial failure handling) |
