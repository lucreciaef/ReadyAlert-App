import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';
import { getTopAppBarStyles } from '../styles/appStyles';

export interface QuizQuestion {
  id: string;
  text: string;
  options: readonly [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
}

interface ArticleQuizPageProps {
  title: string;
  questions: readonly [QuizQuestion, QuizQuestion];
  isAnswered: (id: string) => boolean;
  markAnswered: (id: string) => Promise<void>;
  onBack: () => void;
  onAllAnswered: () => Promise<void>;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

type OptionState = 'normal' | 'correct' | 'wrong' | 'disabled';

export function ArticleQuizPage({
  title,
  questions,
  isAnswered,
  markAnswered,
  onBack,
  onAllAnswered,
}: ArticleQuizPageProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);
  const topBar = getTopAppBarStyles(isDark);

  const firstUnanswered = questions.findIndex((q) => !isAnswered(q.id));
  const [currentIdx, setCurrentIdx] = useState(firstUnanswered >= 0 ? firstUnanswered : 0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [completing, setCompleting] = useState(false);

  const currentQ = questions[currentIdx];
  const isLastQuestion = currentIdx === questions.length - 1;

  const handleSelect = (idx: number) => {
    if (isCorrect === true) return;
    setSelectedIndex(idx);
    const correct = idx === currentQ.correctIndex;
    setIsCorrect(correct);
    if (correct) {
      markAnswered(currentQ.id).catch(console.error);
    }
  };

  const handleNext = async () => {
    if (!isLastQuestion) {
      setCurrentIdx(currentIdx + 1);
      setSelectedIndex(null);
      setIsCorrect(null);
    } else {
      setCompleting(true);
      try {
        await onAllAnswered();
      } finally {
        setCompleting(false);
      }
    }
  };

  const getOptionState = (idx: number): OptionState => {
    if (isCorrect === null) return 'normal';
    if (isCorrect) {
      return idx === selectedIndex ? 'correct' : 'disabled';
    }
    return idx === selectedIndex ? 'wrong' : 'normal';
  };

  const optionBackground = (state: OptionState) => {
    if (state === 'correct') return colors.successContainer;
    if (state === 'wrong') return colors.errorContainer;
    return isDark ? colors.surfaceAlt : colors.surface;
  };

  const optionBorder = (state: OptionState) => {
    if (state === 'correct') return colors.success;
    if (state === 'wrong') return colors.error;
    if (state === 'disabled') return colors.divider;
    return colors.outline;
  };

  const badgeBackground = (state: OptionState) => {
    if (state === 'correct') return colors.success;
    if (state === 'wrong') return colors.error;
    return colors.surfaceAlt;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View
        className={topBar.container}
        style={{
          elevation: 2,
          shadowColor: isDark ? '#000' : '#888',
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
          {title} — Quiz
        </Text>
      </View>

      <View style={{ flex: 1, padding: 24, gap: 20 }}>
        <Text
          style={{ fontSize: 13, fontWeight: '500', color: colors.textMuted, letterSpacing: 0.4 }}
        >
          Question {currentIdx + 1} of {questions.length}
        </Text>

        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, lineHeight: 26 }}>
          {currentQ.text}
        </Text>

        <View style={{ gap: 10 }}>
          {currentQ.options.map((option, idx) => {
            const state = getOptionState(idx);
            const disabled = state === 'disabled';
            return (
              <Pressable
                key={idx}
                onPress={() => handleSelect(idx)}
                disabled={disabled}
                android_ripple={{ color: colors.ripple }}
                style={{ borderRadius: 12, overflow: 'hidden' }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                    padding: 14,
                    borderRadius: 12,
                    backgroundColor: optionBackground(state),
                    borderWidth: 1.5,
                    borderColor: optionBorder(state),
                    opacity: disabled ? 0.4 : 1,
                  }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: badgeBackground(state),
                      flexShrink: 0,
                    }}
                  >
                    {state === 'correct' ? (
                      <MaterialCommunityIcons name="check" size={16} color="#fff" />
                    ) : state === 'wrong' ? (
                      <MaterialCommunityIcons name="close" size={16} color="#fff" />
                    ) : (
                      <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textMuted }}>
                        {OPTION_LABELS[idx]}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 14,
                      lineHeight: 20,
                      color: disabled ? colors.textMuted : colors.text,
                    }}
                  >
                    {option}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {isCorrect !== null && (
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: isCorrect ? colors.success : colors.error,
              textAlign: 'center',
            }}
          >
            {isCorrect ? '✓ Correct!' : '✗ Incorrect — try again'}
          </Text>
        )}
      </View>

      {isCorrect === true && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 16,
            borderTopWidth: 1,
            borderTopColor: colors.divider,
            backgroundColor: isDark ? colors.surfaceAlt : colors.surface,
          }}
        >
          <Pressable
            onPress={handleNext}
            disabled={completing}
            android_ripple={{ color: colors.rippleOnPrimary }}
            style={{
              borderRadius: 28,
              overflow: 'hidden',
              backgroundColor: colors.primary,
              opacity: completing ? 0.7 : 1,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 16,
                paddingHorizontal: 24,
              }}
            >
              {completing ? (
                <ActivityIndicator size="small" color={colors.onPrimary} />
              ) : (
                <MaterialCommunityIcons
                  name={isLastQuestion ? 'check-circle' : 'arrow-right'}
                  size={20}
                  color={colors.onPrimary}
                />
              )}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  letterSpacing: 0.1,
                  color: colors.onPrimary,
                }}
              >
                {completing ? 'Saving…' : isLastQuestion ? 'Complete quiz' : 'Next question'}
              </Text>
            </View>
          </Pressable>
        </View>
      )}
    </View>
  );
}
