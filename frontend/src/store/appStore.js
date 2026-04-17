import { create } from 'zustand';

export const useStore = create((set) => ({
  // API Configuration
  apiKey: localStorage.getItem('groqApiKey') || '',
  setApiKey: (key) => {
    localStorage.setItem('groqApiKey', key);
    set({ apiKey: key });
  },

  // UI State
  isRecording: false,
  setIsRecording: (recording) => set({ isRecording: recording }),

  // Transcript State
  transcriptChunks: [],
  addTranscriptChunk: (chunk) => set((state) => ({
    transcriptChunks: [...state.transcriptChunks, {
      id: Date.now(),
      text: chunk,
      timestamp: new Date().toISOString()
    }]
  })),
  clearTranscript: () => set({ transcriptChunks: [] }),

  // Suggestions State
  suggestionBatches: [],
  addSuggestionBatch: (suggestions) => set((state) => ({
    suggestionBatches: [
      {
        id: Date.now(),
        suggestions,
        timestamp: new Date().toISOString()
      },
      ...state.suggestionBatches
    ]
  })),
  clearSuggestions: () => set({ suggestionBatches: [] }),

  // Chat State
  chatMessages: [],
  addChatMessage: (message) => set((state) => ({
    chatMessages: [...state.chatMessages, {
      id: Date.now(),
      ...message,
      timestamp: new Date().toISOString()
    }]
  })),
  clearChat: () => set({ chatMessages: [] }),

  // Settings
  suggestionPrompt: localStorage.getItem('suggestionPrompt') || '',
  setSuggestionPrompt: (prompt) => {
    localStorage.setItem('suggestionPrompt', prompt);
    set({ suggestionPrompt: prompt });
  },

  chatPrompt: localStorage.getItem('chatPrompt') || '',
  setChatPrompt: (prompt) => {
    localStorage.setItem('chatPrompt', prompt);
    set({ chatPrompt: prompt });
  },

  contextWindow: parseInt(localStorage.getItem('contextWindow') || '2000'),
  setContextWindow: (size) => {
    localStorage.setItem('contextWindow', size.toString());
    set({ contextWindow: size });
  },

  // Export data
  exportSession: () => {
    return {
      exportedAt: new Date().toISOString(),
      transcript: (state) => state.transcriptChunks,
      suggestions: (state) => state.suggestionBatches,
      chat: (state) => state.chatMessages
    };
  }
}));
