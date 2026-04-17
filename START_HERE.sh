#!/bin/bash

# TwinMind Pro - Setup Verification & Next Steps
# Run this to verify your setup and get instructions

echo "🎙️  TwinMind Pro - Setup Verification"
echo "====================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Please run this from the root directory (where README.md is)"
    exit 1
fi

echo "✅ Found project structure"
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js $NODE_VERSION found"
else
    echo "❌ Node.js not found. Install from https://nodejs.org"
    exit 1
fi

echo ""
echo "📦 Project Contents:"
echo "  Backend: backend/"
echo "    - server.js"
echo "    - services/groqService.js"
echo "    - routes/ (transcription, suggestions, chat)"
echo ""
echo "  Frontend: frontend/"
echo "    - src/App.jsx (main component)"
echo "    - src/components/ (5 components)"
echo "    - src/hooks/ (audio & API hooks)"
echo "    - src/store/ (Zustand state)"
echo ""
echo "📚 Documentation:"
echo "    - README.md (start here)"
echo "    - QUICKSTART.md (5-minute setup)"
echo "    - BUILD_GUIDE.md (complete guide)"
echo "    - ARCHITECTURE.md (design decisions)"
echo "    - PROMPT_ENGINEERING.md (optimize prompts)"
echo "    - DEPLOYMENT.md (deploy to Vercel)"
echo "    - TROUBLESHOOTING.md (fix issues)"
echo ""
echo "====================================="
echo ""
echo "🚀 QUICK START (5 MINUTES):"
echo ""
echo "1. Get Groq API Key"
echo "   → Visit https://console.groq.com"
echo "   → Sign up free"
echo "   → Copy your API key (gsk_...)"
echo ""
echo "2. Install Backend"
echo "   → cd backend"
echo "   → npm install"
echo "   → cp .env.example .env"
echo "   → Edit .env and add your GROQ_API_KEY"
echo ""
echo "3. Install Frontend"
echo "   → cd ../frontend"
echo "   → npm install"
echo ""
echo "4. Start Development (from root)"
echo "   → Terminal 1: npm run dev:backend"
echo "   → Terminal 2: npm run dev:frontend"
echo "   → Browser opens to http://localhost:3000"
echo ""
echo "5. Use App"
echo "   → Settings ⚙️ → Paste API key"
echo "   → Start Recording"
echo "   → Speak for 30+ seconds"
echo "   → Watch live suggestions appear!"
echo ""
echo "====================================="
echo ""
echo "📖 Read These (in order):"
echo "   1. QUICKSTART.md (this is enough to get running)"
echo "   2. README.md (full documentation)"
echo "   3. ARCHITECTURE.md (understand design)"
echo "   4. PROMPT_ENGINEERING.md (make it better)"
echo ""
echo "====================================="
echo ""
echo "✅ READY TO GO!"
echo ""
echo "Next: Open QUICKSTART.md and follow the steps"
echo ""
