/**
 * Bottom navigation bar rendered across all tabs.
 * Delegates active-tab state upward and opens the right-side drawer when the More button is pressed.
 */

import { View } from 'react-native';
import { getBottomMenuStyles } from '../styles/appStyles';
import { MenuButton } from './MenuButton';
import { useTheme } from '../theme/ThemeContext';

interface BottomMenuProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openMoreMenu: () => void;
}

export function BottomMenu({ activeTab, setActiveTab, openMoreMenu }: BottomMenuProps) {
  const { isDark } = useTheme();
  const bottomMenu = getBottomMenuStyles(isDark);

  return (
    <View className={bottomMenu.container}>
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

      <MenuButton label="More" icon="ellipsis-horizontal" active={false} onPress={openMoreMenu} />
    </View>
  );
}
