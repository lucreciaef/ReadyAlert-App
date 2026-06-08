/**
 * Sub-page: Home Pharmacy Kit
 * Top App Bar with back button, linear progress bar, checklist with checkboxes, and a Save button
 */

import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { getThemeColors } from '../../styles/themeColors';
import { getTopAppBarStyles } from '../../styles/appStyles';
import { usePharmacyChecklist } from '../../hooks/usePharmacyChecklist';
import { usePreparedness } from '../../context/PreparednessContext';

const GROUP_ORDER = ['Medicines', 'Other items', 'First-aid dressing packs'];

interface PharmacyKitPageProps {
  onBack: () => void;
}

export function PharmacyKitPage({ onBack }: PharmacyKitPageProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const topBar = getTopAppBarStyles(isDark);
  const { refresh: refreshPreparedness } = usePreparedness();

  const { items, loading, saving, saved, checkedCount, totalCount, toggleItem, saveChecklist } =
    usePharmacyChecklist();

  const handleSave = async () => {
    await saveChecklist();
    await refreshPreparedness();
  };

  const groups = GROUP_ORDER.map((groupName) => ({
    name: groupName,
    items: items.filter((i) => i.group === groupName),
  })).filter((g) => g.items.length > 0);

  const progressPercent = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

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
          Home Pharmacy Kit
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 16, fontSize: 14, color: colors.textMuted }}>
            Loading checklist…
          </Text>
        </View>
      ) : (
        <>
          <View style={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 14,
            backgroundColor: isDark ? colors.surfaceContainer : colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '500', letterSpacing: 0.5, color: colors.textMuted }}>
                {checkedCount} / {totalCount} items ready at home
              </Text>
              <Text style={{
                fontSize: 12,
                fontWeight: '700',
                color: progressPercent === 100 ? '#4CAF50' : colors.primary,
              }}>
                {Math.round(progressPercent)}%
              </Text>
            </View>
            <View style={{ height: 4, borderRadius: 2, backgroundColor: isDark ? '#3a3a3a' : colors.primaryContainer }}>
              <View
                style={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: progressPercent === 100 ? '#4CAF50' : colors.primary,
                  width: `${progressPercent}%`,
                }}
              />
            </View>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {groups.map((group) => (
              <View key={group.name} style={{ marginBottom: 20 }}>
                <Text style={{
                  fontSize: 11,
                  fontWeight: '700',
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  color: colors.textMuted,
                  marginBottom: 8,
                }}>
                  {group.name}
                </Text>

                <View style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: isDark ? colors.surfaceContainer : colors.surface,
                  elevation: 1,
                }}>
                  {group.items.map((item, idx) => {
                    const isLast = idx === group.items.length - 1;
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => toggleItem(item.id)}
                        android_ripple={{ color: colors.ripple }}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: 16,
                          paddingVertical: 14,
                          borderBottomWidth: isLast ? 0 : 1,
                          borderBottomColor: colors.border,
                        }}
                      >
                        <View style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: 2,
                          marginRight: 14,
                          flexShrink: 0,
                          borderColor: item.checked ? colors.primary : colors.outline,
                          backgroundColor: item.checked ? colors.primary : 'transparent',
                        }}>
                          {item.checked && (
                            <MaterialCommunityIcons name="check" size={14} color={colors.onPrimary} />
                          )}
                        </View>

                        <Text style={{
                          flex: 1,
                          fontSize: 14,
                          lineHeight: 20,
                          color: item.checked ? colors.textMuted : colors.text,
                          textDecorationLine: item.checked ? 'line-through' : 'none',
                        }}>
                          {item.name}
                        </Text>

                        {item.quantity && (
                          <View style={{
                            marginLeft: 8,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 12,
                            backgroundColor: isDark ? colors.border : colors.primaryContainer,
                            flexShrink: 0,
                          }}>
                            <Text style={{
                              fontSize: 11,
                              fontWeight: '600',
                              color: isDark ? colors.textMuted : colors.primary,
                            }}>
                              ×{item.quantity}
                            </Text>
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 16,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: isDark ? colors.surfaceContainer : colors.surface,
          }}>
            <Pressable
              onPress={handleSave}
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
        </>
      )}
    </View>
  );
}