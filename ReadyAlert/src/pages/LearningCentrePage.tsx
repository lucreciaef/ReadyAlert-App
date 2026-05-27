import { View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export function LearningCentrePage() {
  const { isDark } = useTheme();

  return (
    <View className={`flex-1 ${isDark ? 'bg-surface-dark' : 'bg-surface'}`} />
  );
}

