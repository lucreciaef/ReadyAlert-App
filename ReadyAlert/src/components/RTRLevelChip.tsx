import { getThemeColours } from '../styles/themeColours';
import { Pressable, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getAlertLevelColour } from '../api';
import { RtrAlertLevel } from '../api';
import { useTheme } from '../theme/ThemeContext';

interface LevelChipProps {
  level: RtrAlertLevel;
  active: boolean;
  onPress: () => void;
}

export function RTRLevelChip({ level, active, onPress }: LevelChipProps) {
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);
  const color = getAlertLevelColour(level, isDark);
  const shortLabel: Record<RtrAlertLevel, string> = {
    AlertLevel1: 'Emergency',
    AlertLevel2: 'Extreme',
    AlertLevel3: 'Severe',
    AlertLevel4: 'Info',
    Amber: 'Other',
  };

  const borderColor = isDark
    ? active
      ? color
      : colors.outline
    : active
      ? color
      : colors.textMuted;
  const backgroundColor = isDark ? (active ? color : 'transparent') : colors.surface;
  const textColor = isDark ? (active ? '#fff' : color) : active ? color : colors.textMuted;
  const iconColor = isDark ? '#fff' : color;

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: active ? colors.rippleOnPrimary : colors.ripple }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 8,
        borderWidth: 1.5,
        borderColor,
        backgroundColor,
        overflow: 'hidden',
      }}
    >
      {active && <MaterialCommunityIcons name="check" size={14} color={iconColor} />}
      <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.5, color: textColor }}>
        {shortLabel[level]}
      </Text>
    </Pressable>
  );
}
