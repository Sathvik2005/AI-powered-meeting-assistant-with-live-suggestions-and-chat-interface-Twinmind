import { Groq } from 'groq-sdk';

/**
 * TwinMind Pro - Groq AI Service
 * 
 * MODEL STRATEGY:
 * - Transcription: Whisper Large V3 (most accurate, specifically trained for speech)
 * - Suggestions: llama-3.3-70b-versatile (excellent quality, fast on Groq)
 * - Chat: llama-3.3-70b-versatile (comprehensive understanding with full context)
 * 
 * OPTIMIZATION:
 * - Suggestion context: Last 2000 chars (~2 minutes of speech) = Fast (2-3 sec latency)
 * - Chat context: Full transcript = Quality answers with comprehensive context
 * - Tokens: Limited to essential only to reduce latency
 * - Prompt format: Strict JSON for reliability
 */

// Lazy-initialize Groq client to ensure environment variables are loaded
let client = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is not set. Please check your .env file.');
    }
    client = new Groq({ apiKey });
  }
  return client;
}

/**
 * Transcribe audio to text using Whisper Large V3
 * 
 * @param {ArrayBuffer} audioBuffer - Raw audio data
 * @returns {Promise<string>} Transcribed text
 * @throws {Error} If transcription fails
 * 
 * LATENCY: ~5-10 sec per 30-sec chunk
 */
export async function transcribeAudio(audioBuffer) {
  try {
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      throw new Error('Empty audio buffer provided');
    }

    const response = await getClient().audio.transcriptions.create({
      file: new File([audioBuffer], 'audio.wav', { type: 'audio/wav' }),
      model: 'whisper-large-v3',
      language: 'en',
      response_format: 'json'
    });

    if (!response.text || response.text.trim().length === 0) {
      console.warn('Whisper returned empty transcription');
      return ''; // Return empty rather than throwing for silence
    }

    return response.text.trim();
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error(`Transcription failed: ${error.message}`);
  }
}

/**
 * Generate 3 smart suggestions for real-time meeting assistance
 * 
 * STRATEGY:
 * - Analyzes RECENT context only (last 2000 chars = ~2 minutes)
 * - Enforces suggestion DIVERSITY (3 different types)
 * - Prioritizes ACTIONABILITY (can use in conversation immediately)
 * - Context-aware (detects question, confusion, decision-making)
 * 
 * TYPES:
 * 1. "question" - Smart follow-up or clarifying question
 * 2. "insight" - Key insight, talking point, or fact
 * 3. "clarification" - Clarification needed, objection to address, or fact-check
 * 
 * LATENCY: ~2-3 seconds
 * 
 * @param {string} transcript - Recent transcript chunk (limited context)
 * @param {string|null} customPrompt - Optional custom prompt override
 * @returns {Promise<Array>} Array of exactly 3 suggestions
 * @throws {Error} If generation fails
 */
export async function generateSuggestions(transcript, customPrompt = null) {
  try {
    if (!transcript || transcript.trim().length === 0) {
      return []; // Return empty array for empty input
    }

    // Trim to last 1500 chars (~2 min) for FAST suggestions
    const trimmedContext = transcript.slice(-1500);

    const defaultPrompt = `Generate 3 DIFFERENT suggestions:
1. Question (15 words max)
2. Insight (15 words max)  
3. Clarification (15 words max)

Specific to conversation, actionable now, all different.

Context: ${trimmedContext}

Return ONLY JSON:
[{"type":"question","text":"..."},{"type":"insight","text":"..."},{"type":"clarification","text":"..."}]`;

    const prompt = customPrompt || defaultPrompt;

    const message = await getClient().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 150, // Minimal tokens for speed
      temperature: 0.6,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = message.choices[0].message.content;
    
    // Parse JSON response
    const jsonMatch = content.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      console.error('Invalid JSON response:', content);
      throw new Error('No valid JSON found in response');
    }
    
    const suggestions = JSON.parse(jsonMatch[0]);
    
    // Validate exactly 3 suggestions with required fields
    if (!Array.isArray(suggestions) || suggestions.length !== 3) {
      throw new Error(`Expected 3 suggestions, got ${suggestions.length}`);
    }

    // Validate each suggestion
    suggestions.forEach((s, idx) => {
      if (!s.type || !s.text) {
        throw new Error(`Suggestion ${idx} missing 'type' or 'text' field`);
      }
      if (!['question', 'insight', 'clarification'].includes(s.type)) {
        throw new Error(`Suggestion ${idx} has invalid type: ${s.type}`);
      }
      if (s.text.length > 150) {
        console.warn(`Suggestion ${idx} is long: ${s.text.length} chars`);
      }
    });
    
    return suggestions;
  } catch (error) {
    console.error('Suggestions error:', error);
    throw new Error(`Suggestions generation failed: ${error.message}`);
  }
}

/**
 * Generate detailed answer with full meeting context
 * 
 * STRATEGY:
 * - Uses FULL transcript context (not limited to recent)
 * - Provides comprehensive, structured answer
 * - Format optimized for "ready-to-speak" (can read aloud)
 * - Includes specific examples when helpful
 * - Naturally handles both questions and statement followups
 * 
 * USE CASE:
 * - User clicks on a suggestion to expand it
 * - Needs full context understanding
 * - Answer should be conversational but professional
 * - 2-4 sentences of substantive content
 * 
 * LATENCY: ~2-4 seconds
 * 
 * @param {string} transcript - Complete meeting transcript
 * @param {string} suggestion - The suggestion to expand on
 * @param {string|null} customPrompt - Optional custom prompt override
 * @returns {Promise<string>} Detailed answer, ready to speak
 * @throws {Error} If generation fails
 */
export async function generateDetailedAnswer(transcript, suggestion, customPrompt = null) {
  try {
    if (!suggestion || suggestion.trim().length === 0) {
      throw new Error('Suggestion required for expansion');
    }

    // Trim context to last 4000 chars (~4 min) for faster latency while keeping quality
    const contextWindow = transcript ? transcript.slice(-4000) : '(No context)';

    const defaultPrompt = `Answer in 2-4 sentences using meeting context. Be specific, conversational, ready to speak.

Context: ${contextWindow}

Suggestion: ${suggestion}

Answer:`;

    const prompt = customPrompt || defaultPrompt;

    const message = await getClient().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 180, // 2-4 sentences = ~100-150 tokens
      temperature: 0.65, // More consistent
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    let answer = message.choices[0].message.content.trim();
    
    // Clean up if wrapped in quotes
    if ((answer.startsWith('"') && answer.endsWith('"')) ||
        (answer.startsWith("'") && answer.endsWith("'"))) {
      answer = answer.slice(1, -1);
    }

    if (!answer || answer.length === 0) {
      throw new Error('Empty response from API');
    }

    return answer;
  } catch (error) {
    console.error('Detailed answer error:', error);
    throw new Error(`Detailed answer generation failed: ${error.message}`);
  }
}

/**
 * Handle freeform chat messages with full conversation context
 * 
 * STRATEGY:
 * - Uses FULL transcript for context-aware responses
 * - Supports 3 chat modes (answer questions, suggest next steps, clarify)
 * - Natural, conversational tone optimized for speaking
 * - Can provide brief answers or detailed explanations
 * - Memory of entire meeting context
 * 
 * USE CASE:
 * - User types a question or statement in chat panel
 * - Responds naturally using full context
 * - Can answer questions, suggest talking points, or clarify concepts
 * - Tone: Trusted advisor, not robotic
 * 
 * LATENCY: ~2-4 seconds
 * 
 * @param {string} transcript - Complete meeting transcript
 * @param {string} userMessage - User's chat message/question
 * @param {string|null} customPrompt - Optional custom prompt override
 * @returns {Promise<string>} Chat response, ready to speak or read
 * @throws {Error} If generation fails
 */
export async function chatMessage(transcript, userMessage, customPrompt = null) {
  try {
    if (!userMessage || userMessage.trim().length === 0) {
      throw new Error('User message required for chat');
    }

    // Trim context to last 5000 chars (~5 min) for faster response
    const contextWindow = transcript ? transcript.slice(-5000) : '(Starting new conversation)';

    const defaultPrompt = `Answer naturally using meeting context. Be conversational, direct, ready to speak.

Context: ${contextWindow}

Question: ${userMessage}

Answer:`;

    const prompt = customPrompt || defaultPrompt;

    const message = await getClient().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 180, // Keep responses brief
      temperature: 0.65, // Consistent tone
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    let response = message.choices[0].message.content.trim();
    
    // Clean up if wrapped in quotes (sometimes GPT adds these unnecessarily)
    if ((response.startsWith('"') && response.endsWith('"')) ||
        (response.startsWith("'") && response.endsWith("'"))) {
      response = response.slice(1, -1);
    }

    if (!response || response.length === 0) {
      throw new Error('Empty response from API');
    }

    return response;
  } catch (error) {
    console.error('Chat error:', error);
    throw new Error(`Chat message failed: ${error.message}`);
  }
}
