/**
 * Learning Centre page
 * List of items to learn from, and lists of checklists to complete.
 */

import {ScrollView, Text, View} from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';
import { getTopAppBarStyles } from '../styles/appStyles';
import { LearningCentreCard } from '../components/LearningCentreCard';
import { PharmacyKitPage } from './learning/PharmacyKitPage';
import { WeatherEmergencyTipsPage } from "./learning/WeatherEmergencyTipsPage";
import {MaterialCommunityIcons} from "@expo/vector-icons";

type SubPage = 'pharmacyKit' | 'weatherEmergencyTips' | null;

export function LearningCentrePage() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);
  const topBar = getTopAppBarStyles(isDark);
  const [activePage, setActivePage] = useState<SubPage>(null);

  if (activePage === 'pharmacyKit') {
    return <PharmacyKitPage onBack={() => setActivePage(null)} />;
  }
  if (activePage === 'weatherEmergencyTips') {
    return <WeatherEmergencyTipsPage onBack={() => setActivePage(null)} />;
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: isDark ? colors.background : colors.background, paddingTop: insets.top }}
    >
      <View
        style={{
          height: 64,
          backgroundColor: colors.background,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          gap: 12 }}
      >
        <MaterialCommunityIcons name="school-outline" size={24} color={colors.primary} />
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
          iconName="medical-bag"
          onPress={() => setActivePage('pharmacyKit')}
        />
        <LearningCentreCard
          title="Weather emergency tips"
          description="How to prepare for and stay safe during extreme weather events like floods and hurricane-like winds."
          iconName="weather-lightning-rainy"
          onPress={() => setActivePage('weatherEmergencyTips')}
        />
      </ScrollView>
    </View>
  );
}
