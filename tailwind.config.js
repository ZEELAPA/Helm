/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/index.html",
    "./src/renderer/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      colors: {
        tokyo: {
          // This allows opacity like 'bg-tokyo-base/50' to work
          base: 'rgb(var(--bg-base) / <alpha-value>)',
          surface: 'rgb(var(--bg-surface) / <alpha-value>)',
          highlight: 'rgb(var(--bg-highlight) / <alpha-value>)',
          text: 'rgb(var(--text-main) / <alpha-value>)',
          dim: 'rgb(var(--text-dim) / <alpha-value>)',
          
          red: 'rgb(var(--color-red) / <alpha-value>)',
          orange: 'rgb(var(--color-orange) / <alpha-value>)',
          yellow: 'rgb(var(--color-yellow) / <alpha-value>)',
          green: 'rgb(var(--color-green) / <alpha-value>)',
          cyan: 'rgb(var(--color-cyan) / <alpha-value>)',
          blue: 'rgb(var(--color-blue) / <alpha-value>)',
          purple: 'rgb(var(--color-purple) / <alpha-value>)',
          magenta: 'rgb(var(--color-magenta) / <alpha-value>)',
          teal: 'rgb(var(--color-teal) / <alpha-value>)',
        }
      }
    },
  },
  plugins: [],
}