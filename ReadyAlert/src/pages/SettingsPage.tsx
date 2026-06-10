/**
 * Settings page
 * Contains user preferences, info about licencing and debug tools.
 */

import { ScrollView, Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColors } from '../styles/themeColors';
import { getSideMenuStyles } from '../styles/appStyles';
import { DebugMode } from '../context/LocationContext';

interface SettingsPageProps {
  debugMode?: DebugMode;
  onDebugLondonPress?: () => void;
  onDebugDangerPress?: () => void;
  onDebug503Press?: () => void;
  onClearDebugPress?: () => void;
}

export function SettingsPage({
  debugMode,
  onDebugLondonPress,
  onDebugDangerPress,
  onDebug503Press,
  onClearDebugPress,
}: SettingsPageProps) {
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useTheme();
  const colors = getThemeColors(isDark);
  const sideMenu = getSideMenuStyles(isDark);

  const isDebugMode = debugMode !== null && debugMode !== undefined;

  const debugLabel: Record<NonNullable<DebugMode>, string> = {
    london: 'London, UK',
    danger: 'Local Danger Alert',
    '503': '503 Server Response',
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>

        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20 }}>
          <MaterialCommunityIcons name="shield-alert" size={36} color={colors.primary} />
          <Text style={{ fontSize: 22, fontWeight: '400', marginTop: 8, color: colors.text }}>ReadyAlert</Text>
          <Text style={{ fontSize: 14, marginTop: 4, color: colors.textMuted }}>Alerts and preparedness in Austria</Text>
        </View>

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

        {isDebugMode ? (
          <Pressable
            className={sideMenu.item}
            android_ripple={{ color: colors.ripple }}
            onPress={onClearDebugPress}
          >
            <MaterialCommunityIcons name="bug" size={24} color="#F59E0B" />
            <View style={{ flex: 1 }}>
              <Text className={sideMenu.text}>Clear Debug Mode</Text>
              <Text style={{ fontSize: 11, color: '#F59E0B', marginTop: 2 }}>
                Currently: {debugLabel[debugMode!]}
              </Text>
            </View>
          </Pressable>
        ) : (
          <>
            <Pressable
              className={sideMenu.item}
              android_ripple={{ color: colors.ripple }}
              onPress={onDebugLondonPress}
            >
              <MaterialCommunityIcons name="map-marker-off-outline" size={24} color="#F59E0B" />
              <Text className={sideMenu.text}>Simulate London, UK</Text>
            </Pressable>

            <Pressable
              className={sideMenu.item}
              android_ripple={{ color: colors.ripple }}
              onPress={onDebugDangerPress}
            >
              <MaterialCommunityIcons name="alert-outline" size={24} color="#F59E0B" />
              <Text className={sideMenu.text}>Simulate Local Danger Alert</Text>
            </Pressable>

            <Pressable
              className={sideMenu.item}
              android_ripple={{ color: colors.ripple }}
              onPress={onDebug503Press}
            >
              <MaterialCommunityIcons name="server-off" size={24} color="#F59E0B" />
              <Text className={sideMenu.text}>Simulate 503 Server Response</Text>
            </Pressable>
          </>
        )}

      </ScrollView>
    </View>
  );
}
