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
  isFirst?: boolean;
}

export function ExpandableInfoCard({
  icon,
  title,
  expanded,
  onToggle,
  colours,
  summary,
  children,
  isFirst,
}: Props) {
  return (
    <View
      style={{
        borderTopWidth: isFirst ? 0 : 1,
        borderTopColor: colours.divider,
        paddingHorizontal: 12,
      }}
    >
      <Pressable onPress={onToggle} android_ripple={{ color: colours.ripple }}>
        <View style={{ paddingVertical: 12 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <MaterialCommunityIcons name={icon} size={22} color={colours.text} />
              <Text
                style={{ fontSize: 14, fontWeight: '500', letterSpacing: 0.1, color: colours.text }}
              >
                {title}
              </Text>
            </View>
            <MaterialCommunityIcons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={22}
              color={colours.textMuted}
            />
          </View>

          {summary}
        </View>
      </Pressable>

      {expanded && <View style={{ paddingBottom: 12 }}>{children}</View>}
    </View>
  );
}
