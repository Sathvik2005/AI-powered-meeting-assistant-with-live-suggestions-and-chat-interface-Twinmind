import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from './store/appStore';
import { TranscriptPanel } from './components/TranscriptPanel';
import { SuggestionsPanel } from './components/SuggestionsPanel';
import { ChatPanel } from './components/ChatPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { ExportPanel } from './components/ExportPanel';
import { useAudioRecorder, useTranscription, useSuggestions, useChat } from './hooks/useAudio';
import { Mic, MicOff, Settings, Zap, RotateCw, AlertCircle, CheckCircle, Wifi, WifiOff, Trash2 } from 'lucide-react';

export default function App() {
  const isRecording = useStore((state) => state.isRecording);
  const setIsRecording = useStore((state) => state.setIsRecording);
  const addTranscriptChunk = useStore((state) => state.addTranscriptChunk);
  const addSuggestionBatch = useStore((state) => state.addSuggestionBatch);
  const addChatMessage = useStore((state) => state.addChatMessage);
  const transcriptChunks = useStore((state) => state.transcriptChunks);
  const apiKey = useStore((state) => state.apiKey);
  const suggestionPrompt = useStore((state) => state.suggestionPrompt);
  const contextWindow = useStore((state) => state.contextWindow);
  const clearTranscript = useStore((state) => state.clearTranscript);
  const clearSuggestions = useStore((state) => state.clearSuggestions);
  const clearChat = useStore((state) => state.clearChat);

  const [showSettings, setShowSettings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const [backendConnected, setBackendConnected] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  const { transcribe } = useTranscription();
  const { generateSuggestions } = useSuggestions();
  const { getDetailedAnswer } = useChat();

  // Helper function to generate suggestions after new transcript
  const generateSuggestionsAfterTranscript = useCallback(async (newTranscript) => {
    if (!apiKey) {
      console.warn('⚠️ API key not configured');
      return;
    }

    // Build transcript from current chunks + new transcript
    const transcriptText = useStore.getState().transcriptChunks
      .map(c => c.text || c)
      .join(' ');
    
    // Combine with new transcript
    const allTranscriptText = (transcriptText + ' ' + newTranscript)
      .trim()
      .slice(-contextWindow);

    console.log('📝 Generating suggestions for transcript of length:', allTranscriptText.length);

    try {
      setIsProcessing(true);
      const suggestions = await generateSuggestions(allTranscriptText, suggestionPrompt, apiKey);
      
      console.log('✅ Suggestions generated:', suggestions?.length || 0);
      
      if (suggestions && suggestions.length > 0) {
        addSuggestionBatch(suggestions);
        setLastRefreshTime(new Date().toISOString());
        setSuccessMessage('💡 New suggestions generated');
        setTimeout(() => setSuccessMessage(''), 2000);
      } else {
        console.warn('⚠️ No suggestions returned');
      }
    } catch (err) {
      console.error('❌ Suggestions error:', err.message);
      setError(`❌ Failed to generate suggestions: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [apiKey, contextWindow, suggestionPrompt, generateSuggestions, addSuggestionBatch]);

  // Check backend connection
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/health');
        if (response.ok) {
          setBackendConnected(true);
          setRetryCount(0);
        } else {
          setBackendConnected(false);
        }
      } catch (err) {
        setBackendConnected(false);
      }
    };

    const interval = setInterval(checkBackend, 5000);
    checkBackend();
    return () => clearInterval(interval);
  }, []);

  // Timer for recording
  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Handle audio chunks from recorder with retry logic
  const handleAudioChunk = useCallback(async (audioBlob) => {
    if (!apiKey) {
      setError('🔑 Please configure API key in settings');
      return;
    }

    if (!backendConnected) {
      setError('📡 Backend server is not responding. Please check the server.');
      return;
    }

    let attempts = 0;
    const maxAttempts = 3;

    const attemptTranscribe = async () => {
      try {
        setError('');
        setIsProcessing(true);
        const transcript = await transcribe(audioBlob, apiKey);
        if (transcript && transcript.trim()) {
          addTranscriptChunk(transcript);
          console.log('✅ Transcript added:', transcript.slice(0, 50) + '...');
          setSuccessMessage('✅ Transcription successful');
          setTimeout(() => setSuccessMessage(''), 2000);
          setRetryCount(0);
          
          // IMMEDIATELY trigger suggestions after transcription with the new transcript
          setTimeout(() => {
            console.log('🚀 Triggering suggestions immediately after transcription');
            // Generate suggestions based on latest transcript chunks
            generateSuggestionsAfterTranscript(transcript);
          }, 100); // Small delay to let state update
        }
      } catch (err) {
        attempts++;
        console.error('❌ Transcription error:', err);
        if (attempts < maxAttempts) {
          setError(`⏳ Retrying transcription (${attempts}/${maxAttempts})...`);
          setTimeout(attemptTranscribe, 1000);
        } else {
          setError(`❌ Transcription failed: ${err.message}`);
          setRetryCount(attempts);
          addChatMessage({
            role: 'system',
            content: `Transcription error: ${err.message}`
          });
        }
      } finally {
        if (attempts >= maxAttempts) {
          setIsProcessing(false);
        }
      }
    };

    attemptTranscribe();
  }, [apiKey, transcribe, addTranscriptChunk, addChatMessage, backendConnected]);

  const { startRecording, stopRecording } = useAudioRecorder(handleAudioChunk, 30);

  // Handle mic start/stop
  const handleToggleMic = async () => {
    if (!backendConnected) {
      setError('📡 Backend server is not responding');
      return;
    }

    if (isRecording) {
      stopRecording();
      setIsRecording(false);
      if (autoRefreshInterval) clearInterval(autoRefreshInterval);
      setSuccessMessage('⏹️ Recording stopped');
      setTimeout(() => setSuccessMessage(''), 2000);
    } else {
      try {
        await startRecording();
        setIsRecording(true);
        setError('');
        setSuccessMessage('🎤 Recording started');
        setTimeout(() => setSuccessMessage(''), 2000);

        // Start auto-refresh every 30 seconds
        const interval = setInterval(() => {
          handleRefreshSuggestions();
        }, 30000);
        setAutoRefreshInterval(interval);
      } catch (err) {
        setError(`❌ ${err.message}`);
      }
    }
  };

  // Generate suggestions with retry
  const handleRefreshSuggestions = useCallback(async () => {
    console.log('🔄 handleRefreshSuggestions called');
    console.log('  API Key configured:', !!apiKey);
    console.log('  Transcript chunks:', transcriptChunks.length);
    console.log('  Backend connected:', backendConnected);

    if (!apiKey) {
      console.warn('⚠️ API key not configured');
      setError('🔑 API key not configured');
      return;
    }

    if (transcriptChunks.length === 0) {
      console.warn('⚠️ No transcript chunks');
      setError('📝 No transcript to generate suggestions from');
      return;
    }

    if (!backendConnected) {
      console.warn('⚠️ Backend not connected');
      setError('📡 Backend server is not responding');
      return;
    }

    try {
      setIsProcessing(true);
      const fullTranscript = transcriptChunks
        .map(c => c.text)
        .join(' ')
        .slice(-contextWindow);

      console.log('📤 Sending to suggestions API:');
      console.log('  Context length:', fullTranscript.length, 'chars');
      console.log('  Context window:', contextWindow);

      const suggestions = await generateSuggestions(fullTranscript, suggestionPrompt, apiKey);
      
      console.log('✅ Suggestions received:', suggestions?.length || 0);
      
      if (suggestions && suggestions.length > 0) {
        console.log('💾 Adding suggestion batch');
        addSuggestionBatch(suggestions);
        setLastRefreshTime(new Date().toISOString());
        setSuccessMessage('💡 New suggestions generated');
        setTimeout(() => setSuccessMessage(''), 2000);
      } else {
        console.warn('⚠️ No suggestions returned');
        setError('❌ No suggestions generated');
      }
    } catch (err) {
      console.error('❌ Suggestions error:', err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      setError(`❌ Suggestions failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [apiKey, transcriptChunks, contextWindow, suggestionPrompt, generateSuggestions, addSuggestionBatch, backendConnected]);

  const handleClearSession = () => {
    if (window.confirm('🗑️ Clear all session data? This cannot be undone.')) {
      clearTranscript();
      clearSuggestions();
      clearChat();
      setError('');
      setLastRefreshTime(null);
      setSuccessMessage('✅ Session cleared');
      setTimeout(() => setSuccessMessage(''), 2000);
    }
  };

  // Handle suggestion selection - expand to detailed answer
  const handleSuggestionSelect = useCallback(async (suggestion) => {
    console.log('🎯 Suggestion selected:', suggestion.text);
    
    if (!apiKey) {
      setError('🔑 API key not configured');
      return;
    }

    try {
      setIsProcessing(true);
      const fullTranscript = transcriptChunks
        .map(c => c.text)
        .join(' ')
        .slice(-contextWindow);

      console.log('📤 [SuggestionExpand] Calling getDetailedAnswer...');
      const answer = await getDetailedAnswer(fullTranscript, suggestion, suggestionPrompt, apiKey);
      
      console.log('✅ [SuggestionExpand] Received answer, length:', answer?.length || 0);
      
      // Add messages to chat
      addChatMessage({
        role: 'user',
        content: `💡 ${suggestion.text}`
      });
      addChatMessage({
        role: 'assistant',
        content: answer
      });
      
      setSuccessMessage('✅ Suggestion expanded');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      console.error('❌ [SuggestionExpand] Error:', err);
      setError(`❌ Failed to expand suggestion: ${err.message}`);
      addChatMessage({
        role: 'assistant',
        content: `Error expanding suggestion: ${err.message}`
      });
    } finally {
      setIsProcessing(false);
    }
  }, [apiKey, transcriptChunks, contextWindow, suggestionPrompt, getDetailedAnswer, addChatMessage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!apiKey) {
          setError('🔑 Please configure API key in settings');
          return;
        }
        handleToggleMic();
      }

      if (e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setShowSettings(true);
      }

      if (e.shiftKey && e.key === 'R') {
        e.preventDefault();
        if (!isProcessing) {
          handleRefreshSuggestions();
        }
      }

      if (e.shiftKey && e.key === 'C') {
        e.preventDefault();
        handleClearSession();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isProcessing, apiKey, handleToggleMic, handleRefreshSuggestions, generateSuggestionsAfterTranscript]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-oil via-oil to-maroon/10">
      {/* Professional Header with Status Indicators */}
      <header className="bg-gradient-to-r from-oil to-oil/90 backdrop-blur-xl border-b border-brass/20 sticky top-0 z-40 shadow-2xl">
        <div className="px-8 py-5 flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <motion.div
              animate={isRecording ? { scale: [1, 1.15, 1], y: [0, -2, 0] } : { rotate: 0 }}
              transition={{ repeat: isRecording ? Infinity : 0, duration: 1 }}
              className="text-4xl drop-shadow-lg"
            >
              🎙️
            </motion.div>
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-black bg-gradient-to-r from-brass to-brass/70 bg-clip-text text-transparent"
              >
                TwinMind Pro
              </motion.h1>
              <p className="text-sm text-sage/80">Real-Time AI Meeting Copilot</p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-6">
            {/* Backend Status */}
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-1 bg-ash/50 rounded-full border border-maroon/30"
            >
              {backendConnected ? (
                <>
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <Wifi className="w-4 h-4 text-green-400" />
                  </motion.div>
                  <span className="text-xs text-green-400">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-400 animate-pulse" />
                  <span className="text-xs text-red-400">Disconnected</span>
                </>
              )}
            </motion.div>

            {/* Recording Time */}
            {isRecording && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full border border-red-400"
              >
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                </motion.div>
                <span className="text-xs text-red-400 font-mono font-bold">{formatTime(recordingTime)}</span>
              </motion.div>
            )}

            {/* Last Update Time */}
            {lastRefreshTime && (
              <div className="text-xs text-sage/60 font-mono">
                {new Date(lastRefreshTime).toLocaleTimeString()}
              </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-brass">
                <Zap className="w-5 h-5" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Notification Bar */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-8 py-3 bg-red-500/10 border-t border-red-500/20 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-300">{error}</span>
            </motion.div>
          )}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-8 py-3 bg-green-500/10 border-t border-green-500/20 flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="text-sm text-green-300">{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Control Bar */}
        <div className="px-8 py-4 border-t border-maroon/20 bg-oil/70 flex items-center justify-between gap-6">
          <div className="flex gap-3">
            {/* Record Button */}
            <motion.button
              whileHover={{ scale: 1.08, boxShadow: '0 0 20px rgba(255, 153, 102, 0.5)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleMic}
              disabled={!backendConnected}
              className={`px-6 py-3 rounded-lg font-bold flex items-center gap-3 transition-all shadow-lg text-lg ${
                isRecording
                  ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white animate-pulse'
                  : backendConnected 
                    ? 'bg-gradient-to-r from-brass to-brass/80 hover:from-brass/90 hover:to-brass/70 text-oil'
                    : 'bg-ash text-sage/50 cursor-not-allowed'
              }`}
            >
              {isRecording ? (
                <>
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                    <MicOff className="w-5 h-5" />
                  </motion.div>
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  Start Recording
                </>
              )}
            </motion.button>

            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefreshSuggestions}
              disabled={!isRecording || isProcessing || !backendConnected}
              className="px-4 py-3 bg-ash/50 border border-maroon/40 text-sage rounded-lg font-semibold text-sm hover:text-brass hover:border-brass/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 backdrop-blur-sm"
            >
              <RotateCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>

            {/* Export Button */}
            <ExportPanel />
          </div>

          <div className="flex gap-3">
            {/* Clear Session Button */}
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClearSession}
              className="px-4 py-3 text-sm text-sage hover:text-red-400 transition-all rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/30 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </motion.button>

            {/* Settings Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(true)}
              className="px-4 py-3 bg-ash/50 border border-maroon/40 text-sage rounded-lg hover:text-brass hover:border-brass/40 transition-all flex items-center gap-2 backdrop-blur-sm"
            >
              <Settings className="w-4 h-4" />
              Settings
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex h-[calc(100vh-200px)] gap-1 p-4">
        {/* Left Panel: Transcript */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 overflow-hidden rounded-xl border border-maroon/20 bg-oil/40 backdrop-blur-sm shadow-lg p-4"
        >
          <TranscriptPanel />
        </motion.div>

        {/* Middle Panel: Suggestions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 overflow-hidden rounded-xl border border-maroon/20 bg-oil/40 backdrop-blur-sm shadow-lg p-4"
        >
          <SuggestionsPanel onSuggestionSelect={handleSuggestionSelect} />
        </motion.div>

        {/* Right Panel: Chat */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex-1 overflow-hidden rounded-xl border border-maroon/20 bg-oil/40 backdrop-blur-sm shadow-lg p-4"
        >
          <ChatPanel />
        </motion.div>
      </div>

      {/* Settings Modal */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

    </div>
  );
}
