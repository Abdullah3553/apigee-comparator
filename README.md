# Apigee Monitor Dashboard

A real-time monitoring dashboard that enables Apigee integration engineers to compare entity configurations across multiple Apigee Edge instances, organizations, and environments.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Phase](https://img.shields.io/badge/phase-foundation%20complete-green)

## Overview

The Apigee Monitor Dashboard provides:
- **Side-by-side comparison** of configurations between environments
- **Visual diff indicators** (matched, different, missing)
- **Entity management** for 9 Apigee entity types (Apps, API Products, Proxies, Caches, KVMs, Target Servers, References, Keystores, Virtual Hosts)
- **Issue detection** (expired certificates, revoked credentials, undeployed proxies)
- **Database-first architecture** for fast reads and offline analysis
- **Read-only operations** to ensure safety

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 18)                      │
│  Vite + TanStack Query + Tailwind CSS + TypeScript         │
│                    Port 3000                                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST
┌──────────────────────────▼──────────────────────────────────┐
│                   Backend (NestJS)                          │
│  TypeORM + PostgreSQL + Apigee API Client                  │
│                    Port 3001                                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
      ┌───────▼────────┐      ┌────────▼─────────┐
      │  PostgreSQL 15 │      │ Apigee Management│
      │   Port 5432    │      │       API        │
      └────────────────┘      └──────────────────┘
```

## Features

### Current (Phase 1-2: Foundation Complete ✓)
- ✅ Monorepo structure with backend and frontend
- ✅ PostgreSQL database with TypeORM entities
- ✅ NestJS backend with Apigee API integration
- ✅ React frontend with TanStack Query and Tailwind CSS
- ✅ Docker Compose orchestration
- ✅ Environment-based configuration with YAML
- ✅ TypeScript throughout

### Coming Soon (Phases 3-10)
- 🚧 Environment selection (hierarchical Instance → Org → Env)
- 🚧 Comparison view with visual indicators
- 🚧 Refresh data from Apigee
- 🚧 Entity type filtering
- 🚧 Drill-down into nested configurations
- 🚧 Single environment view mode
- 🚧 Automated issue detection and highlighting

## Quick Start

### Prerequisites

- **Node.js 20 LTS** or higher
- **Docker & Docker Compose** (recommended)
- **Apigee Edge credentials** with read access

### 1. Clone Repository

```bash
git clone <repository-url>
cd apigee-comparator
git checkout 001-apigee-monitor-dashboard
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

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

# Frontend Configuration
FRONTEND_PORT=3000
VITE_API_BASE_URL=http://localhost:3001

# Apigee Instance Credentials
# Pattern: APIGEE_{INSTANCE_NAME}_USERNAME and APIGEE_{INSTANCE_NAME}_PASSWORD
APIGEE_PROD_USERNAME=your-apigee-username
APIGEE_PROD_PASSWORD=your-apigee-password
```

### 3. Configure Apigee Topology

Edit `config/apigee-config.yaml`:

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

**Important**:
- Replace `your-org-name` with your Apigee organization name
- Instance name must match environment variable pattern (e.g., `PROD` → `APIGEE_PROD_USERNAME`)

### 4. Start Services

Using Docker Compose (recommended):

```bash
docker-compose up --build
```

Or manually:

```bash
# Terminal 1: Backend
cd backend
npm install
npm run migration:run
npm run start:dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

### 5. Access Application

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **API Documentation**: http://localhost:3001/api/docs (Swagger)

## Project Structure

```
apigee-comparator/
├── backend/                    # NestJS backend
│   ├── src/
│   │   ├── main.ts            # Entry point
│   │   ├── app.module.ts      # Root module
│   │   ├── database/          # Entities & migrations
│   │   ├── config/            # YAML config loader
│   │   ├── apigee/            # Apigee API client
│   │   └── common/            # Shared utilities
│   ├── Dockerfile
│   ├── package.json
│   └── README.md              # Backend-specific docs
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── main.tsx           # Entry point
│   │   ├── App.tsx            # Root component
│   │   ├── services/          # API client
│   │   ├── types/             # TypeScript types
│   │   ├── hooks/             # Custom hooks
│   │   ├── components/        # React components
│   │   └── contexts/          # Context providers
│   ├── Dockerfile
│   ├── package.json
│   └── README.md              # Frontend-specific docs
│
├── config/                     # Configuration files
│   └── apigee-config.yaml     # Apigee topology
│
├── specs/                      # Feature documentation
│   └── 001-apigee-monitor-dashboard/
│       ├── spec.md            # Feature specification
│       ├── plan.md            # Implementation plan
│       ├── data-model.md      # Database schema
│       ├── tasks.md           # Task breakdown
│       ├── research.md        # Technical decisions
│       ├── quickstart.md      # Quick reference
│       └── contracts/         # API contracts
│
├── docker-compose.yml         # Service orchestration
├── .env.example               # Environment template
└── README.md                  # This file
```

## Environment Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` or `db` (Docker) |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `apigee_monitor` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `APIGEE_*_USERNAME` | Apigee username for instance | `your-username` |
| `APIGEE_*_PASSWORD` | Apigee password for instance | `your-password` |

### Apigee Credentials Pattern

Credentials follow the pattern: `APIGEE_{INSTANCE_NAME}_USERNAME` and `APIGEE_{INSTANCE_NAME}_PASSWORD`

The `{INSTANCE_NAME}` must match the `name` field in `config/apigee-config.yaml`.

**Example**:
```yaml
# config/apigee-config.yaml
instances:
  - name: "PROD"     # Use APIGEE_PROD_USERNAME/PASSWORD
  - name: "DEV"      # Use APIGEE_DEV_USERNAME/PASSWORD
```

```env
# .env
APIGEE_PROD_USERNAME=prod-user
APIGEE_PROD_PASSWORD=prod-pass
APIGEE_DEV_USERNAME=dev-user
APIGEE_DEV_PASSWORD=dev-pass
```

## Development

### Backend Development

See [backend/README.md](backend/README.md) for detailed backend instructions.

```bash
cd backend
npm install
npm run start:dev          # Start with hot-reload
npm run migration:run      # Run database migrations
npm run lint               # Lint code
npm test                   # Run tests
```

### Frontend Development

See [frontend/README.md](frontend/README.md) for detailed frontend instructions.

```bash
cd frontend
npm install
npm run dev                # Start dev server with HMR
npm run build              # Build for production
npm run lint               # Lint code
npm test                   # Run tests
```

### Database Management

```bash
cd backend

# Generate migration from entity changes
npm run migration:generate -- -n MigrationName

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Direct database access
docker-compose exec db psql -U postgres -d apigee_monitor
```

## Docker Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Rebuild after code changes
docker-compose up --build

# Start specific service
docker-compose up backend
docker-compose up frontend
docker-compose up db

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

## API Documentation

Once the backend is running, access interactive API documentation at:

**Swagger UI**: http://localhost:3001/api/docs

### Key Endpoints

**Configuration**:
- `GET /api/config` - Get Apigee topology
- `GET /api/config/environments` - List environments
- `GET /api/config/environments/:identifier` - Get environment details

**Future Endpoints** (Phases 3+):
- `GET /api/entities/:identifier/:entityType` - Get entities
- `GET /api/compare?env1=X&env2=Y&entityType=Z` - Compare environments
- `POST /api/refresh` - Refresh data from Apigee

## Troubleshooting

### Database Connection Issues

**Symptom**: Backend fails to connect to database

**Solution**:
```bash
# Ensure database is running
docker-compose up db

# Or check local PostgreSQL
pg_isready -h localhost -p 5432

# Verify credentials in .env match database
```

### Apigee Authentication Failed

**Symptom**: Backend logs show 401 errors from Apigee API

**Solution**:
1. Verify credentials in `.env` are correct
2. Check instance name matches: `PROD` → `APIGEE_PROD_USERNAME`
3. Test manually: `curl -u username:password https://api.enterprise.apigee.com/v1/organizations`
4. Ensure user has read access to Apigee organization

### Frontend Cannot Reach Backend

**Symptom**: Network errors in browser console

**Solution**:
1. Verify backend is running: `curl http://localhost:3001/api/config`
2. Check `VITE_API_BASE_URL` in `.env` or frontend `.env`
3. Ensure CORS is enabled (already configured in NestJS)
4. Clear browser cache and restart frontend dev server

### Docker Build Issues

**Symptom**: `docker-compose up` fails

**Solution**:
```bash
# Clear Docker cache
docker-compose down -v
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up
```

### Port Conflicts

**Symptom**: Port already in use

**Solution**:
- Change ports in `.env`: `BACKEND_PORT=3002`, `FRONTEND_PORT=3001`
- Or kill existing processes:
  - macOS/Linux: `lsof -ti:3001 | xargs kill`
  - Windows: `netstat -ano | findstr :3001` then `taskkill /PID <pid> /F`

## Testing

### Backend Tests
```bash
cd backend
npm test              # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:cov      # Coverage report
```

### Frontend Tests
```bash
cd frontend
npm test              # Vitest unit tests
npm run test:ui       # Interactive test UI
npm run test:coverage # Coverage report
```

## Implementation Status

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | Setup - Project structure and dependencies |
| Phase 2 | ✅ Complete | Foundational - Core infrastructure (CRITICAL) |
| Phase 3 | 🚧 Pending | User Story 1 - Environment selection |
| Phase 4 | 🚧 Pending | User Story 2 - Comparison view |
| Phase 5 | 🚧 Pending | User Story 3 - Refresh functionality |
| Phase 6 | 🚧 Pending | User Story 4 - Entity type filtering |
| Phase 7 | 🚧 Pending | User Story 5 - Detail drill-down |
| Phase 8 | 🚧 Pending | User Story 6 - Single environment view |
| Phase 9 | 🚧 Pending | User Story 7 - Issue highlighting |
| Phase 10 | 🚧 Pending | Polish - Cross-cutting improvements |

**MVP Milestone**: Phase 3 + Phase 4 (Environment selection + Comparison view)

## Architecture Principles

The project follows these architectural principles (see [Constitution](specs/001-apigee-monitor-dashboard/plan.md)):

1. **Read-Only Operations**: No write operations to Apigee (safety first)
2. **Database-First Architecture**: All reads served from PostgreSQL for speed
3. **Environment Isolation**: INSTANCE-ORG-ENV pattern prevents conflicts
4. **Comparison Accuracy**: Deterministic, deep comparison algorithms
5. **Configuration as Code**: YAML config with env var interpolation

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 18+ |
| Frontend Build | Vite | 5+ |
| State Management | TanStack Query | 5+ |
| Styling | Tailwind CSS | 3+ |
| Backend | NestJS | 10+ |
| Language | TypeScript | 5.4+ |
| Runtime | Node.js | 20 LTS |
| Database | PostgreSQL | 15+ |
| ORM | TypeORM | 0.3+ |
| HTTP Client | Axios | 1.6+ |
| API Docs | Swagger/OpenAPI | 3.0 |
| Container | Docker | Latest |
| Orchestration | Docker Compose | Latest |

## Documentation

- **[Backend README](backend/README.md)** - Backend setup and API details
- **[Frontend README](frontend/README.md)** - Frontend setup and component architecture
- **[Quickstart Guide](specs/001-apigee-monitor-dashboard/quickstart.md)** - 5-minute setup guide
- **[Implementation Plan](specs/001-apigee-monitor-dashboard/plan.md)** - Architecture and technical decisions
- **[Data Model](specs/001-apigee-monitor-dashboard/data-model.md)** - Database schema
- **[API Contracts](specs/001-apigee-monitor-dashboard/contracts/openapi.yaml)** - OpenAPI specification
- **[Tasks](specs/001-apigee-monitor-dashboard/tasks.md)** - Detailed task breakdown

## Contributing

1. Follow the existing code structure and naming conventions
2. Ensure TypeScript strict mode compliance
3. Write tests for new features
4. Update documentation for significant changes
5. Follow commit message format: `feat: description` or `fix: description`

## License

ISC

## Support

For issues, questions, or contributions:
- Review documentation in `specs/001-apigee-monitor-dashboard/`
- Check backend/frontend READMEs for specific issues
- See troubleshooting sections above
