/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'oil': '#0a0a0a',
        'ash': '#2a2a2a',
        'maroon': '#4a2c2a',
        'brass': '#b8860b',
        'brass-light': '#ffd700',
        'sage': '#93a29b'
      }
    }
  },
  plugins: []
}
