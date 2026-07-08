/**
 * Outlined Card – expandable card for a single Geosphere weather warning
 */

import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';
import { Warning } from '../api';

interface ExpandableWarningCardProps {
  warning: Warning;
}

export function SingleWeatherWarningCard({ warning }: ExpandableWarningCardProps) {
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);
  const [expanded, setExpanded] = useState(false);

  const hasDescription = [
    warning.properties.auswirkungen,
    warning.properties.empfehlungen,
    warning.properties.meteotext,
  ].some((v) => !!v);

  return (
    <Pressable
      onPress={hasDescription ? () => setExpanded((prev) => !prev) : undefined}
      android_ripple={hasDescription ? { color: colors.ripple } : undefined}
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 8,
      }}
    >
      <View
        style={{
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.warningBorder,
          backgroundColor: colors.warningContainer,
        }}
      >
      {/*<View style={{ height: 3, backgroundColor: colors.warning }} />*/}

      <View style={{ padding: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '500',
              lineHeight: 20,
              color: colors.warningOnContainer,
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
          {hasDescription && (
            <MaterialCommunityIcons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textMuted}
            />
          )}
        </View>

        {expanded && (
          <View style={{
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.warningBorder,
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

