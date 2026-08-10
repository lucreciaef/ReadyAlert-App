/**
 * Emergency information screen
 * Displays emergency call buttons and links to external resources.
 */

import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';
import { getTopAppBarStyles } from '../styles/appStyles';

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
  const topBar = getTopAppBarStyles(isDark);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View
        style={{
          height: 64,
          backgroundColor: colors.background,
          flexDirection: 'row',
          alignItems: 'center',
          // paddingHorizontal: 16,
          gap: 12,
        }}
      >
        <Text className={topBar.title} numberOfLines={1}>
          Emergency
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {/* Emergency call section */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            letterSpacing: 0.5,
            color: colors.primary,
            marginBottom: 12,
          }}
        >
          Call emergency services
        </Text>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          {/* Left column */}
          <View style={{ flex: 1, gap: 12 }}>
            {([SERVICES[0], SERVICES[2]] as const).map((s) => (
              <Pressable
                key={s.label}
                onPress={() => Linking.openURL(`tel:${s.number}`)}
                android_ripple={{ color: colors.ripple }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                  borderRadius: 16,
                  overflow: 'hidden',
                })}
              >
                <View
                  style={{
                    backgroundColor: colors.surfaceAlt,
                    borderRadius: 16,
                    height: 110,
                    padding: 20,
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textMuted }}>
                    {s.label}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <MaterialCommunityIcons
                      name={s.icon as ServiceIconName}
                      size={40}
                      color={s.accent}
                    />
                    <Text style={{ fontSize: 26, fontWeight: '500', color: s.accent }}>
                      {s.number}
                    </Text>
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
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                  borderRadius: 16,
                  overflow: 'hidden',
                })}
              >
                <View
                  style={{
                    backgroundColor: colors.surfaceAlt,
                    borderRadius: 16,
                    height: 110,
                    padding: 20,
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textMuted }}>
                    {s.label}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <MaterialCommunityIcons
                      name={s.icon as ServiceIconName}
                      size={40}
                      color={s.accent}
                    />
                    <Text style={{ fontSize: 26, fontWeight: '500', color: s.accent }}>
                      {s.number}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: colors.divider, marginVertical: 28 }} />

        {/* Resources section */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            letterSpacing: 0.5,
            color: colors.primary,
            marginBottom: 12,
          }}
        >
          Resources
        </Text>

        {LINKS.map((link) => (
          <Pressable
            key={link.label}
            onPress={() => Linking.openURL(link.url)}
            android_ripple={{ color: colors.ripple }}
            style={{
              borderRadius: 12,
              overflow: 'hidden',
              marginBottom: 8,
              backgroundColor: colors.surfaceAlt,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 16,
                gap: 16,
              }}
            >
              <MaterialCommunityIcons
                name={link.icon as LinkIconName}
                size={24}
                color={colors.primary}
              />
              <Text style={{ flex: 1, fontSize: 15, fontWeight: '400', color: colors.text }}>
                {link.label}
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
