/**
 * Settings page
 * Contains user preferences, info about licencing and debug tools.
 */

import { ScrollView, Text, View, Pressable, Alert, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';
import { getSettingsPageStyles } from '../styles/appStyles';
import { DebugMode } from '../context/LocationContext';
import { LicenseInformationPage } from './settings/LicenseInformationPage';
import { SavedLocationsPage } from './settings/SavedLocationsPage';

type SubPage = 'licenseInformation' | 'savedLocations' | null;

interface SettingsPageProps {
  debugMode?: DebugMode;
  onDebugLondonPress?: () => void;
  onDebugGrazPress?: () => void;
  onDebugDangerPress?: () => void;
  onDebug503Press?: () => void;
  onClearDebugPress?: () => void;
  /** When set, the settings page opens directly on this subpage. */
  initialSubPage?: SubPage;
  /** Called when the initial subpage is closed so the parent can reset the request. */
  onSubPageClosed?: () => void;
}

export function SettingsPage({
  debugMode,
  onDebugLondonPress,
  onDebugGrazPress,
  onDebugDangerPress,
  onDebug503Press,
  onClearDebugPress,
  initialSubPage,
  onSubPageClosed,
}: SettingsPageProps) {
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useTheme();
  const colours = getThemeColours(isDark);
  const styles = getSettingsPageStyles(isDark);
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
    london: 'London, UK',
    graz: 'Graz, Austria',
    danger: 'Austria-wide danger alert',
    '503': '503 Server Response',
  };

  return (
    <View style={{ flex: 1, backgroundColor: colours.background, paddingTop: insets.top }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20 }}>
          <Image
            source={require('../../assets/icon.png')}
            style={{ width: 128, height: 128, borderRadius: 8 }}
          />
          <Text style={{ fontSize: 22, fontWeight: '400', marginTop: 8, color: colours.text }}>
            ReadyAlert
          </Text>
          <Text style={{ fontSize: 14, marginTop: 4, color: colours.textMuted }}>
            Alerts and preparedness in Austria
          </Text>
        </View>

        <Text className={styles.sectionLabel}>Preferences</Text>

        <Pressable
          className={styles.item}
          android_ripple={{ color: colours.ripple }}
          onPress={toggleTheme}
        >
          <MaterialCommunityIcons
            name={isDark ? 'white-balance-sunny' : 'moon-waning-crescent'}
            size={24}
            color={colours.textMuted}
          />
          <Text className={styles.itemText}>{isDark ? 'Light Mode' : 'Dark Mode'}</Text>
        </Pressable>

        <Pressable
          onPress={() => setActivePage('savedLocations')}
          className={styles.item}
          android_ripple={{ color: colours.ripple }}
        >
          <MaterialCommunityIcons name="map-marker-multiple-outline" size={24} color={colours.textMuted} />
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
          <Text className={styles.itemText}>About</Text>
        </Pressable>

        <View className={styles.divider} />

        <Text className={styles.sectionLabel}>Debug</Text>

        {isDebugMode ? (
          <Pressable
            className={styles.item}
            android_ripple={{ color: colours.ripple }}
            onPress={onClearDebugPress}
          >
            <MaterialCommunityIcons name="bug" size={24} color={colours.warning} />
            <View style={{ flex: 1 }}>
              <Text className={styles.itemText}>Clear Debug Mode</Text>
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
              onPress={onDebugLondonPress}
            >
              <MaterialCommunityIcons
                name="map-marker-off-outline"
                size={24}
                color={colours.warning}
              />
              <Text className={styles.itemText}>
                Simulate Current location to London, UK in Dashboard
              </Text>
            </Pressable>

            <Pressable
              className={styles.item}
              android_ripple={{ color: colours.ripple }}
              onPress={onDebugGrazPress}
            >
              <MaterialCommunityIcons name="map-marker-outline" size={24} color={colours.warning} />
              <Text className={styles.itemText}>
                Simulate Forced location to Graz, AT in Dashboard
              </Text>
            </Pressable>

            <Pressable
              className={styles.item}
              android_ripple={{ color: colours.ripple }}
              onPress={onDebugDangerPress}
            >
              <MaterialCommunityIcons name="alert-outline" size={24} color={colours.warning} />
              <Text className={styles.itemText}>Simulate National Danger Alert</Text>
            </Pressable>

            <Pressable
              className={styles.item}
              android_ripple={{ color: colours.ripple }}
              onPress={onDebug503Press}
            >
              <MaterialCommunityIcons name="server-off" size={24} color={colours.warning} />
              <Text className={styles.itemText}>Simulate 503 Server Response</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}
