import { getThemeColours } from '../styles/themeColours';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RtrAlert, getAlertLevelColour, getAlertLevelLabel } from '../api';

interface AlertCardProps {
  alert: RtrAlert;
  expanded: boolean;
  onPress: () => void;
  isDark: boolean;
  colors: ReturnType<typeof getThemeColours>;
}

export function RTRAlertCard({ alert, expanded, onPress, isDark, colors }: AlertCardProps) {
  const levelColor = getAlertLevelColour(alert.alert_level, isDark);
  const levelLabel = getAlertLevelLabel(alert.alert_level);

  const formatTime = (iso?: string) => {
    if (!iso) return null;
    try {
      return new Date(iso).toLocaleString('en-AT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const startStr = formatTime(alert.begin_date);
  const endStr = formatTime(alert.end_date);
  const timeRange = startStr && endStr ? `${startStr} – ${endStr}` : (startStr ?? endStr);
  const bodyText = alert.info_description?.trim() ?? '';

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: colors.ripple }}
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 8,
      }}
    >
      <View
        style={{
          borderRadius: 12,
          borderWidth: 2,
          borderColor: isDark ? `${levelColor}44` : `${levelColor}77`,
          backgroundColor: isDark ? `${levelColor}12` : `${levelColor}0e`,
        }}
      >
        <View style={{ padding: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
                backgroundColor: levelColor,
                alignSelf: 'flex-start',
                marginTop: 1,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.4 }}>
                {levelLabel}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', lineHeight: 20, color: levelColor }}>
                {alert.title ?? alert.info_area_description ?? '(No title)'}
              </Text>
              {alert.info_area_description && alert.title ? (
                <Text style={{ fontSize: 11, marginTop: 2, color: colors.textMuted }}>
                  {alert.info_area_description}
                  {alert.sender ? ` · ${alert.sender}` : ''}
                </Text>
              ) : alert.sender ? (
                <Text style={{ fontSize: 11, marginTop: 2, color: colors.textMuted }}>
                  {alert.sender}
                </Text>
              ) : null}
              {timeRange ? (
                <Text style={{ fontSize: 11, marginTop: 2, color: colors.textMuted }}>
                  {timeRange}
                </Text>
              ) : null}
            </View>

            <MaterialCommunityIcons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textMuted}
            />
          </View>

          {expanded && bodyText ? (
            <View
              style={{
                marginTop: 10,
                paddingTop: 10,
                borderTopWidth: 1,
                borderTopColor: isDark ? `${levelColor}33` : `${levelColor}44`,
              }}
            >
              <Text style={{ fontSize: 12, lineHeight: 18, color: colors.text }}>{bodyText}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
