/**
 * Learning Centre page
 * List of items to learn from, and lists of checklists to complete.
 */

import { ScrollView, Text, View } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';
import { getLayoutStyles, getTopAppBarStyles } from '../styles/appStyles';
import { LearningCentreCard } from '../components/LearningCentreCard';
import { PreparednessScoreCard } from '../components/PreparednessScoreCard';
import { PharmacyKitPage } from './learning/PharmacyKitPage';
import { WeatherEmergencyTipsPage } from './learning/WeatherEmergencyTipsPage';
import { BuildingAGoBagPage } from './learning/BuildingAGoBagPage';

type SubPage = 'pharmacyKit' | 'weatherEmergencyTips' | 'goBag' | null;

export function LearningCentrePage() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);
  const layout = getLayoutStyles(isDark);
  const topBar = getTopAppBarStyles(isDark);
  const [activePage, setActivePage] = useState<SubPage>(null);

  if (activePage === 'pharmacyKit') {
    return <PharmacyKitPage onBack={() => setActivePage(null)} />;
  }
  if (activePage === 'weatherEmergencyTips') {
    return <WeatherEmergencyTipsPage onBack={() => setActivePage(null)} />;
  }
  if (activePage === 'goBag') {
    return <BuildingAGoBagPage onBack={() => setActivePage(null)} />;
  }

  return (
    <View className={layout.safeArea} style={{ paddingTop: insets.top }}>
      <View className={topBar.containerOnBackground}>
        <Text className={topBar.title} numberOfLines={1}>
          Learning centre
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 14, lineHeight: 20, color: colors.text, marginBottom: 16 }}>
          Complete the tasks below to build your preparedness against different environmental
          risks. Keep your readiness up to date.
        </Text>
        <View style={{ marginBottom: 16 }}>
          <PreparednessScoreCard />
        </View>
        <LearningCentreCard
          taskId="task_pharmacy_kit"
          title="Home pharmacy kit"
          description="What you should always have at home for basic emergencies and an emergency kit."
          iconName="medical-bag"
          onPress={() => setActivePage('pharmacyKit')}
        />
        <LearningCentreCard
          taskId="task_weather_tips"
          title="Weather emergency tips"
          description="How to prepare for and stay safe during extreme weather events like floods and hurricane-like winds."
          iconName="weather-lightning-rainy"
          onPress={() => setActivePage('weatherEmergencyTips')}
        />
        <LearningCentreCard
          taskId="task_go_bag"
          title="Emergency go-bag"
          description="What to pack in a go-bag so you can leave your home quickly if evacuation becomes necessary."
          iconName="bag-personal-outline"
          onPress={() => setActivePage('goBag')}
        />
      </ScrollView>
    </View>
  );
}
