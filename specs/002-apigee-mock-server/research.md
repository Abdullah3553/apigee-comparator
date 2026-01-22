# Research: Apigee Mock Management Server

**Feature Branch**: `002-apigee-mock-server`
**Date**: 2026-01-22

## Executive Summary

All technical decisions for the mock server were resolved during the clarification phase. This document consolidates the decisions, rationales, and best practices research for implementing an Express.js mock server that replicates the Apigee Edge Management API.

## Decision Log

### 1. Framework Selection: Express.js (TypeScript)

**Decision**: Use Express.js with TypeScript instead of NestJS

**Rationale**:
- Mock server is a stateless API returning static JSON data
- No business logic, dependency injection, or complex module structure needed
- Express.js is lighter weight (~50% less boilerplate for simple route handlers)
- Faster startup time for development iteration
- Constitution deviation justified: this is a development tool, not the production backend

**Alternatives Considered**:
| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| NestJS | Constitution compliant, consistent with backend | Over-engineered for static mock responses | Adds 2-3x code for same functionality |
| Fastify | Faster than Express | Less ecosystem, team unfamiliar | No performance benefit for mock server |
| json-server | Zero-code JSON API | Can't match exact Apigee URL patterns | Route structure incompatible |

### 2. Mock Data Format: JSON Files

**Decision**: Store mock data in JSON files, one per entity type per environment

**Rationale**:
- JSON is native to JavaScript/TypeScript (no parsing dependencies)
- Matches Apigee API response format exactly
- Easy to copy/adapt real Apigee responses into mock data
- Git-friendly for version control and code review

**File Organization**:
```
mock-server/data/
├── organizations.json           # Org-level data
├── dev/                         # Per-environment directories
│   ├── apps.json
│   ├── apiProducts.json
│   └── ...
└── staging/
    └── ...
```

### 3. Authentication: Hardcoded Credentials

**Decision**: Accept only `mock/mock` (username/password) via Basic Auth

**Rationale**:
- Simpler than environment variables for a development tool
- Exercises the authentication code path in the dashboard
- Clear signal that this is mock data (credential = "mock")
- No security risk since mock server only runs locally

**Implementation**:
```typescript
// Decode Basic Auth header, compare against "mock:mock"
const validCredentials = Buffer.from('mock:mock').toString('base64');
```

### 4. Port Selection: 8080 (Default)

**Decision**: Run mock server on port 8080 (configurable via MOCK_SERVER_PORT)

**Rationale**:
- Matches Apigee Private Cloud default port pattern (`http://<ms-ip>:8080/v1`)
- Different from backend (3001) and frontend (3002)
- Allows running all services simultaneously
- 8080 is conventional for HTTP development servers

### 5. Certificate Generation: Pre-generated PEM Files

**Decision**: Include pre-generated self-signed certificates in the repository

**Rationale**:
- Apigee API returns raw PEM strings for certificate endpoints
- Dashboard already has certificate parsing logic that needs testing
- Pre-generated certs ensure deterministic expiry dates for testing
- Three certificate scenarios needed: expired, expiring soon (30 days), valid (1 year)

**Certificate Generation** (one-time, using OpenSSL):
```bash
# Expired certificate (expired 30 days ago)
openssl req -x509 -newkey rsa:2048 -keyout /dev/null -out expired.pem \
  -days -30 -nodes -subj "/CN=expired.example.com"

# Expiring soon (15 days from generation)
openssl req -x509 -newkey rsa:2048 -keyout /dev/null -out expiring-soon.pem \
  -days 15 -nodes -subj "/CN=expiring.example.com"

# Valid certificate (365 days)
openssl req -x509 -newkey rsa:2048 -keyout /dev/null -out valid.pem \
  -days 365 -nodes -subj "/CN=valid.example.com"
```

### 6. Logging: Console with Configurable Levels

**Decision**: Use morgan for HTTP request logging, console for application logs

**Rationale**:
- Morgan is the Express.js standard for request logging
- Console output is sufficient for local development
- Log levels (debug/info/error) via LOG_LEVEL environment variable
- No need for structured JSON logging (development tool, not production)

**Log Format**:
```
[INFO] Mock server listening on port 8080
[DEBUG] GET /v1/organizations/mock-org/apps - 200 (3ms)
[ERROR] Failed to load mock data: data/dev/apps.json not found
```

### 7. Docker Integration

**Decision**: Add mock-server as optional service in docker-compose.yml with `mock` profile

**Rationale**:
- Allows running with `docker-compose --profile mock up`
- Doesn't start by default (won't interfere with real Apigee testing)
- Single-command startup for full mock stack
- Consistent with existing Docker Compose patterns

**Service Configuration**:
```yaml
mock-server:
  profiles: ["mock"]
  build:
    context: ./mock-server
    target: development
  ports:
    - "${MOCK_SERVER_PORT:-8080}:8080"
  environment:
    - LOG_LEVEL=${LOG_LEVEL:-info}
```

## Best Practices Applied

### Express.js Mock Server Patterns

1. **Route organization**: One file per resource type (e.g., `routes/apps.ts`)
2. **Centralized data loading**: `data/loader.ts` handles JSON file reading with caching
3. **Error handling middleware**: Return 404 for unknown entities, 401 for bad auth
4. **Request validation**: Validate org/env path parameters against mock data

### Mock Data Design Patterns

1. **Realistic naming**: Use business-relevant names (e.g., `payment-api-v1`, `partner-portal-app`)
2. **Consistent timestamps**: Use epoch milliseconds matching Apigee format
3. **Known differences**: Design env2 to have deliberate differences from env1 for comparison testing
4. **Issue scenarios**: Include at least one example of each issue type (expired, revoked, undeployed)

### Testing Strategy

1. **Auth tests**: Verify 401 for missing/invalid credentials, 200 for valid
2. **Endpoint tests**: Verify each endpoint returns correct structure
3. **Not-found tests**: Verify 404 for unknown org/env/entity
4. **Response structure tests**: Validate JSON matches Apigee API schema

## Open Questions (None)

All questions were resolved during the clarification phase. No blocking issues remain.

## References

- [APIGEE_MOCK_STRUCTURE.md](../../APIGEE_MOCK_STRUCTURE.md) - Apigee API response structures
- [Express.js Documentation](https://expressjs.com/)
- [Morgan Logger](https://github.com/expressjs/morgan)
- [OpenSSL Certificate Generation](https://www.openssl.org/docs/man1.1.1/man1/openssl-req.html)
