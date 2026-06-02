/**
 * Tappable card displayed on the Learning Centre main page
 */

import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColors } from '../styles/themeColors';

interface LearningCentreCardProps {
  title: string;
  description: string;
  onPress: () => void;
}

export function LearningCentreCard({ title, description, onPress }: LearningCentreCardProps) {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      className={`rounded-2xl overflow-hidden border mb-4 ${
        isDark ? 'bg-[#2a2a2a] border-[#3a3a3a]' : 'bg-white border-gray-200'
      }`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.08,
        shadowRadius: 6,
        elevation: 3,
      }}
    >
      <View
        className={`w-full h-40 items-center justify-center ${
          isDark ? 'bg-[#3a3a3a]' : 'bg-gray-200'
        }`}
      >
        <Ionicons name="medkit-outline" size={48} color={isDark ? '#666' : '#aaa'} />
      </View>

      <View className="flex-row items-center px-4 py-3 gap-3">
        <View className="flex-1">
          <Text
            className={`text-[15px] font-bold mb-0.5 ${isDark ? 'text-text-dark' : 'text-text'}`}
          >
            {title}
          </Text>
          <Text
            className={`text-[13px] leading-[18px] ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`}
          >
            {description}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

