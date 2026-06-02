import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColors } from '../styles/themeColors';
import {
  fetchWarningsForLocation,
  GeosphereResponse,
  getLocationName,
  getWarningCount,
  OutsideAustriaError,
  ServiceUnavailableError,
  Warning,
} from '../api';
import { useLocationContext } from '../context/LocationContext';
import { usePreparedness } from '../context/PreparednessContext';
import { Toast } from '../components/Toast';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { ExpandableWarningCard } from '../components/ExpandableWarningCard';
import { APIResultButton } from '../components/APIResultButton';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PEEK_HEIGHT = 88;
const HALF_HEIGHT = Math.round(SCREEN_HEIGHT * 0.5);
const MAX_TRANSLATE_Y = HALF_HEIGHT - PEEK_HEIGHT;

const TROPHY_SIZE = 26;

function TrophyIcon({ fill, color }: { fill: number; color: string }) {
  return (
    <View style={{ width: TROPHY_SIZE, height: TROPHY_SIZE }}>
      {/* Gray outline — always visible as the "empty" background */}
      <Ionicons name="trophy-outline" size={TROPHY_SIZE} color="#D1D5DB" />
      {/* Coloured fill clipped to the fraction of the icon width */}
      {fill > 0 && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: Math.ceil(TROPHY_SIZE * fill),
            height: TROPHY_SIZE,
            overflow: 'hidden',
          }}
        >
          <Ionicons name="trophy" size={TROPHY_SIZE} color={color} />
        </View>
      )}
    </View>
  );
}

export function HomeDashboardPage({ onPreparednessPress }: { onPreparednessPress?: () => void }) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const { preparedness, loading: prepLoading } = usePreparedness();

  const {
    coords: userLocation,
    loading: locationLoading,
    error: locationError,
    requestPermission,
    isDebugMode,
  } = useLocationContext();

  const [apiData, setApiData] = useState<GeosphereResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceUnavailable, setServiceUnavailable] = useState(false);
  const [locationDisplayName, setLocationDisplayName] = useState<string | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' } | null>(null);

  useEffect(() => {
    if (!userLocation) {
      setLocationDisplayName(null);
      return;
    }
    let cancelled = false;
    Location.reverseGeocodeAsync({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
    })
      .then((results) => {
        if (cancelled || !results.length) return;
        const place = results[0];
        const parts = [place.city ?? place.district ?? place.subregion, place.country].filter(Boolean);
        if (parts.length) setLocationDisplayName(parts.join(', '));
      })
      .catch(() => {}); // Fail silently if there is a geocoding error, just show coordinates without a name
    return () => { cancelled = true; };
  }, [userLocation]);

  // Bottom sheet animation
  const sheetAnim = useRef(new Animated.Value(MAX_TRANSLATE_Y)).current;
  const expandedRef = useRef(false);

  const snapSheet = (toValue: number) => {
    const expanded = toValue === 0;
    expandedRef.current = expanded;
    setSheetExpanded(expanded);
    Animated.spring(sheetAnim, {
      toValue,
      useNativeDriver: true,
      damping: 30,
      stiffness: 200,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 4,
      onPanResponderMove: (_, gs) => {
        const base = expandedRef.current ? 0 : MAX_TRANSLATE_Y;
        const next = Math.max(0, Math.min(MAX_TRANSLATE_Y, base + gs.dy));
        sheetAnim.setValue(next);
      },
      onPanResponderRelease: (_, gs) => {
        const base = expandedRef.current ? 0 : MAX_TRANSLATE_Y;
        const finalVal = Math.max(0, Math.min(MAX_TRANSLATE_Y, base + gs.dy));
        const snapTo = finalVal < MAX_TRANSLATE_Y / 2 || gs.vy < -0.5 ? 0 : MAX_TRANSLATE_Y;
        snapSheet(snapTo);
      },
    }),
  ).current;

  // data fetching
  useEffect(() => {
    if (userLocation && !locationLoading) {
      loadWarnings(userLocation.longitude, userLocation.latitude);
    }
  }, [userLocation, locationLoading]);

  // Auto-expand sheet once data arrives or an error occurs
  useEffect(() => {
    if (!loading && (apiData || error)) {
      snapSheet(0);
    }
  }, [loading, apiData, error]);

  const loadWarnings = async (lon: number, lat: number) => {
    try {
      setLoading(true);
      setError(null);
      setServiceUnavailable(false);
      setApiData(null); // clear stale data from previous location immediately
      const data = await fetchWarningsForLocation(lon, lat, 'en');
      setApiData(data);
    } catch (err) {
      if (err instanceof ServiceUnavailableError) {
        // Show the unavailable banner inside the bottom sheet and expand it
        setServiceUnavailable(true);
        snapSheet(0);
      } else if (err instanceof OutsideAustriaError) {
        // Clear any leftover warnings and collapse the sheet, then show a toast
        setApiData(null);
        snapSheet(MAX_TRANSLATE_Y);
        setToast({ message: err.message, type: 'warning' });
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch warnings');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (userLocation) loadWarnings(userLocation.longitude, userLocation.latitude);
    else requestPermission();
  };

  const warningCount = getWarningCount(apiData);
  const locationName = getLocationName(apiData);
  const hasWarnings = warningCount > 0;
  const warnings = apiData?.properties?.warnings || [];

  // State/region level zoom — large enough to see the surrounding area
  const REGION_DELTA = 1.2;
  const mapRegion = userLocation
    ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: REGION_DELTA,
        longitudeDelta: REGION_DELTA,
      }
    : {
        latitude: 48.2082,
        longitude: 16.3738,
        latitudeDelta: REGION_DELTA,
        longitudeDelta: REGION_DELTA,
      };

  const headerLabel = locationLoading
    ? 'Locating…'
    : isDebugMode
      ? 'London, UK (debug)'
      : locationDisplayName ?? locationName ?? 'Unknown location';

  return (
    <View className="flex-1" style={{ paddingTop: insets.top }}>
      <View
        className={`flex-row items-center justify-between px-4 h-14 border-b shadow-sm ${
          isDark ? 'bg-surface-dark border-[#333]' : 'bg-surface border-gray-200'
        }`}
      >
        <View className="flex-row items-center flex-1 gap-2">
          <Ionicons name="location" size={18} color={colors.primary} />
          <Text
            className={`text-[15px] font-semibold flex-1 ${isDark ? 'text-text-dark' : 'text-text'}`}
            numberOfLines={1}
          >
            {headerLabel}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleRefresh}
          disabled={loading || locationLoading}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="refresh"
            size={20}
            color={loading || locationLoading ? colors.textMuted : colors.primary}
          />
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <MapView
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          region={mapRegion}
          showsUserLocation
          showsMyLocationButton={false}
          provider={PROVIDER_DEFAULT}
          mapPadding={{ top: 0, right: 0, bottom: HALF_HEIGHT, left: 0 }}
        />

        {!prepLoading && (
          <Animated.View
            style={{
              position: 'absolute',
              bottom: PEEK_HEIGHT + 14,
              left: 16,
              alignSelf: 'flex-start',
              elevation: 5,
              zIndex: 5,
              transform: [{ translateY: Animated.subtract(sheetAnim, MAX_TRANSLATE_Y) }], // translateY mirrors sheetAnim: 0 when collapsed, -MAX_TRANSLATE_Y when fully open
            }}
          >
            <TouchableOpacity activeOpacity={0.85} onPress={onPreparednessPress}>
            <View
              className={`rounded-2xl px-4 py-3  ${isDark ? 'bg-surface-dark' : 'bg-white'}`}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: isDark ? 0.35 : 0.12,
                shadowRadius: 10,
              }}
            >
              <Text
                className={`text-[11px] font-semibold uppercase tracking-widest mb-2 ${
                  isDark ? 'text-text-muted-dark' : 'text-text-muted'
                }`}
              >
                Preparedness score
              </Text>

              <View className="flex-row items-center justify-between">
                {/* Trophy row — 5 icons representing 0–100% in 20% steps */}
                <View className="flex-row gap-1.5">
                  {[0, 1, 2, 3, 4].map((i) => {
                    const trophyScore = preparedness.score / 20; // 0–5 scale
                    const fill = Math.min(1, Math.max(0, trophyScore - i));
                    return (
                      <TrophyIcon key={i} fill={fill} color={preparedness.color} />
                    );
                  })}
                </View>
              </View>
            </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        <Animated.View
          className={`absolute bottom-0 left-0 right-0 rounded-t-[22px] ${isDark ? 'bg-surface-dark' : 'bg-surface'}`}
          style={{
            height: HALF_HEIGHT,
            transform: [{ translateY: sheetAnim }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          <View {...panResponder.panHandlers} className="px-4 pb-1">
            <View
              className={`w-10 h-1 rounded-sm self-center mt-2.5 mb-3 ${isDark ? 'bg-[#555]' : 'bg-gray-300'}`}
            />
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name={
                    loading || locationLoading
                      ? 'hourglass-outline'
                      : serviceUnavailable || !!error || (!!locationError && !userLocation)
                        ? 'warning'
                        : 'checkmark-circle'
                  }
                  size={20}
                  color={
                    loading || locationLoading
                      ? colors.textMuted
                      : serviceUnavailable || !!error || (!!locationError && !userLocation)
                        ? '#F59E0B'
                        : '#22C55E'
                  }
                />
                <Text className={`text-base font-bold ${isDark ? 'text-text-dark' : 'text-text'}`}>
                  Current location
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => snapSheet(expandedRef.current ? MAX_TRANSLATE_Y : 0)}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <Ionicons
                  name={sheetExpanded ? 'chevron-down' : 'chevron-up'}
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 16 }}
            showsVerticalScrollIndicator={false}
            scrollEnabled={sheetExpanded}
            keyboardShouldPersistTaps="handled"
          >

            {(loading || locationLoading) && (
              <LoadingState message={locationLoading ? 'Getting your location…' : 'Loading warnings…'} />
            )}

            {(error || (locationError && !userLocation)) && !loading && (
              <ErrorBanner message={error || locationError || ''} />
            )}

            {serviceUnavailable && !loading && (
              <APIResultButton
                loading={false}
                hasAlerts={false}
                totalCount={0}
                isUnavailable
                onPress={handleRefresh}
              />
            )}

            {!loading && apiData && !hasWarnings && (
              <EmptyState message="No active warnings in this area" />
            )}

            {!loading &&
              hasWarnings &&
              warnings.map((warning: Warning, index: number) => (
                <ExpandableWarningCard
                  key={`${warning.properties.warnid}-${index}`}
                  warning={warning}
                />
              ))}

            <View className="h-6" />
          </ScrollView>
        </Animated.View>
      </View>

      <Toast
        visible={!!toast}
        message={toast?.message ?? ''}
        type={toast?.type ?? 'warning'}
        duration={5000}
        onHide={() => setToast(null)}
      />
    </View>
  );
}
