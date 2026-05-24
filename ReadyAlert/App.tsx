import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import './globals.css';
import { BottomMenu } from './src/components/BottomMenu';
import { getCardStyles, getLayoutStyles, getTypographyStyles } from './src/styles/appStyles';
import { RightSideMenu } from './src/components/RightSideMenu';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { SettingsPage } from './src/pages/SettingsPage';
import { HomeDashboardPage } from './src/pages/HomeDashboardPage';
import { NationalStatusPage } from './src/pages/NationalStatusPage';
import { LocationProvider, useLocationContext } from './src/context/LocationContext';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDark } = useTheme();

  const layout = getLayoutStyles(isDark);
  const typography = getTypographyStyles(isDark);
  const card = getCardStyles(isDark);

  const { isDebugMode, setDebugLondon, clearDebugLocation } = useLocationContext();

  function openMoreMenu() {
    setIsMenuOpen(true);
  }

  function closeMoreMenu() {
    setIsMenuOpen(false);
  }

  function renderScreenTitle() {
    if (activeTab === 'home') return 'Dashboard';
    if (activeTab === 'national') return 'National view';
    if (activeTab === 'emergency') return 'Emergency';
    if (activeTab === 'settings') return 'Settings';
    return 'Dashboard';
  }

  function renderContent() {
    if (activeTab === 'settings') {
      return <SettingsPage />;
    }

    // Placeholder for emergency tab
    return (
      <>
        <Text className={typography.title}>{renderScreenTitle()}</Text>

        <View className={card.container}>
          <Text className={card.title}>Main content area placeholder</Text>
          <Text className={card.text}>Placeholder.</Text>
        </View>
      </>
    );
  }

  return (
    <SafeAreaView className={`${layout.safeArea} ${isDark ? 'dark' : ''}`} edges={['bottom']}>
      <View className={layout.app}>
        {activeTab === 'home' ? (
          <HomeDashboardPage />
        ) : activeTab === 'national' ? (
          <NationalStatusPage />
        ) : (
          <View className={layout.content}>{renderContent()}</View>
        )}

        <BottomMenu activeTab={activeTab} setActiveTab={setActiveTab} openMoreMenu={openMoreMenu} />

        {isMenuOpen && (
          <RightSideMenu
            closeMenu={closeMoreMenu}
            onSettingsPress={() => {
              setActiveTab('settings');
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
          <AppContent />
        </LocationProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
