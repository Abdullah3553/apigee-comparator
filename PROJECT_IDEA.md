# Apigee Real-Time Monitoring Dashboard - Project Specification

## Project Overview

| Attribute | Value |
|-----------|-------|
| **Project Name** | apigee-monitor |
| **Purpose** | Real-time monitoring and comparison of Apigee Edge entities across multiple instances, organizations, and environments |
| **Target Users** | Apigee integration engineering team |
| **Primary Goals** | Environment alignment, reduce downtime, catch configuration drift, ensure consistency |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React with TypeScript |
| **Backend** | NestJS with TypeScript |
| **Database** | PostgreSQL with JSONB columns |
| **ORM** | TypeORM |
| **Config Format** | YAML |
| **Deployment** | Local development + Docker Compose |
| **Apigee Auth** | Basic Authentication |

---

## Identifier Schema

All entities are organized using the following identifier pattern:

```
INSTANCE-ORG-ENV

Examples:
  PROD-prodorg-staging
  PROD-prodorg-production
  DEV-devorg-dev
  DEV-devorg-test
```

This identifier uniquely identifies each environment and serves as the primary grouping key throughout the application.

---

## Topology

The system monitors the following structure:

```
├── Instance: PROD-INSTANCE
│   └── Org: prod-org
│       ├── Env: staging
│       └── Env: production
│
└── Instance: DEV-INSTANCE
    └── Org: dev-org
        ├── Env: dev
        └── Env: test

Total: 2 instances × 1 org each × 2 environments = 4 environments
```

---

## Entities to Monitor

| Entity | Key Attributes to Track |
|--------|------------------------|
| **Apps** | name, status (approved/revoked), credentials (consumerKey, status, expiresAt), associated products |
| **API Products** | name, status, proxies included, quota settings, scopes |
| **API Proxies** | name, deployed revision(s) per environment, deployment status |
| **Caches** | name, expiry settings, configuration |
| **KVMs** | name, encrypted flag, all entries (keys and values) |
| **Target Servers** | name, host, port, SSL enabled, status (enabled/disabled) |
| **References** | name, resource type, refers to (keystore/truststore name) |
| **Keystores/Truststores** | name, aliases, certificates with expiration dates |
| **Virtual Hosts** | name, host aliases, port, SSL configuration |

---

## UI Design

### Layout Structure

```
┌──────────────────────────────────────────────────────────────────────────┐
│                               Nav Bar                                     │
│  ┌─────────────────┐ ┌─────────────────┐ ┌────────────┐ ┌───────┐ ┌────┐ │
│  │ Env Selector 1  │ │ Env Selector 2  │ │Entity Type │ │Refresh│ │View│ │
│  │ (INST-ORG-ENV)  │ │ (INST-ORG-ENV)  │ │ Dropdown   │ │  All  │ │Mode│ │
│  └─────────────────┘ └─────────────────┘ └────────────┘ └───────┘ └────┘ │
├──────────────────────────────────┬───────────────────────────────────────┤
│                                  │                                       │
│      Left Panel                  │         Right Panel                   │
│      (First Selected Env)        │         (Second Selected Env)         │
│                                  │                                       │
│  ┌────────────────────────────┐  │  ┌────────────────────────────────┐   │
│  │                            │  │  │                                │   │
│  │    Entity List             │  │  │      Entity List               │   │
│  │                            │  │  │                                │   │
│  │  • entity-a  ✓ (matched)   │  │  │  • entity-a  ✓ (matched)       │   │
│  │  • entity-b  ⚠ (different) │  │  │  • entity-b  ⚠ (different)     │   │
│  │  • entity-c  ✗ (only here) │  │  │  • ---                         │   │
│  │  • ---                     │  │  │  • entity-d  ✗ (only here)     │   │
│  │                            │  │  │                                │   │
│  └────────────────────────────┘  │  └────────────────────────────────┘   │
│                                  │                                       │
└──────────────────────────────────┴───────────────────────────────────────┘
```

### View Modes

| Mode | Description |
|------|-------------|
| **Comparison Mode** (default) | Two panels side-by-side for comparing two environments |
| **Single Env Mode** | One full-width panel for viewing a single environment in detail |

Users toggle between modes via a "View Mode" button in the nav bar.

### Nav Bar Components

| Component | Behavior |
|-----------|----------|
| **Env Selector 1** | Cascading dropdown: Instance → Org → Env |
| **Env Selector 2** | Same as above (hidden when in single-env mode) |
| **Entity Type Dropdown** | Options: Apps, Products, Proxies, Caches, KVMs, Target Servers, References, Keystores, Virtual Hosts |
| **Refresh All Button** | Fetches fresh data from Apigee for ALL configured environments and stores in database |
| **View Mode Toggle** | Switches between Comparison Mode and Single Env Mode |

### Comparison Visual Indicators

| Status | Left Panel | Right Panel | Color |
|--------|------------|-------------|-------|
| **Matched & identical** | ✓ Entity | ✓ Entity | Green |
| **Matched but different** | ⚠ Entity | ⚠ Entity | Yellow/Orange |
| **Only in left env** | ✗ Entity | (empty row) | Red highlight on left |
| **Only in right env** | (empty row) | ✗ Entity | Red highlight on right |

### Entity Drill-Down

Clicking an entity row expands to show full details:
- For **KVMs**: all entries with keys and values compared side-by-side
- For **Keystores**: all certificates with alias, subject, issuer, expiration date
- For **Apps**: all credentials with consumer key, status, expiration
- For **Proxies**: deployed revisions with deployment state

### KVM Deep Comparison Example

```
┌─────────────────────────────────┬─────────────────────────────────┐
│ Env 1: PROD-prodorg-staging     │ Env 2: PROD-prodorg-production  │
├─────────────────────────────────┼─────────────────────────────────┤
│ KVM: config-map                 │ KVM: config-map                 │
│ ├── api_url: staging.api.com   │ ├── api_url: prod.api.com       │  ⚠ different value
│ ├── timeout: 30                │ ├── timeout: 30                 │  ✓ identical
│ ├── feature_flag: true         │ ├── ---                         │  ✗ missing in right
│ └── ---                        │ └── new_key: some_value         │  ✗ missing in left
└─────────────────────────────────┴─────────────────────────────────┘
```

---

## Data Flow

### Refresh Flow (User clicks "Refresh All")

```
User clicks "Refresh All" button
        │
        ▼
Frontend displays loading indicator
        │
        ▼
Backend receives POST /api/refresh
        │
        ▼
For EACH configured environment (in parallel):
  ├── Fetch Apps from Apigee Management API
  ├── Fetch API Products from Apigee
  ├── Fetch API Proxies + Deployments from Apigee
  ├── Fetch Caches from Apigee
  ├── Fetch KVMs + all entries from Apigee
  ├── Fetch Target Servers from Apigee
  ├── Fetch References from Apigee
  ├── Fetch Keystores + Certificates from Apigee
  └── Fetch Virtual Hosts from Apigee
        │
        ▼
Backend UPSERTS all data into PostgreSQL
  - Insert new records
  - Update existing records
  - Set fetched_at timestamp
        │
        ▼
Backend returns success response with summary
        │
        ▼
Frontend re-fetches currently displayed data
        │
        ▼
UI updates with fresh comparison view
```

### Read Flow (Page load or entity type change)

```
User selects environments + entity type
        │
        ▼
Frontend requests GET /api/compare or GET /api/entities/:env/:type
        │
        ▼
Backend queries PostgreSQL (NOT Apigee directly)
        │
        ▼
Backend returns stored entity data
        │
        ▼
Frontend renders comparison or single-env view
```

---

## Database Schema

### Core Tables

```sql
-- Instances table
CREATE TABLE instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    management_url VARCHAR(500) NOT NULL,
    org_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Environments table
CREATE TABLE environments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID REFERENCES instances(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    instance_org_env VARCHAR(500) UNIQUE NOT NULL,
    last_refreshed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Entity Tables

All entity tables follow this pattern with specific fields per entity type:

```sql
-- Apps
CREATE TABLE apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    environment_id UUID REFERENCES environments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50),
    credentials JSONB,
    products JSONB,
    raw_response JSONB,
    fetched_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(environment_id, name)
);

-- API Products
CREATE TABLE api_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    environment_id UUID REFERENCES environments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50),
    proxies JSONB,
    quota JSONB,
    scopes JSONB,
    raw_response JSONB,
    fetched_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(environment_id, name)
);

-- API Proxies
CREATE TABLE api_proxies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    environment_id UUID REFERENCES environments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    deployed_revisions JSONB,
    raw_response JSONB,
    fetched_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(environment_id, name)
);

-- Caches
CREATE TABLE caches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    environment_id UUID REFERENCES environments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    expiry_settings JSONB,
    raw_response JSONB,
    fetched_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(environment_id, name)
);

-- KVMs
CREATE TABLE kvms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    environment_id UUID REFERENCES environments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    encrypted BOOLEAN DEFAULT FALSE,
    entries JSONB,
    raw_response JSONB,
    fetched_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(environment_id, name)
);

-- Target Servers
CREATE TABLE target_servers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    environment_id UUID REFERENCES environments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    host VARCHAR(500),
    port INTEGER,
    ssl_enabled BOOLEAN DEFAULT FALSE,
    status VARCHAR(50),
    raw_response JSONB,
    fetched_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(environment_id, name)
);

-- References
CREATE TABLE references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    environment_id UUID REFERENCES environments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    refers_to VARCHAR(255),
    raw_response JSONB,
    fetched_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(environment_id, name)
);

-- Keystores
CREATE TABLE keystores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    environment_id UUID REFERENCES environments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    aliases JSONB,
    certificates JSONB,
    raw_response JSONB,
    fetched_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(environment_id, name)
);

-- Virtual Hosts
CREATE TABLE virtual_hosts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    environment_id UUID REFERENCES environments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    host_aliases JSONB,
    port INTEGER,
    ssl_config JSONB,
    raw_response JSONB,
    fetched_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(environment_id, name)
);
```

---

## API Endpoints

### Configuration Endpoints

```
GET /api/config
  Description: Returns all configured instances, orgs, and environments
  Response: {
    instances: [
      {
        name: "PROD-INSTANCE",
        org: "prod-org",
        environments: ["staging", "production"]
      }
    ]
  }

GET /api/environments
  Description: Returns list of all instance_org_env identifiers
  Response: {
    environments: [
      "PROD-prodorg-staging",
      "PROD-prodorg-production",
      "DEV-devorg-dev",
      "DEV-devorg-test"
    ]
  }
```

### Refresh Endpoint

```
POST /api/refresh
  Description: Triggers refresh of ALL environments from Apigee APIs
  Request Body: (none)
  Response: {
    success: true,
    refreshedAt: "2024-01-15T10:30:00Z",
    summary: {
      environmentsRefreshed: 4,
      entitiesFetched: {
        apps: 150,
        products: 45,
        proxies: 200,
        ...
      }
    }
  }
```

### Entity Endpoints (Read from Database)

```
GET /api/entities/:instanceOrgEnv/apps
GET /api/entities/:instanceOrgEnv/products
GET /api/entities/:instanceOrgEnv/proxies
GET /api/entities/:instanceOrgEnv/caches
GET /api/entities/:instanceOrgEnv/kvms
GET /api/entities/:instanceOrgEnv/kvms/:kvmName/entries
GET /api/entities/:instanceOrgEnv/target-servers
GET /api/entities/:instanceOrgEnv/references
GET /api/entities/:instanceOrgEnv/keystores
GET /api/entities/:instanceOrgEnv/keystores/:keystoreName/certificates
GET /api/entities/:instanceOrgEnv/virtual-hosts

Response format:
{
  environment: "PROD-prodorg-staging",
  entityType: "proxies",
  lastRefreshed: "2024-01-15T10:30:00Z",
  data: [
    { name: "proxy-1", ... },
    { name: "proxy-2", ... }
  ]
}
```

### Comparison Endpoint

```
GET /api/compare
  Query Parameters:
    - env1: string (e.g., "PROD-prodorg-staging")
    - env2: string (e.g., "PROD-prodorg-production")
    - entityType: string (apps|products|proxies|caches|kvms|target-servers|references|keystores|virtual-hosts)
  
  Response: {
    env1: "PROD-prodorg-staging",
    env2: "PROD-prodorg-production",
    entityType: "proxies",
    comparison: {
      matched: [
        { name: "proxy-a", env1Data: {...}, env2Data: {...}, identical: true }
      ],
      different: [
        { name: "proxy-b", env1Data: {...}, env2Data: {...}, differences: ["deployed_revision"] }
      ],
      onlyInEnv1: [
        { name: "proxy-c", data: {...} }
      ],
      onlyInEnv2: [
        { name: "proxy-d", data: {...} }
      ]
    }
  }
```

---

## Configuration File

Create `config/apigee-config.yaml`:

```yaml
instances:
  - name: "PROD-INSTANCE"
    management_url: "https://api.enterprise.apigee.com/v1"
    org: "prod-org"
    credentials:
      username: "${APIGEE_PROD_USERNAME}"
      password: "${APIGEE_PROD_PASSWORD}"
    environments:
      - "staging"
      - "production"

  - name: "DEV-INSTANCE"
    management_url: "https://api.enterprise.apigee.com/v1"
    org: "dev-org"
    credentials:
      username: "${APIGEE_DEV_USERNAME}"
      password: "${APIGEE_DEV_PASSWORD}"
    environments:
      - "dev"
      - "test"
```

Environment variables for credentials:
- `APIGEE_PROD_USERNAME`
- `APIGEE_PROD_PASSWORD`
- `APIGEE_DEV_USERNAME`
- `APIGEE_DEV_PASSWORD`

---

## Docker Compose Configuration

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:3001
    depends_on:
      - backend
    volumes:
      - ./frontend/src:/app/src

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/apigee_monitor
      - APIGEE_PROD_USERNAME=${APIGEE_PROD_USERNAME}
      - APIGEE_PROD_PASSWORD=${APIGEE_PROD_PASSWORD}
      - APIGEE_DEV_USERNAME=${APIGEE_DEV_USERNAME}
      - APIGEE_DEV_PASSWORD=${APIGEE_DEV_PASSWORD}
    volumes:
      - ./backend/src:/app/src
      - ./config:/app/config
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=apigee_monitor
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

---

## Project Structure

```
apigee-monitor/
├── docker-compose.yml
├── .env.example
├── README.md
├── config/
│   └── apigee-config.yaml
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       │
│       ├── config/
│       │   ├── config.module.ts
│       │   ├── config.service.ts
│       │   └── config.controller.ts
│       │
│       ├── database/
│       │   ├── database.module.ts
│       │   └── entities/
│       │       ├── instance.entity.ts
│       │       ├── environment.entity.ts
│       │       ├── app.entity.ts
│       │       ├── api-product.entity.ts
│       │       ├── api-proxy.entity.ts
│       │       ├── cache.entity.ts
│       │       ├── kvm.entity.ts
│       │       ├── target-server.entity.ts
│       │       ├── reference.entity.ts
│       │       ├── keystore.entity.ts
│       │       └── virtual-host.entity.ts
│       │
│       ├── apigee/
│       │   ├── apigee.module.ts
│       │   └── apigee.service.ts
│       │
│       ├── refresh/
│       │   ├── refresh.module.ts
│       │   ├── refresh.controller.ts
│       │   └── refresh.service.ts
│       │
│       ├── entities/
│       │   ├── entities.module.ts
│       │   ├── entities.controller.ts
│       │   └── entities.service.ts
│       │
│       └── compare/
│           ├── compare.module.ts
│           ├── compare.controller.ts
│           └── compare.service.ts
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.tsx
        ├── App.tsx
        │
        ├── components/
        │   ├── NavBar/
        │   │   ├── NavBar.tsx
        │   │   └── NavBar.css
        │   ├── EnvSelector/
        │   │   ├── EnvSelector.tsx
        │   │   └── EnvSelector.css
        │   ├── EntityTypeSelector/
        │   │   └── EntityTypeSelector.tsx
        │   ├── ComparisonView/
        │   │   ├── ComparisonView.tsx
        │   │   ├── ComparisonPanel.tsx
        │   │   └── ComparisonRow.tsx
        │   ├── SingleEnvView/
        │   │   ├── SingleEnvView.tsx
        │   │   └── EntityTable.tsx
        │   ├── EntityDetails/
        │   │   ├── EntityDetails.tsx
        │   │   ├── KvmDetails.tsx
        │   │   ├── KeystoreDetails.tsx
        │   │   └── AppDetails.tsx
        │   └── common/
        │       ├── LoadingSpinner.tsx
        │       ├── StatusBadge.tsx
        │       └── DiffIndicator.tsx
        │
        ├── hooks/
        │   ├── useEnvironments.ts
        │   ├── useEntities.ts
        │   ├── useComparison.ts
        │   └── useRefresh.ts
        │
        ├── services/
        │   └── api.ts
        │
        ├── types/
        │   ├── environment.types.ts
        │   ├── entity.types.ts
        │   └── comparison.types.ts
        │
        └── utils/
            ├── comparison.utils.ts
            └── format.utils.ts
```

---

## Apigee Management API Reference

The backend will call these Apigee Edge Management API endpoints:

### Organization Level
```
GET /v1/organizations/{org}/apps
GET /v1/organizations/{org}/apps/{app}
GET /v1/organizations/{org}/apiproducts
GET /v1/organizations/{org}/apiproducts/{product}
GET /v1/organizations/{org}/apis
GET /v1/organizations/{org}/apis/{api}/deployments
```

### Environment Level
```
GET /v1/organizations/{org}/environments/{env}/caches
GET /v1/organizations/{org}/environments/{env}/keyvaluemaps
GET /v1/organizations/{org}/environments/{env}/keyvaluemaps/{kvm}/entries
GET /v1/organizations/{org}/environments/{env}/targetservers
GET /v1/organizations/{org}/environments/{env}/references
GET /v1/organizations/{org}/environments/{env}/keystores
GET /v1/organizations/{org}/environments/{env}/keystores/{keystore}/certs
GET /v1/organizations/{org}/environments/{env}/virtualhosts
```

All API calls use Basic Authentication with the configured credentials.

---

## Issue Highlighting Rules

The UI should highlight potential issues:

| Issue | Detection Logic | Visual Indicator |
|-------|-----------------|------------------|
| **Expired Certificate** | certificate.expiresAt < now | Red badge, ⚠️ icon |
| **Expiring Soon** | certificate.expiresAt < now + 30 days | Orange badge |
| **Revoked App** | app.status === "revoked" | Red badge |
| **Revoked Credential** | credential.status === "revoked" | Red text |
| **Expired Credential** | credential.expiresAt < now | Red badge |
| **Undeployed Proxy** | proxy.deployed_revisions is empty | Gray/muted row |
| **Missing in Env** | Entity exists in one env but not the other | Red highlight with ✗ |
| **Config Mismatch** | Same entity, different values | Yellow highlight with ⚠ |

---

## Development Phases

### Phase 1 (Current Scope)
- ✅ Project setup with Docker Compose
- ✅ NestJS backend with PostgreSQL
- ✅ React frontend with TypeScript
- ✅ YAML configuration loading
- ✅ All entity types monitoring
- ✅ Comparison view (side-by-side)
- ✅ Single environment view
- ✅ Refresh all environments
- ✅ Issue highlighting

### Phase 2 (Future)
- ⬜ Historical change tracking (snapshots over time)
- ⬜ Alerting/notifications (Slack, email)
- ⬜ Auto-refresh with configurable interval
- ⬜ Export reports (PDF, CSV)
- ⬜ User authentication for dashboard

### Out of Scope
- Write operations to Apigee (create/update/delete entities)
- Multi-user collaboration features
- Real-time WebSocket updates

---

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in Apigee credentials
3. Update `config/apigee-config.yaml` with your instance/org/env details
4. Run `docker-compose up --build`
5. Access frontend at http://localhost:3000
6. Access backend at http://localhost:3001

---

## Notes for Development

1. **Start with backend first**: Set up NestJS project, database schema, and Apigee service
2. **Test Apigee connectivity**: Ensure API calls work before building frontend
3. **Use TypeORM migrations**: For database schema changes
4. **Implement refresh service carefully**: Handle parallel API calls and rate limiting
5. **Frontend state management**: Consider using React Query for server state
6. **Error handling**: Graceful handling of Apigee API failures per environment