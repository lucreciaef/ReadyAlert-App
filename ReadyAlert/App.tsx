import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
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
import { PreparednessProvider } from './src/context/PreparednessContext';
import { migrateDbIfNeeded } from './src/db/migrations';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const [prevTab, setPrevTab] = useState('home');
  const { isDark } = useTheme();

  const layout = getLayoutStyles(isDark);

  const { isDebugMode, setDebugLondon, clearDebugLocation } = useLocationContext();

  function openSettings() {
    setPrevTab(activeTab);
    setActiveTab('settings');
  }

  function closeSettings() {
    setActiveTab(prevTab);
  }

  return (
    <SafeAreaView className={layout.safeArea} edges={[]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View className={layout.app}>
        {activeTab === 'settings' ? (
          <SettingsPage
            onBack={closeSettings}
            onLearningCentrePress={() => { closeSettings(); setActiveTab('learning'); }}
            isDebugMode={isDebugMode}
            onDebugLondonPress={() => { setDebugLondon(); closeSettings(); }}
            onClearDebugPress={() => { clearDebugLocation(); closeSettings(); }}
          />
        ) : activeTab === 'home' ? (
          <HomeDashboardPage onPreparednessPress={() => setActiveTab('learning')} onSettingsPress={openSettings} />
        ) : activeTab === 'national' ? (
          <NationalStatusPage onSettingsPress={openSettings} />
        ) : activeTab === 'emergency' ? (
          <EmergencyPage onSettingsPress={openSettings} />
        ) : activeTab === 'learning' ? (
          <LearningCentrePage onSettingsPress={openSettings} />
        ) : null}

        {activeTab !== 'settings' && (
          <BottomMenu activeTab={activeTab} setActiveTab={setActiveTab} openMoreMenu={openSettings} />
        )}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LocationProvider>
          <SQLiteProvider databaseName="readyalert.db" onInit={migrateDbIfNeeded}>
            <PreparednessProvider>
              <AppContent />
            </PreparednessProvider>
          </SQLiteProvider>
        </LocationProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
