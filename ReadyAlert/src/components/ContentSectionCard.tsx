/**
 * ContentSectionCard – Card for reading-page content sections.
 *
 * Each card has:
 * - A coloured 4dp accent bar across the top
 * - A circular tinted icon badge + title row
 * - A list of bullet-point body strings
 *
 * Used in learning/reading pages.
 */

import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColors } from '../styles/themeColors';

export interface ContentSectionCardProps {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  /** Hex colour used for the accent bar, icon tint and bullet dots. */
  color: string;
  /** Each string becomes one bullet-point paragraph. */
  body: string[];
}

export function ContentSectionCard({ icon, title, color, body }: ContentSectionCardProps) {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  return (
    <View
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: isDark ? colors.surfaceContainer : colors.surface,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      }}
    >
      {/* Coloured accent bar */}
      <View style={{ height: 4, backgroundColor: color }} />

      <View style={{ padding: 16 }}>
        {/* Header row: icon badge + title */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: color + '1A',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name={icon} size={20} color={color} />
          </View>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, flex: 1 }}>
            {title}
          </Text>
        </View>

        {/* Bullet-point body */}
        {body.map((point, idx) => (
          <View
            key={idx}
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 10,
              marginBottom: idx < body.length - 1 ? 10 : 0,
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: color,
                marginTop: 8,
                flexShrink: 0,
              }}
            />
            <Text style={{ flex: 1, fontSize: 14, lineHeight: 22, color: colors.text }}>
              {point}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

