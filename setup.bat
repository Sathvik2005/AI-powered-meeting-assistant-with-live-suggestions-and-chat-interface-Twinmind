@echo off
echo 🚀 TwinMind Pro - Setup Script
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% found
echo.

REM Backend setup
echo 📦 Setting up backend...
cd backend

if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo ⚠️  Please update backend\.env with your GROQ_API_KEY
)

call npm install
echo ✅ Backend dependencies installed
echo.

REM Frontend setup
echo 📦 Setting up frontend...
cd ..\frontend

call npm install
echo ✅ Frontend dependencies installed
echo.

echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Update backend\.env with your GROQ_API_KEY
echo 2. For development, run in two separate terminal windows:
echo    - Backend: cd backend ^& npm run dev
echo    - Frontend: cd frontend ^& npm run dev
echo.
pause
