#!/bin/bash

# Apigee Monitor Dashboard Setup Wizard
# This script helps configure the application for first-time setup

set -e

echo "================================================"
echo "  Apigee Monitor Dashboard - Setup Wizard"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Please install Node.js 20 LTS or higher.${NC}"
    exit 1
else
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js found: $NODE_VERSION${NC}"
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠ Docker not found. You'll need to install PostgreSQL manually.${NC}"
    USE_DOCKER=false
else
    echo -e "${GREEN}✓ Docker found: $(docker --version)${NC}"
    USE_DOCKER=true
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}⚠ Docker Compose not found.${NC}"
    USE_DOCKER_COMPOSE=false
else
    echo -e "${GREEN}✓ Docker Compose found: $(docker-compose --version)${NC}"
    USE_DOCKER_COMPOSE=true
fi

echo ""

# Step 1: Create .env file
echo -e "${BLUE}Step 1: Creating environment configuration...${NC}"

if [ -f .env ]; then
    echo -e "${YELLOW}⚠ .env file already exists.${NC}"
    read -p "Overwrite existing .env? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing .env file."
    else
        cp .env.example .env
        echo -e "${GREEN}✓ Created new .env file from template${NC}"
    fi
else
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file from template${NC}"
fi

echo ""

# Step 2: Configure Apigee credentials
echo -e "${BLUE}Step 2: Configuring Apigee credentials...${NC}"
echo "Please provide your Apigee Edge credentials:"
echo ""

read -p "Apigee Username: " APIGEE_USERNAME
read -sp "Apigee Password: " APIGEE_PASSWORD
echo ""
read -p "Apigee Organization Name: " APIGEE_ORG
read -p "Instance Name (e.g., PROD): " INSTANCE_NAME

# Convert instance name to uppercase
INSTANCE_NAME=$(echo "$INSTANCE_NAME" | tr '[:lower:]' '[:upper:]')

# Update .env file
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/APIGEE_PROD_USERNAME=.*/APIGEE_${INSTANCE_NAME}_USERNAME=${APIGEE_USERNAME}/" .env
    sed -i '' "s/APIGEE_PROD_PASSWORD=.*/APIGEE_${INSTANCE_NAME}_PASSWORD=${APIGEE_PASSWORD}/" .env
else
    # Linux
    sed -i "s/APIGEE_PROD_USERNAME=.*/APIGEE_${INSTANCE_NAME}_USERNAME=${APIGEE_USERNAME}/" .env
    sed -i "s/APIGEE_PROD_PASSWORD=.*/APIGEE_${INSTANCE_NAME}_PASSWORD=${APIGEE_PASSWORD}/" .env
fi

echo -e "${GREEN}✓ Credentials saved to .env${NC}"
echo ""

# Step 3: Configure Apigee topology
echo -e "${BLUE}Step 3: Configuring Apigee topology...${NC}"

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/your-org-name/${APIGEE_ORG}/" config/apigee-config.yaml
    sed -i '' "s/name: \"PROD\"/name: \"${INSTANCE_NAME}\"/" config/apigee-config.yaml
    sed -i '' "s/APIGEE_PROD_USERNAME/APIGEE_${INSTANCE_NAME}_USERNAME/" config/apigee-config.yaml
    sed -i '' "s/APIGEE_PROD_PASSWORD/APIGEE_${INSTANCE_NAME}_PASSWORD/" config/apigee-config.yaml
else
    # Linux
    sed -i "s/your-org-name/${APIGEE_ORG}/" config/apigee-config.yaml
    sed -i "s/name: \"PROD\"/name: \"${INSTANCE_NAME}\"/" config/apigee-config.yaml
    sed -i "s/APIGEE_PROD_USERNAME/APIGEE_${INSTANCE_NAME}_USERNAME/" config/apigee-config.yaml
    sed -i "s/APIGEE_PROD_PASSWORD/APIGEE_${INSTANCE_NAME}_PASSWORD/" config/apigee-config.yaml
fi

echo -e "${GREEN}✓ Updated config/apigee-config.yaml${NC}"
echo ""

# Step 4: Test Apigee credentials
echo -e "${BLUE}Step 4: Testing Apigee credentials...${NC}"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -u "${APIGEE_USERNAME}:${APIGEE_PASSWORD}" \
    "https://api.enterprise.apigee.com/v1/organizations")

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Apigee credentials verified successfully!${NC}"
elif [ "$HTTP_CODE" -eq 401 ]; then
    echo -e "${RED}✗ Authentication failed. Please check your credentials.${NC}"
    exit 1
else
    echo -e "${YELLOW}⚠ Could not verify credentials (HTTP $HTTP_CODE). Proceeding anyway...${NC}"
fi

echo ""

# Step 5: Start services
echo -e "${BLUE}Step 5: Ready to start services${NC}"
echo ""
echo "Configuration complete! You can now start the application."
echo ""

if [ "$USE_DOCKER_COMPOSE" = true ]; then
    read -p "Start services with Docker Compose now? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        echo ""
        echo -e "${GREEN}Starting services...${NC}"
        docker-compose up --build -d
        echo ""
        echo -e "${GREEN}✓ Services started successfully!${NC}"
        echo ""
        echo "Application URLs:"
        echo "  Frontend:  http://localhost:3000"
        echo "  Backend:   http://localhost:3001/api"
        echo "  API Docs:  http://localhost:3001/api/docs"
        echo ""
        echo "View logs with: docker-compose logs -f"
    else
        echo ""
        echo "To start services manually:"
        echo "  docker-compose up --build"
        echo ""
        echo "Or see backend/README.md and frontend/README.md for manual setup."
    fi
else
    echo "To start services:"
    echo ""
    echo "1. Start database:"
    echo "   docker-compose up db"
    echo ""
    echo "2. Start backend (new terminal):"
    echo "   cd backend && npm install && npm run migration:run && npm run start:dev"
    echo ""
    echo "3. Start frontend (new terminal):"
    echo "   cd frontend && npm install && npm run dev"
fi

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Access the dashboard at http://localhost:3000"
echo "  2. Review README.md for detailed documentation"
echo "  3. See SETUP.md for configuration details"
echo ""
