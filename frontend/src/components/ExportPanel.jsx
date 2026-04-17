import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/appStore';
import { Download, Copy, CheckCircle } from 'lucide-react';

export function ExportPanel() {
  const transcriptChunks = useStore((state) => state.transcriptChunks);
  const suggestionBatches = useStore((state) => state.suggestionBatches);
  const chatMessages = useStore((state) => state.chatMessages);

  const [copyFeedback, setCopyFeedback] = useState('');
  const [exportFeedback, setExportFeedback] = useState('');

  const handleExport = () => {
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        session: {
          duration: transcriptChunks.length > 0 ? 
            (new Date(transcriptChunks[transcriptChunks.length - 1].timestamp) - new Date(transcriptChunks[0].timestamp)) / 1000 
            : 0,
          transcriptChunks: transcriptChunks.length,
          suggestionBatches: suggestionBatches.length,
          totalSuggestions: suggestionBatches.length * 3,
          chatMessages: chatMessages.length
        },
        transcript: transcriptChunks.map(chunk => ({
          timestamp: chunk.timestamp,
          text: chunk.text
        })),
        suggestions: suggestionBatches.map(batch => ({
          timestamp: batch.timestamp,
          suggestions: batch.suggestions
        })),
        chat: chatMessages.map(msg => ({
          timestamp: msg.timestamp,
          role: msg.role,
          content: msg.content
        }))
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `twinmind-session-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportFeedback('✅ Session exported successfully');
      setTimeout(() => setExportFeedback(''), 2000);
    } catch (error) {
      setExportFeedback('❌ Export failed: ' + error.message);
      setTimeout(() => setExportFeedback(''), 3000);
    }
  };

  const handleCopyJson = async () => {
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        session: {
          duration: transcriptChunks.length > 0 ? 
            (new Date(transcriptChunks[transcriptChunks.length - 1].timestamp) - new Date(transcriptChunks[0].timestamp)) / 1000 
            : 0,
          transcriptChunks: transcriptChunks.length,
          suggestionBatches: suggestionBatches.length,
          totalSuggestions: suggestionBatches.length * 3,
          chatMessages: chatMessages.length
        },
        transcript: transcriptChunks,
        suggestions: suggestionBatches,
        chat: chatMessages
      };

      await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
      setCopyFeedback('✅ Copied to clipboard');
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch (error) {
      setCopyFeedback('❌ Copy failed: ' + error.message);
      setTimeout(() => setCopyFeedback(''), 3000);
    }
  };

  const hasData = transcriptChunks.length > 0 || chatMessages.length > 0;

  return (
    <div className="flex gap-2 items-center relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleExport}
        disabled={!hasData}
        className="px-4 py-3 bg-gradient-to-r from-brass to-brass/80 text-oil rounded-lg font-semibold text-sm hover:from-brass/90 hover:to-brass/70 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
      >
        <Download className="w-4 h-4" />
        Export JSON
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCopyJson}
        disabled={!hasData}
        className="px-4 py-3 bg-ash/50 border border-maroon/40 text-sage rounded-lg font-semibold text-sm hover:text-brass hover:border-brass/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 backdrop-blur-sm"
      >
        <Copy className="w-4 h-4" />
        Copy
      </motion.button>

      {/* Feedback Messages */}
      {exportFeedback && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="absolute bottom-full left-0 mb-2 px-3 py-1 bg-green-900/80 border border-green-500/50 text-green-300 text-xs rounded whitespace-nowrap flex items-center gap-1"
        >
          <CheckCircle className="w-3 h-3" />
          {exportFeedback}
        </motion.div>
      )}

      {copyFeedback && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="absolute bottom-full left-12 mb-2 px-3 py-1 bg-green-900/80 border border-green-500/50 text-green-300 text-xs rounded whitespace-nowrap flex items-center gap-1"
        >
          <CheckCircle className="w-3 h-3" />
          {copyFeedback}
        </motion.div>
      )}
    </div>
  );
}
