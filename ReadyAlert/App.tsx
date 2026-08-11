// Side-effect imports: register TaskManager task definitions before React mounts
import './src/tasks/expiryBackgroundTask';
import './src/tasks/rtrBackgroundTask';
import './src/tasks/geosphereBackgroundTask';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useFonts, RobotoFlex_400Regular } from '@expo-google-fonts/roboto-flex';
import './globals.css';
import { BottomMenu } from './src/components/BottomMenu';
import { getLayoutStyles } from './src/styles/appStyles';
import { SettingsPage } from './src/pages/SettingsPage';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { HomeDashboardPage } from './src/pages/HomeDashboardPage';
import { NationalStatusPage } from './src/pages/NationalStatusPage';
import { EmergencyPage } from './src/pages/EmergencyPage';
import { LearningCentrePage } from './src/pages/LearningCentrePage';
import { LocationProvider, useLocationContext } from './src/context/LocationContext';
import { SavedLocationsProvider } from './src/context/SavedLocationsContext';
import { PreparednessProvider, usePreparedness } from './src/context/PreparednessContext';
import { migrateDbIfNeeded } from './src/db/migrations';
import { registerExpiryBackgroundTask } from './src/tasks/expiryBackgroundTask';
import { registerRtrBackgroundTask } from './src/tasks/rtrBackgroundTask';
import { registerGeosphereBackgroundTask } from './src/tasks/geosphereBackgroundTask';
import { registerForPushNotifications } from './src/utils/notifications';
import { checkAndExpireTasks } from './src/utils/taskExpiry';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const [pendingSettingsSubPage, setPendingSettingsSubPage] = useState<
    'savedLocations' | null
  >(null);
  const [subPageReturnTab, setSubPageReturnTab] = useState<string | null>(null);
  const { isDark } = useTheme();
  const layout = getLayoutStyles(isDark);
  const { debugMode, setDebugDanger, setDebug503, clearDebugLocation } = useLocationContext();
  const { refresh: refreshPreparedness } = usePreparedness();
  const db = useSQLiteContext();

  // Run expiry check whenever the app comes to the foreground
  const appState = useRef(AppState.currentState);
  const handleAppStateChange = useCallback(
    async (nextState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        try {
          await checkAndExpireTasks(db);
          await refreshPreparedness();
        } catch {
          // Non-critical: don't crash the app if expiry check fails
        }
      }
      appState.current = nextState;
    },
    [db, refreshPreparedness],
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [handleAppStateChange]);

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

  // Register channels and background tasks as early as possible (does not require DB)
  useEffect(() => {
    registerForPushNotifications();
    registerExpiryBackgroundTask();
    registerRtrBackgroundTask();
    registerGeosphereBackgroundTask();
  }, []);

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
