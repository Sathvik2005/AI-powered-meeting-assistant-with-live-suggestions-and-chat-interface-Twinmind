import express from 'express';
import { generateSuggestions } from '../services/groqService.js';

const router = express.Router();

/**
 * POST /api/suggestions/generate
 * Generate 3 live suggestions based on transcript
 */
router.post('/generate', async (req, res) => {
  try {
    const { transcript, customPrompt } = req.body;

    console.log('📥 [Suggestions] Request received');
    console.log('  Transcript length:', transcript?.length || 0);
    console.log('  Custom prompt:', !!customPrompt);

    if (!transcript || transcript.trim().length === 0) {
      console.error('❌ [Suggestions] Empty transcript');
      return res.status(400).json({ error: 'Transcript is required' });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('❌ [Suggestions] GROQ API key not configured');
      return res.status(400).json({ error: 'GROQ_API_KEY not configured' });
    }

    console.log('🔄 [Suggestions] Calling generateSuggestions...');
    const suggestions = await generateSuggestions(transcript, customPrompt);

    console.log('✅ [Suggestions] Generated', suggestions?.length || 0, 'suggestions');

    res.json({
      success: true,
      suggestions,
      count: suggestions.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [Suggestions] Route error:', error.message);
    console.error('  Stack:', error.stack);
    res.status(500).json({ 
      error: error.message || 'Generation failed',
      details: error.stack,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
