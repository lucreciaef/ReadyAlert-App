/**
 * Sub-page: Home Pharmacy Kit
 * Displays a grouped checklist of items recommended for a home emergency kit.
 * Checklist state is loaded from and persisted to a local SQLite database.
 */

import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { getThemeColors } from '../../styles/themeColors';
import { usePharmacyChecklist } from '../../hooks/usePharmacyChecklist';
import { usePreparedness } from '../../context/PreparednessContext';

// The order in which groups should be rendered
const GROUP_ORDER = ['Medicines', 'Other items', 'First-aid dressing packs'];

interface PharmacyKitPageProps {
  onBack: () => void;
}

export function PharmacyKitPage({ onBack }: PharmacyKitPageProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const { refresh: refreshPreparedness } = usePreparedness();

  const { items, loading, saving, saved, checkedCount, totalCount, toggleItem, saveChecklist } =
    usePharmacyChecklist();

  const handleSave = async () => {
    await saveChecklist();
    // Re-compute the global preparedness score so the Home Dashboard badge updates
    await refreshPreparedness();
  };

  // Group items while preserving GROUP_ORDER
  const groups = GROUP_ORDER.map((groupName) => ({
    name: groupName,
    items: items.filter((i) => i.group === groupName),
  })).filter((g) => g.items.length > 0);

  const progressPercent = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  return (
    <View
      className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}
      style={{ paddingTop: insets.top }}
    >
      <View
        className={`flex-row items-center px-3 h-14 border-b ${
          isDark ? 'bg-surface-dark border-[#333]' : 'bg-surface border-gray-200'
        }`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="p-1 mr-2"
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text
          className={`flex-1 text-[17px] font-bold ${isDark ? 'text-text-dark' : 'text-text'}`}
          numberOfLines={1}
        >
          Home Pharmacy Kit
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className={`mt-3 text-[14px] ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`}>
            Loading checklist…
          </Text>
        </View>
      ) : (
        <>
          {/* ── Progress bar ── */}
          <View
            className={`px-4 py-3 border-b ${
              isDark ? 'bg-surface-dark border-[#333]' : 'bg-surface border-gray-200'
            }`}
          >
            <View className="flex-row items-center justify-between mb-1.5">
              <Text
                className={`text-[13px] font-semibold ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`}
              >
                {checkedCount} / {totalCount} items ready
              </Text>
              <Text
                className={`text-[13px] font-bold ${
                  progressPercent === 100
                    ? 'text-green-500'
                    : isDark
                      ? 'text-primary-dark'
                      : 'text-primary'
                }`}
              >
                {Math.round(progressPercent)}%
              </Text>
            </View>
            {/* Track */}
            <View className={`h-2 rounded-full ${isDark ? 'bg-[#3a3a3a]' : 'bg-gray-200'}`}>
              <View
                className={`h-2 rounded-full ${progressPercent === 100 ? 'bg-green-500' : 'bg-primary'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </View>
          </View>

          {/* ── Checklist ── */}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {groups.map((group) => (
              <View key={group.name} className="mb-5">
                {/* Group header */}
                <Text
                  className={`text-[12px] font-bold uppercase tracking-widest mb-2 ${
                    isDark ? 'text-text-muted-dark' : 'text-text-muted'
                  }`}
                >
                  {group.name}
                </Text>

                {/* Group items */}
                <View
                  className={`rounded-2xl overflow-hidden border ${
                    isDark ? 'border-[#3a3a3a]' : 'border-gray-200'
                  }`}
                >
                  {group.items.map((item, idx) => {
                    const isLast = idx === group.items.length - 1;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.7}
                        onPress={() => toggleItem(item.id)}
                        className={`flex-row items-center px-4 py-3 ${
                          isDark ? 'bg-surface-dark' : 'bg-surface'
                        } ${!isLast ? (isDark ? 'border-b border-[#3a3a3a]' : 'border-b border-gray-100') : ''}`}
                      >
                        {/* Checkbox */}
                        <View
                          className={`w-6 h-6 rounded-full items-center justify-center border-2 mr-3 flex-shrink-0 ${
                            item.checked
                              ? 'bg-primary border-primary'
                              : isDark
                                ? 'border-[#555] bg-transparent'
                                : 'border-gray-300 bg-transparent'
                          }`}
                        >
                          {item.checked && (
                            <Ionicons name="checkmark" size={14} color="#fff" />
                          )}
                        </View>

                        {/* Label */}
                        <Text
                          className={`flex-1 text-[14px] leading-5 ${
                            item.checked
                              ? isDark
                                ? 'text-text-muted-dark line-through'
                                : 'text-text-muted line-through'
                              : isDark
                                ? 'text-text-dark'
                                : 'text-text'
                          }`}
                        >
                          {item.name}
                        </Text>

                        {/* Optional quantity badge */}
                        {item.quantity && (
                          <View
                            className={`ml-2 px-2 py-0.5 rounded-full flex-shrink-0 ${
                              isDark ? 'bg-[#3a3a3a]' : 'bg-gray-100'
                            }`}
                          >
                            <Text
                              className={`text-[11px] font-semibold ${
                                isDark ? 'text-text-muted-dark' : 'text-text-muted'
                              }`}
                            >
                              ×{item.quantity}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>

          {/* ── Save button (sticky footer) ── */}
          <View
            className={`px-4 pt-3 border-t ${
              isDark ? 'bg-surface-dark border-[#333]' : 'bg-surface border-gray-200'
            }`}
            style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSave}
              disabled={saving || saved}
              className={`rounded-2xl py-4 items-center justify-center flex-row gap-2 ${
                saved
                  ? 'bg-green-500'
                  : saving
                    ? isDark
                      ? 'bg-[#3a3a3a]'
                      : 'bg-gray-200'
                    : 'bg-primary'
              }`}
            >
              {saving ? (
                <ActivityIndicator size="small" color={isDark ? '#aaa' : '#888'} />
              ) : (
                <Ionicons
                  name={saved ? 'checkmark-circle' : 'save-outline'}
                  size={20}
                  color={saving ? (isDark ? '#aaa' : '#888') : '#fff'}
                />
              )}
              <Text
                className={`text-[15px] font-bold ${
                  saving ? (isDark ? 'text-text-muted-dark' : 'text-text-muted') : 'text-white'
                }`}
              >
                {saving ? 'Saving…' : saved ? 'Saved!' : 'Save progress'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}




