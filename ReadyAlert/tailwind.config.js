/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './index.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // ── MD3 Background & Surface ──────────────────────────────────
        background: '#FAFCFF',
        'background-dark': '#111318',
        surface: '#FAFCFF',
        'surface-dark': '#1A1C22',
        // Surface Container – used for Navigation Bar & bottom sheet headers
        'surface-container': '#ECF0FB',
        'surface-container-dark': '#20232A',
        // ── MD3 Primary ───────────────────────────────────────────────
        primary: '#1565C0',
        'primary-dark': '#90CAF9',
        // Primary Container – used for active Navigation Bar indicator
        'primary-container': '#D1E4FF',
        'primary-container-dark': '#003A73',
        // ── MD3 Typography ────────────────────────────────────────────
        text: '#1A1B21',
        'text-dark': '#E3E2E9',
        'text-muted': '#44474F',
        'text-muted-dark': '#C5C6D0',
        // ── MD3 Borders / Outline ─────────────────────────────────────
        border: '#C5C6D0',
        'border-dark': '#44474F',
        // ── MD3 Scrim ─────────────────────────────────────────────────
        overlay: 'rgba(0,0,0,0.32)',
        'overlay-dark': 'rgba(0,0,0,0.48)',
      },
    },
  },
  plugins: [],
  // using class strategy for NativeWind dark mode support
  darkMode: 'class',
};
