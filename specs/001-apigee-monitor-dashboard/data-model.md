# Data Model: Apigee Real-Time Monitoring Dashboard

**Date**: 2026-01-20
**Branch**: `001-apigee-monitor-dashboard`

## Overview

This document defines the database schema and entity relationships for the Apigee Monitor Dashboard. The model follows the constitution's Database-First Architecture principle, storing all Apigee entity data in PostgreSQL with JSONB columns for flexible attribute storage.

---

## Entity Relationship Diagram

```text
┌─────────────────┐
│    Instance     │
│─────────────────│
│ id (PK)         │
│ name (unique)   │
│ management_url  │
│ org_name        │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │ 1
         │
         │ *
┌────────▼────────┐
│   Environment   │
│─────────────────│
│ id (PK)         │
│ instance_id (FK)│
│ name            │
│ identifier      │◄── INSTANCE-ORG-ENV pattern
│ last_refreshed  │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │ 1
         │
         │ *
    ┌────┴────┬────────┬────────┬────────┬────────┬────────┬────────┬────────┐
    ▼         ▼        ▼        ▼        ▼        ▼        ▼        ▼        ▼
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│ App   │ │Product│ │ Proxy │ │ Cache │ │  KVM  │ │Target │ │  Ref  │ │Keystre│ │VirtHst│
│       │ │       │ │       │ │       │ │       │ │Server │ │       │ │       │ │       │
└───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘
```

---

## Core Tables

### Instance

Represents an Apigee Edge deployment (management server).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| name | VARCHAR(255) | UNIQUE, NOT NULL | Instance name (e.g., "PROD", "DEV") |
| management_url | VARCHAR(500) | NOT NULL | Apigee Management API base URL |
| org_name | VARCHAR(255) | NOT NULL | Apigee organization name |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last modification time |

**Indexes**: `idx_instance_name` on `name`

### Environment

Represents a deployment environment within an organization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| instance_id | UUID | FK → instances(id) ON DELETE CASCADE | Parent instance |
| name | VARCHAR(255) | NOT NULL | Environment name (e.g., "staging") |
| identifier | VARCHAR(500) | UNIQUE, NOT NULL | INSTANCE-ORG-ENV pattern |
| last_refreshed_at | TIMESTAMP | NULL | Last successful data refresh |
| refresh_status | VARCHAR(50) | DEFAULT 'pending' | Current refresh state |
| refresh_error | TEXT | NULL | Last error message if failed |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last modification time |

**Indexes**: `idx_environment_identifier` on `identifier`, `idx_environment_instance` on `instance_id`

**Computed**: `identifier = CONCAT(instance.name, '-', instance.org_name, '-', name)`

---

## Entity Tables

All entity tables share this common structure:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| environment_id | UUID | FK → environments(id) | Parent environment |
| name | VARCHAR(255) | NOT NULL | Entity name from Apigee |
| raw_response | JSONB | NULL | Full API response for debugging |
| fetched_at | TIMESTAMP | DEFAULT NOW() | When data was fetched |

**Common Constraint**: `UNIQUE(environment_id, name)` - prevents duplicates per environment

### App

Developer applications registered in Apigee.

| Column | Type | Description |
|--------|------|-------------|
| status | VARCHAR(50) | approved, revoked, pending |
| developer_id | VARCHAR(255) | Associated developer identifier |
| credentials | JSONB | Array of {consumerKey, status, expiresAt, products[]} |
| products | JSONB | Array of associated product names |
| attributes | JSONB | Custom app attributes |

**Issue Detection Fields**: `status`, `credentials[].status`, `credentials[].expiresAt`

### ApiProduct

API product bundles.

| Column | Type | Description |
|--------|------|-------------|
| status | VARCHAR(50) | approved, pending |
| display_name | VARCHAR(255) | Human-readable name |
| proxies | JSONB | Array of included proxy names |
| quota | JSONB | {limit, interval, timeUnit} |
| scopes | JSONB | Array of OAuth scopes |
| environments | JSONB | Environments where product is available |
| attributes | JSONB | Custom product attributes |

### ApiProxy

API proxy definitions and deployments.

| Column | Type | Description |
|--------|------|-------------|
| latest_revision | INTEGER | Most recent revision number |
| deployed_revisions | JSONB | Array of {revision, state, servers[]} per this env |
| metadata | JSONB | Proxy metadata (createdBy, modifiedAt, etc.) |

**Issue Detection Fields**: `deployed_revisions` (empty = undeployed)

### Cache

Environment-scoped cache configurations.

| Column | Type | Description |
|--------|------|-------------|
| description | TEXT | Cache description |
| expiry_settings | JSONB | {expiryDate, timeOfDay, timeoutInSec, valuesNull} |
| overflow_to_disk | BOOLEAN | Disk overflow enabled |
| skip_cache_if_element_size_kb | INTEGER | Size threshold for skipping cache |

### Kvm (Key-Value Map)

Environment-scoped key-value stores.

| Column | Type | Description |
|--------|------|-------------|
| encrypted | BOOLEAN | Whether values are encrypted |
| entries | JSONB | Array of {name, value} pairs |
| entry_count | INTEGER | Number of entries (computed) |

**Note**: Encrypted KVM values appear as `*****` from Apigee API

### TargetServer

Backend server definitions.

| Column | Type | Description |
|--------|------|-------------|
| host | VARCHAR(500) | Target hostname |
| port | INTEGER | Target port |
| is_enabled | BOOLEAN | Server enabled status |
| ssl_enabled | BOOLEAN | SSL/TLS enabled |
| ssl_info | JSONB | SSL configuration details |

**Issue Detection Fields**: `is_enabled`

### Reference

References to keystores/truststores.

| Column | Type | Description |
|--------|------|-------------|
| resource_type | VARCHAR(100) | KeyStore, TrustStore |
| refers_to | VARCHAR(255) | Referenced keystore/truststore name |

### Keystore

Certificate stores and their contents.

| Column | Type | Description |
|--------|------|-------------|
| aliases | JSONB | Array of alias names |
| certificates | JSONB | Array of {alias, subject, issuer, expiresAt, serialNumber} |

**Issue Detection Fields**: `certificates[].expiresAt`

### VirtualHost

Environment endpoint configurations.

| Column | Type | Description |
|--------|------|-------------|
| host_aliases | JSONB | Array of hostname aliases |
| port | INTEGER | Listening port |
| ssl_enabled | BOOLEAN | SSL/TLS enabled |
| ssl_info | JSONB | SSL configuration (keyStore, keyAlias, ciphers) |
| base_url | VARCHAR(500) | Base URL for the virtual host |

---

## JSONB Structure Examples

### App Credentials
```json
{
  "credentials": [
    {
      "consumerKey": "abc123...",
      "consumerSecret": "[REDACTED]",
      "status": "approved",
      "expiresAt": "2026-12-31T23:59:59Z",
      "products": [
        {"name": "ProductA", "status": "approved"}
      ]
    }
  ]
}
```

### Proxy Deployed Revisions
```json
{
  "deployed_revisions": [
    {
      "revision": "5",
      "state": "deployed",
      "servers": ["pod1", "pod2"]
    }
  ]
}
```

### Keystore Certificates
```json
{
  "certificates": [
    {
      "alias": "server-cert",
      "subject": "CN=api.example.com",
      "issuer": "CN=DigiCert",
      "expiresAt": "2026-06-15T00:00:00Z",
      "serialNumber": "0A:1B:2C:3D"
    }
  ]
}
```

---

## Validation Rules

| Entity | Rule | Source |
|--------|------|--------|
| All | `name` is required, max 255 chars | Apigee constraint |
| All | `environment_id` must reference valid environment | FK constraint |
| Environment | `identifier` must be unique across system | FR-014 |
| Environment | `identifier` format: `INSTANCE-ORG-ENV` | Constitution III |
| App | `status` must be one of: approved, revoked, pending | Apigee values |
| Keystore | `certificates[].expiresAt` must be ISO 8601 date | For issue detection |

---

## State Transitions

### Environment Refresh Status
```text
                    ┌─────────────────┐
                    │     pending     │ (initial)
                    └────────┬────────┘
                             │ refresh triggered
                             ▼
                    ┌─────────────────┐
                    │   refreshing    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │ success      │              │ failure
              ▼              │              ▼
     ┌─────────────────┐     │     ┌─────────────────┐
     │    success      │     │     │     failed      │
     └─────────────────┘     │     └─────────────────┘
                             │
                             │ next refresh
                             ▼
                    ┌─────────────────┐
                    │   refreshing    │
                    └─────────────────┘
```

---

## Indexes for Performance

```sql
-- Core lookups
CREATE INDEX idx_environment_identifier ON environments(identifier);
CREATE INDEX idx_environment_instance ON environments(instance_id);

-- Entity lookups (repeated for each entity table)
CREATE INDEX idx_{entity}_environment ON {entity}(environment_id);
CREATE INDEX idx_{entity}_name ON {entity}(name);
CREATE INDEX idx_{entity}_fetched ON {entity}(fetched_at);

-- JSONB indexes for issue detection (GIN for contains queries)
CREATE INDEX idx_app_credentials ON apps USING GIN(credentials);
CREATE INDEX idx_keystore_certs ON keystores USING GIN(certificates);
CREATE INDEX idx_proxy_deployments ON api_proxies USING GIN(deployed_revisions);
```

---

## Migration Strategy

1. **Initial Migration**: Create all tables with constraints
2. **Seed Migration**: Optionally seed instances/environments from config
3. **Runtime**: Entity data populated via refresh operation, not migrations
