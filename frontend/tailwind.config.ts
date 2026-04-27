import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-base': '#080C14',
        'bg-surface': '#0D1321',
        'bg-elevated': '#131B2E',
        'bg-subtle': '#1A2440',
        'brand-primary': '#00C896',
        'brand-secondary': '#0EA5E9',
        'text-primary': '#F0F4FF',
        'text-secondary': '#8B9CBB',
        'text-muted': '#4A5A7A',
        'risk-high': '#EF4444',
        'risk-medium': '#F59E0B',
        'risk-low': '#00C896',
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body: ['Geist', '"Helvetica Neue"', 'sans-serif'],
        mono: ['"DM Mono"', '"Courier New"', 'monospace'],
      },
      borderRadius: {
        card: '12px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
