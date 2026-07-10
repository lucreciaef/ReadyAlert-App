/**
 * PreparednessScoreCard – displays the current preparedness score.
 * Displayed as a row of five trophies filled proportionally to the score (0–100).
 * Used in the HomeDashboardPage (tappable) and in the LearningCentrePage (static).
 */

import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';
import { getPreparednessScoreCardStyles } from '../styles/appStyles';
import { usePreparedness } from '../context/PreparednessContext';

const TROPHY_SIZE = 26;

function TrophyIcon({
  fill,
  color,
  outlineColor,
}: {
  fill: number;
  color: string;
  outlineColor: string;
}) {
  return (
    <View style={{ width: TROPHY_SIZE, height: TROPHY_SIZE }}>
      <MaterialCommunityIcons name="trophy-outline" size={TROPHY_SIZE} color={outlineColor} />
      {fill > 0 && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: Math.ceil(TROPHY_SIZE * fill),
            height: TROPHY_SIZE,
            overflow: 'hidden',
          }}
        >
          <MaterialCommunityIcons name="trophy" size={TROPHY_SIZE} color={color} />
        </View>
      )}
    </View>
  );
}

interface PreparednessScoreCardProps {
  onPress?: () => void;
}

export function PreparednessScoreCard({ onPress }: PreparednessScoreCardProps) {
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);
  const styles = getPreparednessScoreCardStyles(isDark);
  const { preparedness, loading } = usePreparedness();

  if (loading) return null;

  const content = (
    <View
      className={styles.card}
      style={{
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 6,
        elevation: 3,
      }}
    >
      <Text className={styles.label}>Preparedness score</Text>
      <View className={styles.trophyRow}>
        {[0, 1, 2, 3, 4].map((i) => {
          const trophyScore = preparedness.score / 20;
          const fill = Math.min(1, Math.max(0, trophyScore - i));
          return (
            <TrophyIcon
              key={i}
              fill={fill}
              color={preparedness.color}
              outlineColor={colors.divider}
            />
          );
        })}
      </View>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: colors.ripple }}
      className={styles.pressable}
    >
      {content}
    </Pressable>
  );
}
