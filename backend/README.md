# Apigee Monitor Dashboard - Backend

Backend API for the Apigee Real-Time Monitoring Dashboard built with NestJS, TypeORM, and PostgreSQL.

## Prerequisites

- Node.js 20 LTS or higher
- PostgreSQL 15+ (or use Docker Compose)
- npm or yarn

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp ../.env.example ../.env
```

Edit `../.env` (in the root directory) with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=apigee_monitor
DB_USER=postgres
DB_PASSWORD=postgres

# Backend Configuration
NODE_ENV=development
BACKEND_PORT=3001

# Apigee Credentials
APIGEE_PROD_USERNAME=your-apigee-username
APIGEE_PROD_PASSWORD=your-apigee-password
```

### 3. Configure Apigee Instances

Edit `../config/apigee-config.yaml`:

```yaml
instances:
  - name: "PROD"
    management_url: "https://api.enterprise.apigee.com/v1"
    org: "your-org-name"
    credentials:
      username: "${APIGEE_PROD_USERNAME}"
      password: "${APIGEE_PROD_PASSWORD}"
    environments:
      - "test"
      - "staging"
      - "production"
```

**Important**: Replace `your-org-name` with your actual Apigee organization name.

### 4. Set Up Database

#### Option A: Using Docker (Recommended)

From the project root:

```bash
docker-compose up db
```

#### Option B: Local PostgreSQL

Create the database manually:

```bash
psql -U postgres
CREATE DATABASE apigee_monitor;
\q
```

### 5. Run Migrations

```bash
npm run migration:run
```

### 6. Start Development Server

```bash
npm run start:dev
```

The API will be available at:
- **API Base**: http://localhost:3001/api
- **Swagger Docs**: http://localhost:3001/api/docs

## Available Scripts

### Development
```bash
npm run start:dev    # Start with hot-reload
npm run start:debug  # Start in debug mode
```

### Build
```bash
npm run build        # Build for production
npm run start:prod   # Run production build
```

### Testing
```bash
npm test            # Run unit tests
npm run test:watch  # Run tests in watch mode
npm run test:cov    # Run tests with coverage
npm run test:e2e    # Run end-to-end tests
```

### Code Quality
```bash
npm run lint        # Lint and fix code
npm run format      # Format code with Prettier
```

### Database
```bash
npm run typeorm                    # TypeORM CLI
npm run migration:generate -- -n MigrationName  # Generate migration
npm run migration:run              # Run pending migrations
npm run migration:revert           # Revert last migration
```

## Project Structure

```
backend/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   ├── database/                  # Database configuration
│   │   ├── database.module.ts
│   │   ├── data-source.ts
│   │   ├── entities/              # TypeORM entities
│   │   │   ├── instance.entity.ts
│   │   │   ├── environment.entity.ts
│   │   │   ├── app.entity.ts
│   │   │   ├── api-product.entity.ts
│   │   │   ├── api-proxy.entity.ts
│   │   │   ├── cache.entity.ts
│   │   │   ├── kvm.entity.ts
│   │   │   ├── target-server.entity.ts
│   │   │   ├── reference.entity.ts
│   │   │   ├── keystore.entity.ts
│   │   │   └── virtual-host.entity.ts
│   │   └── migrations/            # Database migrations
│   ├── config/                    # Configuration module
│   │   ├── config.module.ts
│   │   ├── config.service.ts      # YAML config loader
│   │   └── config.controller.ts   # Config endpoints
│   ├── apigee/                    # Apigee API client
│   │   ├── apigee.module.ts
│   │   └── apigee.service.ts      # Management API calls
│   └── common/                    # Shared utilities
│       └── filters/
│           └── http-exception.filter.ts
├── test/                          # Test files
├── Dockerfile
├── package.json
└── tsconfig.json
```

## API Endpoints

### Configuration
- `GET /api/config` - Get Apigee topology
- `GET /api/config/environments` - List all environments
- `GET /api/config/environments/:identifier` - Get environment details

### Entities (Coming in Phase 3+)
- `GET /api/entities/:identifier/:entityType` - Get entities by type
- `GET /api/entities/:identifier/kvms/:name/entries` - Get KVM entries
- `GET /api/entities/:identifier/keystores/:name/certificates` - Get certificates

### Comparison (Coming in Phase 4)
- `GET /api/compare?env1=X&env2=Y&entityType=Z` - Compare environments

### Refresh (Coming in Phase 5)
- `POST /api/refresh` - Refresh all environments
- `POST /api/refresh/:identifier` - Refresh single environment

## Environment Variables Reference

### Required
| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `apigee_monitor` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |

### Apigee Credentials
Pattern: `APIGEE_{INSTANCE_NAME}_USERNAME` and `APIGEE_{INSTANCE_NAME}_PASSWORD`

Must match instance names in `config/apigee-config.yaml`:

```env
# For instance named "PROD" in YAML
APIGEE_PROD_USERNAME=your-username
APIGEE_PROD_PASSWORD=your-password

# For instance named "DEV" in YAML
APIGEE_DEV_USERNAME=your-dev-username
APIGEE_DEV_PASSWORD=your-dev-password
```

### Optional
| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `BACKEND_PORT` | Server port | `3001` |
| `CONFIG_PATH` | Path to YAML config | `config/apigee-config.yaml` |

## Docker Deployment

### Build Image
```bash
docker build -t apigee-monitor-backend .
```

### Run Container
```bash
docker run -p 3001:3001 \
  --env-file ../.env \
  -v $(pwd)/../config:/app/config \
  apigee-monitor-backend
```

### Docker Compose (Recommended)
From project root:

```bash
docker-compose up backend
```

## Troubleshooting

### Database Connection Failed
- Ensure PostgreSQL is running: `docker-compose up db` or check local PostgreSQL service
- Verify credentials in `.env` match your database
- Check `DB_HOST` is correct (`localhost` for local, `db` for Docker Compose)

### Apigee Authentication Failed
- Verify credentials in `.env` are correct
- Check that environment variable names match the pattern: `APIGEE_{INSTANCE}_USERNAME`
- Ensure instance name in YAML config matches the env var (e.g., `PROD` → `APIGEE_PROD_USERNAME`)
- Test credentials manually: `curl -u username:password https://api.enterprise.apigee.com/v1/organizations`

### Migration Errors
- Ensure database exists before running migrations
- Check database connection settings in `.env`
- Drop and recreate database if needed: `npm run migration:revert` (or DROP DATABASE)

### Config Loading Failed
- Verify `config/apigee-config.yaml` exists and is valid YAML
- Check that all `${VAR_NAME}` placeholders have corresponding environment variables
- Review logs for specific parsing errors

### Port Already in Use
- Change `BACKEND_PORT` in `.env` to a different port
- Or kill the process using port 3001: `lsof -ti:3001 | xargs kill` (macOS/Linux)

## Development Tips

### Watch Mode
The development server uses hot-reload. Changes to TypeScript files trigger automatic recompilation.

### Debugging
Use VS Code launch configuration or:
```bash
npm run start:debug
```

Then attach debugger to `localhost:9229`.

### Database Inspection
```bash
# Connect to database
psql -h localhost -U postgres -d apigee_monitor

# List tables
\dt

# Query environments
SELECT identifier, refresh_status, last_refreshed_at FROM environments;
```

### Testing API Endpoints
Use the Swagger UI at http://localhost:3001/api/docs or:

```bash
# Get configuration
curl http://localhost:3001/api/config

# Get environments
curl http://localhost:3001/api/config/environments

# Get environment details
curl http://localhost:3001/api/config/environments/PROD-your-org-production
```

## Next Steps

1. Verify backend starts successfully
2. Check Swagger docs at http://localhost:3001/api/docs
3. Test configuration endpoint: `curl http://localhost:3001/api/config`
4. Proceed to frontend setup (see `../frontend/README.md`)
5. Run full stack: `docker-compose up` from project root

## Support

For issues or questions:
- Check the main project [README.md](../README.md)
- Review [quickstart.md](../specs/001-apigee-monitor-dashboard/quickstart.md)
- See [plan.md](../specs/001-apigee-monitor-dashboard/plan.md) for architecture details
