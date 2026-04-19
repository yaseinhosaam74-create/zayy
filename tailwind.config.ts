import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        paper: 'var(--paper)',
        'paper-soft': 'var(--paper-soft)',
        card: 'var(--card)',
        mid: 'var(--mid)',
        border: 'var(--border)',
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        barlow: ['Barlow Condensed', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;