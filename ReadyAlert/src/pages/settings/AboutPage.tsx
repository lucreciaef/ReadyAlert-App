import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { getThemeColours } from '../../styles/themeColours';
import { getLicenseInformationPageStyles, getLayoutStyles, getTopAppBarShadow, getTopAppBarStyles } from '../../styles/appStyles';
import appJson from '../../../app.json';

const APP_VERSION = appJson.expo.version;

interface AboutPageProps {
  onBack: () => void;
}

export function AboutPage({ onBack }: AboutPageProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);
  const layout = getLayoutStyles(isDark);
  const topBar = getTopAppBarStyles(isDark);
  const styles = getLicenseInformationPageStyles(isDark);

  return (
    <View className={layout.safeArea} style={{ paddingTop: insets.top }}>
      <View className={topBar.container} style={getTopAppBarShadow(colors)}>
        <Pressable
          onPress={onBack}
          android_ripple={{ color: colors.ripple, borderless: true }}
          className={topBar.iconButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </Pressable>
        <Text className={topBar.titleMedium} numberOfLines={1}>
          About
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className={styles.sectionLabel}>App Information</Text>
        <View className={`${styles.card} ${styles.cardSpacing}`}>
          <View className={styles.libraryRow}>
            <Text className={styles.libraryName}>Version</Text>
            <Text className={styles.libraryLicense}>{APP_VERSION}</Text>
          </View>
        </View>

        <Text className={styles.sectionLabel}>Disclaimer</Text>
        <View className={styles.card}>
          <View className={styles.creditRow}>
            <Text className={styles.creditDescription}>
              App developed as part of the CM3070 Final Project module. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
