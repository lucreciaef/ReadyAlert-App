export const layout = {
  safeArea: 'flex-1 bg-background',
  app: 'flex-1',
  content: 'flex-1 p-5 pt-16',
};

export const typography = {
  title: 'text-3xl font-bold mb-5',
  cardTitle: 'text-xl font-bold mb-2',
  cardText: 'text-base text-text-muted',
};

export const card = {
  container: 'bg-surface p-5 rounded-2xl',
  title: typography.cardTitle,
  text: typography.cardText,
};

export const bottomMenu = {
  container:
    'h-20 bg-surface border-t border-border flex flex-row justify-around items-center',
  button: 'flex-1 items-center justify-center',
  label: 'text-xs mt-1 text-text-muted',
  labelActive: 'text-primary font-bold',
};

export const overlay = {
  container: 'absolute inset-0 flex flex-row',
  background: 'flex-1 bg-overlay',
};

export const sideMenu = {
  container: 'w-70 bg-surface p-6 pt-16',
  title: 'text-2xl font-bold mb-6',
  item: 'flex flex-row items-center py-3 gap-3',
  text: 'text-lg',
  closeButton: 'mt-8 bg-primary p-3 rounded-lg items-center',
  closeButtonText: 'text-surface font-bold',
};
