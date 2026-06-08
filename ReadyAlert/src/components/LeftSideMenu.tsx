/**
 * MD3 Navigation Drawer – slides in from the LEFT (Material Design standard).
 * Structure: DrawerHeader (surface-container tint) + DrawerItems with
 * full-width pill-shaped active indicator.
 * Uses MaterialCommunityIcons and android_ripple throughout.
 */

import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getOverlayStyles, getSideMenuStyles } from '../styles/appStyles';
import { getThemeColors } from '../styles/themeColors';
import { useTheme } from '../theme/ThemeContext';

interface LeftSideMenuProps {
  closeMenu: () => void;
  onLearningCentrePress?: () => void;
  isDebugMode?: boolean;
  onDebugLondonPress?: () => void;
  onClearDebugPress?: () => void;
}

export function LeftSideMenu({
  closeMenu,
  onLearningCentrePress,
  isDebugMode,
  onDebugLondonPress,
  onClearDebugPress,
}: LeftSideMenuProps) {
  const { isDark, toggleTheme } = useTheme();
  const overlay = getOverlayStyles(isDark);
  const sideMenu = getSideMenuStyles(isDark);
  const colors = getThemeColors(isDark);

  return (
    // Drawer opens from the LEFT: drawer first, scrim second
    <View className={overlay.container}>
      <View className={sideMenu.container}>
        <View className={sideMenu.header}>
          <MaterialCommunityIcons name="shield-alert" size={32} color={colors.primary} />
          <Text className={sideMenu.headerTitle}>ReadyAlert</Text>
          <Text className={sideMenu.headerSubtitle}>Alerts and preparedness in Austria</Text>
        </View>

        <Text className={sideMenu.sectionLabel}>Navigation</Text>

        <Pressable
          className={sideMenu.item}
          android_ripple={{ color: colors.ripple }}
          onPress={onLearningCentrePress}
        >
          <MaterialCommunityIcons name="school-outline" size={24} color={colors.primary} />
          <Text className={sideMenu.text}>Learning Centre</Text>
        </Pressable>

        <View className={sideMenu.divider} />
        <Text className={sideMenu.sectionLabel}>Preferences</Text>

        <Pressable
          className={sideMenu.item}
          android_ripple={{ color: colors.ripple }}
          onPress={toggleTheme}
        >
          <MaterialCommunityIcons
            name={isDark ? 'white-balance-sunny' : 'moon-waning-crescent'}
            size={24}
            color={colors.textMuted}
          />
          <Text className={sideMenu.text}>{isDark ? 'Light Mode' : 'Dark Mode'}</Text>
        </Pressable>

        <Pressable
          className={sideMenu.item}
          android_ripple={{ color: colors.ripple }}
        >
          <MaterialCommunityIcons name="information-outline" size={24} color={colors.textMuted} />
          <Text className={sideMenu.text}>About</Text>
        </Pressable>

        <Pressable
          className={sideMenu.item}
          android_ripple={{ color: colors.ripple }}
        >
          <MaterialCommunityIcons name="help-circle-outline" size={24} color={colors.textMuted} />
          <Text className={sideMenu.text}>Help</Text>
        </Pressable>

        <View className={sideMenu.divider} />
        <Text className={sideMenu.sectionLabel}>Debug</Text>

        {!isDebugMode ? (
          <Pressable
            className={sideMenu.item}
            android_ripple={{ color: colors.ripple }}
            onPress={onDebugLondonPress}
          >
            <MaterialCommunityIcons name="bug-outline" size={24} color="#F59E0B" />
            <Text className={sideMenu.text}>Simulate London, UK</Text>
          </Pressable>
        ) : (
          <Pressable
            className={sideMenu.item}
            android_ripple={{ color: colors.ripple }}
            onPress={onClearDebugPress}
          >
            <MaterialCommunityIcons name="bug" size={24} color="#F59E0B" />
            <View style={{ flex: 1 }}>
              <Text className={sideMenu.text}>Clear Debug Location</Text>
              <Text style={{ fontSize: 11, color: '#F59E0B', marginTop: 2 }}>
                Currently: London, UK 🐛
              </Text>
            </View>
          </Pressable>
        )}
      </View>

      <Pressable className={overlay.background} onPress={closeMenu} />
    </View>
  );
}
