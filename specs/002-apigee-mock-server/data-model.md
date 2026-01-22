# Data Model: Apigee Mock Management Server

**Feature Branch**: `002-apigee-mock-server`
**Date**: 2026-01-22

## Overview

The mock server does not use a database. Instead, it serves JSON files that match the exact response structures of the Apigee Edge Management API. This document defines the data structures for mock data files.

## Entity Definitions

### Organization

**File**: `data/organizations.json`

```typescript
interface Organization {
  name: string;                    // Org identifier (e.g., "mock-org")
  displayName: string;             // Human-readable name
  type: "paid" | "trial";          // Org type
  createdAt: number;               // Epoch timestamp (ms)
  createdBy: string;               // Email of creator
  lastModifiedAt: number;          // Epoch timestamp (ms)
  lastModifiedBy: string;          // Email of last modifier
  environments: string[];          // List of environment names
  properties: {
    property: Array<{
      name: string;
      value: string;
    }>;
  };
}

// List response: string[] (just org names)
// Detail response: Organization object
```

### Environment

**File**: Embedded in `organizations.json` (list) + `data/{env}/environment.json` (details)

```typescript
interface Environment {
  name: string;                    // Environment name (e.g., "dev", "staging")
  createdAt: number;               // Epoch timestamp (ms)
  createdBy: string;               // Email of creator
  lastModifiedAt: number;          // Epoch timestamp (ms)
  lastModifiedBy: string;          // Email of last modifier
  properties: {
    property: Array<{
      name: string;
      value: string;
    }>;
  };
}

// List response: string[] (just environment names)
// Detail response: Environment object
```

### App (Developer App)

**File**: `data/{env}/apps.json`

```typescript
interface App {
  appId: string;                   // UUID
  name: string;                    // App name
  accessType: string;              // "read" | "write" | "readwrite"
  appFamily: string;               // Usually "default"
  callbackUrl: string;             // OAuth callback URL
  developerId: string;             // Developer UUID
  status: "approved" | "revoked";  // App status (KEY FOR ISSUE DETECTION)
  credentials: Array<{
    consumerKey: string;           // API key
    consumerSecret: string;        // API secret
    expiresAt: number;             // -1 for never, or epoch timestamp
    issuedAt: number;              // Epoch timestamp (ms)
    status: "approved" | "revoked";
    apiProducts: Array<{
      apiproduct: string;          // Product name
      status: "approved" | "revoked" | "pending";
    }>;
  }>;
  createdAt: number;               // Epoch timestamp (ms)
  createdBy: string;
  lastModifiedAt: number;
  lastModifiedBy: string;
}

// List response: { app: App[] }
// Detail response: App object
```

### API Product

**File**: `data/{env}/apiProducts.json`

```typescript
interface ApiProduct {
  name: string;                    // Product identifier
  displayName: string;             // Human-readable name
  description: string;             // Product description
  approvalType: "auto" | "manual"; // Developer approval type
  attributes: Array<{
    name: string;
    value: string;
  }>;
  environments: string[];          // Allowed environments
  proxies: string[];               // Associated proxy names
  quota: string;                   // Quota limit (as string)
  quotaInterval: string;           // Quota interval
  quotaTimeUnit: "minute" | "hour" | "day" | "month";
  scopes: string[];                // OAuth scopes
  createdAt: number;
  lastModifiedAt: number;
}

// List response: { apiProduct: ApiProduct[] }
// Detail response: ApiProduct object
```

### API Proxy

**File**: `data/{env}/apiProxies.json` (proxy list) + `data/{env}/deployments.json` (deployment status)

```typescript
interface ApiProxy {
  name: string;                    // Proxy name
  revision: string[];              // List of revision numbers
  metaData: {
    createdAt: number;
    createdBy: string;
    lastModifiedAt: number;
    lastModifiedBy: string;
  };
  type: "Application";             // Always "Application"
}

interface ProxyDeployment {
  name: string;                    // Proxy name
  organization: string;            // Org name
  environment: Array<{
    name: string;                  // Environment name
    revision: Array<{
      name: string;                // Revision number (as string)
      state: "deployed" | "error"; // Deployment state (KEY FOR ISSUE DETECTION)
      server: Array<{
        status: "deployed" | "error";
        type: "message-processor";
        uUID: string;
      }>;
    }>;
  }>;
}

// List response: string[] (just proxy names)
// Detail response: ApiProxy object
// Deployments response: ProxyDeployment object
```

### Cache

**File**: `data/{env}/caches.json`

```typescript
interface Cache {
  name: string;                    // Cache name
  description: string;             // Cache description
  expirySettings: {
    timeoutInSec: {
      value: string;               // Timeout in seconds (as string)
    };
    valuesNull: boolean;
  };
  overflowToDisk: boolean;
  skipCacheIfElementSizeInKBExceeds: string;
  distributed: boolean;
  compression: {
    minimumSizeInKB: number;
  };
}

// List response: string[] (just cache names)
// Detail response: Cache object
```

### Key Value Map (KVM)

**File**: `data/{env}/kvms.json`

```typescript
interface Kvm {
  name: string;                    // KVM name
  encrypted: boolean;              // Whether values are encrypted
  entry: Array<{
    name: string;                  // Key name
    value: string;                 // Key value (masked if encrypted)
  }>;
}

// List response: string[] (just KVM names)
// Detail response: Kvm object
```

### Target Server

**File**: `data/{env}/targetServers.json`

```typescript
interface TargetServer {
  name: string;                    // Server name
  host: string;                    // Hostname or IP
  port: number;                    // Port number
  isEnabled: boolean;              // Whether enabled (KEY FOR ISSUE DETECTION)
  sSLInfo?: {
    enabled: boolean;
    clientAuthEnabled: boolean;
    keyStore: string;              // Reference to keystore (ref://...)
    keyAlias: string;              // Alias in keystore
    trustStore: string;            // Reference to truststore
    ignoreValidationErrors: boolean;
    ciphers: string[];
    protocols: string[];
  };
}

// List response: string[] (just server names)
// Detail response: TargetServer object
```

### Reference

**File**: `data/{env}/references.json`

```typescript
interface Reference {
  name: string;                    // Reference name
  refers: string;                  // Referenced resource name
  resourceType: "KeyStore" | "TrustStore";
}

// List response: string[] (just reference names)
// Detail response: Reference object
```

### Keystore

**File**: `data/{env}/keystores.json` + `certs/*.pem`

```typescript
interface Keystore {
  name: string;                    // Keystore name
  aliases: string[];               // List of alias names
  certs: string[];                 // Same as aliases for keystores
}

interface CertificateAlias {
  alias: string;                   // Alias name
  type: "keycert" | "cert";        // Key+cert or cert only
  format: "pem";                   // Always PEM
  certificate: string;             // Raw PEM string (PARSED BY DASHBOARD FOR EXPIRY)
}

// List response: string[] (just keystore names)
// Keystore detail response: Keystore object
// Alias detail response: CertificateAlias object
```

### Virtual Host

**File**: `data/{env}/virtualHosts.json`

```typescript
interface VirtualHost {
  name: string;                    // Virtual host name
  hostAliases: string[];           // DNS aliases
  interfaces: string[];            // Network interfaces (usually empty)
  port: string;                    // Port (as string)
  baseUrl: string;                 // Full base URL
  sSLInfo?: {
    enabled: boolean;
    keyStore: string;              // Reference to keystore
    keyAlias: string;              // Alias in keystore
    trustStore: string;            // Reference to truststore
    clientAuthEnabled: boolean;
  };
  properties: {
    property: Array<{
      name: string;
      value: string;
    }>;
  };
}

// List response: string[] (just vhost names)
// Detail response: VirtualHost object
```

## Mock Data File Structure

```
mock-server/data/
├── organizations.json           # { organizations: Organization[], list: string[] }
├── dev/
│   ├── environment.json         # Environment details for "dev"
│   ├── apps.json                # { app: App[] }
│   ├── apiProducts.json         # { apiProduct: ApiProduct[] }
│   ├── apiProxies.json          # { proxies: ApiProxy[], deployments: ProxyDeployment[] }
│   ├── caches.json              # { caches: Cache[] }
│   ├── kvms.json                # { kvms: Kvm[] }
│   ├── targetServers.json       # { targetServers: TargetServer[] }
│   ├── references.json          # { references: Reference[] }
│   ├── keystores.json           # { keystores: Keystore[], aliases: Record<string, CertificateAlias[]> }
│   └── virtualHosts.json        # { virtualHosts: VirtualHost[] }
└── staging/
    └── [same structure]
```

## Relationships

```
Organization (1) ──────┬──── (*) Environment
                       │
                       └──── (*) App ────── (*) ApiProduct
                       │
                       └──── (*) ApiProxy ──── (*) ProxyDeployment

Environment (1) ──────┬──── (*) Cache
                      ├──── (*) Kvm
                      ├──── (*) TargetServer ───── (0..1) Keystore (via reference)
                      ├──── (*) Reference ───────── (1) Keystore/TrustStore
                      ├──── (*) Keystore ────────── (*) CertificateAlias
                      └──── (*) VirtualHost ─────── (0..1) Keystore (via reference)
```

## Issue Detection Fields

| Entity | Field | Issue Condition |
|--------|-------|-----------------|
| App | `status` | `"revoked"` = revoked app |
| App | `credentials[].status` | `"revoked"` = revoked credential |
| ApiProxy | `deployment.environment[].revision` | Empty array = undeployed |
| TargetServer | `isEnabled` | `false` = disabled server |
| CertificateAlias | `certificate` (parsed) | Expiry < now = expired |
| CertificateAlias | `certificate` (parsed) | Expiry < now + 30d = expiring soon |

## Validation Rules

1. **Unique names**: Entity names must be unique within their scope (org, env)
2. **Valid references**: Reference `refers` must point to existing keystore
3. **Valid timestamps**: All timestamps must be positive epoch milliseconds
4. **Consistent environments**: App's `credentials[].apiProducts` must reference valid products
5. **Proxy deployments**: Deployment env names must match defined environments
