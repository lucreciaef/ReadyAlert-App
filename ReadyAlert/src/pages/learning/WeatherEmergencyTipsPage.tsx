/**
 * Weather Emergency Tips – read-only educational content page.
 * Source: Österreichisches Rotes Kreuz – https://www.roteskreuz.at/unwetter
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

interface WeatherEmergencyTipsProps {
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
  title: 'What to do immediately',
  accent: 'error',
  body: [
    'Switch on the radio and television and pay attention to severe weather warnings.',
    'Move to safety inside buildings.',
    'Secure your house or flat. Close the windows and lower the blinds.',
    'Help other people and provide first aid.',
  ],
};

const TIPS: {
  icon: React.ComponentProps<typeof LearningReadingContentCard>['icon'];
  title: string;
  accent: AccentKey;
  body: string[];
}[] = [
  {
    icon: 'home-alert-outline',
    title: 'Safety!',
    accent: 'warning',
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
    accent: 'warning',
    body: [
      'Use your emergency supplies and devices that do not depend on electricity.',
    ],
  },
  {
    icon: 'hand-heart',
    title: 'Help other people, provide first aid and help with clean-up work!',
    accent: 'success',
    body: [
      'Remember that not all of your neighbours may be able to help themselves sufficiently.',
    ],
  },
  {
    icon: 'home-alert-outline',
    title: 'Be careful around damaged buildings!',
    accent: 'warning',
    body: [
      'There may be a risk of collapse and danger to life. Consult the emergency services and qualified specialists before entering.',
    ],
  },
];

const QUESTION_IDS = ['wet_q1', 'wet_q2'] as const;

const QUIZ_QUESTIONS: readonly [QuizQuestion, QuizQuestion] = [
  {
    id: 'wet_q1',
    text: 'When lightning strikes outdoors and you cannot get inside, what is the correct protective position?',
    options: [
      'Lie flat on the ground with arms spread',
      'Stand upright away from tall trees',
      'Crouch down with feet together and stay on your tiptoes',
      'Climb to the highest nearby shelter',
    ],
    correctIndex: 2,
  },
  {
    id: 'wet_q2',
    text: 'Which of the following actions is advised when a severe weather warning is issued?',
    options: [
      'Open windows to ventilate your home',
      'Secure garden furniture and park your car in a safe place',
      'Wait for the storm to pass before taking any action',
      'Take a walk to observe the storm from a safe distance',
    ],
    correctIndex: 1,
  },
];

export function WeatherEmergencyTipsPage({ onBack }: WeatherEmergencyTipsProps) {
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
        title="Weather Emergency Tips"
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
          Weather Emergency Tips
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
              Severe weather, thunderstorms, hail, hurricane-force winds
            </Text>

            <LearningReadingContentCard
              icon={IMMEDIATE_ACTIONS.icon}
              title={IMMEDIATE_ACTIONS.title}
              colour={colors[IMMEDIATE_ACTIONS.accent]}
              body={IMMEDIATE_ACTIONS.body}
            />

            <Text className={article.articleSectionLabel}>Tips and advice</Text>

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
              url="https://www.roteskreuz.at/unwetter"
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
