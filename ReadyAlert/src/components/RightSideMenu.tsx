import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getOverlayStyles, getSideMenuStyles } from '../styles/appStyles';
import { getThemeColors } from '../styles/themeColors';
import { useTheme } from '../theme/ThemeContext';

export function RightSideMenu({ closeMenu, onSettingsPress }) {
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

                <TouchableOpacity className={sideMenu.closeButton} onPress={closeMenu}>
                    <Text className={sideMenu.closeButtonText}>Close</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}