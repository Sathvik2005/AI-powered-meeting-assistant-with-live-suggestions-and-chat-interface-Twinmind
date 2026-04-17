import express from 'express';
import { generateDetailedAnswer, chatMessage } from '../services/groqService.js';

const router = express.Router();

/**
 * POST /api/chat/expand
 * Get detailed answer for a selected suggestion
 */
router.post('/expand', async (req, res) => {
  try {
    const { transcript, suggestion, customPrompt } = req.body;

    console.log('📥 [Chat Expand] Request received');
    console.log('  Transcript length:', transcript?.length || 0);
    console.log('  Suggestion:', suggestion?.substring(0, 50) || 'N/A');
    console.log('  Custom prompt:', !!customPrompt);

    if (!transcript || !suggestion) {
      console.error('❌ [Chat Expand] Missing required fields');
      return res.status(400).json({ error: 'Transcript and suggestion are required' });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('❌ [Chat Expand] GROQ API key not configured');
      return res.status(400).json({ error: 'GROQ_API_KEY not configured' });
    }

    console.log('🔄 [Chat Expand] Calling generateDetailedAnswer...');
    const answer = await generateDetailedAnswer(transcript, suggestion, customPrompt);

    console.log('✅ [Chat Expand] Answer generated, length:', answer?.length || 0);

    res.json({
      success: true,
      answer,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [Chat Expand] Route error:', error.message);
    console.error('  Stack:', error.stack);
    res.status(500).json({ 
      error: error.message || 'Answer generation failed',
      details: error.stack,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/chat/message
 * Send a chat message and get a response
 */
router.post('/message', async (req, res) => {
  try {
    const { transcript, message, customPrompt } = req.body;

    console.log('📥 [Chat Message] Request received');
    console.log('  Transcript length:', transcript?.length || 0);
    console.log('  Message:', message?.substring(0, 50) || 'N/A');
    console.log('  Custom prompt:', !!customPrompt);

    if (!transcript || !message) {
      console.error('❌ [Chat Message] Missing required fields');
      return res.status(400).json({ error: 'Transcript and message are required' });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('❌ [Chat Message] GROQ API key not configured');
      return res.status(400).json({ error: 'GROQ_API_KEY not configured' });
    }

    console.log('🔄 [Chat Message] Calling chatMessage...');
    const response = await chatMessage(transcript, message, customPrompt);

    console.log('✅ [Chat Message] Response generated, length:', response?.length || 0);

    res.json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat route error:', error);
    res.status(500).json({ 
      error: error.message || 'Message failed',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
