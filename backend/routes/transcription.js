import express from 'express';
import multer from 'multer';
import { transcribeAudio } from '../services/groqService.js';

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

/**
 * POST /api/transcription/transcribe
 * Transcribe audio blob to text using Whisper
 */
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(400).json({ error: 'GROQ_API_KEY not configured' });
    }

    const transcript = await transcribeAudio(req.file.buffer);

    res.json({
      success: true,
      transcript,
      duration: req.body.duration || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Transcription route error:', error);
    res.status(500).json({ 
      error: error.message || 'Transcription failed',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
