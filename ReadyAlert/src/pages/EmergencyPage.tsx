/**
 * Emergency information screen
 * Will display emergency contacts, guidance, and local authority details relevant to active warnings.
 */

import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';
import { getTopAppBarStyles } from '../styles/appStyles';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function EmergencyPage() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);
  const topBar = getTopAppBarStyles(isDark);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View
        style={{
          height: 64,
          backgroundColor: colors.background,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          gap: 12,
        }}
      >
        <MaterialCommunityIcons name="alert-circle-outline" size={24} color={colors.primary} />
        <Text className={topBar.title} numberOfLines={1}>
          Emergency
        </Text>
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.text }}>Coming up soon</Text>
      </View>
    </View>
  );
}
