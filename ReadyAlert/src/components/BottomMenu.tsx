import { View } from 'react-native';
import { bottomMenu } from '../styles/appStyles';
import { MenuButton } from './MenuButton';

export function BottomMenu({ activeTab, setActiveTab, openMoreMenu }) {
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

            <MenuButton
                label="More"
                icon="ellipsis-horizontal"
                active={false}
                onPress={openMoreMenu}
            />
        </View>
    );
}