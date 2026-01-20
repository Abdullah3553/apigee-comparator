# Feature Specification: Apigee Real-Time Monitoring Dashboard

**Feature Branch**: `001-apigee-monitor-dashboard`
**Created**: 2026-01-20
**Status**: Draft
**Input**: User description: "PROJECT_IDEA.md - Real-time monitoring and comparison of Apigee Edge entities across multiple instances, organizations, and environments"

## Clarifications

### Session 2026-01-20

- Q: How should Apigee credentials be stored/managed? → A: Environment variables only (12-factor app style)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Environment Selection (Priority: P1)

As an Apigee integration engineer, I want to select two environments from a hierarchical selector (Instance → Org → Env) so that I can compare their configurations side-by-side.

**Why this priority**: Environment selection is the foundational interaction - without it, no comparison or viewing is possible. This enables all other features.

**Independent Test**: Can be fully tested by displaying the environment selector with configured instances/orgs/environments and validating correct hierarchical navigation. Delivers the ability to target specific environments.

**Acceptance Scenarios**:

1. **Given** the dashboard is loaded, **When** I click the first environment selector, **Then** I see a cascading dropdown showing available instances, then organizations, then environments
2. **Given** I have selected an environment in the first selector, **When** I click the second environment selector, **Then** I see the same cascading options and can select a different environment
3. **Given** both environments are selected, **When** I view the page, **Then** the selected environment identifiers (INSTANCE-ORG-ENV format) are displayed in the navigation bar

---

### User Story 2 - View Comparison Results (Priority: P1)

As an Apigee integration engineer, I want to compare entities between two selected environments so that I can identify configuration drift, missing entities, and differences.

**Why this priority**: Comparison is the core value proposition - identifying drift between environments is the primary use case for this tool.

**Independent Test**: Can be fully tested by selecting two environments and an entity type, then verifying the comparison results show matched, different, and missing entities with correct visual indicators.

**Acceptance Scenarios**:

1. **Given** two environments are selected and entity type is "API Proxies", **When** comparison loads, **Then** I see a side-by-side view showing entities from both environments with status indicators (matched/different/missing)
2. **Given** an entity exists in both environments with identical configuration, **When** I view the comparison, **Then** it shows a green checkmark (✓) indicating matched
3. **Given** an entity exists in both environments with different values, **When** I view the comparison, **Then** it shows a yellow warning (⚠) indicating differences
4. **Given** an entity exists only in the left environment, **When** I view the comparison, **Then** it shows red (✗) on left panel and an empty placeholder row on right panel
5. **Given** an entity exists only in the right environment, **When** I view the comparison, **Then** it shows an empty placeholder row on left panel and red (✗) on right panel

---

### User Story 3 - Refresh Environment Data (Priority: P2)

As an Apigee integration engineer, I want to refresh all environment data from Apigee so that I am comparing the latest configuration state.

**Why this priority**: Data freshness is essential for accurate comparisons, but the system can function with cached data initially.

**Independent Test**: Can be fully tested by clicking the refresh button and verifying that data is fetched from Apigee, stored, and the UI updates with a timestamp showing when data was last refreshed.

**Acceptance Scenarios**:

1. **Given** the dashboard is loaded, **When** I click "Refresh All" button, **Then** a loading indicator appears and all environments begin fetching data from Apigee
2. **Given** refresh is in progress, **When** fetch completes for all environments, **Then** I see a summary showing how many environments were refreshed and entity counts
3. **Given** refresh completes, **When** I view entity lists, **Then** I see the updated "last refreshed" timestamp
4. **Given** one environment fails to refresh, **When** refresh completes, **Then** I see which environment failed while other environments still update successfully

---

### User Story 4 - Entity Type Selection (Priority: P2)

As an Apigee integration engineer, I want to select which type of entity to view/compare (Apps, Products, Proxies, KVMs, etc.) so that I can focus on specific configuration areas.

**Why this priority**: Entity type filtering enables focused analysis, but comparison view can default to showing one entity type initially.

**Independent Test**: Can be fully tested by selecting different entity types from the dropdown and verifying the displayed data changes to show only that entity type.

**Acceptance Scenarios**:

1. **Given** the dashboard is loaded, **When** I click the entity type dropdown, **Then** I see options for: Apps, API Products, API Proxies, Caches, KVMs, Target Servers, References, Keystores, Virtual Hosts
2. **Given** I select "KVMs" from entity type dropdown, **When** the view updates, **Then** I see only KVM entities in the comparison/list view
3. **Given** I switch from "Apps" to "API Products", **When** the view updates, **Then** the previous entity list is replaced with API Products

---

### User Story 5 - Entity Detail Drill-Down (Priority: P3)

As an Apigee integration engineer, I want to expand an entity row to see its full details and nested data (KVM entries, certificates, credentials) so that I can identify specific differences.

**Why this priority**: Drill-down enables detailed analysis but basic comparison already shows entity-level differences.

**Independent Test**: Can be fully tested by clicking on an entity row and verifying expanded details appear with nested data compared side-by-side.

**Acceptance Scenarios**:

1. **Given** I am viewing KVMs comparison, **When** I click on a KVM row, **Then** it expands to show all key-value entries compared side-by-side
2. **Given** I am viewing Keystores comparison, **When** I click on a keystore row, **Then** it expands to show all certificates with alias, subject, issuer, and expiration date
3. **Given** I am viewing Apps comparison, **When** I click on an app row, **Then** it expands to show all credentials with consumer key, status, and expiration
4. **Given** a KVM entry has different values between environments, **When** I view the expanded details, **Then** the differing values are highlighted

---

### User Story 6 - Single Environment View Mode (Priority: P3)

As an Apigee integration engineer, I want to switch to a single-environment view mode so that I can examine one environment in detail without comparison.

**Why this priority**: Single view is useful but comparison mode is the primary use case and provides more value.

**Independent Test**: Can be fully tested by toggling to single-env mode and verifying the full-width view shows only one environment's entities.

**Acceptance Scenarios**:

1. **Given** I am in comparison mode, **When** I click "View Mode" toggle, **Then** the view switches to single-environment mode with full-width panel
2. **Given** I am in single-env mode, **When** I view the page, **Then** the second environment selector is hidden
3. **Given** I am in single-env mode, **When** I toggle back to comparison mode, **Then** both environment selectors appear and side-by-side view returns

---

### User Story 7 - Issue Highlighting (Priority: P3)

As an Apigee integration engineer, I want the system to automatically highlight potential issues (expired certificates, revoked apps, expiring credentials) so that I can quickly identify problems.

**Why this priority**: Proactive issue detection adds significant value but basic comparison already shows drift which is the primary concern.

**Independent Test**: Can be fully tested by viewing entities with known issues (expired cert, revoked app) and verifying visual indicators appear.

**Acceptance Scenarios**:

1. **Given** a certificate has expired, **When** I view keystores, **Then** the certificate shows a red badge with warning icon
2. **Given** a certificate expires within 30 days, **When** I view keystores, **Then** the certificate shows an orange "expiring soon" badge
3. **Given** an app has status "revoked", **When** I view apps, **Then** the app shows a red "revoked" badge
4. **Given** a credential has expired, **When** I view app details, **Then** the credential shows a red "expired" badge
5. **Given** a proxy has no deployed revisions, **When** I view proxies, **Then** the row appears muted/gray indicating undeployed state

---

### Edge Cases

- What happens when Apigee credentials are invalid or expired? → Display clear error message identifying which instance failed authentication
- What happens when an environment has no entities of the selected type? → Display "No entities found" message with empty state illustration
- What happens when network connectivity to Apigee is lost during refresh? → Show partial success with clear indication of which environments failed
- What happens when comparing environments from different instances? → Comparison works normally as entities are matched by name regardless of instance
- What happens when entity names contain special characters? → Names are displayed as-is with proper encoding/escaping

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all configured Apigee instances, organizations, and environments in hierarchical selectors
- **FR-002**: System MUST support comparison of two environments from any combination of instances/orgs
- **FR-003**: System MUST fetch and store 9 entity types: Apps, API Products, API Proxies, Caches, KVMs, Target Servers, References, Keystores/Truststores, Virtual Hosts
- **FR-004**: System MUST identify entities as: matched-identical, matched-different, only-in-env1, only-in-env2
- **FR-005**: System MUST display visual indicators (colors, icons) distinguishing comparison states
- **FR-006**: System MUST persist fetched data locally so reads do not require live Apigee calls
- **FR-007**: System MUST provide a manual "Refresh All" action to fetch latest data from all environments
- **FR-008**: System MUST display last-refreshed timestamp for each environment
- **FR-009**: System MUST support drill-down into nested entity data (KVM entries, certificates, credentials)
- **FR-010**: System MUST highlight potential issues: expired/expiring certificates, revoked apps/credentials, undeployed proxies
- **FR-011**: System MUST read environment topology from external configuration file (not hardcoded)
- **FR-012**: System MUST NOT perform any write operations to Apigee (read-only)
- **FR-013**: System MUST continue functioning for other environments when one environment fails to refresh
- **FR-014**: System MUST use the INSTANCE-ORG-ENV identifier pattern consistently throughout
- **FR-015**: System MUST load Apigee credentials from environment variables (not stored in config files or database)

### Key Entities

- **Instance**: Represents an Apigee Edge deployment (e.g., PROD, DEV). Has name, management URL, organization name, and credentials loaded from environment variables.
- **Environment**: Represents a deployment target within an org (e.g., staging, production). Identified by INSTANCE-ORG-ENV pattern.
- **App**: Developer application with credentials and associated products. Tracks approval status.
- **API Product**: Bundle of API proxies with quota and scope settings.
- **API Proxy**: The deployed API with revision tracking per environment.
- **Cache**: Environment-scoped cache configuration with expiry settings.
- **KVM**: Key-Value Map with multiple entries; may be encrypted.
- **Target Server**: Backend server reference with host, port, SSL, and enabled status.
- **Reference**: Pointer to keystores/truststores used by proxies.
- **Keystore/Truststore**: Certificate container with multiple aliases and certificate metadata.
- **Virtual Host**: Environment endpoint configuration with host aliases and SSL settings.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can select two environments and view comparison results within 5 seconds of selection
- **SC-002**: Comparison correctly identifies 100% of differences between entities (no false positives or missed differences)
- **SC-003**: Refresh operation completes for 4 environments within 60 seconds under normal network conditions
- **SC-004**: 90% of users can identify configuration drift between two environments within their first session
- **SC-005**: System supports viewing at least 500 entities per environment without noticeable performance degradation
- **SC-006**: Issue highlighting correctly identifies 100% of expired certificates and revoked credentials
- **SC-007**: Users can drill down into entity details with a single click and see nested data within 2 seconds

## Assumptions

- Users have valid Apigee credentials with read access to all configured environments
- Apigee Management API v1 endpoints are available and respond within reasonable timeframes
- Environment topology (instances, orgs, environments) is relatively static and configured at deployment time
- Entity count per environment is in the hundreds, not thousands (Phase 1 scale assumption)
- Basic authentication is acceptable for Apigee API access (no OAuth/SAML requirement initially)
- Users access the dashboard from a modern web browser with JavaScript enabled
- Network connectivity exists between the dashboard backend and Apigee Management API endpoints

## Out of Scope

- Write operations to Apigee (create, update, delete entities)
- Historical change tracking and snapshots over time
- Alerting and notifications (Slack, email)
- Auto-refresh with configurable intervals
- Export reports (PDF, CSV)
- User authentication for the dashboard itself
- Multi-user collaboration features
- Real-time WebSocket updates
