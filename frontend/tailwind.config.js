/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#09090B',
          surface: '#111113',
          elevated: '#1C1C1F',
        },
        border: {
          subtle: '#27272A',
          default: '#3F3F46',
        },
        accent: {
          green: '#3ECF8E',
          dim: '#2EBF7E',
          light: 'rgba(62,207,142,0.08)',
        },
        text: {
          primary: '#FAFAFA',
          secondary: '#A1A1AA',
          muted: '#52525B',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(62,207,142,0.15)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        blink: 'blink 1.2s step-end infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
