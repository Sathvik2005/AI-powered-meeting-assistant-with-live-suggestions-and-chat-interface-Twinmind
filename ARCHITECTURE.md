# TwinMind Pro - Architecture & Design Decisions

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Frontend)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  Transcript      │  │  Suggestions     │  │  Chat        │  │
│  │  Panel           │  │  Panel           │  │  Panel       │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘  │
│           │                     │                    │          │
│           └─────────────────────┼────────────────────┘          │
│                                 │                                │
│                    ┌────────────▼────────────┐                 │
│                    │   Zustand Store        │                 │
│                    │ (Global State Mgmt)    │                 │
│                    │ + localStorage         │                 │
│                    └────────────┬────────────┘                 │
│                                 │                                │
│  ┌──────────────────────────────▼──────────────────────────┐  │
│  │            React App (App.jsx)                          │  │
│  │                                                          │  │
│  │  • Audio Recording (MediaRecorder API)                 │  │
│  │  • Keyboard Shortcuts (Space, Shift+S/R)             │  │
│  │  • Auto-refresh every 30s                             │  │
│  │  • Error handling & loading states                    │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
└───────────────────┼──────────────────────────────────────────┘
                    │
           ┌────────▼─────────┐
           │  HTTP REST API   │
           │  (JSON Requests) │
           └────────┬─────────┘
                    │
┌───────────────────▼──────────────────────┐
│      Node.js Backend (Express)           │
├───────────────────────────────────────────┤
│                                            │
│  ┌──────────────────────────────────┐    │
│  │    Routes                        │    │
│  │  • POST /transcription/transcribe│    │
│  │  • POST /suggestions/generate    │    │
│  │  • POST /chat/expand             │    │
│  │  • POST /chat/message            │    │
│  └──────────────┬───────────────────┘    │
│                 │                         │
│  ┌──────────────▼───────────────────┐    │
│  │    Groq Service                  │    │
│  │  (API client wrapper)            │    │
│  │  • Whisper Large V3 (audio→text) │    │
│  │  • GPT-4o (suggestions + chat)   │    │
│  └──────────────────────────────────┘    │
│                                            │
└───────────────────┬──────────────────────┘
                    │
           ┌────────▼─────────┐
           │  Groq API        │
           │  (Cloud)         │
           └──────────────────┘
```

## Component Architecture

### Frontend Components

```
App.jsx (Main orchestrator)
├── TranscriptPanel.jsx
│   └── Shows chunks with auto-scroll
├── SuggestionsPanel.jsx  
│   ├── SuggestionCard.jsx (Reusable card)
│   └── Shows batches, new at top
├── ChatPanel.jsx
│   ├── ChatMessage.jsx (User/Assistant messages)
│   └── Input + send button
├── SettingsPanel.jsx (Modal)
│   └── Editable fields + save
└── ExportPanel.jsx (Buttons)
    └── Download JSON or copy
```

### Hooks Architecture

```
useAudio.js
├── useAudioRecorder()
│   ├── Captures mic
│   ├── Chunks every 30s
│   └── Calls callback
├── useTranscription()
│   └── Sends audio blob → Groq
├── useSuggestions()
│   └── Sends transcript → Groq
└── useChat()
    ├── getDetailedAnswer()
    └── sendChatMessage()
```

### State Management (Zustand)

```
appStore.js
├── API Config
│   └── apiKey (localStorage)
├── Recording
│   └── isRecording boolean
├── Transcript
│   ├── transcriptChunks[]
│   └── Append/clear methods
├── Suggestions
│   ├── suggestionBatches[]
│   └── Add/clear methods
├── Chat
│   ├── chatMessages[]
│   └── Add/clear methods
└── Settings
    ├── suggestionPrompt
    ├── chatPrompt
    ├── contextWindow
    └── Persistence methods
```

## Data Flow

### 1. Recording Flow

```
User clicks "Start" 
    ↓
MediaRecorder.start()
    ↓
Every 30 seconds:
  - MediaRecorder.stop()
  - onDataAvailable fires
  - Blob collected → Callback
  - MediaRecorder.start() again
    ↓
handleAudioChunk(blob)
  - POST /api/transcription/transcribe
  - Groq Whisper processes
  - Returns text
  - addTranscriptChunk()
  - Zustand updates store
  - TranscriptPanel auto-scrolls
```

### 2. Suggestions Flow

```
Recording active + Last transcript chunk added
    ↓
Auto-trigger every 30 seconds OR manual refresh
    ↓
handleRefreshSuggestions()
    ↓
Get last 2000 chars of transcript
    ↓
POST /api/suggestions/generate
    ↓
Groq GPT-4o with specialized prompt
    ↓
Returns JSON: [s1, s2, s3]
    ↓
addSuggestionBatch()
    ↓
SuggestionsPanel re-renders
    ↓
New batch appears at top
```

### 3. Chat Flow

### When user clicks suggestion:
```
handleSuggestionSelect(suggestion)
    ↓
Add to chat as "user" message
    ↓
POST /api/chat/expand
  - Full transcript
  - Suggestion text
  - Expansion prompt
    ↓
Groq returns detailed answer
    ↓
Add to chat as "assistant" message
    ↓
ChatPanel auto-scrolls to bottom
```

### When user types question:
```
handleSendMessage(text)
    ↓
Add to chat as "user" message
    ↓
POST /api/chat/message
  - Full transcript
  - User message
  - Chat prompt
    ↓
Groq returns response
    ↓
Add to chat as "assistant" message
```

## Key Design Decisions

### 1. Context Windowing (Suggestions vs Chat)

**Decision**: Different context sizes for different purposes

**Suggestions**:
- Use: Last 2000 characters (~2 min)
- Why: Fast response (2-3 sec), recent context is most relevant
- Tradeoff: Might miss earlier context

**Chat**:
- Use: Full transcript
- Why: User wants comprehensive answer, latency less critical
- Tradeoff: Slightly slower but better quality

### 2. Zustand for State Management

**Decision**: Lightweight state management instead of Redux/Context

**Why Zustand**:
- Minimal boilerplate
- Direct mutation syntax (less confusing than Immer)
- localStorage integration simple
- Bundle size: ~2KB vs Redux ~40KB

**Alternative Considered**: Context API
- Problem: Prop drilling, multiple providers
- Solution: Zustand's simpler API

### 3. Auto-Refresh Every 30 Seconds

**Decision**: Automatic background suggestions + manual refresh button

**Why**:
- Mirrors real-time nature of meeting
- Manual button for edge cases
- 30 sec interval balances freshness vs API cost
- Matches audio chunk duration

**Alternative**: On-demand only
- Problem: Users forget to click
- We chose auto + manual

### 4. No Database (In-Memory Only)

**Decision**: Zustand + localStorage, no persistent backend storage

**Why**:
- Assignment is demo/evaluation phase
- Export JSON gives users their data
- Simpler backend (no DB setup)
- Fast iteration

**For production**: Add Postgres + auth

### 5. JSON Export Instead of Cloud Sync

**Decision**: Download JSON file instead of cloud storage

**Why**:
- Simple to implement
- Users own their data
- Privacy-friendly
- Works offline

**For production**: Add cloud sync option

### 6. Prompt Injection Protection

**Structure Used**:
```
SYSTEM INSTRUCTION: (fixed)
INPUT: (user/transcript - quoted)
OUTPUT FORMAT: (fixed)
```

Never put user input first.

### 7. Single API Key, No User Auth

**Decision**: Users paste their own Groq key

**Why**:
- Assignment allows this
- No login complex authentication
- Keeps backend simple
- Clear privacy model

**For production**: Backend-owned API key + rate limiting

## Performance Optimizations Implemented

### 1. MediaRecorder Chunking
- Stop/restart every 30 sec
- Prevents unbounded memory growth
- Clear chunk boundaries

### 2. Context Window Limiting
- Suggestions: Last 2000 chars only
- Prevents long latency
- Reduces token cost

### 3. Zustand Subscriptions
- Only re-render affected components
- Fine-grained updates
- No unnecessary renders

### 4. Framer Motion Controlled
- Animations use `scale`, not `transform`
- Hardware accelerated
- Smooth 60fps on most devices

### 5. Lazy Loading
- Settings modal: Rendered on demand
- CSS: Tailwind only includes used styles
- No unused dependencies

### 6. Browser API Optimization
- MediaRecorder: Native browser API (fast)
- localStorage: Synchronous, small data only
- No heavy libraries in hot path

## Error Handling Strategy

```
Try-Catch Blocks
├── API calls (transcription, suggestions, chat)
├── Permission errors (microphone)
└── Parsing errors (invalid JSON response)

Error Display
├── Toast-like messages in header
├── In-line error under input
└── System messages in chat

Recovery
├── Auto-retry not implemented (keep simple)
├── User can manually retry
└── Clear errors shown to user
```

## Security Considerations

### What's Secure
- API key stored in localStorage (session-only)
- No hardcoded keys in frontend code
- Backend uses environment variables
- CORS configured properly

### What's Not (Acceptable for Demo)
- No user authentication
- No backend validation of API key
- No rate limiting
- No encryption of localStorage

### For Production
- Add JWT auth
- Validate API key server-side
- Implement rate limiting (Redis)
- Use HTTPS only
- Encrypt sensitive data

## Scalability Notes

### Current Bottlenecks
1. **Groq API rate limits** - Non-issue for demo
2. **Frontend memory** - Transcript stored in memory
3. **Single-user** - No real-time sync

### Scaling Path

**1,000s of concurrent users**:
- Move state to backend
- Add persistent database
- Implement real-time sync (WebSocket)
- Rate limiting required

**Production-Ready**:
- Supabase/Firebase for real-time
- Postgres for persistence
- Redis for rate limiting
- Sentry for error tracking
- DataDog for monitoring

## Testing Strategy

### Manual Testing
1. Record 5-min conversation
2. Verify each suggestion is clicked
3. Check chat responses are relevant
4. Export and verify JSON structure

### Automated Testing (Not Implemented)
- API endpoint tests (Jest)
- Component rendering tests (Vitest)
- Integration tests (Playwright)

## Dependencies Analysis

### Frontend
- **react** (18.2.0): Core UI framework
- **zustand** (4.4.0): State management
- **framer-motion** (10.16.4): Animations (slick UX)
- **lucide-react** (0.263.1): Icons (tiny, tree-shakeable)
- **tailwindcss** (3.3.5): Styling

**Rationale**: Minimal, focused, well-maintained

### Backend
- **express** (4.18.2): HTTP server (industry standard)
- **cors** (2.8.5): Cross-origin requests
- **dotenv** (16.3.1): Environment config
- **groq-sdk** (0.3.3): Official SDK (well-maintained)
- **multer** (1.4.5): Multipart form data

**Rationale**: Essential only, no over-engineering

## Future Enhancement Ideas

1. **Suggestion History** - See previous suggestions in modal
2. **Prompt Versioning** - A/B test different prompts
3. **Meeting Transcripts** - Save/export full transcript
4. **Speaker Detection** - Mark different voices
5. **Real-time Sentiment** - Gauge conversation tone
6. **Action Items** - Auto-extract TODOs
7. **Mobile Support** - Responsive for tablets
8. **Voice Commands** - "Stop recording" via speech
9. **Meeting Templates** - Pre-configured prompts per type
10. **Analytics** - Track which suggestions users click

---

**This architecture is simple, focused, and evaluates what matters most: Prompt quality + Clean code.**
