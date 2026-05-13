import { Text, TouchableOpacity } from 'react-native';
import { colors } from '../styles/colors';
import { Ionicons } from '@expo/vector-icons';
import { bottomMenu } from '../styles/appStyles';

export function MenuButton({ label, icon, active, onPress }) {
    return (
        <TouchableOpacity className={bottomMenu.button} onPress={onPress}>
            <Ionicons
                name={icon}
                size={24}
                color={active ? colors.primary : colors.textMuted}
            />
            <Text
                className={`${bottomMenu.label} ${
                    active ? bottomMenu.labelActive : ''
                }`}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}