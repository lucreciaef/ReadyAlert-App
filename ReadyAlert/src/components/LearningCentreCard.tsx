/**
 * Learning Centre list item — compact tappable row with a 40dp leading icon,
 * title/description, and a trailing progress indicator sourced from the
 * preparedness score for the topic's task.
 */

import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';
import { usePreparedness } from '../context/PreparednessContext';

interface LearningCentreCardProps {
  title: string;
  description: string;
  onPress: () => void;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  taskId: string;
}

function daysUntil(isoDate: string): number {
  const diff = new Date(isoDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function LearningCentreCard({
  title,
  description,
  onPress,
  iconName,
  taskId,
}: LearningCentreCardProps) {
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);
  const { preparedness } = usePreparedness();
  const task = preparedness.taskScores.find((t) => t.taskId === taskId);

  const complete = task && task.totalCount > 0 && task.checkedCount === task.totalCount;
  const started = task && task.checkedCount > 0;
  const progressPercent = task && task.totalCount > 0 ? task.checkedCount / task.totalCount : 0;

  const showExpiryBadge = task && (task.isExpired || task.expiresAt !== null);
  const expiryDaysLeft = task?.expiresAt ? daysUntil(task.expiresAt) : 0;

  return (
    <Pressable
      onPress={onPress}
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
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor:
              task?.isExpired
                ? colors.errorContainer
                : complete
                  ? colors.successContainer
                  : colors.primaryContainer,
          }}
        >
          <MaterialCommunityIcons
            name={iconName}
            size={22}
            color={
              task?.isExpired
                ? colors.error
                : complete
                  ? colors.successOnContainer
                  : colors.primary
            }
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>{title}</Text>
          <Text
            style={{ fontSize: 13, lineHeight: 18, color: colors.textMuted, marginTop: 2 }}
            numberOfLines={2}
          >
            {description}
          </Text>
          {showExpiryBadge && (
            <Text
              style={{
                fontSize: 11,
                fontWeight: '500',
                marginTop: 4,
                color: task.isExpired ? colors.error : colors.textMuted,
              }}
            >
              {task.isExpired
                ? '⚠ Expired — tap to review'
                : `Valid for ${expiryDaysLeft} more day${expiryDaysLeft === 1 ? '' : 's'}`}
            </Text>
          )}
        </View>

        {task && task.totalCount > 0 && (
          <View style={{ alignItems: 'flex-end', minWidth: 48 }}>
            {complete && !task.isExpired ? (
              <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} />
            ) : task.isExpired ? (
              <MaterialCommunityIcons name="alert-circle" size={20} color={colors.error} />
            ) : (
              <>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: started ? colors.primary : colors.textMuted,
                  }}
                >
                  {task.checkedCount} / {task.totalCount}
                </Text>
                <View
                  style={{
                    height: 3,
                    width: 48,
                    borderRadius: 2,
                    backgroundColor: colors.divider,
                    marginTop: 4,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      height: 3,
                      width: `${progressPercent * 100}%`,
                      backgroundColor: colors.primary,
                    }}
                  />
                </View>
              </>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}
