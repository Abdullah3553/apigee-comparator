@echo off
REM Apigee Monitor Dashboard Setup Wizard for Windows
REM This script helps configure the application for first-time setup

echo ================================================
echo   Apigee Monitor Dashboard - Setup Wizard
echo ================================================
echo.

REM Check prerequisites
echo Checking prerequisites...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found. Please install Node.js 20 LTS or higher.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [OK] Node.js found: %NODE_VERSION%
)

where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Docker not found. You'll need to install PostgreSQL manually.
    set USE_DOCKER=false
) else (
    echo [OK] Docker found
    set USE_DOCKER=true
)

where docker-compose >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Docker Compose not found.
    set USE_DOCKER_COMPOSE=false
) else (
    echo [OK] Docker Compose found
    set USE_DOCKER_COMPOSE=true
)

echo.

REM Step 1: Create .env file
echo Step 1: Creating environment configuration...

if exist .env (
    echo [WARNING] .env file already exists.
    set /p OVERWRITE="Overwrite existing .env? (y/N): "
    if /i "%OVERWRITE%"=="y" (
        copy /y .env.example .env >nul
        echo [OK] Created new .env file from template
    ) else (
        echo Keeping existing .env file.
    )
) else (
    copy /y .env.example .env >nul
    echo [OK] Created .env file from template
)

echo.

REM Step 2: Configure Apigee credentials
echo Step 2: Configuring Apigee credentials...
echo Please provide your Apigee Edge credentials:
echo.

set /p APIGEE_USERNAME="Apigee Username: "
set /p APIGEE_PASSWORD="Apigee Password: "
set /p APIGEE_ORG="Apigee Organization Name: "
set /p INSTANCE_NAME="Instance Name (e.g., PROD): "

REM Convert instance name to uppercase
for %%i in (A B C D E F G H I J K L M N O P Q R S T U V W X Y Z) do (
    call set INSTANCE_NAME=%%INSTANCE_NAME:%%i=%%i%%
)

REM Update .env file using PowerShell
powershell -Command "(Get-Content .env) -replace 'APIGEE_PROD_USERNAME=.*', 'APIGEE_%INSTANCE_NAME%_USERNAME=%APIGEE_USERNAME%' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace 'APIGEE_PROD_PASSWORD=.*', 'APIGEE_%INSTANCE_NAME%_PASSWORD=%APIGEE_PASSWORD%' | Set-Content .env"

echo [OK] Credentials saved to .env
echo.

REM Step 3: Configure Apigee topology
echo Step 3: Configuring Apigee topology...

powershell -Command "(Get-Content config\apigee-config.yaml) -replace 'your-org-name', '%APIGEE_ORG%' | Set-Content config\apigee-config.yaml"
powershell -Command "(Get-Content config\apigee-config.yaml) -replace 'name: \"PROD\"', 'name: \"%INSTANCE_NAME%\"' | Set-Content config\apigee-config.yaml"
powershell -Command "(Get-Content config\apigee-config.yaml) -replace 'APIGEE_PROD_USERNAME', 'APIGEE_%INSTANCE_NAME%_USERNAME' | Set-Content config\apigee-config.yaml"
powershell -Command "(Get-Content config\apigee-config.yaml) -replace 'APIGEE_PROD_PASSWORD', 'APIGEE_%INSTANCE_NAME%_PASSWORD' | Set-Content config\apigee-config.yaml"

echo [OK] Updated config/apigee-config.yaml
echo.

REM Step 4: Test Apigee credentials
echo Step 4: Testing Apigee credentials...

curl -s -o nul -w "%%{http_code}" -u "%APIGEE_USERNAME%:%APIGEE_PASSWORD%" "https://api.enterprise.apigee.com/v1/organizations" > temp_http_code.txt
set /p HTTP_CODE=<temp_http_code.txt
del temp_http_code.txt

if "%HTTP_CODE%"=="200" (
    echo [OK] Apigee credentials verified successfully!
) else if "%HTTP_CODE%"=="401" (
    echo [ERROR] Authentication failed. Please check your credentials.
    pause
    exit /b 1
) else (
    echo [WARNING] Could not verify credentials (HTTP %HTTP_CODE%). Proceeding anyway...
)

echo.

REM Step 5: Start services
echo Step 5: Ready to start services
echo.
echo Configuration complete! You can now start the application.
echo.

if "%USE_DOCKER_COMPOSE%"=="true" (
    set /p START_NOW="Start services with Docker Compose now? (Y/n): "
    if /i not "%START_NOW%"=="n" (
        echo.
        echo Starting services...
        docker-compose up --build -d
        echo.
        echo [OK] Services started successfully!
        echo.
        echo Application URLs:
        echo   Frontend:  http://localhost:3000
        echo   Backend:   http://localhost:3001/api
        echo   API Docs:  http://localhost:3001/api/docs
        echo.
        echo View logs with: docker-compose logs -f
    ) else (
        echo.
        echo To start services manually:
        echo   docker-compose up --build
        echo.
        echo Or see backend\README.md and frontend\README.md for manual setup.
    )
) else (
    echo To start services:
    echo.
    echo 1. Start database:
    echo    docker-compose up db
    echo.
    echo 2. Start backend (new terminal):
    echo    cd backend ^&^& npm install ^&^& npm run migration:run ^&^& npm run start:dev
    echo.
    echo 3. Start frontend (new terminal):
    echo    cd frontend ^&^& npm install ^&^& npm run dev
)

echo.
echo ================================================
echo   Setup Complete!
echo ================================================
echo.
echo Next steps:
echo   1. Access the dashboard at http://localhost:3000
echo   2. Review README.md for detailed documentation
echo   3. See SETUP.md for configuration details
echo.

pause
