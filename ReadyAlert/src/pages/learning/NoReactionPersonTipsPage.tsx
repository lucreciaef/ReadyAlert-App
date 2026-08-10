/**
 * No Reaction Person Tips – read-only educational content page.
 * Source: Österreichisches Rotes Kreuz – https://www.roteskreuz.at/erste-hilfe-videos/einer-person-helfen-die-nicht-reagiert
 * Completing the read marks the task 100% in the preparedness score.
 */

import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { getThemeColours } from '../../styles/themeColours';
import { getTopAppBarStyles } from '../../styles/appStyles';
import { LearningReadingContentCard } from '../../components/LearningReadingContentCard';
import { LearningSourceCitation } from '../../components/LearningSourceCitation';
import { LearningMarkAsReadCheckbox } from '../../components/LearningMarkAsReadCheckbox';
import { useNoReactionPersonReadStatus } from '../../hooks/useNoReactionPersonReadStatus';
import { usePreparedness } from '../../context/PreparednessContext';
import { SaveProgressButton } from '../../components/SaveProgressButton';

interface NoReactionPersonTipsProps {
  onBack: () => void;
}

type AccentKey = 'error' | 'warning' | 'success';

const EMERGENCY_STEPS: {
  icon: React.ComponentProps<typeof LearningReadingContentCard>['icon'];
  title: string;
  accent: AccentKey;
  body: string[];
} = {
  icon: 'account-alert-outline',
  title: 'Steps when a person collapses',
  accent: 'error',
  body: [
    'Step 1 – Check consciousness: Speak loudly and gently shake the person by the shoulders.',
    'Step 2 – Call for help: Shout loudly for help so that someone can call emergency services and fetch a first aid kit and defibrillator.',
    'Step 3 – Clear the airways: Place one hand on the forehead and use the other to lift the chin, tilting the head back.',
    'Step 4 – Check breathing: Check for no longer than 10 seconds whether normal breathing can be heard, seen, or felt. Watch whether the chest rises as with normal breathing.',
  ],
};

const TIPS: {
  icon: React.ComponentProps<typeof LearningReadingContentCard>['icon'];
  title: string;
  accent: AccentKey;
  body: string[];
}[] = [
  {
    icon: 'lungs',
    title: 'Why tilting the head matters',
    accent: 'warning',
    body: [
      'In an unresponsive person, the muscles are limp. The base of the tongue can fall back and block the airway.',
      'Tilting the head back and lifting the chin clears the airway so the person can breathe.',
    ],
  },
  {
    icon: 'help-circle-outline',
    title: 'What counts as "normal breathing"?',
    accent: 'warning',
    body: [
      'Isolated, irregular, slow, or deep breaths and gasping for air are NOT considered normal breathing in an unresponsive person.',
      'The most important thing is to determine as quickly as possible whether the person is breathing normally or not.',
    ],
  },
  {
    icon: 'heart-pulse',
    title: 'When in doubt, start resuscitation',
    accent: 'warning',
    body: [
      'If you are unsure during the breathing check, always begin resuscitation immediately.',
      'Do not wait — every second counts when someone is unresponsive.',
    ],
  },
];

export function NoReactionPersonTipsPage({ onBack }: NoReactionPersonTipsProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);
  const topBar = getTopAppBarStyles(isDark);
  const { refresh: refreshPreparedness } = usePreparedness();
  const { isRead, loading, saving, saved, toggleRead, saveReadStatus } =
    useNoReactionPersonReadStatus();

  const handleSave = async () => {
    await saveReadStatus();
    await refreshPreparedness();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View
        className={topBar.container}
        style={{
          elevation: 2,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 3,
        }}
      >
        <Pressable
          onPress={onBack}
          android_ripple={{ color: colors.ripple, borderless: true }}
          style={{
            width: 48,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 24,
          }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </Pressable>
        <Text className={topBar.titleMedium} numberOfLines={1}>
          Helping an Unresponsive Person
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
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                letterSpacing: 0.1,
                color: colors.primary,
                marginTop: 8,
                marginBottom: 12,
                paddingHorizontal: 4,
              }}
            >
              A person is unresponsive when they do not react to external stimuli. This can be
              caused by illness or an accident and is life-threatening. Act immediately.
            </Text>

            <LearningReadingContentCard
              icon={EMERGENCY_STEPS.icon}
              title={EMERGENCY_STEPS.title}
              colour={colors[EMERGENCY_STEPS.accent]}
              body={EMERGENCY_STEPS.body}
            />

            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                letterSpacing: 0.1,
                color: colors.primary,
                marginTop: 8,
                marginBottom: 12,
                paddingHorizontal: 4,
              }}
            >
              Tips and information
            </Text>

            {TIPS.map((tip) => (
              <LearningReadingContentCard
                key={tip.title}
                icon={tip.icon}
                title={tip.title}
                colour={colors[tip.accent]}
                body={tip.body}
              />
            ))}

            <LearningSourceCitation
              source="Österreichisches Rotes Kreuz (Austrian Red Cross)"
              url="https://www.roteskreuz.at/erste-hilfe-videos/einer-person-helfen-die-nicht-reagiert"
            />

            <LearningMarkAsReadCheckbox
              label="I have read and understood how to help an unresponsive person"
              isRead={isRead}
              onToggle={toggleRead}
            />
          </ScrollView>

          <SaveProgressButton onSave={handleSave} saving={saving} saved={saved} />
        </>
      )}
    </View>
  );
}
