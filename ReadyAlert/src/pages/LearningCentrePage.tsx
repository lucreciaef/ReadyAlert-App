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
import { NoReactionPersonTipsPage } from './learning/NoReactionPersonTipsPage';
import { PoisoningDangerAtHomeTipsPage } from './learning/PoisoningDangerAtHomeTipsPage';
import { OneWeekStockpilePage } from './learning/OneWeekStockpilePage';
import { usePreparedness } from '../context/PreparednessContext';

type SubPage =
  | 'pharmacyKit'
  | 'weatherEmergencyTips'
  | 'goBag'
  | 'noReactionPerson'
  | 'poisoningTips'
  | 'weeklyStockpile'
  | null;

export function LearningCentrePage() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);
  const layout = getLayoutStyles(isDark);
  const topBar = getTopAppBarStyles(isDark);
  const { preparedness } = usePreparedness();
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
  if (activePage === 'noReactionPerson') {
    return <NoReactionPersonTipsPage onBack={() => setActivePage(null)} />;
  }
  if (activePage === 'poisoningTips') {
    return <PoisoningDangerAtHomeTipsPage onBack={() => setActivePage(null)} />;
  }
  if (activePage === 'weeklyStockpile') {
    return <OneWeekStockpilePage onBack={() => setActivePage(null)} />;
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
          Complete the tasks below to build your preparedness against different environmental risks.
          Keep your readiness up to date.
        </Text>
        <View style={{ marginBottom: 16 }}>
          <PreparednessScoreCard />
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: preparedness.color,
              textAlign: 'center',
              marginTop: 8,
            }}
          >
            {preparedness.label}
          </Text>
        </View>
        <LearningCentreCard
          taskId="task_pharmacy_kit"
          title="Home pharmacy kit"
          description="What you should always have at home for basic emergencies and an emergency kit."
          iconName="medication"
          onPress={() => setActivePage('pharmacyKit')}
        />
        <LearningCentreCard
          taskId="task_go_bag"
          title="Emergency go-bag"
          description="What to pack in a go-bag so you can leave your home quickly if evacuation becomes necessary."
          iconName="bag-personal-outline"
          onPress={() => setActivePage('goBag')}
        />
        <LearningCentreCard
          taskId="task_stockpile"
          title="Emergency stockpile for one week"
          description="What to stockpile at home for one week in case of emergencies."
          iconName="cart-outline"
          onPress={() => setActivePage('weeklyStockpile')}
        />
        <LearningCentreCard
          taskId="task_no_reaction_person_tips"
          title="How to help a non-reactive person"
          description="First-aid tips to assist a person that does not respond."
          iconName="medical-bag"
          onPress={() => setActivePage('noReactionPerson')}
        />
        <LearningCentreCard
          taskId="task_poisoning_tips"
          title="Poisoning dangers at home"
          description="Learn how to identify and avoid poisoning at home."
          iconName="home-alert"
          onPress={() => setActivePage('poisoningTips')}
        />
        <LearningCentreCard
          taskId="task_weather_tips"
          title="Weather emergency tips"
          description="How to prepare for and stay safe during extreme weather events like floods and hurricane-like winds."
          iconName="weather-lightning-rainy"
          onPress={() => setActivePage('weatherEmergencyTips')}
        />
      </ScrollView>
    </View>
  );
}
