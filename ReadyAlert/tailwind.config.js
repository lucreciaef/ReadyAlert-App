/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./index.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#f4f6f8',
        'background-dark': '#1a1a1a',
        surface: '#ffffff',
        'surface-dark': '#2d2d2d',
        primary: '#007AFF',
        'primary-dark': '#0a84ff',
        text: '#222222',
        'text-dark': '#f5f5f5',
        'text-muted': '#555555',
        'text-muted-dark': '#9a9a9a',
        border: '#dddddd',
        'border-dark': '#444444',
        overlay: 'rgba(0, 0, 0, 0.35)',
        'overlay-dark': 'rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
  // Use class strategy for NativeWind dark mode support
  darkMode: 'class',
};

