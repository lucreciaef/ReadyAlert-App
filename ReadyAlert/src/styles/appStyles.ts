export const getLayoutStyles = (isDark: boolean) => ({
  safeArea: `flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`,
  app: 'flex-1 relative',
  content: 'flex-1 p-5 pt-16',
});

export const getTypographyStyles = (isDark: boolean) => ({
  title: `text-3xl font-bold mb-5 ${isDark ? 'text-text-dark' : 'text-text'}`,
  cardTitle: `text-xl font-bold mb-2 ${isDark ? 'text-text-dark' : 'text-text'}`,
  cardText: `text-base ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`,
});

export const getCardStyles = (isDark: boolean) => {
  const typography = getTypographyStyles(isDark);
  return {
    container: `${isDark ? 'bg-surface-dark' : 'bg-surface'} p-5 rounded-2xl`,
    title: typography.cardTitle,
    text: typography.cardText,
  };
};

export const getBottomMenuStyles = (isDark: boolean) => ({
  container: `h-20 ${isDark ? 'bg-surface-dark border-border-dark' : 'bg-surface border-border'} border-t flex flex-row justify-around items-center`,
  button: 'flex-1 items-center justify-center',
  label: `text-xs mt-1 ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`,
  labelActive: `${isDark ? 'text-primary-dark' : 'text-primary'} font-bold`,
});

export const getOverlayStyles = (isDark: boolean) => ({
  container: 'absolute inset-0 flex flex-row z-50',
  background: `flex-1 ${isDark ? 'bg-overlay-dark' : 'bg-overlay'}`,
});

export const getSideMenuStyles = (isDark: boolean) => ({
  container: `w-4/5 ${isDark ? 'bg-surface-dark' : 'bg-surface'} p-6 pt-16`,
  title: `text-2xl font-bold mb-8 ${isDark ? 'text-text-dark' : 'text-text'}`,
  item: 'flex flex-row items-center py-4 px-2 gap-4',
  text: `text-lg ${isDark ? 'text-text-dark' : 'text-text'}`,
  closeButton: `mt-10 ${isDark ? 'bg-primary-dark' : 'bg-primary'} p-4 rounded-lg items-center`,
  closeButtonText: 'text-white font-bold text-lg',
});
