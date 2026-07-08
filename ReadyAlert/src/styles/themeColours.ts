/**
 * Material Design 3 colour palette.
 * Returns hex or rgba colour values for style props based on the current theme (dark or light).
 */

export function getThemeColours(isDark: boolean) {
  if (isDark) {
    return {
      // Surfaces
      background: '#110c0d',
      surface: '#110c0d',
      surfaceAlt: '#171111',
      // Text (On-Surface)
      text: '#F3F0F0',
      textMuted: '#C5C6D0',
      // Borders
      outline: '#E4E2E9',
      divider: '#3A3A3A',
      // Utility
      shadow: '#000000',
      overlay: 'rgba(0,0,0,0.48)',
      ripple: 'rgba(144,202,249,0.12)',
      rippleOnPrimary: 'rgba(255,255,255,0.16)',

      // Primary
      primary: '#FA92A5',
      primaryContainer: '#B94662',
      onPrimary: '#2A0A0F',

      // Status: info
      info: '#60A5FA',
      infoContainer: 'rgba(96,165,250,0.10)',
      infoBorder: 'rgba(96,165,250,0.28)',
      infoOnContainer: '#93C5FD',

      // Status: success
      success: '#81C784',
      successContainer: 'rgba(129,199,132,0.10)',
      successBorder: 'rgba(129,199,132,0.28)',
      successOnContainer: '#A5D6A7',

      // Status: warning
      warning: '#FFB74D',
      warningContainer: 'rgba(255,183,77,0.10)',
      warningBorder: 'rgba(255,183,77,0.28)',
      warningOnContainer: '#FFD180',

      // Status: error
      error: '#F87171',
      errorContainer: 'rgba(248,113,113,0.10)',
      errorBorder: 'rgba(248,113,113,0.28)',
      errorOnContainer: '#FCA5A5',

      // Status: critical
      critical: '#C084FC',
      criticalContainer: 'rgba(192,132,252,0.10)',
      criticalBorder: 'rgba(192,132,252,0.28)',
      criticalOnContainer: '#E9D5FF',

      // Inverse surface (Toast / Snackbar)
      inverseSurface: '#2E3037',
      inverseOnSurface: '#E4E2E9',
    };
  }

  return {
    // Surfaces
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceAlt: '#FAFAFA',
    // Text (On-Surface)
    text: '#1C1B1F',
    textMuted: '#6B6F76',
    // Borders
    outline: '#1C1B1F',
    divider: '#E2E2E6',
    // Utility
    shadow: '#000000',
    overlay: 'rgba(0,0,0,0.32)',
    ripple: 'rgba(21,101,192,0.12)',
    rippleOnPrimary: 'rgba(255,255,255,0.16)',

    // Primary
    primary: '#D2042D',
    primaryContainer: '#FBAFBC',
    onPrimary: '#FFFFFF',

    // Status: info
    info: '#2563EB',
    infoContainer: '#DBEAFE',
    infoBorder: '#93C5FD',
    infoOnContainer: '#1E3A8A',

    // Status: success
    success: '#4CAF50',
    successContainer: '#E8F5E9',
    successBorder: '#A5D6A7',
    successOnContainer: '#1B5E20',

    // Status: warning
    warning: '#F59E0B',
    warningContainer: '#FEF3C7',
    warningBorder: '#FDE68A',
    warningOnContainer: '#92400E',

    // Status: error
    error: '#DC2626',
    errorContainer: '#FEE2E2',
    errorBorder: '#FCA5A5',
    errorOnContainer: '#7F1D1D',

    // Status: critical
    critical: '#9333EA',
    criticalContainer: '#F3E8FF',
    criticalBorder: '#D8B4FE',
    criticalOnContainer: '#581C87',

    // Inverse surface (Toast / Snackbar)
    inverseSurface: '#2E3037',
    inverseOnSurface: '#E4E2E9',
  };
}
