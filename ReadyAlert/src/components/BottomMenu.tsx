/**
 * Bottom navigation bar rendered across all tabs.
 * Delegates active-tab state upward and opens the navigation drawer when the More button is pressed.
 */

import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getThemeColours } from '../styles/themeColours';
import { MenuButton } from './MenuButton';
import { useTheme } from '../theme/ThemeContext';

interface BottomMenuProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function BottomMenu({ activeTab, setActiveTab }: BottomMenuProps) {
  const { isDark } = useTheme();
  const colours = getThemeColours(isDark);
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: 'row',
        paddingTop: 16,
        paddingBottom: insets.bottom,
        backgroundColor: colours.surface,
        // borderTopColor: colors.text,
        //   borderWidth: 1
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
        onPress={() => setActiveTab('settings')}
      />

    </View>
  );
}
