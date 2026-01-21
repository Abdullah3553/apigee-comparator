# Feature Specification: Apigee Mock Management Server

**Feature Branch**: `002-apigee-mock-server`
**Created**: 2026-01-22
**Status**: Draft
**Input**: User description: "Mock Apigee Management Server for local development without real Apigee instance"

## Clarifications

### Session 2026-01-22

- Q: What technology should be used to implement the mock server? → A: Express.js (TypeScript)
- Q: How many mock entities should be provided per entity type? → A: 5-10 per type
- Q: What logging approach should the mock server use? → A: Console logging with log levels (debug/info/error)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run Dashboard Without Apigee Access (Priority: P1)

As a developer working on the Apigee Monitor Dashboard, I want to run the application locally without access to a real Apigee Management Server so that I can develop, test, and demo the application on my home machine.

**Why this priority**: This is the core need - without a mock server, the entire dashboard is unusable for local development. This enables all other development and testing activities.

**Independent Test**: Can be fully tested by starting the mock server, configuring the dashboard to use it, and verifying that the dashboard loads and displays mock entity data. Delivers the ability to run the full application locally.

**Acceptance Scenarios**:

1. **Given** no real Apigee instance is available, **When** I start the mock server and configure the dashboard to use it, **Then** the dashboard connects successfully and displays mock data
2. **Given** the mock server is running, **When** I select environments in the dashboard, **Then** I see mock environments with realistic data structure
3. **Given** the mock server is running, **When** I trigger a refresh operation, **Then** the mock server responds with entity data for all 9 entity types

---

### User Story 2 - Compare Mock Environments (Priority: P1)

As a developer, I want to compare two mock environments that have realistic differences so that I can verify the comparison functionality works correctly.

**Why this priority**: The comparison feature is the core value proposition of the dashboard. Being able to test it with mock data that has known differences is essential for development.

**Independent Test**: Can be fully tested by selecting two mock environments and verifying the comparison shows expected matched, different, and missing entities based on the known mock data differences.

**Acceptance Scenarios**:

1. **Given** mock server provides two environments with some identical entities, **When** I compare them, **Then** matched entities are correctly identified
2. **Given** mock server provides entities with different configurations, **When** I compare them, **Then** different entities are correctly highlighted with their specific differences
3. **Given** mock server provides entities that exist only in one environment, **When** I compare them, **Then** missing entities are correctly shown in each panel

---

### User Story 3 - Test Issue Detection (Priority: P2)

As a developer, I want the mock server to include entities with issues (expired certificates, revoked apps, undeployed proxies) so that I can verify the issue detection and highlighting features work correctly.

**Why this priority**: Issue highlighting is a key feature but depends on the basic mock server and comparison being functional first.

**Independent Test**: Can be fully tested by viewing mock entities that have known issues and verifying the appropriate badges and warnings appear.

**Acceptance Scenarios**:

1. **Given** mock server includes a keystore with expired certificates, **When** I view keystores, **Then** I see red "expired" badges on those certificates
2. **Given** mock server includes certificates expiring within 30 days, **When** I view keystores, **Then** I see orange "expiring soon" badges
3. **Given** mock server includes revoked apps, **When** I view apps, **Then** I see red "revoked" badges
4. **Given** mock server includes undeployed proxies, **When** I view proxies, **Then** I see muted/gray styling indicating undeployed state

---

### User Story 4 - Customizable Mock Data (Priority: P3)

As a developer, I want to customize the mock data through configuration files so that I can test specific scenarios without modifying code.

**Why this priority**: Customization is a nice-to-have that makes testing more flexible, but the default mock data set covers most development needs.

**Independent Test**: Can be fully tested by modifying mock data configuration files and verifying the changes appear in the dashboard.

**Acceptance Scenarios**:

1. **Given** I modify a mock data configuration file, **When** I restart the mock server, **Then** the new data is reflected in dashboard responses
2. **Given** I want to add a new mock entity, **When** I add it to the configuration, **Then** it appears in the appropriate entity list

---

### Edge Cases

- What happens when mock server is not running? The dashboard should show a clear connection error message
- What happens when mock data files are malformed? The mock server should log errors and use default data
- How does the mock server handle concurrent requests? Should support multiple dashboard instances connecting simultaneously
- What happens when requesting an entity type that has no mock data? Return an empty array, not an error

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Mock server MUST implement all Apigee Management API endpoints used by the dashboard
- **FR-002**: Mock server MUST return realistic data structures matching actual Apigee API responses
- **FR-003**: Mock server MUST provide at least 2 mock environments for comparison testing
- **FR-004**: Mock server MUST provide mock data for all 9 entity types (Apps, API Products, API Proxies, Caches, KVMs, Target Servers, References, Keystores, Virtual Hosts)
- **FR-005**: Mock server MUST include entities with known differences between environments for comparison testing
- **FR-006**: Mock server MUST include entities with issues (expired certs, revoked apps, undeployed proxies) for issue detection testing
- **FR-007**: Mock server MUST support Basic Authentication matching the dashboard's auth method
- **FR-008**: Mock server MUST respond with appropriate HTTP status codes (200, 404, 401, etc.)
- **FR-013**: Mock server MUST provide console logging with configurable log levels (debug/info/error) for request tracing and debugging
- **FR-009**: Mock server MUST be startable as a standalone service via Docker Compose or npm script
- **FR-010**: Mock server MUST use a separate port from the main backend to allow running alongside it
- **FR-011**: Mock server MUST load mock data from configuration files (JSON or YAML)
- **FR-012**: Dashboard configuration MUST allow switching between real Apigee and mock server via environment variables

### Key Entities

- **Mock Instance**: Simulates an Apigee Edge deployment with management URL, org name, and credentials
- **Mock Environment**: Simulates a deployment environment within the mock instance (e.g., "dev", "staging")
- **Mock Entities**: Sample data for all 9 entity types with realistic attributes matching Apigee API responses (5-10 entities per type)
- **Mock Configuration**: Files defining the mock data structure and content

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can start the full dashboard stack (mock server, backend, frontend) with a single docker-compose command
- **SC-002**: Mock server responds to all dashboard API requests within 100ms (simulating fast local network)
- **SC-003**: Dashboard displays mock data indistinguishably from real Apigee data (same structure, formatting)
- **SC-004**: Comparison between mock environments shows at least 3 matched, 3 different, and 2 missing entities for testing (with 5-10 entities per type total)
- **SC-005**: Issue detection correctly identifies at least 5 different issue types from mock data
- **SC-006**: Developers can run the dashboard demo without any Apigee credentials or network access

## Technical Constraints

- Mock server MUST be implemented in Express.js with TypeScript to match the existing backend stack

## Assumptions

- The mock server will run locally on the developer's machine
- Mock data will be deterministic (same data on each restart) for consistent testing
- The mock server does not need to simulate network latency or errors (those can be tested separately)
- Default mock data set will be sufficient for most development; advanced customization is optional
- The mock server will be used only for development/testing, not production

## Out of Scope

- Simulating Apigee OAuth2/SAML authentication flows
- Simulating Apigee rate limiting or quota enforcement
- Providing a UI for editing mock data
- Simulating write operations (POST/PUT/DELETE) to Apigee
- Performance testing with large data volumes
- Simulating network failures or timeouts
