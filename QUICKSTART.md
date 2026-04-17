# TwinMind Pro - Quick Start Guide

## 5-Minute Setup

### Step 1: Get Groq API Key
1. Visit https://console.groq.com
2. Sign up free (takes 2 minutes)
3. Get your API key (starts with `gsk_`)

### Step 2: Backend Setup
```bash
cd backend
npm install

# Create .env file with your key
echo GROQ_API_KEY=gsk_your_key_here > .env
echo PORT=3001 >> .env

# Start backend
npm run dev
```

❌ **If backend fails**, check:
- Do you have Node.js 16+? → `node -v`
- Is your GROQ_API_KEY valid?
- Is port 3001 free?

### Step 3: Frontend Setup (new terminal)
```bash
cd frontend
npm install

# Start frontend
npm run dev
```

Browser will open to http://localhost:3000

## Using the App

1. **Settings** → Paste your Groq API key
2. **Start Recording** → Speak for 30+ seconds
3. **Watch live transcript** on the left
4. **See suggestions** in the middle
5. **Click suggestions** → Detailed answer appears on right
6. **Export JSON** when done

## Common Issues

### "Can't access microphone"
→ Browser must have permission. Check browser settings.

### "Transcription failed"
→ Make sure your GROQ_API_KEY is valid and starts with `gsk_`

### "Port 3001 already in use"
→ Kill process: `lsof -ti:3001 | xargs kill` (Mac/Linux)
→ or change PORT in backend/.env

### Frontend won't start
→ Clear node_modules: `rm -rf frontend/node_modules && npm install`

## What's Happening Behind the Scenes

1. **You talk** → Mic records 30-second chunks
2. **Chunk sent** → Backend transcribes via Groq Whisper
3. **Transcript stored** → Appears on left panel
4. **Every 30s** → AI generates 3 suggestions (GPT-OSS 120B)
5. **You click** → Suggestion expands into full answer
6. **Chat works** → Full context used for comprehensive responses

## Files to Know

- `backend/server.js` - Express server
- `backend/services/groqService.js` - AI calls
- `frontend/src/App.jsx` - Main React app
- `frontend/src/components/` - UI panels
- `frontend/src/hooks/useAudio.js` - Recording logic
- `frontend/src/store/appStore.js` - State management

## Next Steps

- ✅ Get it running locally
- ✅ Test with real conversation
- ✅ Tweak prompts in Settings
- ✅ Export a session JSON
- 🚀 Deploy to Vercel

Good luck! 🎙️
