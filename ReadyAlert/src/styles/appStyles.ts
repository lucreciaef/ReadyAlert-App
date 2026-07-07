//
// Material Design 3 shared style helpers.
// All sizing follows the MD3 specs
//

export const getLayoutStyles = (isDark: boolean) => ({
  safeArea: `flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`,
  app: 'flex-1 relative',
  content: 'flex-1 p-4 pt-0',
});

export const getTypographyStyles = (isDark: boolean) => ({
  // Title Large - Top App Bar title
  title: `text-[22px] font-normal mb-4 ${isDark ? 'text-text-dark' : 'text-text'}`,
  // Title Medium – card headings
  cardTitle: `text-base font-medium mb-1 ${isDark ? 'text-text-dark' : 'text-text'}`,
  // Body Medium – card body
  cardText: `text-sm font-normal ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`,
});

export const getBottomMenuStyles = (isDark: boolean) => ({
  container: `h-20 ${isDark ? 'bg-surface-container-dark' : 'bg-surface-container'} flex flex-row`,
  button: 'flex-1 items-center justify-center',
  label: `text-[12px] mt-1 font-medium tracking-[0.4px] ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`,
  labelActive: `font-bold colors-primary`,
});

// Opens from the left side, Width: 360dp max.
export const getSideMenuStyles = (isDark: boolean) => ({
  container: `w-[300px] ${isDark ? 'bg-surface-dark' : 'bg-surface'} flex-1`,
  header: `px-6 pt-24 pb-5 ${isDark ? 'bg-surface-container-dark' : 'bg-surface-container'}`,
  headerTitle: `text-[22px] font-normal mt-2 ${isDark ? 'text-text-dark' : 'text-text'}`,
  headerSubtitle: `text-sm mt-0.5 ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`,
  sectionLabel: `text-[11px] font-bold uppercase tracking-widest px-6 pt-4 pb-1 ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`,
  item: 'flex flex-row items-center py-3 px-4 mx-3 gap-4 rounded-full',
  itemActive: `${isDark ? 'bg-primary-container-dark' : 'bg-primary-container'}`,
  text: `text-sm font-medium ${isDark ? 'text-text-dark' : 'text-text'}`,
  divider: `h-px mx-4 my-2 ${isDark ? 'bg-border-dark' : 'bg-border'}`,
});

export const getTopAppBarStyles = (isDark: boolean) => ({
  container: `h-16 ${isDark ? 'bg-surface-dark' : 'bg-surface'} flex-row items-center px-1`,
  // Title Large
  title: `flex-1 text-[24px] font-normal px-2 ${isDark ? 'text-text-dark' : 'text-text'}`,
  // Title Medium (for sub-page titles with a back button)
  titleMedium: `flex-1 text-[18px] font-medium px-1 ${isDark ? 'text-text-dark' : 'text-text'}`,
  iconButton: 'w-12 h-12 items-center justify-center rounded-full',
});
