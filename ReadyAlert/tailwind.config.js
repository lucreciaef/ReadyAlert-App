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
        surface: '#ffffff',
        primary: '#007AFF',
        text: '#222222',
        'text-muted': '#555555',
        border: '#dddddd',
        overlay: 'rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [],
};

