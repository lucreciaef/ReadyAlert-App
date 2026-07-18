/**
 * License Information page.
 * Lists open source libraries used in the app, plus other credits/sources
 */

import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { getThemeColours } from '../../styles/themeColours';
import { getLicenseInformationPageStyles, getTopAppBarStyles } from '../../styles/appStyles';

interface LicenseInformationPageProps {
  onBack: () => void;
}

interface LibraryEntry {
  name: string;
  license: string;
  url: string;
}

const OPEN_SOURCE_LIBRARIES: LibraryEntry[] = [
  { name: '@expo-google-fonts/roboto-flex', license: 'OFL-1.1', url: 'https://github.com/expo/google-fonts' },
  { name: 'expo', license: 'MIT', url: 'https://github.com/expo/expo' },
  { name: 'expo-dev-client', license: 'MIT', url: 'https://github.com/expo/expo' },
  { name: 'expo-font', license: 'MIT', url: 'https://github.com/expo/expo' },
  { name: 'expo-location', license: 'MIT', url: 'https://github.com/expo/expo' },
  { name: 'expo-notifications', license: 'MIT', url: 'https://github.com/expo/expo' },
  { name: 'expo-sqlite', license: 'MIT', url: 'https://github.com/expo/expo' },
  { name: 'expo-status-bar', license: 'MIT', url: 'https://github.com/expo/expo' },
  { name: '@expo/vector-icons', license: 'MIT', url: 'https://github.com/expo/vector-icons' },
  { name: '@react-native-async-storage/async-storage', license: 'MIT', url: 'https://github.com/react-native-async-storage/async-storage' },
  { name: 'nativewind', license: 'MIT', url: 'https://github.com/nativewind/nativewind' },
  { name: 'openmeteo', license: 'MIT', url: 'https://github.com/open-meteo/sdk' },
  { name: 'react', license: 'MIT', url: 'https://github.com/facebook/react' },
  { name: 'react-native', license: 'MIT', url: 'https://github.com/facebook/react-native' },
  { name: 'react-native-maps', license: 'MIT', url: 'https://github.com/react-native-maps/react-native-maps' },
  { name: 'react-native-reanimated', license: 'MIT', url: 'https://github.com/software-mansion/react-native-reanimated' },
  { name: 'react-native-safe-area-context', license: 'MIT', url: 'https://github.com/th3rdwave/react-native-safe-area-context' },
  { name: 'react-native-webview', license: 'MIT', url: 'https://github.com/react-native-webview/react-native-webview' },
  { name: 'react-native-worklets', license: 'MIT', url: 'https://github.com/software-mansion/react-native-reanimated' },
];

interface CreditEntry {
  title: string;
  description: string;
  url: string;
}

const CREDITS: CreditEntry[] = [
  {
    title: 'Open-Meteo',
    description:
      'Weather and air quality data provided by Open-Meteo.com, licensed under Creative Commons Attribution 4.0 (CC BY 4.0).',
    url: 'https://open-meteo.com/en/license',
  },
  {
    title: 'Österreichisches Rotes Kreuz (Austrian Red Cross)',
    description:
      'Emergency preparedness checklists and weather safety guidance are adapted from the Austrian Red Cross.',
    url: 'https://www.roteskreuz.at/',
  },
];

export function LicenseInformationPage({ onBack }: LicenseInformationPageProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);
  const topBar = getTopAppBarStyles(isDark);
  const styles = getLicenseInformationPageStyles(isDark);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View
        className={topBar.container}
        style={{ elevation: 2, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 }}
      >
        <Pressable
          onPress={onBack}
          android_ripple={{ color: colors.ripple, borderless: true }}
          style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </Pressable>
        <Text className={topBar.titleMedium} numberOfLines={1}>
          License Information
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className={styles.sectionLabel}>Open Source Libraries</Text>
        <View className={`${styles.card} ${styles.cardSpacing}`}>
          {OPEN_SOURCE_LIBRARIES.map((lib, idx) => (
            <Pressable
              key={lib.name}
              onPress={() => Linking.openURL(lib.url)}
              android_ripple={{ color: colors.ripple }}
              className={`${styles.libraryRow} ${idx === OPEN_SOURCE_LIBRARIES.length - 1 ? '' : styles.rowDivider}`}
            >
              <View style={{ flex: 1 }}>
                <Text className={styles.libraryName}>{lib.name}</Text>
                <Text className={styles.libraryLicense}>{lib.license} License</Text>
              </View>
              <MaterialCommunityIcons name="open-in-new" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>

        <Text className={styles.sectionLabel}>Credits &amp; Sources</Text>
        <View className={styles.card}>
          {CREDITS.map((credit, idx) => (
            <Pressable
              key={credit.title}
              onPress={() => Linking.openURL(credit.url)}
              android_ripple={{ color: colors.ripple }}
              className={`${styles.creditRow} ${idx === CREDITS.length - 1 ? '' : styles.rowDivider}`}
            >
              <Text className={styles.creditTitle}>{credit.title}</Text>
              <Text className={styles.creditDescription}>{credit.description}</Text>
              <Text className={styles.creditUrl}>{credit.url}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
