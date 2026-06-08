/**
 * Elevated Card – tappable card displayed on the Learning Centre main page.
 */

import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
    <Pressable
      onPress={onPress}
      android_ripple={{ color: colors.ripple }}
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: isDark ? '#27293A' : colors.surface,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.25 : 0.08,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Hero image placeholder */}
      <View
        style={{
          width: '100%',
          height: 160,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDark ? colors.surfaceContainer : '#E8F0FE',
        }}
      >
        <MaterialCommunityIcons
          name="medical-bag"
          size={52}
          color={isDark ? colors.textMuted : colors.primary}
        />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text, marginBottom: 2 }}>
            {title}
          </Text>
          <Text style={{ fontSize: 14, lineHeight: 20, color: colors.textMuted }}>
            {description}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}