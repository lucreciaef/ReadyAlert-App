/**
 * Sub-page: Building a Go-Bag
 * Source: Österreichisches Rotes Kreuz - https://www.roteskreuz.at/vorsorge (PDF downloads link)
 * Top App Bar with back button, intro card, linear progress bar, checklist with checkboxes,
 * and a Save button.
 */

import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { getThemeColours } from '../../styles/themeColours';
import { getChecklistPageStyles, getLayoutStyles, getTopAppBarShadow, getTopAppBarStyles } from '../../styles/appStyles';
import { useGoBagChecklist } from '../../hooks/useGoBagChecklist';
import { usePreparedness } from '../../context/PreparednessContext';
import { SaveProgressButton } from '../../components/SaveProgressButton';
import { LearningSourceCitation } from '../../components/LearningSourceCitation';

const GROUP_ORDER = ['Clothing & shelter', 'Food, water & tools', 'Health & documents'];

const INTRO_TEXT =
  'Even a leak in a gas pipe, a fire in a neighbouring house, or the discovery of an unexploded aerial bomb can suddenly make it necessary to evacuate individual buildings — let alone a full-scale disaster. In such a case, you should have an emergency go-bag ready, or at least know what you need to pack. The most practical means of transport is a rucksack, so your hands stay free. A trolley is the second-best choice — thanks to its wheels, it spares you from carrying the weight.';

interface BuildingAGoBagPageProps {
  onBack: () => void;
}

export function BuildingAGoBagPage({ onBack }: BuildingAGoBagPageProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);
  const layout = getLayoutStyles(isDark);
  const topBar = getTopAppBarStyles(isDark);
  const checklist = getChecklistPageStyles(isDark);
  const { refresh: refreshPreparedness } = usePreparedness();

  const { items, loading, saving, saved, checkedCount, totalCount, toggleItem, saveChecklist } =
    useGoBagChecklist();

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
          Emergency Go-Bag
        </Text>
      </View>

      {loading ? (
        <View className={layout.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className={layout.loadingLabel}>Loading checklist…</Text>
        </View>
      ) : (
        <>
          <View className={checklist.progressStrip}>
            <View className={checklist.progressHeaderRow}>
              <Text className={checklist.progressCountLabel}>
                {checkedCount} / {totalCount} items ready at home
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: progressPercent === 100 ? colors.success : colors.primary,
                }}
              >
                {Math.round(progressPercent)}%
              </Text>
            </View>
            <View
              style={{
                height: 4,
                borderRadius: 2,
                backgroundColor: isDark ? colors.divider : colors.primaryContainer,
              }}
            >
              <View
                style={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: progressPercent === 100 ? colors.success : colors.primary,
                  width: `${progressPercent}%`,
                }}
              />
            </View>
          </View>

          <ScrollView
            className={layout.fill}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <View className={checklist.introCard}>
              <View className={checklist.introIconRow}>
                <MaterialCommunityIcons
                  name="bag-personal-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text className={checklist.introTitle}>Why prepare a go-bag?</Text>
              </View>
              <Text className={checklist.introBody}>{INTRO_TEXT}</Text>
            </View>

            {groups.map((group) => (
              <View key={group.name} style={{ marginBottom: 20 }}>
                <Text className={checklist.groupLabel}>{group.name}</Text>

                <View className={checklist.groupCard}>
                  {group.items.map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => toggleItem(item.id)}
                      android_ripple={{ color: colors.ripple }}
                    >
                      <View className={checklist.itemRow}>
                        <View
                          className={checklist.checkbox}
                          style={{
                            borderColor: item.checked ? colors.primary : colors.textMuted,
                            backgroundColor: item.checked ? colors.primary : 'transparent',
                          }}
                        >
                          {item.checked && (
                            <MaterialCommunityIcons name="check" size={14} color={colors.onPrimary} />
                          )}
                        </View>

                        <Text
                          className={checklist.itemLabel}
                          style={{
                            color: item.checked ? colors.textMuted : colors.text,
                            textDecorationLine: item.checked ? 'line-through' : 'none',
                          }}
                        >
                          {item.name}
                        </Text>

                        {item.quantity && (
                          <View
                            className={checklist.quantityBadge}
                            style={{
                              backgroundColor: isDark ? colors.surfaceAlt : colors.primaryContainer,
                            }}
                          >
                            <Text
                              className={checklist.quantityBadgeText}
                              style={{ color: isDark ? colors.textMuted : colors.primary }}
                            >
                              ×{item.quantity}
                            </Text>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
            <LearningSourceCitation
              source="Österreichisches Rotes Kreuz (Austrian Red Cross)"
              url="https://www.roteskreuz.at/vorsorge"
            />
          </ScrollView>
          <SaveProgressButton onSave={handleSave} saving={saving} saved={saved} />
        </>
      )}
    </View>
  );
}
