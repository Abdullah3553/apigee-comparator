<!--
SYNC IMPACT REPORT
==================
Version change: N/A → 1.0.0
Added principles:
  - I. Read-Only Operations
  - II. Database-First Architecture
  - III. Environment Isolation
  - IV. Comparison Accuracy
  - V. Configuration as Code
Added sections:
  - Technology Constraints
  - Development Workflow
Removed sections: None
Templates requiring updates:
  - .specify/templates/plan-template.md ⚠ pending (new project)
  - .specify/templates/spec-template.md ⚠ pending (new project)
  - .specify/templates/tasks-template.md ⚠ pending (new project)
Follow-up TODOs: None
-->

# Apigee Monitor Constitution

## Core Principles

### I. Read-Only Operations

The system MUST operate in read-only mode against Apigee Management APIs. Write operations
(create, update, delete) to Apigee are explicitly forbidden. This principle ensures:

- Zero risk of accidental configuration changes to production environments
- Safe operation by any team member without elevated permissions concerns
- Audit-friendly architecture where the tool cannot be blamed for environment drift

**Rationale**: The primary purpose is monitoring and comparison, not configuration management.
Allowing writes would fundamentally change the risk profile and require complex authorization.

### II. Database-First Architecture

All entity reads MUST be served from PostgreSQL, never directly from Apigee APIs during
normal operation. The data flow is:

- **Refresh**: User-triggered fetch from Apigee → stored in PostgreSQL
- **Read**: UI requests → served from PostgreSQL only
- **Compare**: Comparison logic operates on database records

**Rationale**: This ensures consistent response times, enables offline analysis, reduces
Apigee API rate limit pressure, and allows historical comparison (future phase).

### III. Environment Isolation

Every entity MUST be uniquely identified by the `INSTANCE-ORG-ENV` pattern. This
three-part identifier:

- Prevents accidental cross-environment data mixing
- Enables clear multi-instance, multi-org topology
- Serves as the primary grouping key in database and UI

**Rationale**: Apigee deployments span multiple instances and organizations. Without strict
isolation, comparison results would be meaningless or dangerous.

### IV. Comparison Accuracy

Comparison logic MUST produce deterministic, accurate results with clear visual indicators:

- **Matched & identical**: Entities exist in both environments with same configuration
- **Matched but different**: Same entity name, different values (highlight differences)
- **Only in env1/env2**: Entity exists in one environment only

Deep comparison MUST include nested structures (KVM entries, certificates, credentials).

**Rationale**: Inaccurate comparisons lead to missed drift or false positives, both of
which erode trust in the tool.

### V. Configuration as Code

All environment topology and credentials MUST be defined in YAML configuration files.
No hardcoded environment references in source code. Configuration includes:

- Instance definitions (name, management URL, org)
- Environment lists per instance
- Credential references (via environment variables, never plaintext)

**Rationale**: Enables version control of topology, easy onboarding of new environments,
and separation of configuration from code.

## Technology Constraints

The following technology choices are mandated for this project:

| Layer | Technology | Justification |
|-------|------------|---------------|
| Frontend | React 18+ with TypeScript | Modern component model, type safety |
| Backend | NestJS with TypeScript | Structured modules, dependency injection |
| Database | PostgreSQL with JSONB | Flexible entity storage, robust querying |
| ORM | TypeORM | NestJS integration, migration support |
| Config | YAML | Human-readable, supports env var interpolation |
| Deployment | Docker Compose | Local development parity, single-command startup |
| Auth (Apigee) | Basic Authentication | Apigee Edge Management API standard |

Deviations from this stack require explicit justification and constitution amendment.

## Development Workflow

### Code Organization

- **Monorepo structure**: `backend/` and `frontend/` directories at root
- **Module-per-feature**: NestJS modules for config, refresh, entities, compare
- **Shared types**: TypeScript interfaces for all entity and API contracts

### Testing Requirements

- Unit tests for comparison logic (critical path)
- Integration tests for Apigee service (mocked API responses)
- E2E tests for critical user flows (refresh, compare)

### Error Handling

- Graceful degradation when individual Apigee environments fail to refresh
- Clear error messages surfaced to UI (which env failed, why)
- Never fail entire refresh if one environment is unreachable

## Governance

This constitution is the authoritative source for project principles and constraints.
All implementation decisions MUST align with these principles.

**Amendment Process**:
1. Propose change with rationale
2. Evaluate impact on existing code and templates
3. Update constitution version following semver
4. Propagate changes to dependent templates

**Compliance**:
- All PRs MUST be reviewed against constitution principles
- Violations require either code change or constitution amendment
- Use CLAUDE.md for runtime development guidance

**Version**: 1.0.0 | **Ratified**: 2026-01-20 | **Last Amended**: 2026-01-20
