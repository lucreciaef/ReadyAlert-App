import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import './globals.css';
import { BottomMenu } from './src/components/BottomMenu';
import { card, layout, typography } from './src/styles/appStyles';
import { RightSideMenu } from './src/components/RightSideMenu';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    return 'Dashboard';
  }

  return (
      <SafeAreaView className={layout.safeArea} edges={['bottom']}>
        <View className={layout.app}>
          <View className={layout.content}>
            <Text className={typography.title}>{renderScreenTitle()}</Text>

            <View className={card.container}>
              <Text className={card.title}>Main content area</Text>
              <Text className={card.text}>
                This is where your dashboard content will go.
              </Text>
            </View>
          </View>

          <BottomMenu
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              openMoreMenu={openMoreMenu}
          />

          {isMenuOpen && <RightSideMenu closeMenu={closeMoreMenu} />}
        </View>
      </SafeAreaView>
  );
}