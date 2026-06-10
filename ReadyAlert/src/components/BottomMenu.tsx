/**
 * Bottom navigation bar rendered across all tabs.
 * Delegates active-tab state upward and opens the navigation drawer when the More button is pressed.
 */

import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getThemeColors } from '../styles/themeColors';
import { MenuButton } from './MenuButton';
import { useTheme } from '../theme/ThemeContext';

interface BottomMenuProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openMoreMenu: () => void;
}

export function BottomMenu({ activeTab, setActiveTab, openMoreMenu }: BottomMenuProps) {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: 'row',
        paddingTop: 16,
        paddingBottom: insets.bottom,
        backgroundColor: isDark ? colors.surfaceContainer : colors.surfaceContainer,
      }}
    >
      <MenuButton
        label="Home"
        icon="home-outline"
        active={activeTab === 'home'}
        onPress={() => setActiveTab('home')}
      />

      <MenuButton
        label="National"
        icon="map-outline"
        active={activeTab === 'national'}
        onPress={() => setActiveTab('national')}
      />

      <MenuButton
        label="Emergency"
        icon="alert-circle-outline"
        active={activeTab === 'emergency'}
        onPress={() => setActiveTab('emergency')}
      />

      <MenuButton
        label="Learning"
        icon="school-outline"
        active={activeTab === 'learning'}
        onPress={()=>setActiveTab('learning')}
      />

      <MenuButton
        label="Settings"
        icon="cog-outline"
        active={activeTab === 'settings'}
        onPress={()=>setActiveTab('settings')}
      />

    </View>
  );
}
