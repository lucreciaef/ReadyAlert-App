/**
 * Settings page
 * Contains user preferences, info about licencing and debug tools.
 */

import { ScrollView, Text, View, Pressable, Alert, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { useTheme, ThemeMode } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';
import { getSettingsPageStyles, getTopAppBarStyles } from '../styles/appStyles';
import { DebugMode } from '../context/LocationContext';
import { LicenseInformationPage } from './settings/LicenseInformationPage';
import { SavedLocationsPage } from './settings/SavedLocationsPage';
import { AboutPage } from './settings/AboutPage';
import {
  cancelScheduledTaskExpiryNotification,
  scheduleRtrTestNotification,
  scheduleTaskExpiryNotification,
} from '../utils/notifications';
import appJson from '../../app.json';

type SubPage = 'licenseInformation' | 'savedLocations' | 'about' | null;

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
  const db = useSQLiteContext();
  const [activePage, setActivePage] = useState<SubPage>(initialSubPage ?? null);
  const [expiryDebugBusy, setExpiryDebugBusy] = useState(false);
  const [dangerDebugBusy, setDangerDebugBusy] = useState(false);
  const [logoTapCount, setLogoTapCount] = useState(0);
  const debugUnlocked = logoTapCount >= 10;

  const handleLogoTap = () => {
    const next = logoTapCount + 1;
    setLogoTapCount(next);
    if (next === 10) {
      Alert.alert('Debug settings unlocked', 'Debug tools are now visible.');
    }
  };

  const handleDebugDangerPress = async () => {
    setDangerDebugBusy(true);
    try {
      onDebugDangerPress?.();
      await scheduleRtrTestNotification();
      Alert.alert(
        'Alert simulation scheduled',
        'A national danger alert notification will arrive in ~1 minute. Close the app and wait.',
      );
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setDangerDebugBusy(false);
    }
  };

  const handleDebugExpireArticle = async () => {
    setExpiryDebugBusy(true);
    try {
      const now = new Date();
      const completedAt = now.toISOString();
      const expiresAt = new Date(now.getTime() + 60 * 1000);

      // Cancel any existing scheduled notification before rescheduling.
      const existing = await db.getFirstAsync<{ expiry_notification_id: string | null }>(
        `SELECT expiry_notification_id FROM tasks WHERE id = 'task_weather_tips'`,
      );
      if (existing?.expiry_notification_id) {
        await cancelScheduledTaskExpiryNotification(existing.expiry_notification_id);
      }

      const notificationId = await scheduleTaskExpiryNotification(
        'Weather Emergency Tips',
        expiresAt,
      );

      // Mark all weather tips checklist items as answered/checked (works for both
      // the legacy single-checkbox and the post-migration quiz question rows).
      await db.runAsync(
        `UPDATE checklist_items SET checked = 1 WHERE task_id = 'task_weather_tips'`,
      );
      await db.runAsync(
        `UPDATE tasks SET completed_at = ?, expires_at = ?, expiry_notification_id = ? WHERE id = 'task_weather_tips'`,
        [completedAt, expiresAt.toISOString(), notificationId],
      );

      Alert.alert(
        'Expiry scheduled',
        'The "Weather Emergency Tips" article will expire in 1 minute. Close the app and wait for the push notification.',
      );
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setExpiryDebugBusy(false);
    }
  };

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

  if (activePage === 'about') {
    return <AboutPage onBack={closeSubPage} />;
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
          <Pressable onPress={handleLogoTap} android_ripple={null}>
            <Image
              source={require('../../assets/icon.png')}
              style={{ width: 48, height: 48, borderRadius: 8 }}
            />
          </Pressable>
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
          onPress={() => setActivePage('about')}
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

        {debugUnlocked && (
          <>
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
                  onPress={handleDebugDangerPress}
                  disabled={dangerDebugBusy}
                >
                  <MaterialCommunityIcons name="alert-outline" size={24} color={colours.warning} />
                  <View style={{ flex: 1 }}>
                    <Text className={styles.itemText}>Simulate national danger alert</Text>
                    <Text style={{ fontSize: 11, color: colours.textMuted, marginTop: 2 }}>
                      Schedules a notification in 1 minute — close the app to test
                    </Text>
                  </View>
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

            <Pressable
              className={styles.item}
              android_ripple={{ color: colours.ripple }}
              onPress={handleDebugExpireArticle}
              disabled={expiryDebugBusy}
            >
              <MaterialCommunityIcons name="timer-outline" size={24} color={colours.warning} />
              <View style={{ flex: 1 }}>
                <Text className={styles.itemText}>Expire article in 1 minute</Text>
                <Text style={{ fontSize: 11, color: colours.textMuted, marginTop: 2 }}>
                  Schedules "Weather Emergency Tips" to expire and sends a notification
                </Text>
              </View>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}
