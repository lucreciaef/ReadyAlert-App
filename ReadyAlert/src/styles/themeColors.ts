/**
 * Material Design 3 colour palette.
 * Returns hex or rgba colour values for style props based on the current theme (dark or light).
 */

export function getThemeColors(isDark: boolean) {
  if (isDark) {
    return {
      // Surfaces
      background: '#181112',
      surface: '#181112',
      surfaceContainer: '#2a2020',
      // Primary
      primary: '#FA92A5',
      primaryContainer: '#B94662',
      onPrimary: '#BB0929',
      // Text (On-Surface)
      text: '#C5C6D0',
      textMuted: '#C5C6D0',
      // Borders
      border: '#44474F',
      outline: '#8D9199',
      // Utility
      shadow: '#000000',
      overlay: 'rgba(0,0,0,0.48)',
      ripple: 'rgba(144,202,249,0.12)',
      rippleOnPrimary: 'rgba(255,255,255,0.16)',
      // Semantic
      error: '#FFB4AB',
      errorContainer: '#93000A',
      warning: '#FFB74D',
      warningMuted: 'rgba(255,183,77,0.10)',
      warningBorder: 'rgba(255,183,77,0.28)',
      success: '#81C784',
      successMuted: 'rgba(129,199,132,0.10)',
      successOn: '#A5D6A7',
      // Alert / warning card (orange-toned weather warnings)
      alertBg: 'rgba(239,83,80,0.08)',
      alertBorder: 'rgba(239,83,80,0.30)',
      alertDivider: 'rgba(239,83,80,0.20)',
      alertAccent: '#ef9850',
      alertText: '#efca9a',
      // Inverse surface (Toast / Snackbar)
      inverseSurface: '#2E3037',
      inverseOnSurface: '#E4E2E9',
      // Preparedness levels
      prepNotStarted: '#9CA3AF',
      prepUnprepared: '#EF4444',
      prepGettingReady: '#F97316',
      prepPrepared: '#F59E0B',
      prepWellPrepared: '#3B82F6',
      prepFullyPrepared: '#22C55E',
      // AQI scale colours (dark)
      aqiGood: '#81C784',
      aqiFair: '#A5D6A7',
      aqiModerate: '#FFB74D',
      aqiPoor: '#FF8A65',
      aqiVeryPoor: '#EF9A9A',
      aqiExtreme: '#CE93D8',
      aqiLevelYellow: '#FFB74D',
      aqiLevelRed: '#EF9A9A',
    };
  }

  return {
    // Surfaces
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceContainer: '#fffafa',
    // Primary
    primary: '#e31238',
    primaryContainer: '#FBAFBC',
    onPrimary: '#FFFFFF',
    // Text (On-Surface)
    text: '#44474F',
    textMuted: '#44474F',
    // Borders
    border: '#C5C6D0',
    outline: '#73777F',
    // Utility
    shadow: '#000000',
    overlay: 'rgba(0,0,0,0.32)',
    ripple: 'rgba(21,101,192,0.12)',
    rippleOnPrimary: 'rgba(255,255,255,0.16)',
    // Semantic
    error: '#a61a11',
    errorContainer: '#F9DEDC',
    warning: '#F59E0B',
    warningMuted: '#FFFBEB',
    warningBorder: '#FDE68A',
    success: '#4CAF50',
    successMuted: '#F1F8F1',
    successOn: '#2E7D32',
    // Alert / warning card (orange-toned weather warnings)
    alertBg: '#FFF8F7',
    alertBorder: 'rgba(229,115,115,0.50)',
    alertDivider: 'rgba(229,115,115,0.30)',
    alertAccent: '#ef9850',
    alertText: '#b76a1c',
    // Inverse surface (Toast / Snackbar)
    inverseSurface: '#2E3037',
    inverseOnSurface: '#E4E2E9',
    // Preparedness levels
    prepNotStarted: '#9CA3AF',
    prepUnprepared: '#EF4444',
    prepGettingReady: '#F97316',
    prepPrepared: '#F59E0B',
    prepWellPrepared: '#3B82F6',
    prepFullyPrepared: '#22C55E',
    // AQI scale colours (light)
    aqiGood: '#4CAF50',
    aqiFair: '#A8D08D',
    aqiModerate: '#F59E0B',
    aqiPoor: '#FF7043',
    aqiVeryPoor: '#EF4444',
    aqiExtreme: '#7B1FA2',
    aqiLevelYellow: '#F59E0B',
    aqiLevelRed: '#EF4444',
  };
}