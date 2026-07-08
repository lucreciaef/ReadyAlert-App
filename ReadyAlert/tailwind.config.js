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
        'background-dark': '#110c0d',
        surface: '#FFFFFF',
        'surface-dark': '#110c0d',
        'surface-alt': '#FAFAFA',
        'surface-alt-dark': '#171111',

        // Primary (brand — unchanged, reserved for important accents only)
        primary: '#D2042D',
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

        // Borders — outline = strong/emphasized (cards, buttons, inputs),
        // divider = subtle (list separators)
        outline: '#1C1B1F',
        'outline-dark': '#E4E2E9',
        divider: '#E2E2E6',
        'divider-dark': '#3A3A3A',

        // Scrim / Overlay
        overlay: 'rgba(0,0,0,0.32)',
        'overlay-dark': 'rgba(0,0,0,0.48)',

        // Status: info — reused for informational alerts across weather/disaster components
        info: '#2563EB',
        'info-dark': '#60A5FA',
        'info-container': '#DBEAFE',
        'info-container-dark': 'rgba(96,165,250,0.10)',
        'info-border': '#93C5FD',
        'info-border-dark': 'rgba(96,165,250,0.28)',
        'info-on-container': '#1E3A8A',
        'info-on-container-dark': '#93C5FD',

        // Status: success
        success: '#4CAF50',
        'success-dark': '#81C784',
        'success-container': '#E8F5E9',
        'success-container-dark': 'rgba(129,199,132,0.10)',
        'success-border': '#A5D6A7',
        'success-border-dark': 'rgba(129,199,132,0.28)',
        'success-on-container': '#1B5E20',
        'success-on-container-dark': '#A5D6A7',

        // Status: warning — also covers weather warning cards
        warning: '#F59E0B',
        'warning-dark': '#FFB74D',
        'warning-container': '#FEF3C7',
        'warning-container-dark': 'rgba(255,183,77,0.10)',
        'warning-border': '#FDE68A',
        'warning-border-dark': 'rgba(255,183,77,0.28)',
        'warning-on-container': '#92400E',
        'warning-on-container-dark': '#FFD180',

        // Status: error — distinct hue from primary (orange-red vs. crimson-rose)
        error: '#DC2626',
        'error-dark': '#F87171',
        'error-container': '#FEE2E2',
        'error-container-dark': 'rgba(248,113,113,0.10)',
        'error-border': '#FCA5A5',
        'error-border-dark': 'rgba(248,113,113,0.28)',
        'error-on-container': '#7F1D1D',
        'error-on-container-dark': '#FCA5A5',

        // Status: critical — worst tier only (hazardous AQI, emergency-level alerts)
        critical: '#9333EA',
        'critical-dark': '#C084FC',
        'critical-container': '#F3E8FF',
        'critical-container-dark': 'rgba(192,132,252,0.10)',
        'critical-border': '#D8B4FE',
        'critical-border-dark': 'rgba(192,132,252,0.28)',
        'critical-on-container': '#581C87',
        'critical-on-container-dark': '#E9D5FF',

        // Inverse surface (Toast / Snackbar)
        'inverse-surface': '#2E3037',
        'inverse-on-surface': '#E4E2E9',
      },
    },
  },
  plugins: [],
  // using class strategy for NativeWind dark mode support
  darkMode: 'class',
};
