# Quickstart: Apigee Mock Management Server

**Feature Branch**: `002-apigee-mock-server`
**Date**: 2026-01-22

## Overview

The Apigee Mock Server allows you to run the full Apigee Monitor Dashboard locally without access to a real Apigee instance. It provides realistic mock data for all 9 entity types with known differences between environments for testing comparison functionality.

## Prerequisites

- Node.js 20 LTS
- Docker and Docker Compose (for containerized setup)
- Git

## Quick Start (Docker - Recommended)

```bash
# Clone the repository (if not already)
git clone <repository-url>
cd apigee-comparator

# Start all services with mock server
docker-compose --profile mock up

# Services will be available at:
# - Frontend: http://localhost:3002
# - Backend: http://localhost:3001
# - Mock Server: http://localhost:8080
# - Database: localhost:5432
```

## Quick Start (Local Development)

### 1. Start the Mock Server

```bash
# Navigate to mock server directory
cd mock-server

# Install dependencies
npm install

# Start the server
npm run dev

# Server runs at http://localhost:8080
```

### 2. Configure Dashboard to Use Mock Server

Create or update your `.env` file in the repository root:

```env
# Point to mock server instead of real Apigee
APIGEE_MOCK_URL=http://localhost:8080/v1
APIGEE_MOCK_USERNAME=mock
APIGEE_MOCK_PASSWORD=mock
```

Update `config/apigee-config.yaml`:

```yaml
instances:
  - name: "MOCK"
    management_url: "http://localhost:8080/v1"
    org: "mock-org"
    credentials:
      username: "${APIGEE_MOCK_USERNAME}"
      password: "${APIGEE_MOCK_PASSWORD}"
    environments:
      - "dev"
      - "staging"
```

### 3. Start Backend and Frontend

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Access the Dashboard

Open http://localhost:3002 in your browser.

## Authentication

The mock server uses Basic Authentication with fixed credentials:

- **Username**: `mock`
- **Password**: `mock`

All requests without valid credentials will receive a 401 Unauthorized response.

## Mock Data

### Organization and Environments

| Entity | Value |
|--------|-------|
| Organization | `mock-org` |
| Environment 1 | `dev` |
| Environment 2 | `staging` |

### Entity Counts

| Entity Type | Dev | Staging |
|-------------|-----|---------|
| Apps | 6 | 5 |
| API Products | 5 | 5 |
| API Proxies | 7 | 6 |
| Caches | 4 | 4 |
| KVMs | 5 | 4 |
| Target Servers | 5 | 5 |
| References | 4 | 4 |
| Keystores | 5 | 4 |
| Virtual Hosts | 3 | 3 |

### Issue Scenarios

The mock data includes entities with issues for testing:

| Issue Type | Entity | Environment |
|------------|--------|-------------|
| Expired Certificate | `payment-certs` keystore | dev |
| Expiring Soon (15 days) | `api-gateway-certs` keystore | staging |
| Revoked App | `deprecated-partner-app` | dev |
| Undeployed Proxy | `legacy-api-v1` | staging |
| Disabled Target Server | `old-backend` | dev |

## API Endpoints

The mock server implements the same endpoints as the real Apigee Management API:

```
GET /v1/organizations
GET /v1/organizations/{org}
GET /v1/organizations/{org}/environments
GET /v1/organizations/{org}/environments/{env}
GET /v1/organizations/{org}/apps?expand=true
GET /v1/organizations/{org}/apps/{appId}
GET /v1/organizations/{org}/apiproducts?expand=true
GET /v1/organizations/{org}/apiproducts/{productName}
GET /v1/organizations/{org}/apis
GET /v1/organizations/{org}/apis/{apiName}
GET /v1/organizations/{org}/apis/{apiName}/deployments
GET /v1/organizations/{org}/environments/{env}/caches
GET /v1/organizations/{org}/environments/{env}/caches/{cacheName}
GET /v1/organizations/{org}/environments/{env}/keyvaluemaps
GET /v1/organizations/{org}/environments/{env}/keyvaluemaps/{kvmName}
GET /v1/organizations/{org}/environments/{env}/targetservers
GET /v1/organizations/{org}/environments/{env}/targetservers/{serverName}
GET /v1/organizations/{org}/environments/{env}/references
GET /v1/organizations/{org}/environments/{env}/references/{refName}
GET /v1/organizations/{org}/environments/{env}/keystores
GET /v1/organizations/{org}/environments/{env}/keystores/{keystoreName}
GET /v1/organizations/{org}/environments/{env}/keystores/{keystoreName}/aliases/{aliasName}
GET /v1/organizations/{org}/environments/{env}/virtualhosts
GET /v1/organizations/{org}/environments/{env}/virtualhosts/{vhostName}
```

## Testing the Mock Server

### Verify Server is Running

```bash
curl -u mock:mock http://localhost:8080/v1/organizations
# Expected: ["mock-org"]
```

### Test Authentication

```bash
# Valid credentials
curl -u mock:mock http://localhost:8080/v1/organizations/mock-org
# Expected: 200 OK with organization details

# Invalid credentials
curl -u wrong:wrong http://localhost:8080/v1/organizations/mock-org
# Expected: 401 Unauthorized
```

### Test Environment Listing

```bash
curl -u mock:mock http://localhost:8080/v1/organizations/mock-org/environments
# Expected: ["dev", "staging"]
```

### Test Entity Listing

```bash
curl -u mock:mock "http://localhost:8080/v1/organizations/mock-org/apps?expand=true"
# Expected: { "app": [...] } with app details
```

## Customizing Mock Data

Mock data is stored in JSON files under `mock-server/data/`:

```
data/
├── organizations.json       # Organization details
├── dev/                     # Dev environment data
│   ├── apps.json
│   ├── apiProducts.json
│   ├── apiProxies.json
│   ├── caches.json
│   ├── kvms.json
│   ├── targetServers.json
│   ├── references.json
│   ├── keystores.json
│   └── virtualHosts.json
└── staging/                 # Staging environment data
    └── [same structure]
```

### Hot-Reload (Development Mode)

When running in development mode (`npm run dev`), the mock server automatically watches for changes to JSON files and reloads them without requiring a restart:

1. Edit any JSON file in `mock-server/data/`
2. Save the file
3. The server detects the change and clears the cache automatically
4. Next API request will use the updated data

**No restart needed!** This makes it easy to iterate on test scenarios.

### Manual Reload (Production Mode)

If running in production mode (`npm start`), you need to manually restart the server after changing data files:

1. Edit the appropriate JSON file
2. Restart the mock server
3. Refresh the dashboard

### Validating Your Changes

Before starting the server, validate your JSON files for syntax errors:

```bash
cd mock-server
npm run validate-data
```

This will check all `.json` files and report any syntax errors.

### Example: Adding a New App

To add a new app to the `dev` environment:

1. Open `mock-server/data/dev/apps.json`
2. Add a new app object to the `app` array:

```json
{
  "appId": "12345678-1234-1234-1234-123456789abc",
  "name": "my-new-app",
  "accessType": "read",
  "appFamily": "default",
  "callbackUrl": "https://example.com/callback",
  "developerId": "dev-123",
  "status": "approved",
  "credentials": [
    {
      "consumerKey": "AbCdEfGhIjKlMnOpQrStUvWxYz",
      "consumerSecret": "1234567890abcdef",
      "expiresAt": -1,
      "issuedAt": 1705910400000,
      "status": "approved",
      "apiProducts": [
        {
          "apiproduct": "basic-api-product",
          "status": "approved"
        }
      ]
    }
  ],
  "createdAt": 1705910400000,
  "createdBy": "admin@example.com",
  "lastModifiedAt": 1705910400000,
  "lastModifiedBy": "admin@example.com"
}
```

3. Save the file
4. If in dev mode, the change is detected automatically
5. Refresh the dashboard to see the new app

### Example: Adding an Issue Scenario

To test certificate expiry detection, add a keystore with an expired certificate:

1. Generate an expired certificate (or use existing `certs/expired.pem`)
2. Open `mock-server/data/dev/keystores.json`
3. Add a new keystore with an expired cert alias:

```json
{
  "name": "test-expired-keystore",
  "aliases": ["expired-cert"],
  "certs": ["expired-cert"]
}
```

4. Add the alias details to the `aliases` map in the same file
5. The dashboard will now show the expiry warning for this keystore

### Data File Structure Reference

See [data-model.md](data-model.md) for complete entity schemas and field descriptions.

## Troubleshooting

### Mock server won't start

```bash
# Check if port 8080 is in use
lsof -i :8080

# Use a different port
MOCK_SERVER_PORT=9090 npm run dev
```

### Dashboard shows connection error

1. Verify mock server is running: `curl http://localhost:8080/v1/organizations`
2. Check `config/apigee-config.yaml` points to correct mock server URL
3. Verify credentials are set correctly in `.env`

### Missing entities in dashboard

1. Check mock data files exist in `mock-server/data/{env}/`
2. Verify JSON syntax is valid: `npm run validate-data`
3. Check mock server logs for loading errors

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MOCK_SERVER_PORT` | `8080` | Port for mock server |
| `LOG_LEVEL` | `info` | Logging level (debug, info, error) |
| `ENABLE_HOT_RELOAD` | `false` (auto-enabled in `development`) | Enable automatic reloading of data files when changed |
| `NODE_ENV` | `production` | Environment mode (set to `development` for hot-reload) |

## Next Steps

1. Run the full dashboard with mock data
2. Test the comparison feature between `dev` and `staging`
3. Verify issue detection for expired certs, revoked apps, etc.
4. Customize mock data for specific test scenarios
