//
// Material Design 3 shared style helpers.
// All sizing follows the MD3 specs

export const getLayoutStyles = (isDark: boolean) => ({
  safeArea: `flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`,
  app: 'flex-1 relative',
  content: 'flex-1 p-4 pt-0',
  fill: 'flex-1',
});

export const getBottomMenuStyles = (isDark: boolean) => ({
  container: `h-20 ${isDark ? 'bg-surface-alt-dark' : 'bg-surface-alt'} flex flex-row`,
  button: 'flex-1 items-center justify-center',
  label: `text-[12px] mt-1 font-medium tracking-[0.4px] ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`,
  labelActive: `font-bold colors-primary`,
});

export const getSettingsPageStyles = (isDark: boolean) => ({
  item: 'flex flex-row items-center py-3 px-4 mx-3 gap-4 rounded-full',
  sectionLabel: `text-[11px] font-bold uppercase tracking-widest px-6 pt-4 pb-1 ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`,
  itemText: `text-sm font-medium ${isDark ? 'text-text-dark' : 'text-text'}`,
  divider: `h-px mx-4 my-2 ${isDark ? 'bg-divider-dark' : 'bg-divider'}`,
});

export const getTopAppBarStyles = (isDark: boolean) => ({
  container: `h-16 ${isDark ? 'bg-surface-dark' : 'bg-surface'} flex-row items-center px-1`,
  contentRow: 'flex-1 flex-row items-center px-4 gap-3',   // Standard "icon + title" content row inside a top app bar.
  containerOnBackground: `h-16 flex-row items-center px-4 gap-3 ${isDark ? 'bg-background-dark' : 'bg-background'}`,
  title: `flex-1 text-[24px] font-normal px-2 ${isDark ? 'text-text-dark' : 'text-text'}`,
  titleMedium: `flex-1 text-[18px] font-medium px-1 ${isDark ? 'text-text-dark' : 'text-text'}`,
  iconButton: 'w-12 h-12 items-center justify-center rounded-full',
});

export const getBottomSheetStyles = (isDark: boolean) => ({
  handleWrap: 'px-4 pb-1',
  handle: `w-8 h-1 self-center mt-3 mb-3 rounded-full ${isDark ? 'bg-divider-dark' : 'bg-divider'}`,
});

export const getHomeDashboardPageStyles = (isDark: boolean) => ({
  headerSpacer: 'flex-1',
  addButtonPressable: 'rounded-full overflow-hidden',
  addButtonInner: `px-5 py-1.5 rounded-full ${isDark ? 'bg-primary-dark' : 'bg-primary'}`,
  addButtonText: `text-2xl font-semibold ${isDark ? 'text-on-primary-dark' : 'text-on-primary'}`,

  preparednessPressable: 'rounded-xl overflow-hidden',
  preparednessCard: `rounded-xl px-4 py-3 ${isDark ? 'bg-surface-alt-dark' : 'bg-surface'}`,
  preparednessLabel: `mb-2 text-[11px] font-semibold uppercase tracking-widest ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`,
  trophyRow: 'flex-row gap-1.5',

  sheetHeaderRow: 'flex-row items-center justify-between mb-2',
  sheetHeaderLeft: 'flex-row items-center gap-2',
  sheetTitle: `flex-1 text-lg font-medium ${isDark ? 'text-text-dark' : 'text-text'}`,
  chevronButton: 'w-10 h-10 items-center justify-center rounded-full',
});

export const getNationalStatusPageStyles = (isDark: boolean) => ({
  mainHeaderRow: 'flex-row items-center justify-between mb-3',
  mainHeaderTitle: `text-base font-medium ${isDark ? 'text-text-dark' : 'text-text'}`,

  alertsHeaderRow: 'flex-row items-center justify-between mb-2.5',
  backButton: 'flex-row items-center gap-1 p-1',
  backButtonText: `text-sm font-medium ${isDark ? 'text-text-dark' : 'text-text'}`,
  alertsCountRow: 'flex-row items-center gap-2',
  alertsCountText: `text-sm font-medium pr-4 ${isDark ? 'text-text-dark' : 'text-text'}`,

  weatherContainer: 'mt-1',
  weatherHeaderRow: 'flex-row items-center gap-2 mb-3',
  weatherHeaderText: `text-sm font-medium ${isDark ? 'text-text-dark' : 'text-text'}`,
  weatherStateRow: `flex-row items-center justify-between py-2.5 px-3.5 rounded-lg mb-1.5 ${isDark ? 'bg-surface-dark' : 'bg-surface'}`,
  weatherStateText: `text-sm ${isDark ? 'text-text-dark' : 'text-text'}`,
  weatherStateBar: `w-16 h-2 rounded ${isDark ? 'bg-surface-alt-dark' : 'bg-surface-alt'}`,
});
