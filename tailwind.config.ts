import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        'eco-green': {
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          neon: '#00FF87',
        },
        'sky-blue': {
          400: '#38BDF8',
          neon: '#00D4FF',
        },
        gold: {
          400: '#FACC15',
          500: '#EAB308',
          bright: '#FFD700',
        },
        'carbon-red': {
          400: '#F87171',
          500: '#EF4444',
          bright: '#FF4757',
        },
        earth: {
          800: '#1C1917',
          900: '#0C0A09',
        },
        glass: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          light: 'rgba(255,255,255,0.12)',
          dark: 'rgba(0,0,0,0.3)',
        },
      },
      backdropBlur: {
        xl: '24px',
        '2xl': '40px',
      },
      borderRadius: {
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      backgroundImage: {
        'gradient-eco': 'linear-gradient(135deg, #00FF87 0%, #00D4FF 100%)',
        'gradient-dark': 'linear-gradient(135deg, #050d0a 0%, #0a1a12 50%, #050d0a 100%)',
        'gradient-gold': 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #00FF87, 0 0 10px #00FF87' },
          '100%': { boxShadow: '0 0 20px #00FF87, 0 0 40px #00FF87, 0 0 80px #00FF87' },
        },
      },
      boxShadow: {
        'eco-glow': '0 0 20px rgba(0, 255, 135, 0.4)',
        'eco-glow-strong': '0 0 40px rgba(0, 255, 135, 0.6)',
        'red-glow': '0 0 20px rgba(255, 71, 87, 0.4)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'glass-strong': '0 12px 48px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}

export default config
