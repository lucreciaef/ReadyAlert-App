/**
 * Navigation Bar item.
 */

import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getThemeColors } from '../styles/themeColors';
import { getBottomMenuStyles } from '../styles/appStyles';
import { useTheme } from '../theme/ThemeContext';

interface MenuButtonProps {
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  active: boolean;
  onPress: () => void;
}

export function MenuButton({ label, icon, active, onPress }: MenuButtonProps) {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const bottomMenu = getBottomMenuStyles(isDark);

  return (
    <Pressable
      className={bottomMenu.button}
      android_ripple={{ color: colors.ripple, borderless: true }}
      onPress={onPress}
    >
      <View
        style={{
          width: 56,
          height: 32,
          borderRadius: 16,
          overflow: 'hidden', // forces Android GPU layer to honour border radius on bg colour changes
          backgroundColor: active ? colors.primaryContainer : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={active ? colors.primary : colors.textMuted}
        />
      </View>
      <Text
        className={`${bottomMenu.label} ${active ? bottomMenu.labelActive : ''}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
