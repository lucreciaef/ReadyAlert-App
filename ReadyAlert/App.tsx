import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import './globals.css';
import { BottomMenu } from './src/components/BottomMenu';
import { getLayoutStyles } from './src/styles/appStyles';
import { LeftSideMenu } from './src/components/LeftSideMenu';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDark } = useTheme();

  const layout = getLayoutStyles(isDark);

  const { isDebugMode, setDebugLondon, clearDebugLocation } = useLocationContext();

  function openMoreMenu() {
    setIsMenuOpen(true);
  }

  function closeMoreMenu() {
    setIsMenuOpen(false);
  }

  return (
    <SafeAreaView className={`${layout.safeArea} ${isDark ? 'dark' : ''}`} edges={['bottom']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View className={layout.app}>
        {activeTab === 'home' ? (
          <HomeDashboardPage onPreparednessPress={() => setActiveTab('learningCentre')} />
        ) : activeTab === 'national' ? (
          <NationalStatusPage />
        ) : activeTab === 'emergency' ? (
          <EmergencyPage />
        ) : activeTab === 'learningCentre' ? (
          <LearningCentrePage />
        ) : null}

        <BottomMenu activeTab={activeTab} setActiveTab={setActiveTab} openMoreMenu={openMoreMenu} />

        {isMenuOpen && (
          <LeftSideMenu
            closeMenu={closeMoreMenu}
            onLearningCentrePress={() => {
              setActiveTab('learningCentre');
              closeMoreMenu();
            }}
            isDebugMode={isDebugMode}
            onDebugLondonPress={() => {
              setDebugLondon();
              closeMoreMenu();
            }}
            onClearDebugPress={() => {
              clearDebugLocation();
              closeMoreMenu();
            }}
          />
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
