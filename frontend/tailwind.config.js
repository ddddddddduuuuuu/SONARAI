/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          dark: '#1d4ed8',
          light: '#60a5fa',
        },
        secondary: {
          DEFAULT: '#10b981',
          dark: '#059669',
          light: '#34d399',
        },
        background: {
          DEFAULT: '#0f172a',
          light: '#1e293b',
          dark: '#020617',
        },
        card: {
          DEFAULT: '#1e293b',
          light: '#334155',
          dark: '#0f172a',
        },
        accent: {
          DEFAULT: '#f97316',
          dark: '#ea580c',
          light: '#fb923c',
        },
        text: {
          DEFAULT: '#f8fafc',
          muted: '#94a3b8',
          dark: '#64748b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sonar-ping': 'sonar-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        'sonar-ping': {
          '0%': { transform: 'scale(0.95)', opacity: '1' },
          '75%, 100%': { transform: 'scale(1.2)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
} 