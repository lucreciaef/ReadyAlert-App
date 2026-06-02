/**
 * Learning Centre page for preparedness educational content.
 */

import { ScrollView, Text, View } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { LearningCentreCard } from '../components/LearningCentreCard';
import { PharmacyKitPage } from './learning/PharmacyKitPage';

type SubPage = 'pharmacyKit' | null;

export function LearningCentrePage() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [activePage, setActivePage] = useState<SubPage>(null);

  if (activePage === 'pharmacyKit') {
    return <PharmacyKitPage onBack={() => setActivePage(null)} />;
  }

  return (
    <View
      className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}
      style={{ paddingTop: insets.top }}
    >
      <View
        className={`px-4 h-14 justify-center border-b ${
          isDark ? 'bg-surface-dark border-[#333]' : 'bg-surface border-gray-200'
        }`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Text className={`text-[18px] font-bold ${isDark ? 'text-text-dark' : 'text-text'}`}>
          Learning Centre
        </Text>
      </View>

      <ScrollView
        className="flex-1"
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
