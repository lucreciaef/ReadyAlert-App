/**
 * Settings page
 * Contains user preferences, info about licencing and debug tools.
 */

import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColors } from '../styles/themeColors';
import { getTopAppBarStyles, getSideMenuStyles } from '../styles/appStyles';

interface SettingsPageProps {
  onBack: () => void;
  onLearningCentrePress?: () => void;
  isDebugMode?: boolean;
  onDebugLondonPress?: () => void;
  onClearDebugPress?: () => void;
}

export function SettingsPage({
  onBack,
  isDebugMode,
  onDebugLondonPress,
  onClearDebugPress,
}: SettingsPageProps) {
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useTheme();
  const colors = getThemeColors(isDark);
  const topBar = getTopAppBarStyles(isDark);
  const sideMenu = getSideMenuStyles(isDark);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View style={{ height: 64, backgroundColor: colors.background, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 }}>
        <Pressable
          onPress={onBack}
          android_ripple={{ color: colors.ripple, borderless: true }}
          style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </Pressable>
        <Text className={topBar.titleMedium} numberOfLines={1}>Settings</Text>
      </View>

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

      </ScrollView>
    </View>
  );
}
