/**
 * Poisoning Dangers at Home – read-only educational content page.
 * Source: Österreichisches Gesundheitsportal – https://www.gesundheit.gv.at/krankheiten/vergiftungsinformation/vergiftung-gefahren-haushalt.html
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
import { usePoisoningDangerAtHomeReadStatus } from '../../hooks/usePoisoningDangerAtHomeReadStatus';
import { usePreparedness } from '../../context/PreparednessContext';
import { SaveProgressButton } from '../../components/SaveProgressButton';

interface PoisoningDangerAtHomeTipsProps {
  onBack: () => void;
}

type AccentKey = 'error' | 'warning' | 'success';

const IMMEDIATE_ACTIONS: {
  icon: React.ComponentProps<typeof LearningReadingContentCard>['icon'];
  title: string;
  accent: AccentKey;
  body: string[];
} = {
  icon: 'alert-decagram',
  title: 'If poisoning is suspected',
  accent: 'error',
  body: [
    'Contact the Poison Control Centre early: 01 406 43 43 — do not wait for symptoms to appear.',
    'For life-threatening symptoms, call emergency services: 144.',
    'Never induce vomiting — it can worsen burns to the mouth and throat.',
    'Keep the product packaging ready and give the exact product name to responders.',
  ],
};

const TIPS: {
  icon: React.ComponentProps<typeof LearningReadingContentCard>['icon'];
  title: string;
  accent: AccentKey;
  body: string[];
}[] = [
  {
    icon: 'water-outline',
    title: 'General first aid steps',
    accent: 'warning',
    body: [
      'Swallowed: rinse the mouth with water, then give small sips to drink.',
      'Eye contact: rinse under running water for about 10 minutes. See a doctor if symptoms persist.',
      'Skin contact: rinse with water and remove contaminated clothing.',
      'Never induce vomiting — this rule applies to all household products.',
    ],
  },
  {
    icon: 'spray-bottle',
    title: 'Cleaning products',
    accent: 'warning',
    body: [
      'All-purpose cleaners, toilet cleaners, window cleaners, and dishwashing liquid: low risk. Rinse mouth and give small sips of water.',
      'Drain cleaners (often contain caustic soda): high risk — can cause severe burns. Contact Poison Control immediately.',
      'Dishwasher tablets/pods: more concentrated than regular detergent — contact Poison Control; call 144 for severe symptoms.',
      'Descalers: risk depends on concentration. Contact Poison Control if in doubt. Extra caution when preparing infant formula in recently descaled kettles.',
    ],
  },
  {
    icon: 'face-woman-shimmer-outline',
    title: 'Cosmetics & personal care',
    accent: 'warning',
    body: [
      'Nail polish (small amounts, e.g. licking the brush): usually harmless. Rinse mouth.',
      'Nail polish remover: can cause burning, nausea, and dizziness. Contact Poison Control; call 144 for severe symptoms.',
      'Body powder: inhalation risk for babies — call 144 immediately if severe coughing occurs.',
      'Shampoo, soap, shower gel: low risk. Rinse mouth and give small sips of water.',
      'Perfume and aftershave: treat the same as alcohol.',
    ],
  },
  {
    icon: 'bottle-wine-outline',
    title: 'Alcohol & adhesives',
    accent: 'warning',
    body: [
      'Alcohol in drinks, cosmetics, and disinfectants: give sweetened juice or tea. Never induce vomiting. Call 144 if a child shows impaired consciousness.',
      'Cigarettes and nicotine products: mild symptoms in small amounts. Nicotine refills for e-cigarettes are more concentrated and dangerous — contact Poison Control.',
      "Children's glue and glue sticks: harmless in small amounts.",
      'Super glue: the main risk is bonding, not poisoning. Never force bonded areas apart — risk of injury. Seek a doctor if eyes are affected.',
    ],
  },
  {
    icon: 'home-alert-outline',
    title: 'Products requiring extra caution',
    accent: 'error',
    body: [
      'Industrial/commercial cleaners: do not belong in the home. Highly corrosive — can cause oesophageal burns and severe eye damage. Call Poison Control and 144 immediately.',
      'Petrol/gasoline: causes irritation and dizziness. Call 144 if there is persistent coughing (aspiration risk).',
      'Pesticides (insecticides, herbicides, fungicides): far more toxic than fertilisers — can be life-threatening. Call 144 immediately if symptoms appear.',
      'Essential oils and lamp oil: dangerous if inhaled. Call 144 for persistent or severe coughing.',
      'Silica gel desiccant sachets: completely non-toxic if swallowed.',
    ],
  },
];

export function PoisoningDangerAtHomeTipsPage({ onBack }: PoisoningDangerAtHomeTipsProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);
  const topBar = getTopAppBarStyles(isDark);
  const { refresh: refreshPreparedness } = usePreparedness();
  const { isRead, loading, saving, saved, toggleRead, saveReadStatus } =
    usePoisoningDangerAtHomeReadStatus();

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
          Poisoning Dangers at Home
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
              Common household products can cause poisoning, and children are most at risk. Few home
              substances cause severe poisoning, but quick action is always important.
            </Text>

            <LearningReadingContentCard
              icon={IMMEDIATE_ACTIONS.icon}
              title={IMMEDIATE_ACTIONS.title}
              colour={colors[IMMEDIATE_ACTIONS.accent]}
              body={IMMEDIATE_ACTIONS.body}
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
              Tips by product type
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
              source="Österreichisches Gesundheitsportal (Austrian Health Portal)"
              url="https://www.gesundheit.gv.at/krankheiten/vergiftungsinformation/vergiftung-gefahren-haushalt.html"
            />

            <LearningMarkAsReadCheckbox
              label="I have read and understood the poisoning dangers at home"
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
