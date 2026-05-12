import {View} from "react-native";
import {colors} from "../styles/colors";
import {Ionicons} from "@expo/vector-icons";
import {styles} from "../styles/appStyles";
import {MenuButton} from "./MenuButton";

export function BottomMenu({ activeTab, setActiveTab, openMoreMenu }) {
    return (
        <View style={styles.bottomMenu}>
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
                label="More"
                icon="ellipsis-horizontal"
                active={false}
                onPress={openMoreMenu}
            />
        </View>
    );
}