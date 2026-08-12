/**
 * Emergency information screen
 * Displays emergency call buttons and links to external resources.
 */

import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';
import { getEmergencyPageStyles, getLayoutStyles, getTopAppBarStyles } from '../styles/appStyles';

const SERVICES = [
  { label: 'Ambulance', number: '144', icon: 'ambulance', accent: '#DC2626' },
  { label: 'Police', number: '133', icon: 'police-badge-outline', accent: '#1D4ED8' },
  { label: 'Euro Call', number: '112', icon: 'phone-alert-outline', accent: '#D97706' },
  { label: 'Fire Brigade', number: '122', icon: 'fire-truck', accent: '#EA580C' },
] as const;

const LINKS = [
  { label: 'Get help nearby', icon: 'hand-heart-outline', url: 'https://www.roteskreuz.at' },
  {
    label: 'Hospitals nearby',
    icon: 'hospital-building',
    url: 'https://www.google.com/maps/search/hospital',
  },
  { label: 'More emergency info', icon: 'information-outline', url: 'https://www.roteskreuz.at' },
] as const;

type ServiceIconName = (typeof SERVICES)[number]['icon'];
type LinkIconName = (typeof LINKS)[number]['icon'];

export function EmergencyPage() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);
  const layout = getLayoutStyles(isDark);
  const topBar = getTopAppBarStyles(isDark);
  const emergency = getEmergencyPageStyles(isDark);

  return (
    <View className={layout.safeArea} style={{ paddingTop: insets.top }}>
      <View className={topBar.containerOnBackground}>
        <Text className={topBar.title} numberOfLines={1}>
          Emergency
        </Text>
      </View>

      <ScrollView className={layout.fill} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Text className={emergency.sectionLabel}>Call emergency services</Text>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          {/* Left column */}
          <View style={{ flex: 1, gap: 12 }}>
            {([SERVICES[0], SERVICES[2]] as const).map((s) => (
              <Pressable
                key={s.label}
                onPress={() => Linking.openURL(`tel:${s.number}`)}
                android_ripple={{ color: colors.ripple }}
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, borderRadius: 16, overflow: 'hidden' })}
              >
                <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: 16, height: 110, padding: 20, justifyContent: 'space-between' }}>
                  <Text className={emergency.serviceLabel}>{s.label}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <MaterialCommunityIcons name={s.icon as ServiceIconName} size={40} color={s.accent} />
                    <Text style={{ fontSize: 26, fontWeight: '500', color: s.accent }}>{s.number}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Right column */}
          <View style={{ flex: 1, gap: 12 }}>
            {([SERVICES[1], SERVICES[3]] as const).map((s) => (
              <Pressable
                key={s.label}
                onPress={() => Linking.openURL(`tel:${s.number}`)}
                android_ripple={{ color: colors.ripple }}
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, borderRadius: 16, overflow: 'hidden' })}
              >
                <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: 16, height: 110, padding: 20, justifyContent: 'space-between' }}>
                  <Text className={emergency.serviceLabel}>{s.label}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <MaterialCommunityIcons name={s.icon as ServiceIconName} size={40} color={s.accent} />
                    <Text style={{ fontSize: 26, fontWeight: '500', color: s.accent }}>{s.number}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: colors.divider, marginVertical: 28 }} />

        <Text className={emergency.sectionLabel}>Resources</Text>

        {LINKS.map((link) => (
          <Pressable
            key={link.label}
            onPress={() => Linking.openURL(link.url)}
            android_ripple={{ color: colors.ripple }}
            className={emergency.linkRow}
          >
            <View className={emergency.linkRowInner}>
              <MaterialCommunityIcons name={link.icon as LinkIconName} size={24} color={colors.primary} />
              <Text className={emergency.linkLabel}>{link.label}</Text>
              <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
