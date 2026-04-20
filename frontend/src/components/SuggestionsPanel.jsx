import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/appStore';
import { Copy, MessageSquare, Zap } from 'lucide-react';

function SuggestionCard({ suggestion, onSelect }) {
  const getTypeColor = (type) => {
    switch (type) {
      case 'question': return { bg: 'bg-blue-900/20', border: 'border-blue-500/30', label: '❓ Question' };
      case 'insight': return { bg: 'bg-yellow-900/20', border: 'border-brass/30', label: '💡 Insight' };
      case 'clarification': return { bg: 'bg-green-900/20', border: 'border-green-500/30', label: '🎯 Clarification' };
      default: return { bg: 'bg-ash/50', border: 'border-sage/30', label: '💬 Suggestion' };
    }
  };

  const typeStyle = getTypeColor(suggestion.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-lg ${typeStyle.bg} ${typeStyle.border} group`}
      onClick={() => {
        onSelect(suggestion);
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-semibold text-brass">{typeStyle.label}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <MessageSquare className="w-3 h-3 text-brass" title="Click to add to chat" />
          <Copy className="w-3 h-3 text-sage" title="Click to expand answer" />
        </div>
      </div>
      <p className="text-sm text-gray-100 leading-relaxed font-medium">{suggestion.text}</p>
      <p className="text-xs text-sage/60 mt-2 group-hover:text-brass/60 transition-colors">Click to expand in chat →</p>
    </motion.div>
  );
}

export function SuggestionsPanel({ onSuggestionSelect }) {
  const suggestionBatches = useStore((state) => state.suggestionBatches);
  const isProcessing = useStore((state) => state.isProcessing);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [suggestionBatches.length]);

  return (
    <div className="h-full flex flex-col bg-ash shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-maroon/30 bg-oil">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brass">💡 Live Suggestions</h2>
          {isProcessing && (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-brass">
              <Zap className="w-4 h-4" />
            </motion.div>
          )}
        </div>
        {suggestionBatches.length > 0 && (
          <p className="text-xs text-sage mt-1">{suggestionBatches.length} batches • {suggestionBatches.length * 3} suggestions total</p>
        )}
      </div>

      {/* Suggestions Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {suggestionBatches.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sage text-center">
            <p>Record and transcribe to see suggestions...</p>
          </div>
        ) : (
          <>
            {suggestionBatches.map((batch) => (
              <div key={batch.id} className="space-y-2">
                <div className="text-xs text-sage font-semibold px-2">
                  {new Date(batch.timestamp).toLocaleTimeString()}
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {batch.suggestions.map((suggestion, idx) => (
                    <SuggestionCard
                      key={idx}
                      suggestion={suggestion}
                      onSelect={onSuggestionSelect}
                    />
                  ))}
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-maroon/20 to-transparent my-3" />
              </div>
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>
    </div>
  );
}
