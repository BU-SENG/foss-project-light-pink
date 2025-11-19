@echo off
REM Installation Verification Script for Windows
REM This script checks if all dependencies and configurations are properly set up

echo Verifying AI Docstring Generator Installation...
echo.

REM Check Node.js
echo Checking Node.js installation...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Node.js not found
    echo Please install Node.js 18+ from https://nodejs.org
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo [OK] Node.js %NODE_VERSION%
)

REM Check npm
echo Checking npm installation...
npm -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] npm not found
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
    echo [OK] npm %NPM_VERSION%
)

REM Check package.json
echo Checking package.json...
if exist "package.json" (
    echo [OK] Found
) else (
    echo [X] Not found
    exit /b 1
)

REM Check node_modules
echo Checking dependencies...
if exist "node_modules" (
    echo [OK] Installed
) else (
    echo [!] Not installed
    echo Running npm install...
    call npm install
)

REM Check .env file
echo Checking .env file...
if exist ".env" (
    echo [OK] Found
) else (
    echo [!] Not found
    echo Creating .env from .env.example...
    copy .env.example .env
    echo [!] Please edit .env with your Supabase credentials
)

REM Check src directory
echo Checking source files...
if exist "src" (
    echo [OK] Found
) else (
    echo [X] src directory not found
    exit /b 1
)

REM Check Supabase directory
echo Checking Supabase files...
if exist "supabase" (
    echo [OK] Found
) else (
    echo [!] Supabase directory not found
)

echo.
echo Installation Summary:
echo ----------------------------------------
echo [OK] Node.js and npm installed
echo [OK] Project dependencies installed
echo [OK] Source files present
if exist ".env" (
    echo [OK] Environment file configured
) else (
    echo [!] Environment needs configuration
)

echo.
echo Next Steps:
echo 1. Configure your .env file with Supabase credentials
echo 2. Set up Supabase (see SUPABASE_SETUP.md)
echo 3. Run: npm run dev
echo 4. Open: http://localhost:5173
echo.
echo Documentation:
echo - QUICKSTART.md - 5-minute setup guide
echo - README.md - Full documentation
echo - SUPABASE_SETUP.md - Backend setup
echo.
echo Happy coding!

pause
