/**
 * Learning Centre page
 * List of items to learn from, and lists of checklists to complete.
 */

import { ScrollView, Text, View } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColors } from '../styles/themeColors';
import { getTopAppBarStyles } from '../styles/appStyles';
import { LearningCentreCard } from '../components/LearningCentreCard';
import { PharmacyKitPage } from './learning/PharmacyKitPage';

type SubPage = 'pharmacyKit' | null;

export function LearningCentrePage() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const topBar = getTopAppBarStyles(isDark);
  const [activePage, setActivePage] = useState<SubPage>(null);

  if (activePage === 'pharmacyKit') {
    return <PharmacyKitPage onBack={() => setActivePage(null)} />;
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: isDark ? colors.background : colors.background, paddingTop: insets.top }}
    >
      <View
        className={topBar.container}
        style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 }}
      >
        <Text className={topBar.title} numberOfLines={1}>
          Learning Centre
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <LearningCentreCard
          title="Home pharmacy kit"
          description="What you should always have at home for basic emergencies and an emergency kit."
          onPress={() => setActivePage('pharmacyKit')}
        />

      </ScrollView>
    </View>
  );
}
