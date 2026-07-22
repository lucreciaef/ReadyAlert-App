/**
 * Reusable component for the home dashboard's expandable info cards
 */

import { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getThemeColours } from '../styles/themeColours';

interface Props {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  expanded: boolean;
  onToggle: () => void;
  colours: ReturnType<typeof getThemeColours>;
  summary: ReactNode;
  children?: ReactNode;
}

export function ExpandableInfoCard({ icon, title, expanded, onToggle, colours, summary, children }: Props) {
  return (
    <View
      style={{
        marginTop: 8,
        borderRadius: 12,
        backgroundColor: colours.surface,
        padding: 10,
        borderWidth: 1,
        borderColor: colours.textMuted,
      }}
    >
      <Pressable
        onPress={onToggle}
        android_ripple={{ color: colours.ripple }}
        style={{ borderRadius: 8, overflow: 'hidden' }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialCommunityIcons name={icon} size={20} color={colours.primary} />
            <Text style={{ fontSize: 13, fontWeight: '600', letterSpacing: 1.1, textTransform: 'uppercase', color: colours.textMuted }}>
              {title}
            </Text>
          </View>
          <MaterialCommunityIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colours.textMuted}
          />
        </View>

        {summary}
      </Pressable>

      {expanded && children}
    </View>
  );
}
