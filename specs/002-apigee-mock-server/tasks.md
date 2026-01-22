# Tasks: Apigee Mock Management Server

**Input**: Design documents from `/specs/002-apigee-mock-server/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/openapi.yaml, quickstart.md

**Tests**: Not explicitly requested in the feature specification - tests are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

This project uses a monorepo structure with a new `mock-server/` directory at the repository root:
- `mock-server/src/` - Source code
- `mock-server/data/` - Mock data JSON files
- `mock-server/certs/` - Pre-generated test certificates

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for the mock server

- [X] T001 Create mock-server directory structure per plan.md in mock-server/
- [X] T002 Initialize TypeScript project with Express.js dependencies in mock-server/package.json
- [X] T003 [P] Configure TypeScript compiler options in mock-server/tsconfig.json
- [X] T004 [P] Add npm scripts for dev/build/start in mock-server/package.json
- [X] T005 [P] Create Dockerfile for mock server in mock-server/Dockerfile

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Create Express app entry point with CORS and JSON middleware in mock-server/src/index.ts
- [X] T007 [P] Implement Basic Auth middleware (mock/mock credentials) in mock-server/src/middleware/auth.ts
- [X] T008 [P] Implement request logging middleware with morgan in mock-server/src/middleware/logger.ts
- [X] T009 Create JSON data loader utility with caching in mock-server/src/data/loader.ts
- [X] T010 [P] Create error handling middleware (401, 404, 500) in mock-server/src/middleware/errorHandler.ts
- [X] T011 Add mock-server service to docker-compose.yml with mock profile
- [X] T012 [P] Add MOCK_SERVER_PORT and LOG_LEVEL to .env.example

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Run Dashboard Without Apigee Access (Priority: P1) MVP

**Goal**: Enable developers to run the full dashboard locally without access to a real Apigee instance

**Independent Test**: Start the mock server, configure the dashboard to use it, and verify the dashboard loads and displays mock entity data for all 9 entity types

### Implementation for User Story 1

#### Organization and Environment Routes

- [X] T013 [US1] Create organizations route with list and detail endpoints in mock-server/src/routes/organizations.ts
- [X] T014 [US1] Create environments route with list and detail endpoints in mock-server/src/routes/environments.ts

#### Organization-Level Entity Routes

- [X] T015 [P] [US1] Create apps route with list and detail endpoints in mock-server/src/routes/apps.ts
- [X] T016 [P] [US1] Create apiProducts route with list and detail endpoints in mock-server/src/routes/apiProducts.ts
- [X] T017 [P] [US1] Create apiProxies route with list, detail, and deployments endpoints in mock-server/src/routes/apiProxies.ts

#### Environment-Scoped Entity Routes

- [X] T018 [P] [US1] Create caches route with list and detail endpoints in mock-server/src/routes/caches.ts
- [X] T019 [P] [US1] Create kvms route with list and detail endpoints in mock-server/src/routes/kvms.ts
- [X] T020 [P] [US1] Create targetServers route with list and detail endpoints in mock-server/src/routes/targetServers.ts
- [X] T021 [P] [US1] Create references route with list and detail endpoints in mock-server/src/routes/references.ts
- [X] T022 [P] [US1] Create keystores route with list, detail, and alias endpoints in mock-server/src/routes/keystores.ts
- [X] T023 [P] [US1] Create virtualHosts route with list and detail endpoints in mock-server/src/routes/virtualHosts.ts

#### Register All Routes

- [X] T024 [US1] Register all routes in Express app with /v1 prefix in mock-server/src/index.ts

#### Basic Mock Data (Minimal)

- [X] T025 [US1] Create organizations.json with mock-org definition in mock-server/data/organizations.json
- [X] T026 [P] [US1] Create dev environment.json in mock-server/data/dev/environment.json
- [X] T027 [P] [US1] Create staging environment.json in mock-server/data/staging/environment.json
- [X] T028 [P] [US1] Create minimal dev apps.json (3 apps) in mock-server/data/dev/apps.json
- [X] T029 [P] [US1] Create minimal staging apps.json (3 apps, 2 matching dev) in mock-server/data/staging/apps.json
- [X] T030 [P] [US1] Create minimal dev apiProducts.json (3 products) in mock-server/data/dev/apiProducts.json
- [X] T031 [P] [US1] Create minimal staging apiProducts.json (3 products) in mock-server/data/staging/apiProducts.json
- [X] T032 [P] [US1] Create minimal dev apiProxies.json with deployments (3 proxies) in mock-server/data/dev/apiProxies.json
- [X] T033 [P] [US1] Create minimal staging apiProxies.json (3 proxies) in mock-server/data/staging/apiProxies.json
- [X] T034 [P] [US1] Create minimal dev caches.json (2 caches) in mock-server/data/dev/caches.json
- [X] T035 [P] [US1] Create minimal staging caches.json (2 caches) in mock-server/data/staging/caches.json
- [X] T036 [P] [US1] Create minimal dev kvms.json (2 KVMs) in mock-server/data/dev/kvms.json
- [X] T037 [P] [US1] Create minimal staging kvms.json (2 KVMs) in mock-server/data/staging/kvms.json
- [X] T038 [P] [US1] Create minimal dev targetServers.json (2 servers) in mock-server/data/dev/targetServers.json
- [X] T039 [P] [US1] Create minimal staging targetServers.json (2 servers) in mock-server/data/staging/targetServers.json
- [X] T040 [P] [US1] Create minimal dev references.json (2 refs) in mock-server/data/dev/references.json
- [X] T041 [P] [US1] Create minimal staging references.json (2 refs) in mock-server/data/staging/references.json
- [X] T042 [P] [US1] Create minimal dev keystores.json (2 keystores) in mock-server/data/dev/keystores.json
- [X] T043 [P] [US1] Create minimal staging keystores.json (2 keystores) in mock-server/data/staging/keystores.json
- [X] T044 [P] [US1] Create minimal dev virtualHosts.json (2 vhosts) in mock-server/data/dev/virtualHosts.json
- [X] T045 [P] [US1] Create minimal staging virtualHosts.json (2 vhosts) in mock-server/data/staging/virtualHosts.json

#### Certificates

- [X] T046 [P] [US1] Generate valid.pem certificate (365 days validity) in mock-server/certs/valid.pem

#### Dashboard Configuration

- [X] T047 [US1] Add mock instance configuration to config/apigee-config.yaml

**Checkpoint**: At this point, User Story 1 should be fully functional - dashboard can connect to mock server and display all entity types

---

## Phase 4: User Story 2 - Compare Mock Environments (Priority: P1)

**Goal**: Provide two mock environments with realistic differences for testing comparison functionality

**Independent Test**: Select dev and staging in the dashboard, verify comparison shows expected matched, different, and missing entities

### Implementation for User Story 2

#### Expand Mock Data with Differences

- [X] T048 [P] [US2] Expand dev apps.json to 6 apps with 1 different config, 2 dev-only in mock-server/data/dev/apps.json
- [X] T049 [P] [US2] Expand staging apps.json to 5 apps with 1 staging-only in mock-server/data/staging/apps.json
- [ ] T050 [P] [US2] Expand dev apiProducts.json to 5 products with 2 different configs in mock-server/data/dev/apiProducts.json
- [ ] T051 [P] [US2] Expand staging apiProducts.json to 5 products matching diff pattern in mock-server/data/staging/apiProducts.json
- [ ] T052 [P] [US2] Expand dev apiProxies.json to 7 proxies with 1 different, 2 dev-only in mock-server/data/dev/apiProxies.json
- [ ] T053 [P] [US2] Expand staging apiProxies.json to 6 proxies with 1 staging-only in mock-server/data/staging/apiProxies.json
- [ ] T054 [P] [US2] Expand dev caches.json to 4 caches with 1 different config in mock-server/data/dev/caches.json
- [ ] T055 [P] [US2] Expand staging caches.json to 4 caches matching diff pattern in mock-server/data/staging/caches.json
- [ ] T056 [P] [US2] Expand dev kvms.json to 5 KVMs with 1 different, 2 dev-only in mock-server/data/dev/kvms.json
- [ ] T057 [P] [US2] Expand staging kvms.json to 4 KVMs with 1 staging-only in mock-server/data/staging/kvms.json
- [ ] T058 [P] [US2] Expand dev targetServers.json to 5 servers with 1 different config in mock-server/data/dev/targetServers.json
- [ ] T059 [P] [US2] Expand staging targetServers.json to 5 servers matching diff pattern in mock-server/data/staging/targetServers.json
- [ ] T060 [P] [US2] Expand dev references.json to 4 refs with 1 different config in mock-server/data/dev/references.json
- [ ] T061 [P] [US2] Expand staging references.json to 4 refs matching diff pattern in mock-server/data/staging/references.json
- [ ] T062 [P] [US2] Expand dev keystores.json to 5 keystores with 1 different, 2 dev-only in mock-server/data/dev/keystores.json
- [ ] T063 [P] [US2] Expand staging keystores.json to 4 keystores with 1 staging-only in mock-server/data/staging/keystores.json
- [ ] T064 [P] [US2] Expand dev virtualHosts.json to 3 vhosts with 1 different config in mock-server/data/dev/virtualHosts.json
- [ ] T065 [P] [US2] Expand staging virtualHosts.json to 3 vhosts matching diff pattern in mock-server/data/staging/virtualHosts.json

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - comparison between dev/staging shows matched, different, and missing entities

---

## Phase 5: User Story 3 - Test Issue Detection (Priority: P2)

**Goal**: Include entities with issues (expired certificates, revoked apps, undeployed proxies) for testing issue detection features

**Independent Test**: View mock entities in dashboard and verify appropriate badges and warnings appear for known issues

### Implementation for User Story 3

#### Issue Scenario Certificates

- [ ] T066 [P] [US3] Generate expired.pem certificate (expired 30 days ago) in mock-server/certs/expired.pem
- [ ] T067 [P] [US3] Generate expiring-soon.pem certificate (15 days validity) in mock-server/certs/expiring-soon.pem

#### Issue Scenario Mock Data

- [ ] T068 [US3] Add revoked app deprecated-partner-app to dev apps.json in mock-server/data/dev/apps.json
- [ ] T069 [US3] Add undeployed proxy legacy-api-v1 to staging apiProxies.json with empty deployments in mock-server/data/staging/apiProxies.json
- [ ] T070 [US3] Add disabled target server old-backend to dev targetServers.json with isEnabled:false in mock-server/data/dev/targetServers.json
- [ ] T071 [US3] Add payment-certs keystore with expired cert alias to dev keystores.json in mock-server/data/dev/keystores.json
- [ ] T072 [US3] Add api-gateway-certs keystore with expiring-soon cert alias to staging keystores.json in mock-server/data/staging/keystores.json

**Checkpoint**: All user stories 1-3 should now be functional with full issue detection testing

---

## Phase 6: User Story 4 - Customizable Mock Data (Priority: P3)

**Goal**: Enable developers to customize mock data through configuration files for testing specific scenarios

**Independent Test**: Modify a mock data JSON file, restart the server, and verify the changes appear in the dashboard

### Implementation for User Story 4

- [ ] T073 [US4] Add hot-reload capability for data files (watch mode) in mock-server/src/data/loader.ts
- [ ] T074 [US4] Add data validation script to verify JSON syntax in mock-server/package.json (validate-data script)
- [ ] T075 [US4] Document mock data customization in quickstart.md (add Customizing Mock Data section details)

**Checkpoint**: All 4 user stories should now be independently functional and testable

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T076 [P] Verify all 23 API endpoints respond correctly per openapi.yaml contract
- [ ] T077 [P] Verify response times are under 100ms for all endpoints
- [ ] T078 Run full docker-compose --profile mock up and verify all services connect
- [ ] T079 Verify dashboard can complete full comparison workflow with mock data

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion - MVP delivery
- **User Story 2 (Phase 4)**: Depends on User Story 1 (expands mock data files)
- **User Story 3 (Phase 5)**: Depends on User Story 2 (adds issue scenarios to expanded data)
- **User Story 4 (Phase 6)**: Can start after Foundational, independent of US2/US3
- **Polish (Phase 7)**: Depends on User Stories 1-3 being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories - **MVP**
- **User Story 2 (P1)**: Depends on US1 mock data files existing (expands them)
- **User Story 3 (P2)**: Depends on US2 mock data files (adds issue scenarios)
- **User Story 4 (P3)**: Can start after Foundational - Independent of US2/US3

### Within Each User Story

- Routes before mock data (routes define what data is needed)
- Base mock data before expanded data
- Core functionality before edge cases

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- All route implementations marked [P] can run in parallel (T015-T023)
- All mock data file creations marked [P] can run in parallel per phase
- Certificate generations marked [P] can run in parallel
- User Story 4 can proceed in parallel with US2/US3 after US1 is complete

---

## Parallel Example: User Story 1 Routes

```bash
# Launch all organization-level routes together:
Task: "Create apps route in mock-server/src/routes/apps.ts"
Task: "Create apiProducts route in mock-server/src/routes/apiProducts.ts"
Task: "Create apiProxies route in mock-server/src/routes/apiProxies.ts"

# Launch all environment-scoped routes together:
Task: "Create caches route in mock-server/src/routes/caches.ts"
Task: "Create kvms route in mock-server/src/routes/kvms.ts"
Task: "Create targetServers route in mock-server/src/routes/targetServers.ts"
Task: "Create references route in mock-server/src/routes/references.ts"
Task: "Create keystores route in mock-server/src/routes/keystores.ts"
Task: "Create virtualHosts route in mock-server/src/routes/virtualHosts.ts"
```

---

## Parallel Example: User Story 2 Data Expansion

```bash
# Launch all dev environment expansions together:
Task: "Expand dev apps.json to 6 apps"
Task: "Expand dev apiProducts.json to 5 products"
Task: "Expand dev apiProxies.json to 7 proxies"
Task: "Expand dev caches.json to 4 caches"
...

# Launch all staging environment expansions together:
Task: "Expand staging apps.json to 5 apps"
Task: "Expand staging apiProducts.json to 5 products"
...
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Verify dashboard connects and displays all 9 entity types
5. Deploy/demo if ready - developers can now run dashboard locally

### Incremental Delivery

1. Complete Setup + Foundational + US1 = **MVP** (dashboard works with mock data)
2. Add User Story 2 = Comparison testing works with realistic differences
3. Add User Story 3 = Issue detection testing works
4. Add User Story 4 = Customizable mock data for advanced testing

### Entity Count Summary (Final State)

| Entity Type | Dev | Staging | Matched | Different | Dev-Only | Staging-Only |
|-------------|-----|---------|---------|-----------|----------|--------------|
| Apps | 6 | 5 | 3 | 1 | 2 | 1 |
| API Products | 5 | 5 | 3 | 2 | 0 | 0 |
| API Proxies | 7 | 6 | 4 | 1 | 2 | 1 |
| Caches | 4 | 4 | 3 | 1 | 0 | 0 |
| KVMs | 5 | 4 | 2 | 1 | 2 | 1 |
| Target Servers | 5 | 5 | 4 | 1 | 0 | 0 |
| References | 4 | 4 | 3 | 1 | 0 | 0 |
| Keystores | 5 | 4 | 2 | 1 | 2 | 1 |
| Virtual Hosts | 3 | 3 | 2 | 1 | 0 | 0 |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Mock data follows exact Apigee API response structures per data-model.md
- All endpoints match openapi.yaml contract specification
