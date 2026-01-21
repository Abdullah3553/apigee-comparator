# Tasks: Apigee Real-Time Monitoring Dashboard

**Input**: Design documents from `/specs/001-apigee-monitor-dashboard/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`
- **Frontend**: `frontend/src/`
- **Config**: `config/`
- **Root**: `docker-compose.yml`, `.env.example`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create monorepo directory structure per plan.md (backend/, frontend/, config/)
- [X] T002 [P] Initialize NestJS backend project with TypeScript in backend/
- [X] T003 [P] Initialize Vite + React 18 frontend project with TypeScript in frontend/
- [X] T004 [P] Create docker-compose.yml with PostgreSQL 15 and service definitions
- [X] T005 [P] Create .env.example with environment variable templates
- [X] T006 [P] Create config/apigee-config.yaml with sample instance topology
- [X] T007 [P] Configure ESLint and Prettier for backend in backend/eslint.config.js
- [X] T008 [P] Configure ESLint and Prettier for frontend in frontend/eslint.config.js
- [X] T009 [P] Create backend/Dockerfile for NestJS service
- [X] T010 [P] Create frontend/Dockerfile for React app with nginx

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Foundation

- [X] T011 Configure TypeORM with PostgreSQL in backend/src/database/database.module.ts
- [X] T012 Create Instance entity in backend/src/database/entities/instance.entity.ts
- [X] T013 Create Environment entity with INSTANCE-ORG-ENV identifier in backend/src/database/entities/environment.entity.ts
- [X] T014 [P] Create App entity with credentials JSONB in backend/src/database/entities/app.entity.ts
- [X] T015 [P] Create ApiProduct entity in backend/src/database/entities/api-product.entity.ts
- [X] T016 [P] Create ApiProxy entity with deployed_revisions JSONB in backend/src/database/entities/api-proxy.entity.ts
- [X] T017 [P] Create Cache entity in backend/src/database/entities/cache.entity.ts
- [X] T018 [P] Create Kvm entity with entries JSONB in backend/src/database/entities/kvm.entity.ts
- [X] T019 [P] Create TargetServer entity in backend/src/database/entities/target-server.entity.ts
- [X] T020 [P] Create Reference entity in backend/src/database/entities/reference.entity.ts
- [X] T021 [P] Create Keystore entity with certificates JSONB in backend/src/database/entities/keystore.entity.ts
- [X] T022 [P] Create VirtualHost entity in backend/src/database/entities/virtual-host.entity.ts
- [X] T023 Create TypeORM migration for all entities in backend/src/database/migrations/
- [X] T024 Implement ConfigService for YAML parsing with env var interpolation in backend/src/config/config.service.ts
- [X] T025 Create ConfigModule with YAML loader in backend/src/config/config.module.ts
- [X] T026 Implement ApigeeService for Management API calls with Basic Auth in backend/src/apigee/apigee.service.ts
- [X] T027 Create ApigeeModule in backend/src/apigee/apigee.module.ts
- [X] T028 Create global error handling filter in backend/src/common/filters/http-exception.filter.ts
- [X] T029 Configure AppModule with all modules in backend/src/app.module.ts

### Frontend Foundation

- [X] T030 Configure TanStack Query provider in frontend/src/main.tsx
- [X] T031 Setup Tailwind CSS in frontend/tailwind.config.js and frontend/src/index.css
- [X] T032 Create API service with axios in frontend/src/services/api.ts
- [X] T033 [P] Create environment types in frontend/src/types/environment.types.ts
- [X] T034 [P] Create entity types in frontend/src/types/entity.types.ts
- [X] T035 [P] Create comparison types in frontend/src/types/comparison.types.ts
- [X] T036 Create App layout with NavBar placeholder in frontend/src/App.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Environment Selection (Priority: P1) 🎯 MVP

**Goal**: Enable users to select two environments from hierarchical selectors (Instance → Org → Env) for comparison

**Independent Test**: Load dashboard, verify cascading dropdowns show instances/orgs/environments, select two environments and see identifiers displayed

### Backend Implementation for US1

- [X] T037 [US1] Create ConfigController with GET /api/config endpoint in backend/src/config/config.controller.ts
- [X] T038 [US1] Add GET /api/environments endpoint to ConfigController in backend/src/config/config.controller.ts
- [X] T039 [US1] Add GET /api/environments/:identifier endpoint to ConfigController in backend/src/config/config.controller.ts
- [X] T040 [US1] Implement environment seeding from YAML config on startup in backend/src/config/config.service.ts

### Frontend Implementation for US1

- [X] T041 [US1] Create useEnvironments hook with TanStack Query in frontend/src/hooks/useEnvironments.ts
- [X] T042 [US1] Create EnvSelector component with cascading dropdown in frontend/src/components/EnvSelector/EnvSelector.tsx
- [X] T043 [P] [US1] Create EnvSelector styles in frontend/src/components/EnvSelector/EnvSelector.css
- [X] T044 [US1] Create NavBar component with two EnvSelector instances in frontend/src/components/NavBar/NavBar.tsx
- [X] T045 [US1] Create environment context for selected environments in frontend/src/contexts/EnvironmentContext.tsx
- [X] T046 [US1] Integrate NavBar and EnvironmentContext in App.tsx

**Checkpoint**: User Story 1 complete - can select two environments and see identifiers in nav bar

---

## Phase 4: User Story 2 - View Comparison Results (Priority: P1) 🎯 MVP

**Goal**: Display side-by-side comparison of entities between two selected environments with visual status indicators (matched/different/missing)

**Independent Test**: Select two environments and entity type, verify comparison shows matched (green ✓), different (yellow ⚠), and missing (red ✗) entities correctly

### Backend Implementation for US2

- [X] T047 [US2] Create EntitiesService with getByEnvironment method in backend/src/entities/entities.service.ts
- [X] T048 [US2] Create EntitiesController with GET /api/entities/:identifier/:entityType in backend/src/entities/entities.controller.ts
- [X] T049 [US2] Create EntitiesModule in backend/src/entities/entities.module.ts
- [X] T050 [US2] Create CompareService with comparison algorithm (name-based matching) in backend/src/compare/compare.service.ts
- [X] T051 [US2] Implement deep comparison logic for JSONB fields in backend/src/compare/compare.service.ts
- [X] T052 [US2] Create CompareController with GET /api/compare endpoint in backend/src/compare/compare.controller.ts
- [X] T053 [US2] Create CompareModule in backend/src/compare/compare.module.ts

### Frontend Implementation for US2

- [X] T054 [US2] Create comparison utilities (diff detection, status calculation) in frontend/src/utils/comparison.utils.ts
- [X] T055 [US2] Create useComparison hook with TanStack Query in frontend/src/hooks/useComparison.ts
- [X] T056 [US2] Create ComparisonRow component with status indicators in frontend/src/components/ComparisonView/ComparisonRow.tsx
- [X] T057 [US2] Create ComparisonView component with side-by-side panels in frontend/src/components/ComparisonView/ComparisonView.tsx
- [X] T058 [P] [US2] Create status indicator components (MatchedIcon, DifferentIcon, MissingIcon) in frontend/src/components/common/StatusIcons.tsx
- [X] T059 [US2] Create comparison summary component showing counts in frontend/src/components/ComparisonView/ComparisonSummary.tsx
- [X] T060 [US2] Integrate ComparisonView with selected environments in App.tsx

**Checkpoint**: User Story 2 complete - can view comparison results with correct visual indicators

---

## Phase 5: User Story 3 - Refresh Environment Data (Priority: P2)

**Goal**: Allow users to refresh all environment data from Apigee with progress indication and partial failure handling

**Independent Test**: Click Refresh All, verify loading indicator, see summary of refreshed environments, verify partial failure if one env fails

### Backend Implementation for US3

- [X] T061 [US3] Create RefreshService with parallel refresh using Promise.allSettled in backend/src/refresh/refresh.service.ts
- [X] T062 [US3] Implement fetchAllEntities for single environment in backend/src/refresh/refresh.service.ts
- [X] T063 [US3] Add entity upsert logic (clear old + insert new) in backend/src/refresh/refresh.service.ts
- [X] T064 [US3] Create RefreshController with POST /api/refresh endpoint in backend/src/refresh/refresh.controller.ts
- [X] T065 [US3] Add POST /api/refresh/:identifier for single environment refresh in backend/src/refresh/refresh.controller.ts
- [X] T066 [US3] Create RefreshModule in backend/src/refresh/refresh.module.ts

### Frontend Implementation for US3

- [X] T067 [US3] Create useRefresh hook with mutation in frontend/src/hooks/useRefresh.ts
- [X] T068 [US3] Create RefreshButton component with loading state in frontend/src/components/NavBar/RefreshButton.tsx
- [X] T069 [US3] Create RefreshSummary modal/toast showing results in frontend/src/components/common/RefreshSummary.tsx
- [X] T070 [US3] Add last-refreshed timestamp display to environment details in frontend/src/components/EnvSelector/EnvSelector.tsx
- [X] T071 [US3] Integrate RefreshButton in NavBar in frontend/src/components/NavBar/NavBar.tsx

**Checkpoint**: User Story 3 complete - can refresh data with progress and partial failure handling

---

## Phase 6: User Story 4 - Entity Type Selection (Priority: P2)

**Goal**: Enable users to select which entity type to view/compare from dropdown (9 types)

**Independent Test**: Click entity type dropdown, see all 9 options, select different types and verify displayed data changes

### Frontend Implementation for US4

- [X] T072 [US4] Create EntityTypeSelector component with dropdown in frontend/src/components/EntityTypeSelector/EntityTypeSelector.tsx
- [X] T073 [US4] Add entity type to environment context in frontend/src/contexts/EnvironmentContext.tsx
- [X] T074 [US4] Integrate EntityTypeSelector in NavBar in frontend/src/components/NavBar/NavBar.tsx
- [X] T075 [US4] Update ComparisonView to use selected entity type in frontend/src/components/ComparisonView/ComparisonView.tsx
- [X] T076 [US4] Update useComparison to include entityType parameter in frontend/src/hooks/useComparison.ts

**Checkpoint**: User Story 4 complete - can switch between 9 entity types

---

## Phase 7: User Story 5 - Entity Detail Drill-Down (Priority: P3)

**Goal**: Expand entity rows to show nested data (KVM entries, certificates, credentials) with side-by-side comparison

**Independent Test**: Click on entity row, verify expanded view shows nested data compared side-by-side with difference highlighting

### Backend Implementation for US5

- [X] T077 [US5] Add GET /api/entities/:identifier/kvms/:name/entries endpoint in backend/src/entities/entities.controller.ts
- [X] T078 [US5] Add GET /api/entities/:identifier/keystores/:name/certificates endpoint in backend/src/entities/entities.controller.ts
- [X] T079 [US5] Implement nested data retrieval methods in backend/src/entities/entities.service.ts

### Frontend Implementation for US5

- [X] T080 [US5] Create EntityDetails expandable component in frontend/src/components/EntityDetails/EntityDetails.tsx
- [X] T081 [P] [US5] Create KvmDetails component for key-value entries in frontend/src/components/EntityDetails/KvmDetails.tsx
- [X] T082 [P] [US5] Create KeystoreDetails component for certificates in frontend/src/components/EntityDetails/KeystoreDetails.tsx
- [X] T083 [P] [US5] Create AppDetails component for credentials in frontend/src/components/EntityDetails/AppDetails.tsx
- [X] T084 [US5] Create DiffHighlight component for highlighting differences in frontend/src/components/common/DiffHighlight.tsx
- [X] T085 [US5] Integrate EntityDetails in ComparisonRow with expand/collapse in frontend/src/components/ComparisonView/ComparisonRow.tsx

**Checkpoint**: User Story 5 complete - can drill down into nested entity data

---

## Phase 8: User Story 6 - Single Environment View Mode (Priority: P3)

**Goal**: Toggle between comparison mode (two panels) and single-environment mode (full-width)

**Independent Test**: Click View Mode toggle, verify second selector hides, panel goes full-width, toggle back restores comparison

### Frontend Implementation for US6

- [X] T086 [US6] Add viewMode state to EnvironmentContext in frontend/src/contexts/EnvironmentContext.tsx
- [X] T087 [US6] Create ViewModeToggle component in frontend/src/components/NavBar/ViewModeToggle.tsx
- [X] T088 [US6] Create SingleEnvView component for full-width display in frontend/src/components/SingleEnvView/SingleEnvView.tsx
- [X] T089 [US6] Update NavBar to conditionally show second EnvSelector in frontend/src/components/NavBar/NavBar.tsx
- [X] T090 [US6] Update App.tsx to switch between ComparisonView and SingleEnvView

**Checkpoint**: User Story 6 complete - can toggle between view modes

---

## Phase 9: User Story 7 - Issue Highlighting (Priority: P3)

**Goal**: Automatically highlight issues (expired certs, revoked apps, undeployed proxies) with colored badges

**Independent Test**: View entities with known issues, verify correct badges appear (red for expired, orange for expiring soon)

### Backend Implementation for US7

- [X] T091 [US7] Create IssueDetectionService with detection logic in backend/src/entities/issue-detection.service.ts
- [X] T092 [US7] Add issue detection for expired/expiring certificates in backend/src/entities/issue-detection.service.ts
- [X] T093 [US7] Add issue detection for revoked apps/credentials in backend/src/entities/issue-detection.service.ts
- [X] T094 [US7] Add issue detection for undeployed proxies in backend/src/entities/issue-detection.service.ts
- [X] T095 [US7] Integrate issues in EntitiesController response in backend/src/entities/entities.controller.ts

### Frontend Implementation for US7

- [X] T096 [US7] Create IssueBadge component (red/orange/gray) in frontend/src/components/common/IssueBadge.tsx
- [X] T097 [US7] Create useIssues hook for issue data in frontend/src/hooks/useIssues.ts
- [X] T098 [US7] Integrate IssueBadge in ComparisonRow in frontend/src/components/ComparisonView/ComparisonRow.tsx
- [X] T099 [US7] Integrate IssueBadge in SingleEnvView in frontend/src/components/SingleEnvView/SingleEnvView.tsx
- [X] T100 [US7] Add issue summary to ComparisonSummary in frontend/src/components/ComparisonView/ComparisonSummary.tsx

**Checkpoint**: User Story 7 complete - issues are highlighted with appropriate badges

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T101 [P] Add empty state component for no entities found in frontend/src/components/common/EmptyState.tsx
- [X] T102 [P] Add loading skeleton components in frontend/src/components/common/LoadingSkeleton.tsx
- [X] T103 [P] Add error boundary component in frontend/src/components/common/ErrorBoundary.tsx
- [X] T104 Add responsive layout adjustments for smaller screens in frontend/src/App.tsx
- [X] T105 Add entity name search/filter input to panels in frontend/src/components/ComparisonView/ComparisonView.tsx
- [X] T106 [P] Add format utilities for dates and identifiers in frontend/src/utils/format.utils.ts
- [X] T107 Validate quickstart.md steps work end-to-end
- [X] T108 Code cleanup and remove unused imports across all files

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational) ◄── BLOCKS ALL USER STORIES
    │
    ├──────────────────────────────────────────────┐
    │                                              │
    ▼                                              ▼
Phase 3 (US1: Env Selection)                  Can parallel with
    │                                         other stories if
    ▼                                         staffed
Phase 4 (US2: Comparison) ◄── Core MVP
    │
    ▼
Phase 5 (US3: Refresh)
    │
    ▼
Phase 6 (US4: Entity Type)
    │
    ▼
Phase 7 (US5: Drill-Down)
    │
    ▼
Phase 8 (US6: Single View)
    │
    ▼
Phase 9 (US7: Issue Highlighting)
    │
    ▼
Phase 10 (Polish)
```

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|------------|-----------------|
| US1 (Env Selection) | Phase 2 | Foundational complete |
| US2 (Comparison) | US1 | US1 complete (needs selected envs) |
| US3 (Refresh) | Phase 2 | Foundational complete |
| US4 (Entity Type) | US2 | US2 complete (needs comparison view) |
| US5 (Drill-Down) | US2 | US2 complete (needs comparison rows) |
| US6 (Single View) | US1 | US1 complete (needs env selection) |
| US7 (Issues) | US2 | US2 complete (needs entity display) |

### Parallel Opportunities

**Within Phase 2 (Foundational)**:
- T014-T022 (all entity files) can run in parallel
- T033-T035 (frontend types) can run in parallel

**Across User Stories (with team)**:
- US1 and US3 can run in parallel (different features)
- US5, US6, US7 can run in parallel after US2 (extend different parts)

---

## Parallel Examples

### Phase 2: Entity Creation
```bash
# Launch all entity file tasks in parallel:
T014: Create App entity in backend/src/database/entities/app.entity.ts
T015: Create ApiProduct entity in backend/src/database/entities/api-product.entity.ts
T016: Create ApiProxy entity in backend/src/database/entities/api-proxy.entity.ts
T017: Create Cache entity in backend/src/database/entities/cache.entity.ts
T018: Create Kvm entity in backend/src/database/entities/kvm.entity.ts
T019: Create TargetServer entity in backend/src/database/entities/target-server.entity.ts
T020: Create Reference entity in backend/src/database/entities/reference.entity.ts
T021: Create Keystore entity in backend/src/database/entities/keystore.entity.ts
T022: Create VirtualHost entity in backend/src/database/entities/virtual-host.entity.ts
```

### Phase 7: Detail Components
```bash
# Launch all detail component tasks in parallel:
T081: Create KvmDetails component in frontend/src/components/EntityDetails/KvmDetails.tsx
T082: Create KeystoreDetails component in frontend/src/components/EntityDetails/KeystoreDetails.tsx
T083: Create AppDetails component in frontend/src/components/EntityDetails/AppDetails.tsx
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Environment Selection)
4. Complete Phase 4: User Story 2 (Comparison Results)
5. **STOP and VALIDATE**: Core comparison functionality works
6. Deploy/demo - users can compare two environments

### Incremental Delivery

| Milestone | Stories | Capability |
|-----------|---------|------------|
| MVP | US1 + US2 | Select envs, view comparison |
| + Refresh | US3 | Keep data fresh |
| + Filtering | US4 | Focus on specific entity types |
| + Details | US5 | Deep dive into differences |
| + Flexibility | US6 | Single env exploration |
| + Proactive | US7 | Issue detection without manual search |

### Task Counts

| Phase | Tasks | Parallel |
|-------|-------|----------|
| Setup | 10 | 8 |
| Foundational | 26 | 13 |
| US1 | 10 | 1 |
| US2 | 14 | 1 |
| US3 | 11 | 0 |
| US4 | 5 | 0 |
| US5 | 9 | 3 |
| US6 | 5 | 0 |
| US7 | 10 | 0 |
| Polish | 8 | 4 |
| **Total** | **108** | **30** |

---

## Notes

- [P] tasks = different files, no dependencies
- [US#] label maps task to specific user story for traceability
- Each user story is independently completable and testable after MVP (US1+US2)
- Commit after each task or logical group
- Run `docker-compose up` to start all services for testing
- Stop at any checkpoint to validate story independently
