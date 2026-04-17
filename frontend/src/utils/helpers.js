// Format time string for display
export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString();
};

// Format duration in seconds
export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

// Truncate text with ellipsis
export const truncate = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Download data as file
export const downloadFile = (data, filename, type = 'application/json') => {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

// Check if API key is valid format
export const isValidGroqKey = (key) => {
  return key && key.startsWith('gsk_') && key.length > 20;
};

// Get transcript text from chunks
export const getTranscriptText = (chunks) => {
  return chunks.map(c => c.text).join(' ');
};

// Debounce function
export const debounce = (fn, delay) => {
  let timeoutId;
  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};
