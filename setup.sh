#!/bin/bash

echo "🚀 TwinMind Pro - Setup Script"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Node.js $(node -v) found"
echo ""

# Backend setup
echo "📦 Setting up backend..."
cd backend

if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update backend/.env with your GROQ_API_KEY"
fi

npm install
echo "✅ Backend dependencies installed"
echo ""

# Frontend setup
echo "📦 Setting up frontend..."
cd ../frontend

npm install
echo "✅ Frontend dependencies installed"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your GROQ_API_KEY"
echo "2. Run: npm run dev:all (from root) or run in separate terminals:"
echo "   - Backend: cd backend && npm run dev"
echo "   - Frontend: cd frontend && npm run dev"
echo ""
