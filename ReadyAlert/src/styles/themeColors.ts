/**
 * Runtime colour palette keyed on the current dark-mode state.
 * Returns hex colour values for use in style props where a Tailwind class is insufficient, such as Ionicons colour attributes.
 */

export function getThemeColors(isDark: boolean) {
  if (isDark) {
    return {
      background: '#1a1a1a',
      surface: '#2d2d2d',
      primary: '#0a84ff',
      text: '#f5f5f5',
      textMuted: '#9a9a9a',
      border: '#444444',
      overlay: 'rgba(0, 0, 0, 0.6)',
    };
  }

  return {
    background: '#f4f6f8',
    surface: '#ffffff',
    primary: '#007AFF',
    text: '#222222',
    textMuted: '#555555',
    border: '#dddddd',
    overlay: 'rgba(0, 0, 0, 0.35)',
  };
}

export const colors = getThemeColors(false);
