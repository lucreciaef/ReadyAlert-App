import { ActivityIndicator, Pressable, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColors } from '../styles/themeColors';

interface SaveProgressButtonProps {
  onSave: () => Promise<void>;
  saving: boolean;
  saved: boolean;
}

export function SaveProgressButton({ onSave, saving, saved }: SaveProgressButtonProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  return (
    <View style={{
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: insets.bottom > 0 ? insets.bottom : 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: isDark ? colors.surfaceContainer : colors.surface,
    }}>
      <Pressable
        onPress={onSave}
        disabled={saving || saved}
        android_ripple={{ color: colors.rippleOnPrimary }}
        style={{
          borderRadius: 28,
          overflow: 'hidden',
          backgroundColor: saved ? '#4CAF50' : saving ? colors.border : colors.primary,
          opacity: saving ? 0.7 : 1,
        }}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingVertical: 16,
          paddingHorizontal: 24,
        }}>
          {saving ? (
            <ActivityIndicator size="small" color={colors.textMuted} />
          ) : (
            <MaterialCommunityIcons
              name={saved ? 'check-circle' : 'content-save-outline'}
              size={20}
              color={saving ? colors.textMuted : colors.onPrimary}
            />
          )}
          <Text style={{
            fontSize: 14,
            fontWeight: '500',
            letterSpacing: 0.1,
            color: saving ? colors.textMuted : colors.onPrimary,
          }}>
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save progress'}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}