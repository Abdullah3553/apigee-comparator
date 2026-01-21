# Quick Setup Guide

This guide helps you get the Apigee Monitor Dashboard running in 5 minutes.

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 20 LTS installed (`node --version`)
- ✅ Docker and Docker Compose installed (`docker --version`, `docker-compose --version`)
- ✅ Apigee Edge credentials with read access
- ✅ Your Apigee organization name

## Step-by-Step Setup

### 1. Environment Configuration (2 minutes)

Copy and edit the environment file:

```bash
cp .env.example .env
```

**Edit `.env` with your values:**

```env
# ============================================
# DATABASE (use defaults for Docker)
# ============================================
DB_HOST=localhost          # Use 'db' if running backend in Docker
DB_PORT=5432
DB_NAME=apigee_monitor
DB_USER=postgres
DB_PASSWORD=postgres

# ============================================
# APPLICATION PORTS
# ============================================
BACKEND_PORT=3001
FRONTEND_PORT=3000
VITE_API_BASE_URL=http://localhost:3001

# ============================================
# APIGEE CREDENTIALS (REQUIRED)
# ============================================
# Pattern: APIGEE_{INSTANCE_NAME}_USERNAME/PASSWORD
# The {INSTANCE_NAME} must match the 'name' in config/apigee-config.yaml

APIGEE_PROD_USERNAME=your-username-here
APIGEE_PROD_PASSWORD=your-password-here

# Add more instances as needed:
# APIGEE_DEV_USERNAME=dev-username
# APIGEE_DEV_PASSWORD=dev-password
```

### 2. Apigee Topology Configuration (1 minute)

**Edit `config/apigee-config.yaml`:**

```yaml
instances:
  - name: "PROD"
    management_url: "https://api.enterprise.apigee.com/v1"
    org: "your-org-name-here"          # ← CHANGE THIS
    credentials:
      username: "${APIGEE_PROD_USERNAME}"
      password: "${APIGEE_PROD_PASSWORD}"
    environments:
      - "test"                          # ← ADD YOUR ENVIRONMENTS
      - "staging"
      - "production"

  # Add more instances if needed:
  # - name: "DEV"
  #   management_url: "https://api.enterprise.apigee.com/v1"
  #   org: "your-dev-org-name"
  #   credentials:
  #     username: "${APIGEE_DEV_USERNAME}"
  #     password: "${APIGEE_DEV_PASSWORD}"
  #   environments:
  #     - "dev"
  #     - "qa"
```

**Important**: Replace `your-org-name-here` with your actual Apigee organization name!

### 3. Credentials Pattern Verification

Verify your credentials match the pattern:

| YAML Instance Name | Required Env Vars |
|-------------------|-------------------|
| `PROD` | `APIGEE_PROD_USERNAME`, `APIGEE_PROD_PASSWORD` |
| `DEV` | `APIGEE_DEV_USERNAME`, `APIGEE_DEV_PASSWORD` |
| `STAGING` | `APIGEE_STAGING_USERNAME`, `APIGEE_STAGING_PASSWORD` |

**Pattern Rule**: `name: "PROD"` → `APIGEE_PROD_*`

### 4. Start Application (2 minutes)

**Option A: Docker Compose (Recommended)**

```bash
docker-compose up --build
```

Wait for all services to start. You should see:
- ✅ Database ready: `database system is ready to accept connections`
- ✅ Backend ready: `Application is running on: http://localhost:3001`
- ✅ Frontend ready: `Local: http://localhost:3000/`

**Option B: Manual Start**

```bash
# Terminal 1: Database
docker-compose up db

# Terminal 2: Backend
cd backend
npm install
npm run migration:run
npm run start:dev

# Terminal 3: Frontend
cd frontend
npm install
npm run dev
```

### 5. Verify Installation

Open these URLs in your browser:

1. **Frontend Dashboard**: http://localhost:3000
   - Should show: "Welcome to Apigee Monitor Dashboard"

2. **Backend API Health**: http://localhost:3001/api/config
   - Should return: JSON with your Apigee instances

3. **API Documentation**: http://localhost:3001/api/docs
   - Should show: Swagger UI with API endpoints

## Quick Troubleshooting

### ❌ "Database connection failed"
**Fix**: Ensure database is running
```bash
docker-compose up db
```

### ❌ "Apigee authentication failed" (401 errors)
**Fix**: Check credentials in `.env`
```bash
# Test manually
curl -u "$APIGEE_PROD_USERNAME:$APIGEE_PROD_PASSWORD" \
  https://api.enterprise.apigee.com/v1/organizations
```

### ❌ "Port already in use"
**Fix**: Change ports in `.env`
```env
BACKEND_PORT=3002
FRONTEND_PORT=3001
```

### ❌ "Cannot load config: ENOENT"
**Fix**: Ensure `config/apigee-config.yaml` exists and is valid YAML

### ❌ Frontend shows network errors
**Fix**: Verify backend is running
```bash
curl http://localhost:3001/api/config
```

## Environment Variable Reference

### Complete .env Template

```env
# ===========================================
# DATABASE CONFIGURATION
# ===========================================
DB_HOST=localhost              # Use 'db' for Docker Compose
DB_PORT=5432
DB_NAME=apigee_monitor
DB_USER=postgres
DB_PASSWORD=postgres

# ===========================================
# BACKEND CONFIGURATION
# ===========================================
NODE_ENV=development
BACKEND_PORT=3001
CONFIG_PATH=config/apigee-config.yaml

# ===========================================
# FRONTEND CONFIGURATION
# ===========================================
FRONTEND_PORT=3000
VITE_API_BASE_URL=http://localhost:3001

# ===========================================
# APIGEE CREDENTIALS
# ===========================================
# PRODUCTION INSTANCE
APIGEE_PROD_USERNAME=your-username
APIGEE_PROD_PASSWORD=your-password

# DEVELOPMENT INSTANCE (optional)
# APIGEE_DEV_USERNAME=dev-username
# APIGEE_DEV_PASSWORD=dev-password

# STAGING INSTANCE (optional)
# APIGEE_STAGING_USERNAME=staging-username
# APIGEE_STAGING_PASSWORD=staging-password
```

### Adding New Apigee Instances

To add a new instance:

1. **Add to `config/apigee-config.yaml`:**
```yaml
- name: "NEWINSTANCE"
  management_url: "https://api.enterprise.apigee.com/v1"
  org: "new-org-name"
  credentials:
    username: "${APIGEE_NEWINSTANCE_USERNAME}"
    password: "${APIGEE_NEWINSTANCE_PASSWORD}"
  environments:
    - "env1"
    - "env2"
```

2. **Add credentials to `.env`:**
```env
APIGEE_NEWINSTANCE_USERNAME=username
APIGEE_NEWINSTANCE_PASSWORD=password
```

3. **Restart backend:**
```bash
docker-compose restart backend
# OR
cd backend && npm run start:dev
```

## Configuration Examples

### Example 1: Single Production Instance

**`.env`:**
```env
APIGEE_PROD_USERNAME=john.doe@company.com
APIGEE_PROD_PASSWORD=secure-password-123
```

**`config/apigee-config.yaml`:**
```yaml
instances:
  - name: "PROD"
    management_url: "https://api.enterprise.apigee.com/v1"
    org: "company-prod"
    credentials:
      username: "${APIGEE_PROD_USERNAME}"
      password: "${APIGEE_PROD_PASSWORD}"
    environments:
      - "test"
      - "staging"
      - "production"
```

### Example 2: Multiple Instances (Prod + Dev)

**`.env`:**
```env
APIGEE_PROD_USERNAME=prod-user@company.com
APIGEE_PROD_PASSWORD=prod-password

APIGEE_DEV_USERNAME=dev-user@company.com
APIGEE_DEV_PASSWORD=dev-password
```

**`config/apigee-config.yaml`:**
```yaml
instances:
  - name: "PROD"
    management_url: "https://api.enterprise.apigee.com/v1"
    org: "company-prod"
    credentials:
      username: "${APIGEE_PROD_USERNAME}"
      password: "${APIGEE_PROD_PASSWORD}"
    environments:
      - "staging"
      - "production"

  - name: "DEV"
    management_url: "https://api.enterprise.apigee.com/v1"
    org: "company-dev"
    credentials:
      username: "${APIGEE_DEV_USERNAME}"
      password: "${APIGEE_DEV_PASSWORD}"
    environments:
      - "dev"
      - "qa"
```

## Testing Your Configuration

### 1. Test Backend Connection
```bash
# Should return your Apigee configuration
curl http://localhost:3001/api/config

# Expected output:
# {
#   "instances": [
#     {
#       "name": "PROD",
#       "org": "your-org-name",
#       "environments": ["test", "staging", "production"]
#     }
#   ]
# }
```

### 2. Test Environment List
```bash
# Should return environment identifiers
curl http://localhost:3001/api/config/environments

# Expected output:
# {
#   "environments": [
#     "PROD-your-org-test",
#     "PROD-your-org-staging",
#     "PROD-your-org-production"
#   ]
# }
```

### 3. Test Apigee Credentials Manually
```bash
# Replace with your credentials
curl -u "username:password" \
  https://api.enterprise.apigee.com/v1/organizations

# Should return: List of organizations you have access to
```

### 4. Check Database Connection
```bash
# Connect to database
docker-compose exec db psql -U postgres -d apigee_monitor

# Inside psql:
\dt                    # List all tables
\d environments       # Describe environments table
SELECT * FROM environments;  # View seeded environments
\q                    # Quit
```

## Next Steps

1. ✅ Configuration complete
2. ✅ All services running
3. ✅ Endpoints verified

**You're ready!** The foundation is complete (Phases 1-2).

**Coming Next** (Phases 3+):
- Environment selection UI
- Comparison view
- Refresh functionality
- Entity filtering

See [README.md](README.md) for full documentation or [backend/README.md](backend/README.md) and [frontend/README.md](frontend/README.md) for specific details.

## Getting Help

**Backend Issues**: See [backend/README.md](backend/README.md)
**Frontend Issues**: See [frontend/README.md](frontend/README.md)
**Architecture**: See [specs/001-apigee-monitor-dashboard/plan.md](specs/001-apigee-monitor-dashboard/plan.md)
