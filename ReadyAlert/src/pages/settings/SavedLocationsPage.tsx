/**
 * Saved Locations page
 * Lets the user save up to 3 custom cities, choose which one is used for the Home Dashboard,
 * or switch back to their real GPS location.
 * Has two modes: list of saved locations, and city search when adding a new one.
 */

import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { getThemeColours } from '../../styles/themeColours';
import { getSavedLocationsPageStyles, getTopAppBarStyles } from '../../styles/appStyles';
import { MAX_SAVED_LOCATIONS, useSavedLocations } from '../../context/SavedLocationsContext';
import { GeocodingResult, searchCities } from '../../api/geocoding';

interface SavedLocationsPageProps {
  onBack: () => void;
}

type Mode = 'list' | 'add';

export function SavedLocationsPage({ onBack }: SavedLocationsPageProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);
  const topBar = getTopAppBarStyles(isDark);
  const styles = getSavedLocationsPageStyles(isDark);
  const { savedLocations, selectedId, canAddMore, addLocation, removeLocation, selectLocation } =
    useSavedLocations();

  const [mode, setMode] = useState<Mode>('list');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Debounced city search.
  useEffect(() => {
    if (mode !== 'add') return;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearchError(null);
      setSearching(false);
      abortRef.current?.abort();
      return;
    }
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    setSearching(true);
    setSearchError(null);
    const timer = setTimeout(() => {
      searchCities(trimmed, { signal: controller.signal })
        .then((res) => {
          if (controller.signal.aborted) return;
          setResults(res);
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) return;
          console.warn('City search failed:', err);
          setSearchError('Could not search cities. Please try again.');
          setResults([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearching(false);
        });
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, mode]);

  const handlePickResult = (r: GeocodingResult) => {
    if (!canAddMore) {
      Alert.alert(
        'Limit reached',
        `You can save up to ${MAX_SAVED_LOCATIONS} locations. Remove one before adding another.`,
      );
      return;
    }
    const created = addLocation({
      name: r.name,
      subtitle: r.subtitle,
      latitude: r.latitude,
      longitude: r.longitude,
    });
    if (created) {
      selectLocation(created.id);
    }
    setQuery('');
    setResults([]);
    setMode('list');
  };

  const handleRemove = (id: string, name: string) => {
    Alert.alert('Remove location?', `Remove "${name}" from your saved locations?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeLocation(id) },
    ]);
  };

  const isListMode = mode === 'list';
  const headerTitle = isListMode ? 'Saved locations' : 'Add a location';

  const goBackFromAdd = () => {
    setMode('list');
    setQuery('');
    setResults([]);
    setSearchError(null);
  };

  return (
    <View className={styles.screen} style={{ paddingTop: insets.top }}>
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
          onPress={isListMode ? onBack : goBackFromAdd}
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
          {headerTitle}
        </Text>
      </View>

      {isListMode ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className={styles.helper}>
            Save up to {MAX_SAVED_LOCATIONS} cities. Pick one to see its regional information and
            alerts on the home dashboard, or switch back to your current GPS location.
          </Text>

          <Text className={styles.sectionLabel}>Active location</Text>
          <View className={styles.card}>
            <Pressable
              onPress={() => selectLocation(null)}
              android_ripple={{ color: colors.ripple }}
              className={styles.row}
            >
              <MaterialCommunityIcons
                name={selectedId === null ? 'radiobox-marked' : 'radiobox-blank'}
                size={22}
                color={selectedId === null ? colors.primary : colors.textMuted}
              />
              <View className={styles.rowMain} style={{ marginLeft: 12 }}>
                <Text className={styles.rowTitle}>Use my current GPS location</Text>
              </View>
              <MaterialCommunityIcons name="crosshairs-gps" size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <Text className={styles.sectionLabel}>Saved locations</Text>
          {savedLocations.length === 0 ? (
            <Text className={styles.emptyText}>
              No locations saved yet. Tap “Add a location” below to search for a city or district.
            </Text>
          ) : (
            <View className={styles.card}>
              {savedLocations.map((loc, idx) => {
                const isSelected = selectedId === loc.id;
                const isLast = idx === savedLocations.length - 1;
                return (
                  <Pressable
                    key={loc.id}
                    onPress={() => selectLocation(loc.id)}
                    android_ripple={{ color: colors.ripple }}
                    className={`${styles.row} ${isLast ? '' : styles.rowDivider}`}
                  >
                    <MaterialCommunityIcons
                      name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
                      size={22}
                      color={isSelected ? colors.primary : colors.textMuted}
                    />
                    <View className={styles.rowMain} style={{ marginLeft: 12 }}>
                      <Text className={styles.rowTitle}>{loc.name}</Text>
                      {!!loc.subtitle && <Text className={styles.rowSubtitle}>{loc.subtitle}</Text>}
                    </View>
                    <Pressable
                      onPress={() => handleRemove(loc.id, loc.name)}
                      android_ripple={{ color: colors.ripple, borderless: true }}
                      className={styles.rowIconBtn}
                    >
                      <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={20}
                        color={colors.textMuted}
                      />
                    </Pressable>
                  </Pressable>
                );
              })}
            </View>
          )}

          <Pressable
            onPress={() => canAddMore && setMode('add')}
            disabled={!canAddMore}
            android_ripple={{ color: colors.rippleOnPrimary }}
            className={`${styles.addButton} ${canAddMore ? '' : styles.addButtonDisabled}`}
          >
            <MaterialCommunityIcons
              name="plus"
              size={20}
              color={isDark ? colors.onPrimary : colors.onPrimary}
            />
            <Text className={styles.addButtonText}>
              {canAddMore ? 'Add a location' : `Limit of ${MAX_SAVED_LOCATIONS} reached`}
            </Text>
          </Pressable>
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingTop: 12 }}>
          <View className={styles.searchInputWrap}>
            <MaterialCommunityIcons name="magnify" size={20} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search a city or district"
              placeholderTextColor={colors.textMuted}
              className={styles.searchInput}
              autoFocus
              autoCorrect={false}
              autoCapitalize="words"
              returnKeyType="search"
            />
            {query.length > 0 && (
              <Pressable
                onPress={() => setQuery('')}
                android_ripple={{ color: colors.ripple, borderless: true }}
                hitSlop={8}
              >
                <MaterialCommunityIcons name="close" size={18} color={colors.textMuted} />
              </Pressable>
            )}
          </View>

          <ScrollView
            style={{ flex: 1, marginTop: 8 }}
            contentContainerStyle={{ paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
          >
            {searching && (
              <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                <ActivityIndicator color={colors.primary} />
              </View>
            )}
            {!searching && searchError && <Text className={styles.emptyText}>{searchError}</Text>}
            {!searching && !searchError && query.trim().length >= 2 && results.length === 0 && (
              <Text className={styles.emptyText}>No matches. Try a different name.</Text>
            )}
            {!searching && query.trim().length < 2 && (
              <Text className={styles.emptyText}>Type at least 2 characters to search.</Text>
            )}

            {results.length > 0 && (
              <View className={styles.card} style={{ marginTop: 8 }}>
                {results.map((r, idx) => {
                  const isLast = idx === results.length - 1;
                  return (
                    <Pressable
                      key={`${r.id}-${idx}`}
                      onPress={() => handlePickResult(r)}
                      android_ripple={{ color: colors.ripple }}
                      className={`${styles.row} ${isLast ? '' : styles.rowDivider}`}
                    >
                      <MaterialCommunityIcons
                        name="map-marker-outline"
                        size={20}
                        color={colors.textMuted}
                      />
                      <View className={styles.rowMain} style={{ marginLeft: 12 }}>
                        <Text className={styles.rowTitle}>{r.name}</Text>
                        {!!r.subtitle && <Text className={styles.rowSubtitle}>{r.subtitle}</Text>}
                      </View>
                      <MaterialCommunityIcons name="plus" size={20} color={colors.primary} />
                    </Pressable>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
