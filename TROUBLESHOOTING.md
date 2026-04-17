# TwinMind Pro - Troubleshooting Guide

## Quick Fixes

### ❌ "Cannot find module 'express'"
```bash
cd backend
npm install
```

### ❌ "Port 3001 already in use"
**On Mac/Linux:**
```bash
lsof -ti:3001 | xargs kill -9
```

**On Windows:**
```bash
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

Or change PORT in backend/.env to 3002

### ❌ "React not defined"
Make sure `import React from 'react'` is in your component files (already done)

### ❌ "Cannot transcribe: 401"
Your GROQ_API_KEY is invalid or expired.
1. Go to https://console.groq.com
2. Check your API key
3. Copy fresh key
4. Update backend/.env
5. Restart backend

### ❌ Suggestions not appearing
1. **Check API key** - Settings → Paste key
2. **Check recording** - Is mic button red?
3. **Check duration** - Need 30+ sec of speech
4. **Check browser console** - Any errors?
5. **Check network tab** - Is API request getting response?

## Common Issues & Solutions

### Issue: Microphone Permission Denied

**Symptoms:**
- Recording doesn't start
- Browser console: "NotAllowedError"

**Fix:**
1. Go to browser settings → Microphone
2. Allow site to use microphone
3. Reload page
4. Try recording again

### Issue: Transcription Returns Empty

**Symptoms:**
- You spoke but no transcript appears
- Whisper works but no text

**Debug:**
1. Don't have much background noise
2. Speak clearly and loudly
3. Check Groq API status: https://status.groq.com
4. Try again - could be temporary
5. Check audio format (should be WAV/WebM)

### Issue: Suggestions Take Too Long (>5 seconds)

**Causes:**
1. Groq API slow (check status)
2. Context window too large
3. Network latency

**Fix:**
1. Settings → Reduce contextWindow from 2000 to 1500
2. Check internet speed: speedtest.net
3. Try from different browser/device
4. Groq might be rate limiting (free tier is generous but has limits)

### Issue: Suggestion Prompt Not Working

**Symptoms:**
- Suggestions appear but they're generic
- Same suggestions repeated

**Fix:**
1. Settings → Review customPrompt
2. Check template variables: {transcript}
3. Ensure it returns valid JSON
4. Try default prompt first (leave empty)

### Issue: Chat Not Responding

**Symptoms:**
- Click suggestion, nothing happens
- Type message, no response

**Debug:**
```javascript
// Open browser DevTools (F12) → Console
// Check for errors with:
window.fetch('/api/chat/expand', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    transcript: 'test',
    suggestion: 'test'
  })
})
```

### Issue: Export Button Does Nothing

**Symptoms:**
- Click Export → no download
- Copy button doesn't work

**Fix:**
1. Check browser allow downloads
2. Try different browser
3. Check localStorage size (Settings should have been saved)
4. Open DevTools → Application → localStorage → Check app data

### Issue: Frontend Won't Load

**Symptoms:**
- Blank page after npm run dev
- 404 errors

**Debug:**
```bash
# Kill and restart
cd frontend
npm run dev

# Check console for errors:
# 1. Module not found? → npm install
# 2. SyntaxError? → Check component files
# 3. Port 3000 in use? → Check lsof or change port
```

### Issue: Backend Won't Start

**Symptoms:**
- `npm run dev` shows errors
- Server doesn't start

**Debug:**
```bash
cd backend

# Check Node version
node -v  # Should be 16+

# Check PORT
echo $PORT  # Should be 3001

# Try manual start
node server.js

# If permissions error:
chmod +x server.js
```

## Debugging Techniques

### 1. Check Network Requests

Browser DevTools → Network tab:
- **POST /api/transcription/transcribe** → Should return `{transcript: "...""}`
- **POST /api/suggestions/generate** → Should return `{suggestions: [...]}`
- **POST /api/chat/expand** → Should return `{answer: "..."}`

### 2. Check Browser Console

DevTools → Console tab:
- Look for red errors
- Check for API error responses
- Test fetch calls manually

### 3. Check Backend Logs

Terminal running `npm run dev`:
- Look for error messages
- Check req/res logs
- Environment errors

### 4. Check Application State

DevTools → Application tab:
- **localStorage** → Check `groqApiKey`, prompts
- **Sessions** → Check cookies (none needed here)
- **Cache** → Clear if having issues

### 5. Validate API Key

```bash
# Command line test
curl -X POST "https://api.groq.com/test" \
  -H "Authorization: Bearer gsk_YOUR_KEY"
```

## Performance Issues

### Slow Suggestions (>5 sec)

**Causes in order:**
1. Groq API rate limit hit
2. Network latency (check speedtest.net)
3. Context window too large
4. Browser too many suggestions tabs open

**Fixes:**
1. Settings → Reduce context from 2000 to 1200
2. Wait 1 minute (rate limit resets)
3. Close other browser tabs
4. Try different internet connection

### Stuttering Transcript Display

**Causes:**
1. Browser rendering many updates
2. Old browser (use Chrome/Safari/Firefox latest)
3. Low RAM laptop

**Fixes:**
1. Settings → Clear session
2. Close other apps
3. Reload page
4. Try on different device

### High Memory Usage

**Causes:**
- Very long session (1+ hours)
- Many suggestions batches kept in memory

**Fixes:**
1. Export and clear session
2. Export resets memory
3. Reload page occasionally

## Testing Checklist

Before submitting, test:

- [ ] Click Settings → Paste API key → Save works
- [ ] Click "Start Recording" → Button turns red
- [ ] Speak for 30+ seconds
- [ ] See transcript appear on left
- [ ] Wait until suggestions appear (up to 30 sec)
- [ ] See 3 suggestion cards in middle
- [ ] Click a suggestion → Appears in chat on right
- [ ] Chat shows detailed answer
- [ ] Type custom question in chat → Get response
- [ ] Click "Refresh" → Suggestions update
- [ ] Click "Export JSON" → File downloads
- [ ] Open JSON in text editor → Valid structure
- [ ] Restart browser → Settings persist (API key gone, prompts saved)

## Getting Help

### Resources
- **Groq Docs**: https://console.groq.com/docs
- **React Docs**: https://react.dev
- **Tailwind Docs**: https://tailwindcss.com
- **Vite Docs**: https://vitejs.dev

### Sanity Checks

If everything seems broken:
1. Restart backend: `Ctrl+C` then `npm run dev`
2. Restart frontend: `Ctrl+C` then `npm run dev`
3. Hard refresh browser: `Ctrl+Shift+R`
4. Clear cache: DevTools → Application → Storage → Clear All

### Still Stuck?

1. Open browser DevTools (F12)
2. Take screenshot of console errors
3. Open terminal showing logs
4. Check `.env` file is set correctly
5. Try on different browser

## Performance Tuning

### If 2-3 second latency is too slow

**Option 1: Reduce context**
```javascript
// settings.jsx
CONTEXT_WINDOW = 1200 // Instead of 2000
```

**Option 2: Use faster model** (if available)
- Update groqService.js
- Might reduce quality

**Option 3: Cache suggestions**
- Keep last suggestion batch
- Show while new one loads
- (Advanced feature, not implemented)

### If suggestions are too generic

**Option 1: Increase context window**
```javascript
CONTEXT_WINDOW = 3000 // More history
```

**Option 2: Improve prompt**
- Settings → Edit suggestion prompt
- Add meeting type guidance
- Add domain-specific keywords

**Option 3: Wait longer before generating**
- More transcript = better suggestions
- Already optimized to 30 sec

---

**Most issues resolve with:**
1. Correct GROQ_API_KEY in backend/.env
2. npm install in both backend + frontend
3. Clear browser cache + hard refresh
4. Restart both servers

Good luck! 🚀
