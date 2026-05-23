import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getOverlayStyles, getSideMenuStyles } from '../styles/appStyles';
import { getThemeColors } from '../styles/themeColors';
import { useTheme } from '../theme/ThemeContext';

interface RightSideMenuProps {
  closeMenu: () => void;
  onSettingsPress: () => void;
  isDebugMode?: boolean;
  onDebugLondonPress?: () => void;
  onClearDebugPress?: () => void;
}

export function RightSideMenu({ closeMenu, onSettingsPress, isDebugMode, onDebugLondonPress, onClearDebugPress }: RightSideMenuProps) {
    const { isDark, toggleTheme } = useTheme();
    const overlay = getOverlayStyles(isDark);
    const sideMenu = getSideMenuStyles(isDark);
    const colors = getThemeColors(isDark);

    return (
        <View className={overlay.container}>
            <Pressable className={overlay.background} onPress={closeMenu} />

            <View className={sideMenu.container}>
                <Text className={sideMenu.title}>More</Text>

                <TouchableOpacity className={sideMenu.item} onPress={onSettingsPress}>
                    <Ionicons name="settings-outline" size={22} color={colors.text} />
                    <Text className={sideMenu.text}>Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity className={sideMenu.item} onPress={toggleTheme}>
                    <Ionicons
                        name={isDark ? 'sunny' : 'moon'}
                        size={22}
                        color={colors.primary}
                    />
                    <View className="flex-1 flex-row items-center justify-between">
                        <Text className={sideMenu.text}>
                            {isDark ? 'Light' : 'Dark'} Mode
                        </Text>
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
                <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: isDark ? '#444' : '#e5e7eb', paddingTop: 12 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#666' : '#9ca3af', letterSpacing: 1, marginBottom: 4, paddingHorizontal: 8 }}>
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
                                <Text style={{ fontSize: 11, color: '#F59E0B', marginTop: 1 }}>
                                    Currently: London, UK 🐛
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity className={sideMenu.closeButton} onPress={closeMenu}>
                    <Text className={sideMenu.closeButtonText}>Close</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}