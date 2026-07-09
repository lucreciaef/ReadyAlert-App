import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import MapView, { Polygon, PROVIDER_DEFAULT } from 'react-native-maps';
import { DARK_MAP_STYLE, LIGHT_MAP_STYLE } from '../styles/mapStyles';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';
import { getBottomSheetStyles, getHomeDashboardPageStyles, getLayoutStyles, getTopAppBarStyles } from '../styles/appStyles';
import {
  fetchWarningsForLocation,
  filterWarningsInWindow,
  GeosphereResponse,
  getLocationName,
  OutsideAustriaError,
  ServiceUnavailableError,
} from '../api';
import { useLocationContext } from '../context/LocationContext';
import { usePreparedness } from '../context/PreparednessContext';
import { Toast } from '../components/Toast';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { WeatherAlertsCard } from '../components/WeatherAlertsCard';
import { RTRAlertSummaryButton } from '../components/RTRAlertSummaryButton';
import { useNotifications } from '../hooks/useNotifications';
import { useAirQuality } from '../hooks/useAirQuality';
import { useWeather } from '../hooks/useWeather';
import { AirQualityCard } from '../components/AirQualityCard';
import { WeatherCard } from '../components/WeatherCard';
import { PreparednessScoreCard } from '../components/PreparednessScoreCard';

let _prevGeoWarningCount = 0;
const WARNING_WINDOW_HOURS = 48;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PEEK_HEIGHT = 88;
const HALF_HEIGHT = Math.round(SCREEN_HEIGHT * 0.5);
const MAX_TRANSLATE_Y = HALF_HEIGHT - PEEK_HEIGHT;

export function HomeDashboardPage({ onPreparednessPress }: { onPreparednessPress?: () => void }) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);
  const layout = getLayoutStyles(isDark);
  const topBar = getTopAppBarStyles(isDark);
  const bottomSheet = getBottomSheetStyles(isDark);
  const styles = getHomeDashboardPageStyles(isDark);
  const { loading: prepLoading } = usePreparedness();

  const {
    coords: userLocation,
    loading: locationLoading,
    error: locationError,
    requestPermission,
    debugMode,
  } = useLocationContext();

  const REGION_DELTA = 0.2;

  const [apiData, setApiData] = useState<GeosphereResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceUnavailable, setServiceUnavailable] = useState(false);
  const [locationDisplayName, setLocationDisplayName] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' } | null>(null);
  const { notifyGeosphereWarnings } = useNotifications();

  const { data: aqiData, loading: aqiLoading, error: aqiError } = useAirQuality(userLocation);
  const { data: weatherData, loading: weatherLoading, error: weatherError } = useWeather(userLocation);

  useEffect(() => {
    if (!userLocation) { setLocationDisplayName(null); return; }
    let cancelled = false;
    Location.reverseGeocodeAsync({ latitude: userLocation.latitude, longitude: userLocation.longitude })
      .then((results) => {
        if (cancelled || !results.length) return;
        const place = results[0];
        const parts = [place.city ?? place.district ?? place.subregion, place.country].filter(Boolean);
        if (parts.length) setLocationDisplayName(parts.join(', '));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [userLocation]);

  // Bottom sheet animation
  const sheetAnim = useRef(new Animated.Value(MAX_TRANSLATE_Y)).current;
  const expandedRef = useRef(false);

  const snapSheet = (toValue: number) => {
    const expanded = toValue === 0;
    expandedRef.current = expanded;
    setSheetExpanded(expanded);
    Animated.spring(sheetAnim, { toValue, useNativeDriver: true, damping: 30, stiffness: 200 }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 4,
      onPanResponderMove: (_, gs) => {
        const base = expandedRef.current ? 0 : MAX_TRANSLATE_Y;
        sheetAnim.setValue(Math.max(0, Math.min(MAX_TRANSLATE_Y, base + gs.dy)));
      },
      onPanResponderRelease: (_, gs) => {
        const base = expandedRef.current ? 0 : MAX_TRANSLATE_Y;
        const finalVal = Math.max(0, Math.min(MAX_TRANSLATE_Y, base + gs.dy));
        snapSheet(finalVal < MAX_TRANSLATE_Y / 2 || gs.vy < -0.5 ? 0 : MAX_TRANSLATE_Y);
      },
    }),
  ).current;

  useEffect(() => {
    if (userLocation && !locationLoading) {
      loadWarnings(userLocation.longitude, userLocation.latitude);
    }
  }, [userLocation, locationLoading, debugMode]);

  useEffect(() => {
    if (!userLocation) return;
    const interval = setInterval(() => {
      loadWarnings(userLocation.longitude, userLocation.latitude);
    }, 30000);
    return () => clearInterval(interval);
  }, [userLocation, debugMode]);

  useEffect(() => {
    if (!loading && (apiData || error)) snapSheet(0);
  }, [loading, apiData, error]);

  useEffect(() => {
    if (!userLocation) return;
    if (!apiData) return;
    const coords = apiData.geometry?.coordinates;
    if (coords?.length) {
      // Polygon data available — fit the map to show the polygon above the bottom sheet
      const allCoords = coords
        .flatMap((polygon) => polygon[0])
        .map(([lon, lat]) => ({ latitude: lat, longitude: lon }));
      if (allCoords.length > 0) {
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(allCoords, {
            edgePadding: { top: 40, right: 40, bottom: HALF_HEIGHT + 40, left: 40 },
            animated: true,
          });
        }, 500);
        return;
      }
    }
    // No polygon — zoom to user location using REGION_DELTA
    setTimeout(() => {
      mapRef.current?.animateToRegion(
        { latitude: userLocation.latitude, longitude: userLocation.longitude, latitudeDelta: REGION_DELTA, longitudeDelta: REGION_DELTA },
        400,
      );
    }, 300);
  }, [apiData]);

  const loadWarnings = async (lon: number, lat: number) => {
    try {
      setLoading(true);
      setError(null);
      setServiceUnavailable(false);
      setApiData(null);
      if (debugMode === '503') {
        await new Promise((resolve) => setTimeout(resolve, 600));
        throw new ServiceUnavailableError();
      }
      const data = await fetchWarningsForLocation(lon, lat, 'en');
      setApiData(data);
      const inWindow = filterWarningsInWindow(data?.properties?.warnings ?? [], WARNING_WINDOW_HOURS);
      const newCount = inWindow.length;
      if (newCount > 0 && newCount !== _prevGeoWarningCount) {
        const name = getLocationName(data);
        notifyGeosphereWarnings(newCount, name);
      }
      _prevGeoWarningCount = newCount;
    } catch (err) {
      if (err instanceof ServiceUnavailableError) {
        setServiceUnavailable(true);
        snapSheet(0);
      } else if (err instanceof OutsideAustriaError) {
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

  const locationName = getLocationName(apiData);
  const visibleWarnings = filterWarningsInWindow(
    apiData?.properties?.warnings ?? [],
    WARNING_WINDOW_HOURS,
  );
  const warningCount = visibleWarnings.length;
  const hasWarnings = warningCount > 0;

  const initialMapRegion = { latitude: 47.7, longitude: 13.35, latitudeDelta: 5.0, longitudeDelta: 10.0 };

  const headerLabel = locationLoading
    ? 'Locating…'
    : debugMode === 'london'
      ? 'London, UK (debug)'
      : debugMode === 'graz'
        ? 'Graz, Austria (debug)'
        : debugMode === '503'
          ? `${locationDisplayName ?? locationName ?? 'Current location'} (503 debug)`
          : locationDisplayName ?? locationName ?? 'Unknown location';

  // Status icon for the sheet header
  const statusIcon = loading || locationLoading
    ? 'timer-sand'
    : serviceUnavailable || !!error || (!!locationError && !userLocation)
      ? 'alert'
      : 'check-circle';

  const statusColor = loading || locationLoading
    ? colors.textMuted
    : serviceUnavailable || !!error || (!!locationError && !userLocation)
      ? colors.warning
      : colors.text;

  return (
    <View className={layout.fill} style={{ paddingTop: insets.top }}>
      <View className={topBar.container} style={{ elevation: 0 }}>
        <View className={topBar.contentRow}>
          <MaterialCommunityIcons name="home-outline" size={24} color={colors.primary} />
          <Text className={topBar.title} numberOfLines={1}>
            Local info
          </Text>
          <View className={styles.headerSpacer} />
          <Pressable
            onPress={() => Alert.alert('Feature coming up soon')}
            android_ripple={{ color: colors.ripple }}
            className={styles.addButtonPressable}
          >
            <View className={styles.addButtonInner}>
              <Text className={styles.addButtonText}>
                +
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      <View className={layout.fill}>
        <MapView
          ref={mapRef}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          initialRegion={initialMapRegion}
          showsUserLocation
          showsMyLocationButton={false}
          provider={PROVIDER_DEFAULT}
          customMapStyle={isDark ? DARK_MAP_STYLE : LIGHT_MAP_STYLE}
          mapPadding={{ top: 0, right: 0, bottom: PEEK_HEIGHT, left: 0 }}
        >
          {(apiData?.geometry?.coordinates ?? []).flatMap((polygon, polyIdx) =>
            polygon.map((ring, ringIdx) => (
              <Polygon
                key={`geosphere-${polyIdx}-${ringIdx}`}
                coordinates={ring.map(([lon, lat]) => ({ latitude: lat, longitude: lon }))}
                fillColor={`${colors.warning}40`}
                strokeColor={`${colors.warning}CC`}
                strokeWidth={2}
              />
            ))
          )}
        </MapView>

        {!prepLoading && (
          <Animated.View
            style={{
              position: 'absolute',
              bottom: PEEK_HEIGHT + 14,
              left: 16,
              alignSelf: 'flex-start',
              elevation: 3,
              zIndex: 5,
              transform: [{ translateY: Animated.subtract(sheetAnim, MAX_TRANSLATE_Y) }],
            }}
          >
            <PreparednessScoreCard onPress={onPreparednessPress} />
          </Animated.View>
        )}

        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: HALF_HEIGHT,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            backgroundColor: isDark ? colors.surfaceAlt : colors.surface,
            transform: [{ translateY: sheetAnim }],
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.12,
            shadowRadius: 10,
            elevation: 8,
            opacity: 0.9,
          }}
        >
          <View {...panResponder.panHandlers} className={bottomSheet.handleWrap}>
            <View className={bottomSheet.handle} />
            <View className={styles.sheetHeaderRow}>
              <View className={styles.sheetHeaderLeft}>
                <MaterialCommunityIcons name="map-marker" size={20} color={colors.text} />
                <Text
                    className={styles.sheetTitle}
                    numberOfLines={1}
                >
                  {headerLabel} <MaterialCommunityIcons name={statusIcon as any} size={20} color={statusColor} />
                </Text>
              </View>
              <Pressable
                onPress={() => snapSheet(expandedRef.current ? MAX_TRANSLATE_Y : 0)}
                android_ripple={{ color: colors.ripple, borderless: true }}
                className={styles.chevronButton}
              >
                <MaterialCommunityIcons
                  name={sheetExpanded ? 'chevron-down' : 'chevron-up'}
                  size={22}
                  color={colors.textMuted}
                />
              </Pressable>
            </View>
          </View>

          <ScrollView
            style={{ flex: 1 }}
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
              <RTRAlertSummaryButton loading={false} hasAlerts={false} totalCount={0} isUnavailable onPress={handleRefresh} />
            )}

            {!loading && apiData && !hasWarnings && (
              <EmptyState message="No active warnings in this area" />
            )}

            {!loading && apiData && (
              <WeatherAlertsCard warnings={visibleWarnings} />
            )}

            <WeatherCard data={weatherData} loading={weatherLoading} error={weatherError} />

            <AirQualityCard data={aqiData} loading={aqiLoading} error={aqiError} />

            <View style={{ height: 24 }} />
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
