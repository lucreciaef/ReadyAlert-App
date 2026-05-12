import {Text, TouchableOpacity} from "react-native";
import {colors} from "../styles/colors";
import {Ionicons} from "@expo/vector-icons";
import {styles} from "../styles/appStyles";

export function MenuButton({ label, icon, active, onPress }) {
    return (
        <TouchableOpacity style={styles.menuButton} onPress={onPress}>
            <Ionicons
                name={icon}
                size={24}
                color={active ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.menuLabel, active && styles.activeMenuLabel]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}