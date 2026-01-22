# Apigee Mock Management Server

A standalone Express.js mock server that replicates the Apigee Edge Management API for local development without requiring access to a real Apigee instance.

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start the mock server
npm run dev

# Server runs at http://localhost:8080
# Swagger UI available at http://localhost:8080/api-docs
```

### Docker Compose

```bash
# From repository root - start full stack with mock server
docker-compose --profile mock up

# Or start just the mock server
docker-compose --profile mock up mock-server
```

## Features

- **Complete API Coverage**: 23 endpoints covering all 9 Apigee entity types
- **Interactive API Documentation**: Swagger UI at `/api-docs` for testing endpoints
- **Two Environments**: Mock data for `dev` and `staging` with realistic differences
- **Comparison Testing**: Pre-configured differences for testing comparison features
- **Basic Authentication**: Simple `mock/mock` credentials
- **Fast Response Times**: < 100ms for all endpoints with in-memory caching

## API Endpoints

All endpoints require Basic Auth with credentials `mock:mock`

### Organizations & Environments
- `GET /v1/organizations` - List all organizations
- `GET /v1/organizations/{org}` - Get organization details
- `GET /v1/organizations/{org}/environments` - List environments
- `GET /v1/organizations/{org}/environments/{env}` - Get environment details

### Apps & Products
- `GET /v1/organizations/{org}/apps?expand=true` - List all apps
- `GET /v1/organizations/{org}/apps/{appId}` - Get app details
- `GET /v1/organizations/{org}/apiproducts?expand=true` - List API products
- `GET /v1/organizations/{org}/apiproducts/{productName}` - Get product details

### API Proxies
- `GET /v1/organizations/{org}/apis` - List API proxies
- `GET /v1/organizations/{org}/apis/{apiName}` - Get proxy details
- `GET /v1/organizations/{org}/apis/{apiName}/deployments` - Get deployments

### Environment Resources
- `GET /v1/organizations/{org}/environments/{env}/caches` - List caches
- `GET /v1/organizations/{org}/environments/{env}/caches/{cacheName}` - Get cache
- `GET /v1/organizations/{org}/environments/{env}/keyvaluemaps` - List KVMs
- `GET /v1/organizations/{org}/environments/{env}/keyvaluemaps/{kvmName}` - Get KVM
- `GET /v1/organizations/{org}/environments/{env}/targetservers` - List target servers
- `GET /v1/organizations/{org}/environments/{env}/targetservers/{name}` - Get target server
- `GET /v1/organizations/{org}/environments/{env}/references` - List references
- `GET /v1/organizations/{org}/environments/{env}/references/{refName}` - Get reference
- `GET /v1/organizations/{org}/environments/{env}/keystores` - List keystores
- `GET /v1/organizations/{org}/environments/{env}/keystores/{name}` - Get keystore
- `GET /v1/organizations/{org}/environments/{env}/keystores/{name}/aliases/{alias}` - Get certificate
- `GET /v1/organizations/{org}/environments/{env}/virtualhosts` - List virtual hosts
- `GET /v1/organizations/{org}/environments/{env}/virtualhosts/{vhName}` - Get virtual host

## Mock Data

### Organization
- **Name**: `mock-org`
- **Environments**: `dev`, `staging`

### Entity Counts (Current)

| Entity Type | Dev | Staging | Notes |
|-------------|-----|---------|-------|
| Apps | 6 | 5 | 3 matched, 1 different, 2 dev-only, 1 staging-only |
| API Products | 3 | 3 | All matched |
| API Proxies | 3 | 3 | All matched with deployments |
| Caches | 2 | 2 | All matched |
| KVMs | 2 | 2 | All matched |
| Target Servers | 2 | 2 | All matched |
| References | 2 | 2 | All matched |
| Keystores | 2 | 2 | All matched |
| Virtual Hosts | 2 | 2 | All matched |

### Comparison Examples

**Apps Comparison Pattern:**
- `partner-portal-app` - Matched in both environments
- `mobile-banking-app` - Different (callback URL differs)
- `internal-admin-app` - Matched in both environments
- `analytics-dashboard-app` - Matched in both environments
- `test-automation-app` - Dev only
- `legacy-integration-app` - Dev only
- `web-portal-app` - Staging only

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MOCK_SERVER_PORT` | `8080` | Port for the mock server |
| `LOG_LEVEL` | `info` | Logging level (debug, info, error) |
| `NODE_ENV` | `development` | Node environment |

### Dashboard Configuration

Add to `config/apigee-config.yaml`:

```yaml
instances:
  - name: "MOCK"
    management_url: "http://localhost:8080/v1"
    org: "mock-org"
    credentials:
      username: "mock"
      password: "mock"
    environments:
      - "dev"
      - "staging"
```

## Testing

### Option 1: Swagger UI (Recommended)

1. Start the server: `npm run dev`
2. Open browser: `http://localhost:8080/api-docs`
3. Click "Authorize" button
4. Enter credentials: `mock` / `mock`
5. Test any endpoint interactively

### Option 2: cURL

```bash
# Verify server is running
curl -u mock:mock http://localhost:8080/v1/organizations
# Expected: ["mock-org"]

# Test authentication
curl -u mock:mock http://localhost:8080/v1/organizations/mock-org
# Expected: 200 OK with organization details

# Test environment listing
curl -u mock:mock http://localhost:8080/v1/organizations/mock-org/environments
# Expected: ["dev", "staging"]
```

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start

# Validate mock data JSON syntax
npm run validate-data
```

## Mock Data Customization

Mock data is stored in JSON files under `data/`:

```
data/
├── organizations.json       # Organization details
├── dev/                     # Dev environment data
│   ├── apps.json
│   ├── apiProducts.json
│   └── ...
└── staging/                 # Staging environment data
    └── ...
```

To customize:
1. Edit the appropriate JSON file
2. Restart the mock server
3. Changes will be reflected immediately

## Architecture

- **Express.js**: Lightweight HTTP server
- **TypeScript**: Type-safe development
- **In-memory caching**: Fast data loading with `loader.ts`
- **Basic Auth**: Simple authentication middleware
- **Error handling**: Proper 401, 404, 500 responses
- **Request logging**: Morgan for HTTP logging

## Implementation Status

**Completed (Phase 1-3 + Partial Phase 4):**
- ✅ All 23 API endpoints implemented
- ✅ Complete mock data for 9 entity types
- ✅ Authentication and error handling
- ✅ Docker integration
- ✅ Basic comparison testing (apps expanded)

**Pending (Optional Enhancements):**
- ⏳ Full comparison data for all entity types
- ⏳ Issue detection scenarios (expired certs, revoked apps)
- ⏳ Hot-reload capability for data files

## License

MIT
