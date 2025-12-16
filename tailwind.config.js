/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/index.html",
    "./src/renderer/src/**/*.{js,ts,jsx,tsx}" // This tells it to scan all your React files
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      colors: {
        tokyo: {
          base: '#1a1b26',
          surface: '#24283b',
          highlight: '#414868',
          text: '#a9b1d6',
          dim: '#565f89',
          red: '#f7768e',
          orange: '#ff9e64',
          yellow: '#e0af68',
          green: '#9ece6a',
          cyan: '#7dcfff',
          blue: '#7aa2f7',
          purple: '#bb9af7',
        }
      },
      gridTemplateColumns: {
        'dashboard': '2fr 1fr',
      }
    },
  },
  plugins: [],
}