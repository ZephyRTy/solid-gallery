/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,tsx,ts}', './src/*.{html,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          violet: '#8b5cf6',
          amber: '#f59e0b',
          rose: '#f43f5e',
          emerald: '#10b981',
          cyan: '#06b6d4',
        },
      },
      fontFamily: {
        display: ['"Noto Serif SC"', 'Georgia', 'serif'],
        body: ['"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pop': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.12)' },
          '100%': { transform: 'scale(1)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-2px)' },
          '75%': { transform: 'translateX(2px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'progress-shrink': {
          '0%': { transform: 'scaleX(1)' },
          '100%': { transform: 'scaleX(0)' },
        },
        'breathing': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'slide-out-right': 'slide-out-right 0.2s ease-in forwards',
        'slide-up': 'slide-up 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'scale-in': 'scale-in 0.25s ease-out forwards',
        'pop': 'pop 0.3s ease-out',
        'shake': 'shake 0.3s ease-in-out',
        'shimmer': 'shimmer 1.5s linear infinite',
        'progress-shrink': 'progress-shrink 3s linear forwards',
        'breathing': 'breathing 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'bounce-sm': 'cubic-bezier(0.34,1.56,0.64,1)',
      },
      borderWidth: {
        '1': '1px',
      },
      zIndex: {
        'overlay': 1000,
        'modal': 2000,
        'toast': 3000,
        'max': 9999,
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      opacity: {
        '15': '0.15',
      },
    },
  },
  plugins: [],
};
