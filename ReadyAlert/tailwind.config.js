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
        background: '#FAFCFF',
        'background-dark': '#111318',
        surface: '#FAFCFF',
        'surface-dark': '#111318',

        'surface-container': '#ECF0FB',
        'surface-container-dark': '#20232A',

        primary: '#1565C0',
        'primary-dark': '#90CAF9',

        'primary-container': '#D1E4FF',
        'primary-container-dark': '#003A73',

        text: '#1A1B21',
        'text-dark': '#E3E2E9',
        'text-muted': '#44474F',
        'text-muted-dark': '#C5C6D0',

        border: '#C5C6D0',
        'border-dark': '#44474F',
        // Scrim
        overlay: 'rgba(0,0,0,0.32)',
        'overlay-dark': 'rgba(0,0,0,0.48)',
      },
    },
  },
  plugins: [],
  // using class strategy for NativeWind dark mode support
  darkMode: 'class',
};
