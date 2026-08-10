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
import { getTopAppBarStyles } from '../../styles/appStyles';
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
  const topBar = getTopAppBarStyles(isDark);
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
          One-Week Food Stockpile
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
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 14,
              backgroundColor: isDark ? colors.surfaceAlt : colors.surface,
              borderBottomWidth: 1,
              borderBottomColor: colors.divider,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '500',
                  letterSpacing: 0.5,
                  color: colors.textMuted,
                }}
              >
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
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{
                borderRadius: 12,
                padding: 14,
                marginBottom: 20,
                backgroundColor: colors.surfaceAlt,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <MaterialCommunityIcons name="fridge-outline" size={20} color={colors.primary} />
                <Text
                  style={{
                    marginLeft: 8,
                    fontSize: 14,
                    fontWeight: '700',
                    color: colors.text,
                  }}
                >
                  About this list
                </Text>
              </View>
              <Text style={{ fontSize: 13, lineHeight: 19, color: colors.text }}>{INTRO_TEXT}</Text>
            </View>

            {groups.map((group) => (
              <View key={group.name} style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    letterSpacing: 0.1,
                    color: colors.primary,
                    marginBottom: 8,
                    paddingHorizontal: 4,
                  }}
                >
                  {group.name}
                </Text>

                <View
                  style={{
                    borderRadius: 12,
                    overflow: 'hidden',
                    backgroundColor: colors.surfaceAlt,
                  }}
                >
                  {group.items.map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => toggleItem(item.id)}
                      android_ripple={{ color: colors.ripple }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                        }}
                      >
                        <View
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 2,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 2,
                            marginRight: 14,
                            flexShrink: 0,
                            borderColor: item.checked ? colors.primary : colors.textMuted,
                            backgroundColor: item.checked ? colors.primary : 'transparent',
                          }}
                        >
                          {item.checked && (
                            <MaterialCommunityIcons
                              name="check"
                              size={14}
                              color={colors.onPrimary}
                            />
                          )}
                        </View>

                        <Text
                          style={{
                            flex: 1,
                            fontSize: 14,
                            lineHeight: 20,
                            color: item.checked ? colors.textMuted : colors.text,
                            textDecorationLine: item.checked ? 'line-through' : 'none',
                          }}
                        >
                          {item.name}
                        </Text>

                        {item.quantity && (
                          <View
                            style={{
                              marginLeft: 8,
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                              borderRadius: 12,
                              backgroundColor: isDark ? colors.surfaceAlt : colors.primaryContainer,
                              flexShrink: 0,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 11,
                                fontWeight: '600',
                                color: isDark ? colors.textMuted : colors.primary,
                              }}
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
