import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/appStore';

export function TranscriptPanel() {
  const transcriptChunks = useStore((state) => state.transcriptChunks);
  const isRecording = useStore((state) => state.isRecording);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptChunks]);

  return (
    <div className="h-full flex flex-col bg-ash shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-maroon/30 bg-oil">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brass">📝 Transcript</h2>
          {isRecording && (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 rounded">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              <span className="text-xs text-red-400">Recording</span>
            </div>
          )}
        </div>
        {transcriptChunks.length > 0 && (
          <p className="text-xs text-sage mt-1">{transcriptChunks.length} chunks • {Math.round(transcriptChunks.map(c => c.text.length).reduce((a, b) => a + b, 0) / 10)} words</p>
        )}
      </div>

      {/* Transcript Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {transcriptChunks.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sage text-center">
            <p>Start recording to see transcript...</p>
          </div>
        ) : (
          <>
            {transcriptChunks.map((chunk, idx) => (
              <div key={chunk.id} className="animate-slideInLeft">
                <div className="text-xs text-sage mb-1">
                  {new Date(chunk.timestamp).toLocaleTimeString()}
                </div>
                <p className="text-sm leading-relaxed text-gray-100 bg-oil/50 p-3 rounded border border-maroon/20 glow-br">
                  {chunk.text}
                </p>
              </div>
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-oil border-t border-maroon/30 text-xs text-sage">
        {transcriptChunks.length > 0 && (
          <p>Latest: {new Date(transcriptChunks[transcriptChunks.length - 1].timestamp).toLocaleTimeString()}</p>
        )}
      </div>
    </div>
  );
}
