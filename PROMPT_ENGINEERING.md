# TwinMind Pro - Prompt Engineering Guide

This document explains the core prompts used and how to optimize them for your specific use case.

## 1. Live Suggestions Prompt (CORE)

### Why This Matters
- Generated every 30 seconds while user is speaking
- Must be FAST (~2-3 sec latency)
- Must force DIVERSITY (3 different types)
- Must use RECENT context only

### The Prompt

```
You are a real-time AI meeting copilot.

Analyze the recent conversation and generate EXACTLY 3 different types of suggestions.

Each suggestion MUST be a DIFFERENT type:
1. A smart question to ask
2. A helpful insight or talking point  
3. A fact-check, clarification, or relevant information

STRICT RULES:
- Exactly 3 suggestions (no more, no less)
- Each suggestion must be under 20 words
- Be specific and contextual (no generic advice)
- Focus on MOST RECENT conversation
- Make immediately actionable
- Avoid repeating similar ideas

CONTEXT:
{transcript_last_2000_chars}

Return ONLY valid JSON array:
[
  {"type": "question", "text": "..."},
  {"type": "insight", "text": "..."},
  {"type": "clarification", "text": "..."}
]
```

### How to Optimize

#### For Q&A Sessions
Add to prompt:
```
This is a Q&A session. Prioritize:
1. Questions that advance the discussion
2. Key facts the presenter should mention
3. Clarifications needed
```

#### For Brainstorming Sessions
Add to prompt:
```
This is a brainstorming session. Prioritize:
1. Follow-up ideas building on suggestions
2. New angles not yet explored
3. Potential concerns to address
```

#### For Sales Calls
Add to prompt:
```
This is a sales call. Prioritize:
1. Objection handling questions
2. Value propositions seller should mention
3. Clarifications about customer's needs
```

#### For Technical Discussions
Add to prompt:
```
This is a technical discussion. Prioritize:
1. Technical questions revealing usefulness
2. Implementation considerations
3. Performance/security concerns
```

### Performance Tuning

**If suggestions are too generic:**
- Increase context window from 2000 to 3000 chars
- Add more specific meeting type guidance
- Use "MUST be specific to THIS conversation" in prompt

**If latency is high:**
- Decrease context window to 1500 chars
- Use lower-cost model (if available)
- Consider caching recent transcripts

**If suggestions repeat:**
- Add "Generate DIFFERENT suggestions each time"
- Include list of previous suggestions (if stored)
- Add "Avoid: X, Y, Z topics"

## 2. Chat Expansion Prompt

### Why This Matters
- User clicks a suggestion → needs detailed answer
- Uses FULL transcript (comprehensive)
- Should be ready-to-speak sentences

### The Prompt

```
You are an expert assistant helping in a live conversation.

A suggestion was selected. Expand it.

FULL CONTEXT:
{full_transcript}

SUGGESTION:
{suggestion_text}

Provide:
1. Clear, direct answer
2. Ready-to-say sentences
3. Optional examples if relevant
4. Keep to 2-3 sentences max

Make them sound smart and confident.
```

### Optimizations

**For data-driven answers:**
```
Include relevant statistics or facts from the conversation.
Cite specific things mentioned.
```

**For actionable advice:**
```
Format as: 
- What to do
- How to do it
- Why it matters
```

**For decision-making:**
```
Present pros/cons of options discussed.
Summarize key decision factors.
Include recommendation if appropriate.
```

## 3. Chat Message Prompt

For free-form user questions in the chat.

### The Prompt

```
You are a smart meeting assistant.

CONVERSATION:
{full_transcript}

USER ASKED:
{user_message}

Respond:
- Naturally and concisely (1-2 sentences)
- Based on conversation context
- Immediately usable in their meeting
- Professional but friendly tone

Make them sound smart and confident.
```

## 4. Advanced Prompt Techniques

### A. Context Windowing Strategy

**For suggestions** (speed-focused):
```javascript
transctiptContext = transcript.slice(-2000) // ~2 min
```

**For answers** (quality-focused):
```javascript
transcriptContext = fullTranscript // Everything
```

**Why**: 
- Small window = faster API response
- Full context = more accurate answer

### B. Prompt Injection Prevention

**ALWAYS structure like this:**
```
INSTRUCTION: (system instruction)

INPUT: (user/transcript input)
{input_here}

OUTPUT: (format specification)
```

Never put user input before format specification.

### C. Token Optimization

**Instead of this (wasteful):**
```
Generate 3 suggestions based on this transcript:
[FULL 5000 CHAR TRANSCRIPT]
```

**Do this (efficient):**
```
Transcript (last 120 sec):
{recent_transcript}

Generate 3 suggestions:
```

## 5. Real-World Examples

### Example 1: Sales Call Optimization

Replace generic prompt with:
```
You are helping close a B2B sales deal.

The caller is discussing:
{transcript}

Generate 3 suggestions for the salesperson:
1. Next question to move deal forward
2. Key objection to preempt  
3. Value prop to reinforce

Each <20 words. Assume: cost is important, implementation is concern.

Format as JSON:
[
  {"type": "next_step_question", "text": "..."},
  {"type": "objection_preempt", "text": "..."},
  {"type": "value_prop", "text": "..."}
]
```

### Example 2: Customer Support Optimization

```
You are helping a support agent resolve customer issues.

Customer situation:
{transcript}

Generate 3 suggestions:
1. Clarifying question to understand issue
2. Common solution this sounds like
3. Escalation prep (if needed)

Each <20 words.
```

## 6. Measuring Prompt Quality

### Metrics to Track

1. **Usefulness Score** (1-5)
   - Would user actually click this suggestion?
   - Does preview deliver value alone?

2. **Variety Score** (1-3)
   - How different are the 3 suggestions?
   - No repetition/filler?

3. **Relevance Score** (1-5)
   - How specific to THIS conversation?
   - Not generic advice?

4. **Actionability Score** (1-5)
   - Can user use it immediately?
   - Ready-to-speak?

### Evaluation Test

Record a 5-minute conversation. Generate suggestions. Ask:
- [ ] Would I click the #1 suggestion?
- [ ] Is it different from #2 and #3?
- [ ] Can I use it right now?
- [ ] Does it help me sound smarter?

If all YES → prompt is good.

## 7. Iteration Strategy

### Week 1: Default Prompts
- Use provided prompts
- Test with different conversation types
- Note which suggestions users click

### Week 2: Optimize
- Add meeting-type detection
- Increase context window if latency allows
- Remove generic suggestions from prompt

### Week 3: Specialize
- Customize for YOUR use case
- Add domain-specific vocabulary
- Test with real users

## 8. Common Mistakes

❌ **Too long prompts**
- Wastes tokens
- Slower response
→ Fix: Trim to essentials

❌ **Generic suggestions**
- No value delivered
- Users ignore them
→ Fix: Add "MUST be specific to this conversation"

❌ **Full transcript always**
- Slow response times
- Expensive API calls
→ Fix: Use context windowing (last 2000 chars)

❌ **No format specification**
- Invalid JSON from LLM
- App crashes
→ Fix: Always specify exact output format

## 9. Prompt Template System

To easily test variations, create settings for:

```javascript
const prompts = {
  suggestions: {
    generic: "...", // Current
    sales: "...",
    support: "...",
    brainstorm: "..."
  },
  expansion: {
    default: "..."
  },
  chat: {
    default: "..."
  }
}
```

Then in Settings panel, allow user to select prompt type.

## 10. Groq API Optimization

### Model Choice: GPT-4o vs Others

**Used: gpt-4o** (Good balance)
- Fast enough (~2-3 sec)
- Quality suggestions
- Reliable JSON output

**Alternatives:**
- Mixtral 8x7B: Faster but less quality
- Llama 2 70B: Similar quality, different personality
- Whisper: For transcription only (you use this)

### Rate Limiting

Free tier Groq has friendly limits:
- ~500 requests/month sweet spot
- Brief pause if exceeded
- No hard blocks

For this assignment, non-issue.

## Final Tips

1. **Test with real meetings** - Not synthetic data
2. **Iterate fast** - Update prompt, test within minutes
3. **Track what works** - Note which suggestions users click
4. **Ask for feedback** - "Was that suggestion helpful?"
5. **Specialize over generalize** - Better to be great for X than okay for everything

Good luck! You're evaluating the most important part of the product. 🚀
