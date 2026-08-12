/**
 * No Reaction Person Tips – read-only educational content page.
 * Source: Österreichisches Rotes Kreuz – https://www.roteskreuz.at/erste-hilfe-videos/einer-person-helfen-die-nicht-reagiert
 * Completing both quiz questions marks the task 100% in the preparedness score.
 */

import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { getThemeColours } from '../../styles/themeColours';
import { getLearningArticlePageStyles, getLayoutStyles, getTopAppBarShadow, getTopAppBarStyles } from '../../styles/appStyles';
import { LearningReadingContentCard } from '../../components/LearningReadingContentCard';
import { LearningSourceCitation } from '../../components/LearningSourceCitation';
import { ArticleQuizPage, type QuizQuestion } from '../../components/ArticleQuizPage';
import { useArticleQuizStatus } from '../../hooks/useArticleQuizStatus';
import { usePreparedness } from '../../context/PreparednessContext';

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

const QUESTION_IDS = ['nrp_q1', 'nrp_q2'] as const;

const QUIZ_QUESTIONS: readonly [QuizQuestion, QuizQuestion] = [
  {
    id: 'nrp_q1',
    text: 'For how long should you check whether an unresponsive person is breathing?',
    options: [
      'At least one full minute',
      'No longer than 10 seconds',
      'About 30 seconds',
      'Until emergency services arrive',
    ],
    correctIndex: 1,
  },
  {
    id: 'nrp_q2',
    text: 'If you are unsure whether an unresponsive person is breathing normally, what should you do?',
    options: [
      'Wait and monitor for 5 more minutes',
      'Place them in the recovery position and call for help',
      'Begin resuscitation immediately — do not wait',
      'Give them small sips of water to stimulate a response',
    ],
    correctIndex: 2,
  },
];

export function NoReactionPersonTipsPage({ onBack }: NoReactionPersonTipsProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);
  const layout = getLayoutStyles(isDark);
  const topBar = getTopAppBarStyles(isDark);
  const article = getLearningArticlePageStyles(isDark);
  const { refresh: refreshPreparedness } = usePreparedness();
  const { loading, isAnswered, isComplete, markAnswered, reload } =
    useArticleQuizStatus(QUESTION_IDS);
  const [quizActive, setQuizActive] = useState(false);

  const handleQuizComplete = async () => {
    await refreshPreparedness();
    await reload();
    setQuizActive(false);
  };

  if (quizActive) {
    return (
      <ArticleQuizPage
        title="Helping an Unresponsive Person"
        questions={QUIZ_QUESTIONS}
        isAnswered={isAnswered}
        markAnswered={markAnswered}
        onBack={() => setQuizActive(false)}
        onAllAnswered={handleQuizComplete}
      />
    );
  }

  return (
    <View className={layout.safeArea} style={{ paddingTop: insets.top }}>
      <View className={topBar.container} style={getTopAppBarShadow(colors)}>
        <Pressable
          onPress={onBack}
          android_ripple={{ color: colors.ripple, borderless: true }}
          className={topBar.iconButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </Pressable>
        <Text className={topBar.titleMedium} numberOfLines={1}>
          Helping an Unresponsive Person
        </Text>
      </View>

      {loading ? (
        <View className={layout.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className={layout.loadingLabel}>Loading…</Text>
        </View>
      ) : (
        <>
          <ScrollView
            className={layout.fill}
            contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
          >
            <Text className={article.articleSectionLabel}>
              A person is unresponsive when they do not react to external stimuli. This can be
              caused by illness or an accident and is life-threatening. Act immediately.
            </Text>

            <LearningReadingContentCard
              icon={EMERGENCY_STEPS.icon}
              title={EMERGENCY_STEPS.title}
              colour={colors[EMERGENCY_STEPS.accent]}
              body={EMERGENCY_STEPS.body}
            />

            <Text className={article.articleSectionLabel}>Tips and information</Text>

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
          </ScrollView>

          <View
            className={article.quizActionBar}
            style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }}
          >
            {isComplete ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: colors.successContainer,
                  borderWidth: 1.5,
                  borderColor: colors.success,
                }}
              >
                <MaterialCommunityIcons name="check-circle" size={22} color={colors.success} />
                <Text className={article.quizCompleteText} style={{ color: colors.successOnContainer }}>
                  Quiz completed
                </Text>
              </View>
            ) : (
              <Pressable
                onPress={() => setQuizActive(true)}
                android_ripple={{ color: colors.rippleOnPrimary }}
                className={article.quizStartButton}
                style={{ backgroundColor: colors.primary }}
              >
                <View className={article.quizStartButtonInner}>
                  <MaterialCommunityIcons name="head-question-outline" size={20} color={colors.onPrimary} />
                  <Text className={article.quizStartButtonText}>Start quiz</Text>
                </View>
              </Pressable>
            )}
          </View>
        </>
      )}
    </View>
  );
}
