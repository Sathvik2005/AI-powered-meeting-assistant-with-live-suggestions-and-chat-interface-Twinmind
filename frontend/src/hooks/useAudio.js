import { useCallback, useRef, useEffect, useState } from 'react';

// API Base URL - works in both dev and production
const getApiBaseUrl = () => {
  // In development: use localhost:3001
  // In production (Vercel): use relative path to multi-service backend
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3001';
  }
  return '/_/backend';
};

const API_BASE = getApiBaseUrl();

// Helper for timeout on fetch requests
const fetchWithTimeout = (url, options = {}, timeoutMs = 10000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
};

export const useAudioRecorder = (onChunkReady, chunkDuration = 30) => {
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const chunksRef = useRef([]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onChunkReady(audioBlob);
        chunksRef.current = [];
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop and restart every chunkDuration seconds
      const interval = setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          setTimeout(() => {
            if (streamRef.current) {
              mediaRecorderRef.current.start();
            }
          }, 100);
        }
      }, chunkDuration * 1000);

      // Store interval ID on recorder for cleanup
      mediaRecorder.intervalId = interval;
    } catch (err) {
      setError(err.message);
      setIsRecording(false);
    }
  }, [onChunkReady, chunkDuration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      clearInterval(mediaRecorderRef.current.intervalId);
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    setIsRecording(false);
  }, []);

  return { startRecording, stopRecording, isRecording, error };
};

export const useTranscription = () => {
  const transcribe = useCallback(async (audioBlob, apiKey) => {
    if (!apiKey) throw new Error('API key not configured');

    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    formData.append('duration', 30);

    const response = await fetchWithTimeout(`${API_BASE}/api/transcription/transcribe`, {
      method: 'POST',
      headers: {
        'X-Groq-API-Key': apiKey
      },
      body: formData
    }, 15000);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Transcription failed');
    }

    const data = await response.json();
    return data.transcript;
  }, []);

  return { transcribe };
};

export const useSuggestions = () => {
  const generateSuggestions = useCallback(async (transcript, customPrompt, apiKey) => {
    if (!apiKey) throw new Error('API key not configured');
    if (!transcript.trim()) return [];

    const payload = {
      transcript: transcript.slice(-2000),
      customPrompt
    };

    console.log('📤 [Suggestions] Sending to API...');
    console.log('  Transcript:', payload.transcript.slice(0, 50) + '...');
    console.log('  Length:', payload.transcript.length, 'chars');

    const response = await fetchWithTimeout(`${API_BASE}/api/suggestions/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Groq-API-Key': apiKey
      },
      body: JSON.stringify(payload)
    }, 8000);

    console.log('📨 [Suggestions] Response:', response.status, response.statusText);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('❌ [Suggestions] API Error:', error);
      throw new Error(error.error || error.message || 'Generation failed');
    }

    const data = await response.json();
    console.log('✅ [Suggestions] Received:', data.suggestions?.length || 0, 'suggestions');
    return data.suggestions || [];
  }, []);

  return { generateSuggestions };
};

export const useChat = () => {
  const getDetailedAnswer = useCallback(async (transcript, suggestion, customPrompt, apiKey) => {
    if (!apiKey) throw new Error('API key not configured');

    console.log('📤 [Chat Expand] Sending to API...');
    console.log('  Suggestion:', suggestion.text || suggestion);

    const response = await fetchWithTimeout(`${API_BASE}/api/chat/expand`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Groq-API-Key': apiKey
      },
      body: JSON.stringify({
        transcript,
        suggestion: suggestion.text || suggestion,
        customPrompt
      })
    }, 8000);

    console.log('📨 [Chat Expand] Response:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('❌ [Chat Expand] API Error:', error);
      throw new Error(error.error || error.message || 'Answer generation failed');
    }

    const data = await response.json();
    console.log('✅ [Chat Expand] Answer received');
    return data.answer;
  }, []);

  const sendChatMessage = useCallback(async (transcript, message, customPrompt, apiKey) => {
    if (!apiKey) throw new Error('API key not configured');

    console.log('📤 [Chat Message] Sending to API...');
    console.log('  Message:', message);

    const response = await fetchWithTimeout(`${API_BASE}/api/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Groq-API-Key': apiKey
      },
      body: JSON.stringify({
        transcript,
        message,
        customPrompt
      })
    }, 8000);

    console.log('📨 [Chat Message] Response:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('❌ [Chat Message] API Error:', error);
      throw new Error(error.error || error.message || 'Message failed');
    }

    const data = await response.json();
    console.log('✅ [Chat Message] Response received');
    return data.response;
  }, []);

  return { getDetailedAnswer, sendChatMessage };
};
