/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#060913",
          900: "#0B101F",
          850: "#0F162B",
          800: "#141D38",
          750: "#1A2547",
          700: "#22305C",
          600: "#324378"
        },
        lavender: {
          50: "#FAF5FF",
          100: "#F3E8FF",
          200: "#E9D5FF",
          300: "#D8B4FE",
          400: "#C084FC",
          500: "#A855F7",
          600: "#9333EA",
          700: "#7E22CE"
        },
        violet: {
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9"
        },
        cyan: {
          400: "#38BDF8",
          500: "#0EA5E9"
        }
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "'Inter'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      boxShadow: {
        'glow-sm': '0 0 20px -5px rgba(139, 92, 246, 0.25)',
        'glow-md': '0 0 35px -5px rgba(139, 92, 246, 0.35)',
        'glow-cyan': '0 0 30px -5px rgba(56, 189, 248, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave-bar': 'waveBar 1.2s ease-in-out infinite alternate',
      },
      keyframes: {
        waveBar: {
          '0%': { height: '15%' },
          '100%': { height: '100%' },
        }
      }
    },
  },
  plugins: [],
}
