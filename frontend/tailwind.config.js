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
          base:     '#09090B',
          surface:  '#111113',
          elevated: '#1C1C1F',
          card:     '#141416',
        },
        border: {
          subtle:  '#27272A',
          default: '#3F3F46',
          bright:  '#52525B',
        },
        accent: {
          green: '#3ECF8E',
          dim:   '#2EBF7E',
          light: 'rgba(62,207,142,0.08)',
          glow:  'rgba(62,207,142,0.15)',
        },
        text: {
          primary:   '#FAFAFA',
          secondary: '#A1A1AA',
          muted:     '#52525B',
          dim:       '#3F3F46',
        },
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        sans:    ['DM Sans', 'sans-serif'],
        mono:    ['DM Mono', 'monospace'],
      },
      boxShadow: {
        glow:      '0 0 32px rgba(62,207,142,0.18), 0 0 8px rgba(62,207,142,0.08)',
        'glow-sm': '0 0 12px rgba(62,207,142,0.12)',
        card:      '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.24)',
        float:     '0 8px 32px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(62,207,142,0.12), transparent)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)',
      },
      animation: {
        'fade-up':    'fadeUp 0.5s ease forwards',
        'fade-in':    'fadeIn 0.4s ease forwards',
        blink:        'blink 1.2s step-end infinite',
        shimmer:      'shimmer 2.5s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
