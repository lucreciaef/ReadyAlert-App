import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import './globals.css';
import { BottomMenu } from './src/components/BottomMenu';
import { getLayoutStyles } from './src/styles/appStyles';
import { RightSideMenu } from './src/components/RightSideMenu';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { HomeDashboardPage } from './src/pages/HomeDashboardPage';
import { NationalStatusPage } from './src/pages/NationalStatusPage';
import { EmergencyPage } from "./src/pages/EmergencyPage";
import { LocationProvider, useLocationContext } from './src/context/LocationContext';

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
      <View className={layout.app}>
        {activeTab === 'home' ? (
          <HomeDashboardPage />
        ) : activeTab === 'national' ? (
          <NationalStatusPage />
        ) : activeTab === 'emergency' ? (
          <EmergencyPage />
        ) : null}

        <BottomMenu activeTab={activeTab} setActiveTab={setActiveTab} openMoreMenu={openMoreMenu} />

        {isMenuOpen && (
          <RightSideMenu
            closeMenu={closeMoreMenu}
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
          <AppContent />
        </LocationProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
