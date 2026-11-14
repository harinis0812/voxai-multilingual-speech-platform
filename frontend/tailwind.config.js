/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#050312",
          card: "rgba(35, 20, 65, 0.45)",
          cardHover: "rgba(50, 30, 90, 0.65)",
          border: "rgba(168, 85, 247, 0.22)",
          borderGlow: "rgba(168, 85, 247, 0.55)",
          surface: "#0B0720",
          surfaceLighter: "#140D36",
        },
        navy: {
          950: "#050312",
          900: "#0B081E",
          850: "#110D2C",
          800: "#18133D",
          750: "#221C52",
          700: "#2E266B",
          600: "#3E348C"
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
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9"
        },
        fuchsia: {
          400: "#E879F9",
          500: "#D946EF",
          600: "#C026D3"
        },
        cyan: {
          400: "#38BDF8",
          500: "#0EA5E9"
        }
      },
      fontFamily: {
        sans: [
          "'Inter'",
          "'Plus Jakarta Sans'",
          "'Noto Sans Devanagari'",
          "'Noto Sans Tamil'",
          "'Noto Sans Malayalam'",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif"
        ],
        indic: [
          "'Noto Sans Devanagari'",
          "'Noto Sans Tamil'",
          "'Noto Sans Malayalam'",
          "'Inter'",
          "sans-serif"
        ]
      },
      boxShadow: {
        'glow-sm': '0 0 20px -3px rgba(168, 85, 247, 0.35)',
        'glow-md': '0 0 35px -2px rgba(168, 85, 247, 0.5)',
        'glow-lg': '0 0 55px 0px rgba(168, 85, 247, 0.65)',
        'glow-cyan': '0 0 30px -5px rgba(56, 189, 248, 0.35)',
        'glass': '0 8px 32px 0 rgba(5, 3, 18, 0.65)',
        'orb': '0 0 60px rgba(168, 85, 247, 0.55), inset 0 0 40px rgba(192, 132, 252, 0.35)'
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave-bar': 'waveBar 1.2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'breathe': 'breathe 6s ease-in-out infinite',
        'spin-slow': 'spin 30s linear infinite',
        'spin-reverse': 'spinReverse 25s linear infinite',
      },
      keyframes: {
        waveBar: {
          '0%': { transform: 'scaleY(0.2)' },
          '50%': { transform: 'scaleY(1.0)' },
          '100%': { transform: 'scaleY(0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '0.95', transform: 'scale(1.04)' },
        },
        spinReverse: {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        }
      }
    },
  },
  plugins: [],
}
