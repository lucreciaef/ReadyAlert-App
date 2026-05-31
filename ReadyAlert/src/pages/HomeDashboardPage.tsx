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
  Warning,
} from '../api';
import { useLocationContext } from '../context/LocationContext';
import { Toast } from '../components/Toast';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { ExpandableWarningCard } from '../components/ExpandableWarningCard';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PEEK_HEIGHT = 88;
const HALF_HEIGHT = Math.round(SCREEN_HEIGHT * 0.5);
const MAX_TRANSLATE_Y = HALF_HEIGHT - PEEK_HEIGHT;

export function HomeDashboardPage() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

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
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' } | null>(null);

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
      setApiData(null); // clear stale data from previous location immediately
      const data = await fetchWarningsForLocation(lon, lat, 'en');
      setApiData(data);
    } catch (err) {
      if (err instanceof OutsideAustriaError) {
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
      : apiData
        ? locationName
        : userLocation
          ? `${userLocation.latitude.toFixed(3)}°, ${userLocation.longitude.toFixed(3)}°`
          : 'Unknown location';

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
                  name={hasWarnings ? 'alert-circle' : 'checkmark-circle'}
                  size={20}
                  color={hasWarnings ? '#EF4444' : '#22C55E'}
                />
                <Text className={`text-base font-bold ${isDark ? 'text-text-dark' : 'text-text'}`}>
                  {loading
                    ? 'Loading…'
                    : hasWarnings
                      ? `${warningCount} Active Warning${warningCount !== 1 ? 's' : ''}`
                      : apiData
                        ? 'No Active Warnings'
                        : 'Warnings'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => snapSheet(sheetExpanded ? MAX_TRANSLATE_Y : 0)}>
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
