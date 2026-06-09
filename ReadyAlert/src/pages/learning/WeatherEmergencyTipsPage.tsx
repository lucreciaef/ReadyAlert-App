/**
 * Weather Emergency Tips – read-only educational content page.
 * Source: Österreichisches Rotes Kreuz – https://www.roteskreuz.at/unwetter
 * Completing the read marks the task 100% in the preparedness score.
 */

import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { getThemeColors } from '../../styles/themeColors';
import { getTopAppBarStyles } from '../../styles/appStyles';
import { ContentSectionCard } from '../../components/ContentSectionCard';
import { useWeatherReadStatus } from '../../hooks/useWeatherReadStatus';
import { usePreparedness } from '../../context/PreparednessContext';
import {SaveProgressButton} from "../../components/SaveProgressButton";

interface WeatherEmergencyTipsProps {
  onBack: () => void;
}

const IMMEDIATE_ACTIONS = {
  icon: 'alert-decagram' as const,
  title: 'What to do immediately',
  color: '#EF5350',
  body: [
    'Switch on the radio and television and pay attention to severe weather warnings.',
    'Move to safety inside buildings.',
    'Secure your house or flat. Close the windows and lower the blinds.',
    'Help other people and provide first aid.',
  ],
};

const TIPS: {
  icon: React.ComponentProps<typeof ContentSectionCard>['icon'];
  title: string;
  color: string;
  body: string[];
}[] = [
  {
    icon: 'home-alert-outline',
    title: 'Safety!',
    color: '#F59E0B',
    body: [
      'Pay attention to weather forecasts and weather warnings. Follow the instructions of the authorities and emergency services.',
      'Close windows and blinds, as these help protect windowpanes. If you have garden furniture, you should secure it as well. Check non-return valves, and clean inlets and shafts.',
      'Park your car in a safe place and avoid unnecessary journeys.',
      'When lightning, heavy rain, storms or hail begin, the safest place is inside a building. If there is lightning and you are outside, crouch down with your feet parallel and close together, and remain on your tiptoes.',
    ],
  },
  {
    icon: 'lightning-bolt',
    title: 'Be prepared for power cuts!',
    color: '#F59E0B',
    body: [
      'Use your emergency supplies and devices that do not depend on electricity.',
    ],
  },
  {
    icon: 'hand-heart',
    title: 'Help other people, provide first aid and help with clean-up work!',
    color: '#4CAF50',
    body: [
      'Remember that not all of your neighbours may be able to help themselves sufficiently.',
    ],
  },
  {
    icon: 'home-alert-outline',
    title: 'Be careful around damaged buildings!',
    color: '#F59E0B',
    body: [
      'There may be a risk of collapse and danger to life. Consult the emergency services and qualified specialists before entering.',
    ],
  },
];


export function WeatherEmergencyTipsPage({ onBack }: WeatherEmergencyTipsProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const topBar = getTopAppBarStyles(isDark);
  const { refresh: refreshPreparedness } = usePreparedness();
  const { isRead, loading, saving, saved, toggleRead, saveReadStatus } = useWeatherReadStatus();

  const handleSave = async () => {
    await saveReadStatus();
    await refreshPreparedness();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View
        className={topBar.container}
        style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 }}
      >
        <Pressable
          onPress={onBack}
          android_ripple={{ color: colors.ripple, borderless: true }}
          style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </Pressable>
        <Text className={topBar.titleMedium} numberOfLines={1}>
          Weather Emergency Tips
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 16, fontSize: 14, color: colors.textMuted }}>Loading…</Text>
        </View>
      ) : (
        <>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={{
              fontSize: 11,
              fontWeight: '700',
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: colors.textMuted,
              marginTop: 8,
              marginBottom: 12,
            }}>
              Severe weather, thunderstorms, hail, hurricane-force winds
            </Text>

            <ContentSectionCard
              icon={IMMEDIATE_ACTIONS.icon}
              title={IMMEDIATE_ACTIONS.title}
              color={IMMEDIATE_ACTIONS.color}
              body={IMMEDIATE_ACTIONS.body}
            />

            <Text style={{
              fontSize: 11,
              fontWeight: '700',
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: colors.textMuted,
              marginTop: 8,
              marginBottom: 12,
            }}>
              Tips and advice
            </Text>

            {TIPS.map((tip) => (
              <ContentSectionCard
                key={tip.title}
                icon={tip.icon}
                title={tip.title}
                color={tip.color}
                body={tip.body}
              />
            ))}

            {/* Source box - TODO: make it a reusable component later */}
            <View style={{
              flexDirection: 'row', alignItems: 'flex-start', gap: 8,
              padding: 12, borderRadius: 8, marginTop: 4, marginBottom: 8,
              backgroundColor: isDark ? colors.surfaceContainer : '#F5F5F5',
            }}>
              <MaterialCommunityIcons name="information-outline" size={14} color={colors.textMuted} style={{ marginTop: 1 }} />
              <Text style={{ flex: 1, fontSize: 12, lineHeight: 18, color: colors.textMuted }}>
                Source: Österreichisches Rotes Kreuz (Austrian Red Cross){'\n'}
                <Text style={{ color: colors.primary }}>
                  https://www.roteskreuz.at/unwetter
                </Text>
              </Text>
            </View>


            {/* "Mark as read" checkbox row - TODO: make this a reusable component later */}
            <Pressable
              onPress={toggleRead}
              android_ripple={{ color: colors.ripple }}
              style={{
                borderRadius: 12, marginTop: 4, marginBottom: 8,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 14,
                  padding: 16, borderRadius: 12,
                  backgroundColor: isDark ? colors.surfaceContainer : '#F1F3FF',
                  borderWidth: 1.5,
                  borderColor: isRead ? colors.primary : colors.border,
                }}
              >
              <View style={{
                width: 24, height: 24, borderRadius: 12, overflow: 'hidden',
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 2, flexShrink: 0,
                borderColor: isRead ? colors.primary : colors.outline,
                backgroundColor: isRead ? colors.primary : 'transparent',
              }}>
                {isRead && <MaterialCommunityIcons name="check" size={14} color={colors.onPrimary} />}
              </View>
              <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: colors.text, lineHeight: 20 }}>
                I have read and understood the weather emergency tips
              </Text>
              </View>
            </Pressable>
          </ScrollView>

          <SaveProgressButton onSave={handleSave} saving={saving} saved={saved} />
        </>
      )}
    </View>
  );
}