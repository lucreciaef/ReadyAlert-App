import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getOverlayStyles, getSideMenuStyles } from '../styles/appStyles';
import { getThemeColors } from '../styles/themeColors';
import { useTheme } from '../theme/ThemeContext';

interface RightSideMenuProps {
  closeMenu: () => void;
  isDebugMode?: boolean;
  onDebugLondonPress?: () => void;
  onClearDebugPress?: () => void;
}

export function RightSideMenu({
  closeMenu,
  isDebugMode,
  onDebugLondonPress,
  onClearDebugPress,
}: RightSideMenuProps) {
  const { isDark, toggleTheme } = useTheme();
  const overlay = getOverlayStyles(isDark);
  const sideMenu = getSideMenuStyles(isDark);
  const colors = getThemeColors(isDark);

  return (
    <View className={overlay.container}>
      <Pressable className={overlay.background} onPress={closeMenu} />

      <View className={sideMenu.container}>
        {/* ── Top section: menu items ── */}
        <View>
          <Text className={sideMenu.title}>More</Text>

          <TouchableOpacity className={sideMenu.item} onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={22} color={colors.primary} />
            <View className="flex-1 flex-row items-center justify-between">
              <Text className={sideMenu.text}>{isDark ? 'Light' : 'Dark'} Mode</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className={sideMenu.item}>
            <Ionicons name="information-circle-outline" size={22} color={colors.text} />
            <Text className={sideMenu.text}>About</Text>
          </TouchableOpacity>

          <TouchableOpacity className={sideMenu.item}>
            <Ionicons name="help-circle-outline" size={22} color={colors.text} />
            <Text className={sideMenu.text}>Help</Text>
          </TouchableOpacity>

          {/* ── DEBUG SECTION ── */}
          <View className={`mt-4 pt-3 border-t ${isDark ? 'border-border-dark' : 'border-gray-200'}`}>
            <Text
              className={`text-[11px] font-bold tracking-widest mb-1 px-2 ${isDark ? 'text-[#666]' : 'text-gray-400'}`}
            >
              DEBUG
            </Text>

            {!isDebugMode ? (
              <TouchableOpacity className={sideMenu.item} onPress={onDebugLondonPress}>
                <Ionicons name="bug-outline" size={22} color="#F59E0B" />
                <Text className={sideMenu.text}>Simulate London, UK</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity className={sideMenu.item} onPress={onClearDebugPress}>
                <Ionicons name="bug" size={22} color="#F59E0B" />
                <View className="flex-1">
                  <Text className={sideMenu.text}>Clear Debug Location</Text>
                  <Text className="text-[11px] text-amber-400 mt-px">Currently: London, UK 🐛</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Close button pinned to bottom ── */}
        <TouchableOpacity className={sideMenu.closeButton} onPress={closeMenu}>
          <Text className={sideMenu.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
