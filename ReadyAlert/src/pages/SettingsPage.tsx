/**
 * Settings page
 * Contains user preferences, info about licencing and debug tools.
 */

import { ScrollView, Text, View, Pressable, Alert, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, ThemeMode } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';
import { getSettingsPageStyles, getTopAppBarStyles } from '../styles/appStyles';
import { DebugMode } from '../context/LocationContext';
import { LicenseInformationPage } from './settings/LicenseInformationPage';
import { SavedLocationsPage } from './settings/SavedLocationsPage';
import appJson from '../../app.json';

type SubPage = 'licenseInformation' | 'savedLocations' | null;

const APP_VERSION = appJson.expo.version;

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'] }[] = [
  { value: 'light', label: 'Light', icon: 'white-balance-sunny' },
  { value: 'dark', label: 'Dark', icon: 'moon-waning-crescent' },
  { value: 'system', label: 'System', icon: 'cellphone' },
];

interface SettingsPageProps {
  debugMode?: DebugMode;
  onDebugDangerPress?: () => void;
  onDebug503Press?: () => void;
  onClearDebugPress?: () => void;
  initialSubPage?: SubPage; // When set, the settings page opens directly on this subpage.
  onSubPageClosed?: () => void; // Called when the initial subpage is closed so the parent can reset the request
}

export function SettingsPage({
  debugMode,
  onDebugDangerPress,
  onDebug503Press,
  onClearDebugPress,
  initialSubPage,
  onSubPageClosed,
}: SettingsPageProps) {
  const insets = useSafeAreaInsets();
  const { isDark, themeMode, setThemeMode } = useTheme();
  const colours = getThemeColours(isDark);
  const styles = getSettingsPageStyles(isDark);
  const topBar = getTopAppBarStyles(isDark);
  const [activePage, setActivePage] = useState<SubPage>(initialSubPage ?? null);

  // Honour later prop changes (e.g. user taps the "+" on the home dashboard
  // while the settings tab was already the previous tab).
  useEffect(() => {
    if (initialSubPage) setActivePage(initialSubPage);
  }, [initialSubPage]);

  const closeSubPage = () => {
    setActivePage(null);
    onSubPageClosed?.();
  };

  if (activePage === 'licenseInformation') {
    return <LicenseInformationPage onBack={closeSubPage} />;
  }

  if (activePage === 'savedLocations') {
    return <SavedLocationsPage onBack={closeSubPage} />;
  }

  const isDebugMode = debugMode !== null && debugMode !== undefined;

  const debugLabel: Record<NonNullable<DebugMode>, string> = {
    danger: 'Austria-wide danger alert',
    '503': '503 server response',
  };

  return (
    <View style={{ flex: 1, backgroundColor: colours.background, paddingTop: insets.top }}>
      <View className={topBar.containerOnBackground}>
        <Text className={topBar.title} numberOfLines={1}>
          Settings
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 16,
            gap: 16,
          }}
        >
          <Image
            source={require('../../assets/icon.png')}
            style={{ width: 48, height: 48, borderRadius: 8 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '500', color: colours.text }}>ReadyAlert</Text>
            <Text style={{ fontSize: 13, color: colours.textMuted, marginTop: 2 }}>
              Alerts and preparedness in Austria
            </Text>
          </View>
        </View>

        <Text className={styles.sectionLabel}>Preferences</Text>

        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: colours.text,
              marginBottom: 8,
            }}
          >
            Theme
          </Text>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: colours.surfaceAlt,
              borderRadius: 999,
              padding: 4,
            }}
          >
            {THEME_OPTIONS.map((opt) => {
              const active = themeMode === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setThemeMode(opt.value)}
                  android_ripple={{ color: colours.ripple }}
                  style={{ flex: 1, borderRadius: 999, overflow: 'hidden' }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      paddingVertical: 8,
                      borderRadius: 999,
                      backgroundColor: active ? colours.primaryContainer : 'transparent',
                    }}
                  >
                    <MaterialCommunityIcons
                      name={opt.icon}
                      size={16}
                      color={active ? colours.primary : colours.textMuted}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: active ? '600' : '500',
                        color: active ? colours.primary : colours.textMuted,
                      }}
                    >
                      {opt.label}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={() => setActivePage('savedLocations')}
          className={styles.item}
          android_ripple={{ color: colours.ripple }}
        >
          <MaterialCommunityIcons
            name="map-marker-multiple-outline"
            size={24}
            color={colours.textMuted}
          />
          <Text className={styles.itemText}>Saved locations</Text>
        </Pressable>

        <Pressable
          onPress={() => setActivePage('licenseInformation')}
          className={styles.item}
          android_ripple={{ color: colours.ripple }}
        >
          <MaterialCommunityIcons name="information-outline" size={24} color={colours.textMuted} />
          <Text className={styles.itemText}>License information</Text>
        </Pressable>

        <Pressable
          onPress={() => Alert.alert('Feature coming up soon')}
          className={styles.item}
          android_ripple={{ color: colours.ripple }}
        >
          <MaterialCommunityIcons name="help-circle-outline" size={24} color={colours.textMuted} />
          <View style={{ flex: 1 }}>
            <Text className={styles.itemText}>About</Text>
            <Text style={{ fontSize: 11, color: colours.textMuted, marginTop: 2 }}>
              Version {APP_VERSION}
            </Text>
          </View>
        </Pressable>

        <Text className={styles.sectionLabel}>Debug</Text>

        {isDebugMode ? (
          <Pressable
            className={styles.item}
            android_ripple={{ color: colours.ripple }}
            onPress={onClearDebugPress}
          >
            <MaterialCommunityIcons name="bug-outline" size={24} color={colours.warning} />
            <View style={{ flex: 1 }}>
              <Text className={styles.itemText}>Clear debug mode</Text>
              <Text style={{ fontSize: 11, color: colours.warning, marginTop: 2 }}>
                Currently: {debugLabel[debugMode!]}
              </Text>
            </View>
          </Pressable>
        ) : (
          <>
            <Pressable
              className={styles.item}
              android_ripple={{ color: colours.ripple }}
              onPress={onDebugDangerPress}
            >
              <MaterialCommunityIcons name="alert-outline" size={24} color={colours.warning} />
              <Text className={styles.itemText}>Simulate national danger alert</Text>
            </Pressable>

            <Pressable
              className={styles.item}
              android_ripple={{ color: colours.ripple }}
              onPress={onDebug503Press}
            >
              <MaterialCommunityIcons name="server-off" size={24} color={colours.warning} />
              <Text className={styles.itemText}>Simulate 503 server response</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}
