import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { overlay, sideMenu } from '../styles/appStyles';

export function RightSideMenu({ closeMenu }) {
    return (
        <View className={overlay.container}>
            <Pressable className={overlay.background} onPress={closeMenu} />

            <View className={sideMenu.container}>
                <Text className={sideMenu.title}>More</Text>

                <TouchableOpacity className={sideMenu.item}>
                    <Ionicons name="settings-outline" size={22} color="#222" />
                    <Text className={sideMenu.text}>Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity className={sideMenu.item}>
                    <Ionicons name="information-circle-outline" size={22} color="#222" />
                    <Text className={sideMenu.text}>About</Text>
                </TouchableOpacity>

                <TouchableOpacity className={sideMenu.item}>
                    <Ionicons name="help-circle-outline" size={22} color="#222" />
                    <Text className={sideMenu.text}>Help</Text>
                </TouchableOpacity>

                <TouchableOpacity className={sideMenu.closeButton} onPress={closeMenu}>
                    <Text className={sideMenu.closeButtonText}>Close</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}