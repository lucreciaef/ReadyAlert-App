/**
 * Material Design 3 colour palette.
 * Returns hex or rgba colour values for style props based on the current theme (dark or light).
 */

export function getThemeColors(isDark: boolean) {
  if (isDark) {
    return {
      // Surfaces
      background: '#111318',
      surface: '#111318',
      surfaceContainer: '#20232A',
      // Primary
      primary: '#90CAF9',
      primaryContainer: '#003A73',
      onPrimary: '#003063',
      // Text (On-Surface)
      text: '#E3E2E9',
      textMuted: '#C5C6D0',
      // Borders
      border: '#44474F',
      outline: '#8D9199',
      // Utility
      overlay: 'rgba(0,0,0,0.48)',
      ripple: 'rgba(144,202,249,0.12)',
      rippleOnPrimary: 'rgba(255,255,255,0.16)',
      // Semantic
      error: '#FFB4AB',
      errorContainer: '#93000A',
    };
  }

  return {
    // Surfaces
    background: '#FAFCFF',
    surface: '#FAFCFF',
    surfaceContainer: '#ECF0FB',
    // Primary
    primary: '#1565C0',
    primaryContainer: '#D1E4FF',
    onPrimary: '#FFFFFF',
    // Text (On-Surface)
    text: '#1A1B21',
    textMuted: '#44474F',
    // Borders
    border: '#C5C6D0',
    outline: '#73777F',
    // Utility
    overlay: 'rgba(0,0,0,0.32)',
    ripple: 'rgba(21,101,192,0.12)',
    rippleOnPrimary: 'rgba(255,255,255,0.16)',
    // Semantic
    error: '#B3261E',
    errorContainer: '#F9DEDC',
  };
}