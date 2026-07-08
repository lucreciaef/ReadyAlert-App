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
import { getThemeColours } from '../styles/themeColours';

export interface LearningReadingContentCardProps {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  colour: string;
  body: string[];
}

export function LearningReadingContentCard({ icon, title, colour, body }: LearningReadingContentCardProps) {
  const { isDark } = useTheme();
  const colours = getThemeColours(isDark);

  return (
    <View
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colours.outline,
        backgroundColor: isDark ? colours.surfaceAlt : colours.surface,
        elevation: 1,
        shadowColor: colours.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      }}
    >
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colour + '1A',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name={icon} size={20} color={colour} />
          </View>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colours.text, flex: 1 }}>
            {title}
          </Text>
        </View>

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
                backgroundColor: colour,
                marginTop: 8,
                flexShrink: 0,
              }}
            />
            <Text style={{ flex: 1, fontSize: 14, lineHeight: 22, color: colours.text }}>
              {point}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

