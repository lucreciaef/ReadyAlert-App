/**
 * Outlined Card – expandable card for a single Geosphere weather warning
 */

import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColors } from '../styles/themeColors';
import { Warning } from '../api';

interface ExpandableWarningCardProps {
  warning: Warning;
}

export function ExpandableWarningCard({ warning }: ExpandableWarningCardProps) {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable
      onPress={() => setExpanded((prev) => !prev)}
      android_ripple={{ color: colors.ripple }}
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 8,
      }}
    >
      {/* backgroundColor + border live on this inner View so Android's ripple
          layer doesn't cache the old colour when the theme changes. */}
      <View
        style={{
          borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(239,83,80,0.3)' : 'rgba(229,115,115,0.5)',
          backgroundColor: isDark ? 'rgba(239,83,80,0.08)' : '#FFF8F7',
        }}
      >
      <View style={{ height: 3, backgroundColor: '#EF5350' }} />

      <View style={{ padding: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '500',
              lineHeight: 20,
              color: isDark ? '#EF9A9A' : '#B71C1C',
            }}>
              {warning.properties.text}
            </Text>
            <Text style={{
              fontSize: 12,
              marginTop: 4,
              color: colors.textMuted,
              letterSpacing: 0.4,
            }}>
              {warning.properties.begin} – {warning.properties.end}
            </Text>
          </View>
          <MaterialCommunityIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textMuted}
          />
        </View>

        {expanded && (
          <View style={{
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: isDark ? 'rgba(239,83,80,0.2)' : 'rgba(229,115,115,0.3)',
            gap: 10,
          }}>
            {[
              { label: 'Effects',                  value: warning.properties.auswirkungen },
              { label: 'Recommendation',            value: warning.properties.empfehlungen },
              { label: 'Meteorological background', value: warning.properties.meteotext },
            ]
              .filter((d) => !!d.value)
              .map((d) => (
                <View key={d.label}>
                  <Text style={{
                    fontSize: 11,
                    fontWeight: '600',
                    letterSpacing: 0.5,
                    color: colors.textMuted,
                    marginBottom: 2,
                  }}>
                    {d.label}
                  </Text>
                  <Text style={{ fontSize: 12, lineHeight: 18, color: colors.text }}>
                    {d.value}
                  </Text>
                </View>
              ))}
          </View>
        )}
      </View>
      </View>
    </Pressable>
  );
}

