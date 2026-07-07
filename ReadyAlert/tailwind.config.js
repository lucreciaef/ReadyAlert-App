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
      fontFamily: {
        sans: ['RobotoFlex_400Regular'],
      },
      colors: {
        // Surfaces
        background: '#FFFFFF',
        'background-dark': '#181112',
        surface: '#FFFFFF',
        'surface-dark': '#181112',
        'surface-container': '#FAFAFA',
        'surface-container-dark': '#2A2020',

        // Primary
        primary: '#D20A2E',
        'primary-dark': '#FA92A5',
        'primary-container': '#FBAFBC',
        'primary-container-dark': '#B94662',
        'on-primary': '#FFFFFF',
        'on-primary-dark': '#2A0A0F',
        // Text (On-Surface)
        text: '#1C1B1F',
        'text-dark': '#F3F0F0',
        'text-muted': '#6B6F76',
        'text-muted-dark': '#C5C6D0',

        // Borders
        border: '#1C1B1F',
        'border-dark': '#E4E2E9',
        outline: '#1C1B1F',
        'outline-dark': '#E4E2E9',

        // Scrim / Overlay
        overlay: 'rgba(0,0,0,0.32)',
        'overlay-dark': 'rgba(0,0,0,0.48)',

        // Semantic
        warning: '#F59E0B',
        'warning-dark': '#FFB74D',
        'warning-muted': '#FFFBEB',
        'warning-muted-dark': 'rgba(255,183,77,0.10)',
        'warning-border': '#FDE68A',
        'warning-border-dark': 'rgba(255,183,77,0.28)',
        success: '#4CAF50',
        'success-dark': '#81C784',
        'success-muted': '#F1F8F1',
        'success-muted-dark': 'rgba(129,199,132,0.10)',
        'success-on': '#2E7D32',
        'success-on-dark': '#A5D6A7',
        error: '#e35f62',
        'error-dark': '#e69597',
        'error-container': '#F9DEDC',
        'error-container-dark': '#93000A',

        // Alert / warning card
        'alert-bg': '#FFF8F7',
        'alert-bg-dark': 'rgba(239,83,80,0.08)',
        'alert-border': 'rgba(229,115,115,0.50)',
        'alert-border-dark': 'rgba(239,83,80,0.30)',
        'alert-divider': 'rgba(229,115,115,0.30)',
        'alert-divider-dark': 'rgba(239,83,80,0.20)',
        'alert-accent': '#ef9850',
        'alert-text': '#b76a1c',
        'alert-text-dark': '#efca9a',

        // Inverse surface (Toast / Snackbar)
        'inverse-surface': '#2E3037',
        'inverse-on-surface': '#E4E2E9',

        // AQI scale
        'aqi-good': '#4CAF50',
        'aqi-good-dark': '#81C784',
        'aqi-fair': '#A8D08D',
        'aqi-fair-dark': '#A5D6A7',
        'aqi-moderate': '#F59E0B',
        'aqi-moderate-dark': '#FFB74D',
        'aqi-poor': '#FF7043',
        'aqi-poor-dark': '#FF8A65',
        'aqi-very-poor': '#EF4444',
        'aqi-very-poor-dark': '#EF9A9A',
        'aqi-extreme': '#7B1FA2',
        'aqi-extreme-dark': '#CE93D8',
        'aqi-level-yellow': '#F59E0B',
        'aqi-level-yellow-dark': '#FFB74D',
        'aqi-level-red': '#EF4444',
        'aqi-level-red-dark': '#EF9A9A',
      },
    },
  },
  plugins: [],
  // using class strategy for NativeWind dark mode support
  darkMode: 'class',
};
