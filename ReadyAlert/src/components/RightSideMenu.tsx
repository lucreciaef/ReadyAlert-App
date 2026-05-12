import {Pressable, Text, TouchableOpacity, View} from "react-native";
import {styles} from "../styles/appStyles";
import {Ionicons} from "@expo/vector-icons";

export function RightSideMenu({ closeMenu }) {
    return (
        <View style={styles.overlay}>
            <Pressable style={styles.overlayBackground} onPress={closeMenu}/>

            <View style={styles.sideMenu}>
                <Text style={styles.sideMenuTitle}>More</Text>

                <TouchableOpacity style={styles.sideMenuItem}>
                    <Ionicons name="settings-outline" size={22} color="#222"/>
                    <Text style={styles.sideMenuText}>Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.sideMenuItem}>
                    <Ionicons name="information-circle-outline" size={22} color="#222"/>
                    <Text style={styles.sideMenuText}>About</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.sideMenuItem}>
                    <Ionicons name="help-circle-outline" size={22} color="#222"/>
                    <Text style={styles.sideMenuText}>Help</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.closeButton} onPress={closeMenu}>
                    <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}