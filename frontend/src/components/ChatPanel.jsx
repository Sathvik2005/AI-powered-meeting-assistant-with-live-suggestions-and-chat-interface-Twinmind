import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/appStore';
import { useChat } from '../hooks/useAudio';
import { Send, Loader } from 'lucide-react';

function ChatMessage({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-xs px-4 py-2 rounded-lg ${
          message.role === 'user'
            ? 'bg-brass text-oil rounded-br-none'
            : 'bg-ash border border-maroon/30 text-gray-100 rounded-bl-none glow-br'
        }`}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p className="text-xs mt-1 opacity-60">{new Date(message.timestamp).toLocaleTimeString()}</p>
      </div>
    </motion.div>
  );
}

export function ChatPanel() {
  const chatMessages = useStore((state) => state.chatMessages);
  const addChatMessage = useStore((state) => state.addChatMessage);
  const transcriptChunks = useStore((state) => state.transcriptChunks);
  const apiKey = useStore((state) => state.apiKey);
  const chatPrompt = useStore((state) => state.chatPrompt);
  const suggestionBatches = useStore((state) => state.suggestionBatches);

  const { getDetailedAnswer, sendChatMessage } = useChat();

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const transcript = transcriptChunks.map(c => c.text).join(' ');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    const message = inputValue.trim();
    if (!message || isLoading) return;

    if (!apiKey) {
      setError('Please configure API key in settings');
      return;
    }

    setError('');
    setInputValue('');
    addChatMessage({ role: 'user', content: message });
    setIsLoading(true);

    try {
      const response = await sendChatMessage(transcript, message, chatPrompt, apiKey);
      addChatMessage({ role: 'assistant', content: response });
    } catch (err) {
      setError(err.message);
      addChatMessage({ role: 'assistant', content: `Error: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSuggestion = async (suggestion) => {
    if (!apiKey) {
      setError('Please configure API key in settings');
      return;
    }

    setError('');
    addChatMessage({ role: 'user', content: `Selected: ${suggestion.text}` });
    setIsLoading(true);

    try {
      const answer = await getDetailedAnswer(transcript, suggestion, chatPrompt, apiKey);
      addChatMessage({ role: 'assistant', content: answer });
    } catch (err) {
      setError(err.message);
      addChatMessage({ role: 'assistant', content: `Error: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-ash shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-maroon/30 bg-oil">
        <h2 className="text-lg font-semibold text-brass">💬 Chat</h2>
        {chatMessages.length > 0 && (
          <p className="text-xs text-sage mt-1">{chatMessages.length} messages</p>
        )}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 bg-red-900/20 border-b border-red-500/30 text-red-300 text-xs"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <p className="text-sage text-sm font-semibold">💬 Chat Panel</p>
            <div className="space-y-3 text-xs text-sage/80">
              <div className="border border-brass/20 rounded p-3 bg-brass/5">
                <p className="font-semibold text-brass mb-2">🎯 Click a suggestion</p>
                <p>Select any suggestion from the middle panel to expand it here</p>
              </div>
              <div className="border border-sage/20 rounded p-3 bg-sage/5">
                <p className="font-semibold text-sage mb-2">❓ Ask questions</p>
                <p>Type your own questions below to discuss the transcript</p>
              </div>
              {suggestionBatches.length === 0 && (
                <div className="border border-yellow-600/20 rounded p-3 bg-yellow-900/10">
                  <p className="font-semibold text-yellow-400 mb-2">🎤 Start recording</p>
                  <p>Record and transcribe first to get suggestions</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {chatMessages.map((msg, idx) => (
              <ChatMessage key={idx} message={msg} />
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-maroon/30 bg-oil">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder="Ask a question..."
            disabled={isLoading}
            className="flex-1 bg-ash border border-maroon/30 rounded px-3 py-2 text-sm text-white placeholder-sage focus:outline-none focus:border-brass/50 glow-br disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="px-3 py-2 bg-brass text-oil rounded font-semibold text-sm hover:bg-brass-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
