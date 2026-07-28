/**
 * LearningSourceCitation – source attribution row for learning/reading pages.
 *
 * Info icon + "Source: {source}" line, with the URL on a second line in the
 * primary colour.
 */

import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';

export interface LearningSourceCitationProps {
  source: string;
  url: string;
}

export function LearningSourceCitation({ source, url }: LearningSourceCitationProps) {
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);

  return (
    <View style={{
      flexDirection: 'row', alignItems: 'flex-start', gap: 8,
      padding: 12, borderRadius: 8, marginTop: 4, marginBottom: 8,
      backgroundColor: colors.surfaceAlt,
    }}>
      <MaterialCommunityIcons name="information-outline" size={14} color={colors.textMuted} style={{ marginTop: 1 }} />
      <Text style={{ flex: 1, fontSize: 12, lineHeight: 18, color: colors.textMuted }}>
        Source: {source}{'\n'}
        <Text style={{ color: colors.primary }}>
          {url}
        </Text>
      </Text>
    </View>
  );
}
