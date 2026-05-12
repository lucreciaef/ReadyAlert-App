import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomMenu } from './src/components/BottomMenu';
import { styles } from './src/styles/appStyles';
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
    if (activeTab === 'national') return 'National View';
    if (activeTab === 'emergency') return 'Emergency';
    return 'Dashboard';
  }

  return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.app}>
          <View style={styles.content}>
            <Text style={styles.title}>{renderScreenTitle()}</Text>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Main content area</Text>
              <Text style={styles.cardText}>
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