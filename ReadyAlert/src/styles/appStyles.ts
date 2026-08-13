//
// Material Design 3 shared style helpers.
// All sizing follows the MD3 specs

export const getLayoutStyles = (isDark: boolean) => ({
  safeArea: `flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`,
  app: 'flex-1 relative',
  content: 'flex-1 p-4 pt-0',
  fill: 'flex-1',
  centered: 'flex-1 items-center justify-center',
  loadingLabel: `mt-4 text-sm ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`,
});

// Shared elevation/shadow style for top app bars. Used as `style={getTopAppBarShadow(colors)}`.
export const getTopAppBarShadow = (colours: { shadow: string }) => ({
  elevation: 2,
  shadowColor: colours.shadow,
  shadowOffset: { width: 0, height: 1 } as const,
  shadowOpacity: 0.08 as const,
  shadowRadius: 3,
});

export const getBottomMenuStyles = (isDark: boolean) => ({
  container: `h-20 ${isDark ? 'bg-surface-alt-dark' : 'bg-surface-alt'} flex flex-row`,
  button: 'flex-1 items-center justify-center',
  label: `text-[12px] mt-1 font-medium tracking-[0.4px] ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`,
  labelActive: `font-bold colors-primary`,
});

export const getSettingsPageStyles = (isDark: boolean) => ({
  item: 'flex flex-row items-center py-3 px-4 mx-3 gap-4 rounded-full',
  sectionLabel: `text-[14px] font-medium px-4 pt-4 pb-1 ${isDark ? 'text-primary-dark' : 'text-primary'}`,
  itemText: `text-sm font-medium ${isDark ? 'text-text-dark' : 'text-text'}`,
});

export const getLicenseInformationPageStyles = (isDark: boolean) => ({
  sectionLabel: `text-[14px] font-medium mb-2 ${isDark ? 'text-primary-dark' : 'text-primary'}`,
  card: `rounded-xl overflow-hidden ${isDark ? 'bg-surface-alt-dark' : 'bg-surface-alt'}`,
  cardSpacing: 'mb-6',
  rowDivider: `border-b ${isDark ? 'border-divider-dark' : 'border-divider'}`,
  libraryRow: 'flex-row items-center px-4 py-3',
  libraryName: `text-sm font-medium ${isDark ? 'text-text-dark' : 'text-text'}`,
  libraryLicense: `text-xs mt-0.5 ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`,
  creditRow: 'px-4 py-3.5',
  creditTitle: `text-sm font-medium ${isDark ? 'text-text-dark' : 'text-text'}`,
  creditDescription: `text-[13px] leading-[18px] mt-1 ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`,
  creditUrl: `text-xs mt-1.5 ${isDark ? 'text-primary-dark' : 'text-primary'}`,
});

export const getTopAppBarStyles = (isDark: boolean) => ({
  container: `h-16 ${isDark ? 'bg-surface-dark' : 'bg-surface'} flex-row items-center px-1`,
  contentRow: 'flex-1 flex-row items-center px-4 gap-3', // Standard "icon + title" content row inside a top app bar.
  containerOnBackground: `h-16 flex-row items-center gap-3 ${isDark ? 'bg-background-dark' : 'bg-background'}`,
  title: `flex-1 text-[24px] font-normal px-4 ${isDark ? 'text-text-dark' : 'text-text'}`,
  titleMedium: `flex-1 text-[18px] font-medium px-1 ${isDark ? 'text-text-dark' : 'text-text'}`,
  iconButton: 'w-12 h-12 items-center justify-center rounded-full',
});

export const getBottomSheetStyles = (isDark: boolean) => ({
  handleWrap: 'px-4 pb-1',
  handle: `w-8 h-1 self-center mt-3 mb-3 rounded-full ${isDark ? 'bg-divider-dark' : 'bg-divider'}`,
});

export const getSavedLocationsPageStyles = (isDark: boolean) => ({
  screen: `flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`,
  sectionLabel: `text-[14px] font-medium mb-2 mt-4 px-5 ${isDark ? 'text-primary-dark' : 'text-primary'}`,
  helper: `text-[13px] leading-[18px] px-4 mb-2 ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`,
  card: `mx-4 rounded-xl overflow-hidden ${isDark ? 'bg-surface-alt-dark' : 'bg-surface-alt'}`,
  row: 'flex-row items-center px-4 py-3',
  rowDivider: '',
  rowMain: 'flex-1',
  rowTitle: `text-sm font-medium ${isDark ? 'text-text-dark' : 'text-text'}`,
  rowSubtitle: `text-xs mt-0.5 ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`,
  rowIconBtn: 'w-10 h-10 items-center justify-center rounded-full ml-2',
  addButton: `mx-4 mt-3 flex-row items-center justify-center gap-2 px-4 py-3 rounded-full ${isDark ? 'bg-primary-dark' : 'bg-primary'}`,
  addButtonDisabled: `mx-4 mt-3 flex-row items-center justify-center gap-2 px-4 py-3 rounded-full ${isDark ? 'bg-surface-alt-dark' : 'bg-surface-alt'}`,
  addButtonText: `text-sm font-semibold ${isDark ? 'text-on-primary-dark' : 'text-on-primary'}`,
  addButtonTextDisabled: `text-sm font-medium ${isDark ? 'text-text-muted-dark' : 'text-text-muted'} opacity-60`,
  searchInputWrap: `flex-row items-center gap-2 mx-4 px-8 py-2 rounded-full ${isDark ? 'bg-surface-alt-dark' : 'bg-surface-alt'}`,
  searchInput: `flex-1 text-sm ${isDark ? 'text-text-dark' : 'text-text'}`,
  emptyText: `text-[13px] text-center px-4 py-6 ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`,
});

export const getPreparednessScoreCardStyles = (isDark: boolean) => ({
  pressable: 'rounded-xl overflow-hidden',
  card: `rounded-xl px-4 py-3 ${isDark ? 'bg-surface-alt-dark' : 'bg-surface-alt'}`,
  label: `mb-2 text-[14px] font-medium ${isDark ? 'text-primary-dark' : 'text-primary'}`,
  trophyRow: 'flex-row gap-1.5',
});

export const getEmergencyPageStyles = (isDark: boolean) => ({
  sectionLabel: `text-[13px] font-semibold tracking-[0.5px] mb-3 ${isDark ? 'text-primary-dark' : 'text-primary'}`,
  serviceLabel: `text-[13px] font-medium ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`,
  linkRow: `rounded-xl overflow-hidden mb-2 ${isDark ? 'bg-surface-alt-dark' : 'bg-surface-alt'}`,
  linkRowInner: 'flex-row items-center py-3 px-4 gap-4',
  linkLabel: `flex-1 text-[15px] ${isDark ? 'text-text-dark' : 'text-text'}`,
});

export const getChecklistPageStyles = (isDark: boolean) => ({
  groupLabel: `text-sm font-medium tracking-[0.1px] mb-2 px-1 ${isDark ? 'text-primary-dark' : 'text-primary'}`,
  groupCard: `rounded-xl overflow-hidden ${isDark ? 'bg-surface-alt-dark' : 'bg-surface-alt'}`,
  itemRow: 'flex-row items-center px-4 py-3',
  checkbox: 'w-5 h-5 rounded-sm items-center justify-center border-2 mr-3.5 shrink-0',
  itemLabel: 'flex-1 text-sm leading-5',
  quantityBadge: 'ml-2 px-2 py-0.5 rounded-xl shrink-0',
  quantityBadgeText: 'text-[11px] font-semibold',
  progressStrip: `px-4 pt-3 pb-3.5 border-b ${isDark ? 'bg-surface-alt-dark border-divider-dark' : 'bg-surface border-divider'}`,
  progressHeaderRow: 'flex-row items-center justify-between mb-2',
  progressCountLabel: `text-xs font-medium tracking-[0.5px] ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`,
  introCard: `rounded-xl p-3.5 mb-5 ${isDark ? 'bg-surface-alt-dark' : 'bg-surface-alt'}`,
  introIconRow: 'flex-row items-center mb-2',
  introTitle: `ml-2 text-sm font-bold ${isDark ? 'text-text-dark' : 'text-text'}`,
  introBody: `text-[13px] leading-[19px] ${isDark ? 'text-text-dark' : 'text-text'}`,
});

export const getLearningArticlePageStyles = (isDark: boolean) => ({
  articleSectionLabel: `text-sm font-medium tracking-[0.1px] mt-2 mb-3 px-1 ${isDark ? 'text-primary-dark' : 'text-primary'}`,
  quizActionBar: `px-4 pt-3 border-t ${isDark ? 'bg-surface-alt-dark border-divider-dark' : 'bg-surface border-divider'}`,
  quizCompleteText: 'flex-1 text-sm font-semibold',
  quizStartButton: 'rounded-[28px] overflow-hidden',
  quizStartButtonInner: 'flex-row items-center justify-center gap-2 py-4 px-6',
  quizStartButtonText: `text-sm font-medium tracking-[0.1px] ${isDark ? 'text-on-primary-dark' : 'text-on-primary'}`,
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
  weatherHeaderText: `text-base font-medium ${isDark ? 'text-text-dark' : 'text-text'}`,
  weatherGroup: `rounded-xl overflow-hidden ${isDark ? 'bg-surface-dark' : 'bg-surface'}`,
  weatherStateRow: 'flex-row items-center justify-between py-3 px-3.5',
  weatherStateText: `text-sm ${isDark ? 'text-text-dark' : 'text-text'}`,
  weatherStateBar: `w-16 h-2 rounded ${isDark ? 'bg-surface-alt-dark' : 'bg-surface-alt'}`,
});
