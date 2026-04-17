import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/appStore';
import { Settings, X } from 'lucide-react';

export function SettingsPanel({ isOpen, onClose }) {
  const apiKey = useStore((state) => state.apiKey);
  const setApiKey = useStore((state) => state.setApiKey);
  const suggestionPrompt = useStore((state) => state.suggestionPrompt);
  const setSuggestionPrompt = useStore((state) => state.setSuggestionPrompt);
  const chatPrompt = useStore((state) => state.chatPrompt);
  const setChatPrompt = useStore((state) => state.setChatPrompt);
  const contextWindow = useStore((state) => state.contextWindow);
  const setContextWindow = useStore((state) => state.setContextWindow);

  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [localSuggestionPrompt, setLocalSuggestionPrompt] = useState(suggestionPrompt);
  const [localChatPrompt, setLocalChatPrompt] = useState(chatPrompt);
  const [localContextWindow, setLocalContextWindow] = useState(contextWindow);

  const handleSave = () => {
    setApiKey(localApiKey);
    setSuggestionPrompt(localSuggestionPrompt);
    setChatPrompt(localChatPrompt);
    setContextWindow(parseInt(localContextWindow));
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-ash rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-maroon/30"
          >
            {/* Header */}
            <div className="sticky top-0 px-6 py-4 border-b border-maroon/30 bg-oil flex items-center justify-between">
              <h2 className="text-xl font-semibold text-brass flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Settings
              </h2>
              <button onClick={onClose} className="text-sage hover:text-brass transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* API Key */}
              <div>
                <label className="block text-sm font-semibold text-brass mb-2">Groq API Key</label>
                <input
                  type="password"
                  value={localApiKey}
                  onChange={(e) => setLocalApiKey(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full bg-oil border border-maroon/30 rounded px-3 py-2 text-sm text-white placeholder-sage focus:outline-none focus:border-brass/50 glow-br"
                />
                <p className="text-xs text-sage mt-2">Get from https://console.groq.com</p>
              </div>

              {/* Context Window */}
              <div>
                <label className="block text-sm font-semibold text-brass mb-2">Context Window (chars)</label>
                <input
                  type="number"
                  value={localContextWindow}
                  onChange={(e) => setLocalContextWindow(parseInt(e.target.value))}
                  className="w-full bg-oil border border-maroon/30 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-brass/50 glow-br"
                />
                <p className="text-xs text-sage mt-2">How much transcript to send for suggestions</p>
              </div>

              {/* Suggestion Prompt */}
              <div>
                <label className="block text-sm font-semibold text-brass mb-2">Suggestion Prompt</label>
                <textarea
                  value={localSuggestionPrompt}
                  onChange={(e) => setLocalSuggestionPrompt(e.target.value)}
                  rows={6}
                  className="w-full bg-oil border border-maroon/30 rounded px-3 py-2 text-sm text-white placeholder-sage focus:outline-none focus:border-brass/50 glow-br font-mono resize-none"
                />
              </div>

              {/* Chat Prompt */}
              <div>
                <label className="block text-sm font-semibold text-brass mb-2">Chat Prompt</label>
                <textarea
                  value={localChatPrompt}
                  onChange={(e) => setLocalChatPrompt(e.target.value)}
                  rows={6}
                  className="w-full bg-oil border border-maroon/30 rounded px-3 py-2 text-sm text-white placeholder-sage focus:outline-none focus:border-brass/50 glow-br font-mono resize-none"
                />
              </div>

              {/* Keyboard Shortcuts */}
              <div>
                <label className="block text-sm font-semibold text-brass mb-2">⌨️ Keyboard Shortcuts</label>
                <div className="bg-oil border border-maroon/30 rounded p-4 space-y-2 text-xs text-sage/80">
                  <p>• <span className="text-brass font-mono">Space</span> = Toggle Recording</p>
                  <p>• <span className="text-brass font-mono">Shift+S</span> = Open Settings</p>
                  <p>• <span className="text-brass font-mono">Shift+R</span> = Refresh Suggestions</p>
                  <p>• <span className="text-brass font-mono">Shift+C</span> = Clear Session</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 px-6 py-4 border-t border-maroon/30 bg-oil flex gap-2 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-ash border border-maroon/30 rounded text-sage hover:text-brass transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-brass text-oil rounded font-semibold hover:bg-brass-light transition-colors"
              >
                Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
