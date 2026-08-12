/**
 * One-Week Food Stockpile – interactive checklist page.
 * Source: Österreichischer Zivilschutzverband (Austrian Civil Protection Association) – https://zivilschutz.at/thema/vorrat/
 * Quantities are based on a sample household of 2 adults and 2 children for 7 days, as calculated by the Zivilschutz.
 */

import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { getThemeColours } from '../../styles/themeColours';
import { getChecklistPageStyles, getLayoutStyles, getTopAppBarShadow, getTopAppBarStyles } from '../../styles/appStyles';
import { useOneWeekStockpileChecklist } from '../../hooks/useOneWeekStockpileChecklist';
import { usePreparedness } from '../../context/PreparednessContext';
import { SaveProgressButton } from '../../components/SaveProgressButton';
import { LearningSourceCitation } from '../../components/LearningSourceCitation';

const GROUP_ORDER = [
  'Water & drinks',
  'Fruit & vegetables',
  'Carbohydrates',
  'Legumes & protein',
  'Meat & fish',
  'Dairy & fats',
];

const INTRO_TEXT =
  'This list covers essential food and water supplies for a household of 2 adults and 2 children for 7 days. ' +
  'For longer periods, multiply all quantities by the number of weeks. Where items are labelled "OR", ' +
  'choose whichever option best suits your household; you only need one of the alternatives.';

interface OneWeekStockpilePageProps {
  onBack: () => void;
}

export function OneWeekStockpilePage({ onBack }: OneWeekStockpilePageProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);
  const layout = getLayoutStyles(isDark);
  const topBar = getTopAppBarStyles(isDark);
  const checklist = getChecklistPageStyles(isDark);
  const { refresh: refreshPreparedness } = usePreparedness();

  const { items, loading, saving, saved, checkedCount, totalCount, toggleItem, saveChecklist } =
    useOneWeekStockpileChecklist();

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
          One-Week Food Stockpile
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
                {checkedCount} / {totalCount} items stocked
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
                <MaterialCommunityIcons name="fridge-outline" size={20} color={colors.primary} />
                <Text className={checklist.introTitle}>About this list</Text>
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
              source="Österreichischer Zivilschutzverband (Austrian Civil Protection Association)"
              url="https://zivilschutz.at/thema/vorrat/"
            />
          </ScrollView>

          <SaveProgressButton onSave={handleSave} saving={saving} saved={saved} />
        </>
      )}
    </View>
  );
}
