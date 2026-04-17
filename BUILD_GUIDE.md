# 🎙️ TwinMind Pro - Complete Build Guide

**Status**: ✅ Complete Full-Stack Application Ready

Welcome! This is a production-ready real-time AI meeting copilot. Here's everything you need to know to get started.

## 📋 What You Have

A complete, tested codebase with:
- ✅ **Frontend**: React + Tailwind + Framer Motion (premium UI)
- ✅ **Backend**: Express + Groq SDK (clean API)
- ✅ **State Management**: Zustand (lightweight)
- ✅ **Audio**: MediaRecorder API (live chunking)
- ✅ **Export**: Full session JSON export
- ✅ **Settings Panel**: Customizable prompts
- ✅ **Documentation**: 6 comprehensive guides

## 🚀 Start Here (5 Minutes)

### Step 1: Get Your Free Groq API Key
1. Go https://console.groq.com
2. Sign up (takes 2 minutes)
3. Copy your API key (starts with `gsk_`)

### Step 2: Install Dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Step 3: Configure Backend
```bash
cd backend
cp .env.example .env
# Edit .env and add: GROQ_API_KEY=gsk_your_key_here
```

### Step 4: Start Development
**Terminal 1:**
```bash
cd backend
npm run dev
```

**Terminal 2:**
```bash
cd frontend
npm run dev
```

**Browser** will open to http://localhost:3000

### Step 5: Use the App
1. Go to Settings (top right)
2. Paste your Groq API key
3. Click "Start Recording"
4. Speak for 30+ seconds
5. Watch live suggestions appear!

**That's it! 🎉**

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | **START HERE** - Full overview, how to use |
| [QUICKSTART.md](./QUICKSTART.md) | Quick 5-minute setup guide |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Deep dive into design decisions |
| [PROMPT_ENGINEERING.md](./PROMPT_ENGINEERING.md) | How to optimize suggestions |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | How to deploy to Vercel |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Fix common issues |

## 🎯 Key Features

### 1. Live Transcription
- Records mic audio in 30-second chunks
- Uses Groq's Whisper Large V3
- Appears on left panel with timestamps

### 2. Smart Suggestions
- Generates exactly 3 suggestions every 30 seconds
- Mix of questions, insights, and clarifications
- Click any suggestion for detailed answer

### 3. Interactive Chat
- Click suggestions → Detailed answers appear
- Type custom questions → Get responses
- Full transcript context used for answers

### 4. Session Export
- Click "Export JSON"
- Download full session with transcript, suggestions, chat
- Perfect for review and submission

### 5. Customizable Settings
- Paste your own Groq API key
- Edit suggestion prompts
- Adjust context window for latency vs quality tradeoff

## 🛠️ Project Structure

```
twinmind-pro/
├── backend/                          # Node.js/Express server
│   ├── server.js                    # Main server
│   ├── services/groqService.js      # Groq API integration
│   ├── routes/                      # API endpoints
│   │   ├── transcription.js         # POST /transcribe
│   │   ├── suggestions.js           # POST /suggestions
│   │   └── chat.js                  # POST /chat
│   ├── package.json
│   └── .env.example
│
├── frontend/                         # React app
│   ├── src/
│   │   ├── App.jsx                  # Main app component
│   │   ├── components/              # UI components
│   │   │   ├── TranscriptPanel.jsx
│   │   │   ├── SuggestionsPanel.jsx
│   │   │   ├── ChatPanel.jsx
│   │   │   ├── SettingsPanel.jsx
│   │   │   └── ExportPanel.jsx
│   │   ├── hooks/useAudio.js        # Audio & API hooks
│   │   ├── store/appStore.js        # Zustand state
│   │   └── utils/helpers.js         # Utilities
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── README.md                        # Full documentation
├── QUICKSTART.md                    # 5-minute setup
├── ARCHITECTURE.md                  # Design decisions
├── PROMPT_ENGINEERING.md            # Prompt optimization
├── DEPLOYMENT.md                    # Deploy to Vercel
├── TROUBLESHOOTING.md               # Fix issues
├── BUILD_GUIDE.md                   # This file
├── package.json                     # Root scripts
└── .gitignore
```

## 💡 How It Works

```
You speak
    ↓
30 seconds of audio recorded
    ↓
Groq Whisper transcribes to text
    ↓
Text appears on LEFT panel
    ↓
Every 30 seconds:
  - Last 2000 chars sent to Groq GPT-4o
  - 3 suggestions generated
  - Appear on MIDDLE panel
    ↓
Click any suggestion
    ↓
Full transcript + suggestion sent back to GPT-4o
    ↓
Detailed answer appears on RIGHT panel in chat
    ↓
Type custom question or click another suggestion
    ↓
Export JSON when done
```

## ⚙️ Configuration

Located in Settings panel (⚙️ button, top right):

| Setting | Default | What It Do |
|---------|---------|-----------|
| API Key | (required) | Your Groq API key |
| Context Window | 2000 chars | How much transcript to use for suggestions |
| Suggestion Prompt | (optimized) | Custom prompt for generating suggestions |
| Chat Prompt | (optimized) | Prompt for chat responses |

### To Customize Prompts

1. Click Settings ⚙️
2. Edit "Suggestion Prompt"
3. Click Save
4. Next suggestions will use your prompt

**Prompt Tips:**
- Use `{transcript}` placeholder
- Keep suggestions to 3 exactly
- Use JSON format
- Test incrementally

See [PROMPT_ENGINEERING.md](./PROMPT_ENGINEERING.md) for advanced tips.

## 🔑 API Endpoints

### Backend Routes

**POST /api/transcription/transcribe**
- Input: Audio file (FormData)
- Output: `{ transcript: "...", timestamp: "..." }`

**POST /api/suggestions/generate**
- Input: `{ transcript: "...", customPrompt?: "..." }`
- Output: `{ suggestions: [{type, text}, ...] }`

**POST /api/chat/expand**
- Input: `{ transcript: "...", suggestion: "...", customPrompt?: "..." }`
- Output: `{ answer: "..." }`

**POST /api/chat/message**
- Input: `{ transcript: "...", message: "...", customPrompt?: "..." }`
- Output: `{ response: "..." }`

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Space** | Start/stop recording |
| **Shift + S** | Open Settings |
| **Shift + R** | Manual refresh suggestions |

## 🐛 Debugging

### Check if everything is running
```bash
# Backend should respond:
curl http://localhost:3001/health

# Frontend should be at:
http://localhost:3000
```

### Check your API key
```bash
# In browser console:
localStorage.getItem('groqApiKey')
# Should show your key
```

### See API requests
- Open DevTools (F12)
- Go to Network tab
- Perform action (record, suggest, chat)
- See POST requests to /api/*

### See errors
- Network tab → See failed requests with error details
- Console tab → See JavaScript errors
- Backend terminal → See server errors

## 📦 Deployment

When ready to submit:

### Option 1: Vercel (Easiest)

1. Push to GitHub
2. Connect GitHub repo to Vercel
3. Deploy frontend under `/frontend`
4. Deploy backend under `/backend`
5. Set `GROQ_API_KEY` in environment variables
6. Share deployed URLs

### Option 2: Manual

```bash
cd frontend
npm run build
# Upload dist/ to hosting

cd ../backend
npm install
# Deploy server.js to Node.js hosting
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## ✅ Pre-Submission Checklist

- [ ] App runs locally without errors
- [ ] Mic recording works
- [ ] Transcript appears on left
- [ ] Suggestions appear in middle (after 30 sec)
- [ ] Clicking suggestion shows answer on right
- [ ] Custom chat messages work
- [ ] Export JSON works
- [ ] Settings can be customized
- [ ] API key persists in localStorage
- [ ] Code is clean and well-documented
- [ ] README is comprehensive
- [ ] Deployed to public URL
- [ ] GitHub repo public or shared

## 🎓 Learning Resources

### Understand the Code
1. Start with `frontend/src/App.jsx` - Main orchestrator
2. Look at `frontend/src/components/` - UI structure
3. Check `backend/services/groqService.js` - API calls
4. Review `frontend/src/hooks/useAudio.js` - Audio logic

### Improve Prompts
- Read [PROMPT_ENGINEERING.md](./PROMPT_ENGINEERING.md)
- Test with different meeting types
- Iterate based on results

### Understand Design
- Read [ARCHITECTURE.md](./ARCHITECTURE.md)
- Understand why each choice was made
- Think about tradeoffs

## 🎯 What Evaluators Will Look For

1. **Suggestion Quality** - Are they useful and contextual?
2. **Chat Quality** - Do answers help you sound smarter?
3. **Prompt Quality** - How well are you using the transcript?
4. **Code Quality** - Is it clean, readable, maintainable?
5. **User Experience** - Does it feel responsive and trustworthy?
6. **Latency** - How fast from mic to suggestions rendered?
7. **Overall Polish** - Does it feel professional?

## 🚀 Next Steps

1. ✅ Read [README.md](./README.md) for full details
2. ✅ Do [QUICKSTART.md](./QUICKSTART.md) setup
3. ✅ Test the app locally
4. ✅ Read [PROMPT_ENGINEERING.md](./PROMPT_ENGINEERING.md)
5. ✅ Optimize prompts for your use case
6. ✅ Deploy to Vercel from [DEPLOYMENT.md](./DEPLOYMENT.md)
7. ✅ Submit GitHub link + deployed URL

## 📞 Support

### If stuck on:
- **Setup**: Check [QUICKSTART.md](./QUICKSTART.md)
- **Issues**: Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Prompts**: Check [PROMPT_ENGINEERING.md](./PROMPT_ENGINEERING.md)
- **Deployment**: Check [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Architecture**: Check [ARCHITECTURE.md](./ARCHITECTURE.md)

## 💭 Final Tips

1. **Test with real conversations** - Not synthetic data
2. **Iterate on prompts** - This is where your value is
3. **Keep it simple** - Better to have 3 great suggestions than 10 okay ones
4. **Focus on latency** - Fast feedback matters more than perfection
5. **Monitor which suggestions users click** - That tells you what works
6. **Export and review sessions** - Learn from your outputs

## 🎉 You're Ready!

Everything is set up and tested. Now go build something great!

**Questions? Check the docs above. Everything is documented.**

---

**Happy building! 🎙️**

*Made with ❤️ for TwinMind assignment*
