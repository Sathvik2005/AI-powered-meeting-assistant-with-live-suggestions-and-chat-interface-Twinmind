# Prompt Engineering Strategy - TwinMind Meeting Copilot

## Executive Summary

TwinMind uses a **context-aware, multi-modal prompt strategy** with 3 specialized AI functions optimized for real-time meeting assistance. Each function targets a specific user need with tailored prompts, context windows, and output formats.

**Core Principle**: *Use the right amount of context for the job.*
- **Quick suggestions**: Limited context (2000 chars) = Speed (2-3 sec)
- **Detailed answers**: Full context = Quality (~4 sec)
- **Chat responses**: Full context = Understanding (~3 sec)

---

## 📊 AI Models Used

### Whisper Large V3 (Transcription)
- **Model**: `whisper-large-v3`
- **Purpose**: Convert audio chunks to accurate text
- **Why**: Most accurate speech recognition available
- **Input**: 30-second audio WAV files
- **Output**: Text transcript JSON format
- **Latency**: ~5-10 seconds per 30-second chunk
- **Language**: English (hardcoded for now, configurable)

### GPT-4o (Suggestions, Answers, Chat)
- **Model**: `gpt-4o`
- **Purpose**: Generate meeting-relevant suggestions and responses
- **Why**: Best balance of speed, quality, and cost
- **Available on Groq**: Yes (via Groq API)
- **Temperature**: Varies by function (0.7-0.8)
- **Max tokens**: Optimized per function (see below)

---

## 🎯 Function-Specific Prompt Strategies

### 1. **Transcription** - `transcribeAudio()`

**Context**:
- Input: 30-second WAV audio chunk
- Output: Plain text string of what was spoken

**Prompt Strategy**: 
```
- Use Whisper Large V3 model directly
- No custom prompt (API handles this)
- Language set to English explicitly
- Response format: JSON (structured output)
```

**Optimization**:
- `temperature`: N/A (transcription is deterministic)
- `max_tokens`: N/A (natural limit from audio length)
- **Latency expectation**: 5-10 seconds
- **Error handling**: Empty transcription alerts, buffer validation

**Key Decisions**:
✓ Whisper v3 is the gold standard for meeting audio
✓ 30-second chunks prevent memory leaks and allow real-time updates
✓ JSON response format ensures machine-readable output

---

### 2. **Live Suggestions** - `generateSuggestions()`

**Context Window**:
- Input: Recent transcript chunk (~2000 characters = ~2 minutes of speech)
- Why limited: Speed is critical (need response in 2-3 seconds)
- Trade-off: Sacrifice some context for responsiveness

**Output Format**: JSON array with exactly 3 distinct suggestion types
```json
[
  {"type": "question", "text": "..."},
  {"type": "insight", "text": "..."},
  {"type": "clarification", "text": "..."}
]
```

**Prompt Strategy** (See `groqService.js` for full prompt):
```
1. CONTEXT ANALYSIS PHASE:
   - Detect what's happening (question? confusion? decision?)
   - Understand the conversation direction
   
2. GENERATION PHASE:
   - Generate 3 DIFFERENT types of suggestions
   - "question" → Smart follow-up that reveals missing info
   - "insight" → Talking point or key fact
   - "clarification" → Info to prevent miscommunication
   
3. FILTERING PHASE:
   - Each suggestion must be UNDER 20 WORDS
   - Each must be SPECIFIC (not generic)
   - Each must be IMMEDIATELY ACTIONABLE
   - No overlap between suggestions
```

**Optimization**:
- `temperature`: 0.7 (balance creativity with consistency)
- `max_tokens`: 300 (limited response space)
- **Latency expectation**: 2-3 seconds
- **Validation**: Strict JSON parsing with 3-suggestion requirement

**Key Decisions**:
✓ Limited context = fast suggestions (users need them now)
✓ Forced diversity = no duplicates or similar suggestions
✓ 20-word limit = easily readable and usable
✓ 3 types = covers question/insight/clarification needs
✓ JSON validation = reliable parsing, no surprises

---

### 3. **Detailed Answers** - `generateDetailedAnswer()`

**Context Window**:
- Input: FULL transcript (complete meeting so far)
- Why unlimited: Need complete context for quality answers
- Trade-off: Slightly longer latency is acceptable for quality

**Output Format**: Plain text, ready-to-speak (2-4 sentences)

**Prompt Strategy**:
```
1. CONTEXT PHASE:
   - Read the full meeting transcript
   - Understand the conversation flow and context
   
2. EXPANSION PHASE:
   - Take the suggestion user clicked on
   - Expand it with concrete, useful information
   
3. DELIVERY PHASE:
   - Format for speaking aloud (no markdown)
   - Include specific examples when relevant
   - Professional but conversational tone
   - 2-4 sentences = ~15 seconds to speak
```

**Why This Matters**:
- User clicked on a suggestion → Wants MORE detail
- Need full context to provide meaningful expansion
- Answer must be speakable (they'll say it in the meeting)
- Concrete examples > generic advice

**Optimization**:
- `temperature`: 0.8 (more natural, conversational tone)
- `max_tokens`: 250 (2-4 sentences)
- **Latency expectation**: 2-4 seconds
- **Validation**: Empty response check, quote cleanup

**Key Decisions**:
✓ Full context allows richer, more relevant answers
✓ "Ready-to-speak" format makes it immediately usable
✓ Slightly higher temperature = more natural tone
✓ Concrete examples = better than generic advice

---

### 4. **Chat Messages** - `chatMessage()`

**Context Window**:
- Input: FULL transcript (complete meeting)
- Why unlimited: Need full context for natural conversation
- Purpose: Answer questions, suggest next steps, clarify concepts

**Output Format**: Plain text, conversational (1-2 sentences typically)

**Prompt Strategy**:
```
1. MODE DETECTION:
   - User asking a question? → ANSWER mode
   - Need suggestions? → SUGGEST mode
   - Confused about something? → CLARIFY mode
   
2. TONE GUIDELINES:
   - Conversational (like talking to a colleague)
   - Confident (they're using advice in real-time)
   - Concise (1-2 sentences unless asked for more)
   - Actionable (usable immediately)
   - Professional (business-appropriate)
   
3. RESPONSE PHASE:
   - Answer naturally and directly
   - Reference specific points from meeting
   - Include examples if they add value
   - No meta-commentary or labels
```

**Why Full Context**:
- User might ask about something mentioned 10 minutes ago
- Need to remember the entire conversation flow
- Can reference specific people, decisions, or data points
- More natural conversation feels like a real colleague

**Optimization**:
- `temperature`: 0.8 (natural conversation tone)
- `max_tokens`: 300 (1-2 sentences usually)
- **Latency expectation**: 2-4 seconds
- **Validation**: Empty response check, quote cleanup

**Key Decisions**:
✓ Full context = understanding, not just pattern matching
✓ Mode-based approach = flexible response types
✓ Higher temperature = more human-like conversation
✓ Direct tone = sounds like a real colleague

---

## 📈 Context Window Strategy

### Why Two Different Context Windows?

| Function | Context | Reason | Trade-off |
|----------|---------|--------|-----------|
| **Suggestions** | 2000 chars (recent) | Speed | Less context = sometimes generic suggestions |
| **Answers** | Full transcript | Quality | Slightly longer latency (worth it) |
| **Chat** | Full transcript | Understanding | Slightly longer latency (worth it) |

**2000 Character Limit Reasoning**:
- ~2 minutes of typical meeting speech
- Enough to understand immediate context
- Under 5 seconds response time (critical for "live")
- Stays within token limits for speed

**Full Transcript Reasoning**:
- User explicitly wants detail (clicked suggestion or sent message)
- A few extra seconds is acceptable
- Richer context = better quality output
- Can reference anything from the meeting

---

## 🎨 Prompt Quality Patterns

### Pattern 1: Role Framing
```javascript
// Bad: No context
"Generate suggestions"

// Good: Clear role
"You are a real-time AI meeting copilot. Your job is to suggest 
the MOST USEFUL next move in a conversation."
```

### Pattern 2: Task Breakdown
```javascript
// Bad: Vague
"Give me an answer"

// Good: Step-by-step
"1. CONTEXT PHASE: Read the meeting...
 2. EXPANSION PHASE: Take the suggestion...
 3. DELIVERY PHASE: Format for speaking..."
```

### Pattern 3: Constraint Enforcement
```javascript
// Bad: No limits
"Generate suggestions"

// Good: Specific constraints
"✓ Each suggestion UNDER 20 WORDS
 ✓ Each suggestion is DIFFERENT
 ✓ All suggestions IMMEDIATELY ACTIONABLE"
```

### Pattern 4: Format Specification
```javascript
// Bad: Ambiguous
"Return suggestions"

// Good: Exact format
"Return ONLY this JSON format (no markdown):
 [
   {\"type\": \"question\", \"text\": \"...\"},
   ...
 ]"
```

### Pattern 5: Output Validation
```javascript
// Bad: Hope for the best
const response = await api.call(prompt);

// Good: Validate strictly
if (!Array.isArray(suggestions) || suggestions.length !== 3) {
  throw new Error(`Expected 3, got ${suggestions.length}`);
}
suggestions.forEach((s) => {
  if (!s.type || !s.text) throw new Error('Invalid suggestion');
});
```

---

## ⚡ Latency Optimization

### Target Latencies
- **Transcription**: 5-10 seconds (audio processing time)
- **Suggestions**: 2-3 seconds (speed-critical)
- **Detailed Answers**: 2-4 seconds (acceptable for quality)
- **Chat**: 2-4 seconds (acceptable for quality)

### How We Achieve It
1. **Temperature tuning**: 0.7-0.8 for consistent, fast generation
2. **Token limits**: Strict max_tokens prevents long responses
3. **Context limiting**: 2000 char limit for suggestions = speed
4. **JSON validation**: Fail fast on invalid responses
5. **Parallel processing**: UI renders while API responds

---

## 🔒 Error Handling & Robustness

### Validation Points

#### Transcription
- ✓ Check buffer is not empty
- ✓ Validate response has `.text` field
- ✓ Handle empty transcription (silence)

#### Suggestions
- ✓ Check transcript is not empty
- ✓ Parse JSON strictly
- ✓ Validate exactly 3 suggestions
- ✓ Validate each has `type` and `text`
- ✓ Ensure types are in allowed list

#### Detailed Answers
- ✓ Check suggestion is not empty
- ✓ Validate response is not empty
- ✓ Clean up quote wrapping
- ✓ Validate response length

#### Chat
- ✓ Check user message is not empty
- ✓ Validate response is not empty
- ✓ Clean up quote wrapping
- ✓ Validate response length

### Error Messages
All errors are:
- ✓ Descriptive (what went wrong)
- ✓ User-friendly (shown in UI)
- ✓ Logged (console for debugging)
- ✓ Non-blocking (won't crash the app)

---

## 🎓 Prompt Engineering Decisions Explained

### Decision 1: Why "Suggestions" Override?
**Q**: Why let users customize suggestion prompts?
**A**: Different meetings need different suggestions:
- Sales call: Emphasize objection handling & closing
- Technical: Emphasize clarification & deep dives
- 1:1: Emphasize relationship building & listening

### Decision 2: Why Enforce 3 Suggestions?
**Q**: Why exactly 3, not 5 or 1?
**A**: 
- 1 = too limiting, not enough options
- 3 = "Goldilocks" - enough variety, not overwhelming
- 5+ = too many options paralyzes users

### Decision 3: Why 20-Word Limit?
**Q**: Why limit suggestions to 20 words?
**A**:
- Natural speech limit: ~3-4 seconds to speak
- Prevents verbose, rambling suggestions
- Forces clarity and directness
- Stays on screen nicely

### Decision 4: Why "Ready-to-Speak" Format?
**Q**: Why not structured JSON for all responses?
**A**: 
- Users will speak the answer aloud in real time
- Natural text is more usable than structured data
- Conversational tone required in meetings
- Machine readability less important than usability

### Decision 5: Why Split Suggestions vs. Chat?
**Q**: Why have both suggestions and chat if they both respond?
**A**:
- Suggestions: Proactive (we generate ideas)
- Chat: Reactive (user asks a question)
- Different use cases, different UX patterns
- Different optimization targets (speed vs. depth)

---

## 📝 Prompt Examples

### Example 1: Sales Meeting
**Context**: Customer saying "I need to think about it"

**Suggestion Generated**:
```json
[
  {
    "type": "question",
    "text": "What specific aspects do you want to evaluate?"
  },
  {
    "type": "insight", 
    "text": "Here's how we typically help teams similar to yours..."
  },
  {
    "type": "clarification",
    "text": "Is the concern about cost, implementation, or ROI?"
  }
]
```

**User clicks insight**: Gets detailed answer with specific examples

### Example 2: Engineering Standup
**Context**: "We hit rate limiting on the API"

**Question in Chat**: "How do we fix rate limiting?"

**Response**:
```
Rate limiting happens when traffic exceeds 1000 requests/min. You can add exponential backoff (gradually increase wait time between retries) or request a higher tier from the API provider. Most teams choose backoff first.
```

---

## 🚀 Future Optimizations

### Potential Improvements
1. **Prompt versioning**: A/B test different prompts
2. **User preferences**: Learn which suggestion types user prefers
3. **Context compression**: Summarize old parts of conversation
4. **Model selection**: Use faster model for suggestions, GPT-4o for answers
5. **Caching**: Store common responses to avoid duplicate API calls
6. **Fine-tuning**: Create custom Whisper model for domain-specific terms

### Monitoring
- Track suggestion acceptance rate
- Monitor response latencies
- Log API errors and failure patterns
- Collect user feedback on response quality

---

## 📞 Quick Reference

### Groq Service Functions

```javascript
// Transcribe audio
const text = await transcribeAudio(audioBuffer);
// → Returns: "The market is growing 15% year-over-year..."

// Generate suggestions (FAST)
const suggestions = await generateSuggestions(recentTranscript);
// → Returns: [
//     {type: "question", text: "..."},
//     {type: "insight", text: "..."},
//     {type: "clarification", text: "..."}
//   ]

// Expand a suggestion (DETAILED)
const answer = await generateDetailedAnswer(fullTranscript, suggestion);
// → Returns: "That's a great question. Here's why that matters..."

// Chat with the copilot (CONVERSATIONAL)
const response = await chatMessage(fullTranscript, userQuestion);
// → Returns: "Yes, we discussed that earlier. The key point was..."
```

---

## ✅ Checklist for Using Prompts

Before deploying a new prompt:
- [ ] Test with sample meeting audio
- [ ] Verify output format is correct
- [ ] Check latency is within target
- [ ] Validate error handling
- [ ] Get user feedback on quality
- [ ] Compare against baseline
- [ ] Document rationale for changes
- [ ] Update this guide

---

**Last Updated**: Current Session  
**Model Versions**: Whisper Large V3, GPT-4o  
**Status**: Production-Ready ✅
