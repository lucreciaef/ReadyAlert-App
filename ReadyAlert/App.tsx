import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useFonts, RobotoFlex_400Regular } from '@expo-google-fonts/roboto-flex';
import './globals.css';
import { BottomMenu } from './src/components/BottomMenu';
import { getLayoutStyles } from './src/styles/appStyles';
import { SettingsPage } from './src/pages/SettingsPage';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { HomeDashboardPage } from './src/pages/HomeDashboardPage';
import { NationalStatusPage } from './src/pages/NationalStatusPage';
import { EmergencyPage } from "./src/pages/EmergencyPage";
import { LearningCentrePage } from './src/pages/LearningCentrePage';
import { LocationProvider, useLocationContext } from './src/context/LocationContext';
import { SavedLocationsProvider } from './src/context/SavedLocationsContext';
import { PreparednessProvider } from './src/context/PreparednessContext';
import { migrateDbIfNeeded } from './src/db/migrations';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  // When the "+" on the Home Dashboard is tapped, we jump to the Settings tab
  // and open Saved Locations directly. This flag gets consumed on subpage close.
  const [pendingSettingsSubPage, setPendingSettingsSubPage] = useState<
    'savedLocations' | null
  >(null);
  // Tab to restore when a deep-linked subpage closes, so the back arrow returns
  // to where the user came from instead of the Settings root.
  const [subPageReturnTab, setSubPageReturnTab] = useState<string | null>(null);
  const { isDark } = useTheme();

  const layout = getLayoutStyles(isDark);

  const { debugMode, setDebugDanger, setDebug503, clearDebugLocation } = useLocationContext();

  const openSavedLocations = () => {
    setSubPageReturnTab(activeTab);
    setPendingSettingsSubPage('savedLocations');
    setActiveTab('settings');
  };

  const handleSubPageClosed = () => {
    setPendingSettingsSubPage(null);
    if (subPageReturnTab && subPageReturnTab !== 'settings') {
      setActiveTab(subPageReturnTab);
    }
    setSubPageReturnTab(null);
  };

  return (
    <SafeAreaView className={layout.safeArea} edges={[]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View className={layout.app}>
        {activeTab === 'home' ? (
          <HomeDashboardPage
            onPreparednessPress={() => setActiveTab('learning')}
            onOpenSavedLocations={openSavedLocations}
          />
        ) : activeTab === 'national' ? (
          <NationalStatusPage />
        ) : activeTab === 'emergency' ? (
          <EmergencyPage />
        ) : activeTab === 'learning' ? (
          <LearningCentrePage />
        ) : activeTab === 'settings' ? (
          <SettingsPage
            debugMode={debugMode}
            onDebugDangerPress={() => setDebugDanger()}
            onDebug503Press={() => setDebug503()}
            onClearDebugPress={() => clearDebugLocation()}
            initialSubPage={pendingSettingsSubPage}
            onSubPageClosed={handleSubPageClosed}
          />
        ) : null}

        <BottomMenu activeTab={activeTab} setActiveTab={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ RobotoFlex_400Regular });
  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SavedLocationsProvider>
          <LocationProvider>
            <SQLiteProvider databaseName="readyalert.db" onInit={migrateDbIfNeeded}>
              <PreparednessProvider>
                <AppContent />
              </PreparednessProvider>
            </SQLiteProvider>
          </LocationProvider>
        </SavedLocationsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
