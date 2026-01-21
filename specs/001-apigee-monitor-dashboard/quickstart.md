# Quickstart: Apigee Real-Time Monitoring Dashboard

**Branch**: `001-apigee-monitor-dashboard`
**Date**: 2026-01-20

## Prerequisites

- Node.js 20 LTS
- Docker & Docker Compose
- Apigee Edge credentials with read access

## Quick Setup (5 minutes)

### 1. Clone and Install

```bash
git clone <repository-url>
cd apigee-comparator
git checkout 001-apigee-monitor-dashboard
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your Apigee credentials
# APIGEE_PROD_USERNAME=your-username
# APIGEE_PROD_PASSWORD=your-password
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
      - "staging"
      - "production"
```

### 4. Start Services

```bash
docker-compose up --build
```

### 5. Access Dashboard

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **API Docs**: http://localhost:3001/api/docs

---

## Development Setup

### Backend Only

```bash
cd backend
npm install
npm run start:dev
```

### Frontend Only

```bash
cd frontend
npm install
npm run dev
```

### Database Only

```bash
docker-compose up db
```

---

## First Steps

1. **Refresh Data**: Click "Refresh All" to fetch data from Apigee
2. **Select Environments**: Use the dropdowns to select two environments
3. **Choose Entity Type**: Select what to compare (Proxies, KVMs, etc.)
4. **View Comparison**: See matched, different, and missing entities
5. **Drill Down**: Click any entity to see detailed differences

---

## API Quick Reference

### Get Environments
```bash
curl http://localhost:3001/api/environments
```

### Compare Environments
```bash
curl "http://localhost:3001/api/compare?env1=PROD-org-staging&env2=PROD-org-production&entityType=proxies"
```

### Refresh All
```bash
curl -X POST http://localhost:3001/api/refresh
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection failed | Ensure `docker-compose up db` is running |
| Apigee auth failed | Check credentials in `.env` |
| Refresh timeout | Verify network access to Apigee Management API |
| Empty entity list | Run refresh first to populate database |

---

## Project Structure

```
apigee-comparator/
├── backend/           # NestJS API
├── frontend/          # React dashboard
├── config/            # Apigee configuration
├── docker-compose.yml # Service orchestration
└── specs/             # Feature documentation
```

---

## Next Steps

- Read [spec.md](./spec.md) for feature requirements
- Read [data-model.md](./data-model.md) for database schema
- Read [contracts/openapi.yaml](./contracts/openapi.yaml) for API details
- Run `/speckit.tasks` to generate implementation tasks
