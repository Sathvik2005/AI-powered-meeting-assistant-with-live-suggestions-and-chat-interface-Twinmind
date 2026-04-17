@echo off
REM TwinMind Pro - Setup Verification & Next Steps
REM Run this to verify your setup and get instructions

echo 🎙️  TwinMind Pro - Setup Verification
echo =====================================
echo.

REM Check if we're in the right directory
if not exist package.json (
    echo ❌ Please run this from the root directory
    pause
    exit /b 1
)

if not exist backend\ (
    echo ❌ Backend folder not found
    pause
    exit /b 1
)

if not exist frontend\ (
    echo ❌ Frontend folder not found
    pause
    exit /b 1
)

echo ✅ Found project structure
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo ✅ Node.js !NODE_VERSION! found
) else (
    echo ❌ Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)

echo.
echo 📦 Project Contents:
echo   Backend: backend\
echo     - server.js
echo     - services\groqService.js
echo     - routes\ (transcription, suggestions, chat)
echo.
echo   Frontend: frontend\
echo     - src\App.jsx (main component)
echo     - src\components\ (5 components)
echo     - src\hooks\ (audio ^& API hooks)
echo     - src\store\ (Zustand state)
echo.
echo 📚 Documentation:
echo     - README.md (start here)
echo     - QUICKSTART.md (5-minute setup)
echo     - BUILD_GUIDE.md (complete guide)
echo     - ARCHITECTURE.md (design decisions)
echo     - PROMPT_ENGINEERING.md (optimize prompts)
echo     - DEPLOYMENT.md (deploy to Vercel)
echo     - TROUBLESHOOTING.md (fix issues)
echo.
echo =====================================
echo.
echo 🚀 QUICK START (5 MINUTES):
echo.
echo 1. Get Groq API Key
echo    ^→ Visit https://console.groq.com
echo    ^→ Sign up free
echo    ^→ Copy your API key (gsk_...)
echo.
echo 2. Install Backend
echo    ^→ cd backend
echo    ^→ npm install
echo    ^→ copy .env.example .env
echo    ^→ Edit .env and add your GROQ_API_KEY
echo.
echo 3. Install Frontend
echo    ^→ cd ..\frontend
echo    ^→ npm install
echo.
echo 4. Start Development (from root)
echo    ^→ Terminal 1: cd backend ^& npm run dev
echo    ^→ Terminal 2: cd frontend ^& npm run dev
echo    ^→ Browser opens to http://localhost:3000
echo.
echo 5. Use App
echo    ^→ Settings ⚙️ ^→ Paste API key
echo    ^→ Start Recording
echo    ^→ Speak for 30+ seconds
echo    ^→ Watch live suggestions appear!
echo.
echo =====================================
echo.
echo 📖 Read These (in order):
echo    1. QUICKSTART.md (this is enough to get running)
echo    2. README.md (full documentation)
echo    3. ARCHITECTURE.md (understand design)
echo    4. PROMPT_ENGINEERING.md (make it better)
echo.
echo =====================================
echo.
echo ✅ READY TO GO!
echo.
echo Next: Open QUICKSTART.md and follow the steps
echo.
pause
