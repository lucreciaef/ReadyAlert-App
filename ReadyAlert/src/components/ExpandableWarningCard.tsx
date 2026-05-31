/**
 * Expandable card for a single Geosphere weather warning.
 * Tapping the card toggles the detailed Auswirkungen (effects) / Empfehlungen (recommendations) / Meteotext section.
 */

import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    <TouchableOpacity
      onPress={() => setExpanded((prev) => !prev)}
      activeOpacity={0.8}
      className={`p-3 rounded-xl border mt-2 ${
        isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-50 border-amber-200'
      }`}
    >
      <View className="flex-row items-start gap-2">
        <View style={{ flex: 1 }}>
          <Text
            className={`text-[13px] font-bold leading-[18px] ${isDark ? 'text-red-300' : 'text-red-700'}`}
          >
            {warning.properties.text}
          </Text>
          <Text
            className={`text-[11px] mt-1 ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`}
          >
            {warning.properties.begin} – {warning.properties.end}
          </Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textMuted}
        />
      </View>

      {expanded && (
        <View
          className={`mt-3 pt-3 border-t gap-2.5 ${
            isDark ? 'border-red-500/20' : 'border-amber-200'
          }`}
        >
          {[
            { label: 'Effects', value: warning.properties.auswirkungen },
            { label: 'Recommendation', value: warning.properties.empfehlungen },
            { label: 'Meteorological background', value: warning.properties.meteotext },
          ]
            .filter((d) => !!d.value)
            .map((d) => (
              <View key={d.label} className="gap-0.5">
                <Text
                  className={`text-[11px] font-semibold ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`}
                >
                  {d.label}:
                </Text>
                <Text
                  className={`text-[11px] leading-4 ${isDark ? 'text-text-dark' : 'text-text'}`}
                >
                  {d.value}
                </Text>
              </View>
            ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

