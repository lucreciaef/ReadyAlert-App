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
import MapView, { Circle, Polygon, PROVIDER_DEFAULT } from 'react-native-maps';
import { DARK_MAP_STYLE, LIGHT_MAP_STYLE } from '../styles/mapStyles';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';
import {
  getBottomSheetStyles,
  getHomeDashboardPageStyles,
  getLayoutStyles,
  getTopAppBarStyles,
} from '../styles/appStyles';
import { getLocationName } from '../api';
import { useLocationContext } from '../context/LocationContext';
import { usePreparedness } from '../context/PreparednessContext';
import { useGeosphereWarnings } from '../hooks/useGeosphereWarnings';
import { useAirQuality } from '../hooks/useAirQuality';
import { useWeather } from '../hooks/useWeather';
import { Toast } from '../components/Toast';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingState } from '../components/LoadingState';
import { APIWeatherAlertsCard } from '../components/APIWeatherAlertsCard';
import { APIWeatherCard } from '../components/APIWeatherCard';
import { RTRAlertSummaryButton } from '../components/RTRAlertSummaryButton';
import { APIAirQualityCard } from '../components/APIAirQualityCard';
import { useRadiationLevel } from '../hooks/useRadiationLevel';
import { APIRadiationLevelCard } from '../components/APIRadiationLevelCard';
import { classifyRadiation } from '../api';
import { PreparednessScoreCard } from '../components/PreparednessScoreCard';

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
  const {
    data: warningsData,
    visibleWarnings,
    loading: warningsLoading,
    error: warningsError,
    serviceUnavailable,
    outsideAustria,
    outsideAustriaMessage,
    refresh,
  } = useGeosphereWarnings(userLocation);
  const { data: aqiData, loading: aqiLoading, error: aqiError } = useAirQuality(userLocation);
  const {
    data: weatherData,
    loading: weatherLoading,
    error: weatherError,
  } = useWeather(userLocation);
  const radiationState = useRadiationLevel(userLocation);

  const REGION_DELTA = 0.2;

  const [locationDisplayName, setLocationDisplayName] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' } | null>(null);
  const [radiationExpanded, setRadiationExpanded] = useState(false);

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
        const parts = [place.city ?? place.district ?? place.subregion, place.country].filter(
          Boolean,
        );
        if (parts.length) setLocationDisplayName(parts.join(', '));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
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
        sheetAnim.setValue(Math.max(0, Math.min(MAX_TRANSLATE_Y, base + gs.dy)));
      },
      onPanResponderRelease: (_, gs) => {
        const base = expandedRef.current ? 0 : MAX_TRANSLATE_Y;
        const finalVal = Math.max(0, Math.min(MAX_TRANSLATE_Y, base + gs.dy));
        snapSheet(finalVal < MAX_TRANSLATE_Y / 2 || gs.vy < -0.5 ? 0 : MAX_TRANSLATE_Y);
      },
    }),
  ).current;

  // Open the sheet once warnings finish (success, general error, or 503)
  useEffect(() => {
    if (
      !warningsLoading &&
      !outsideAustria &&
      (warningsData || warningsError || serviceUnavailable)
    ) {
      snapSheet(0);
    }
  }, [warningsLoading, warningsData, warningsError, serviceUnavailable, outsideAustria]);

  // Peek sheet and show toast when user is outside Austria
  useEffect(() => {
    if (outsideAustria && outsideAustriaMessage) {
      snapSheet(MAX_TRANSLATE_Y);
      setToast({ message: outsideAustriaMessage, type: 'warning' });
    }
  }, [outsideAustria, outsideAustriaMessage]);

  // Fit map to warning polygon or zoom to user location when data changes
  useEffect(() => {
    if (!userLocation) return;
    if (!warningsData) return;
    const coords = warningsData.geometry?.coordinates;
    if (coords?.length) {
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
    setTimeout(() => {
      mapRef.current?.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: REGION_DELTA,
          longitudeDelta: REGION_DELTA,
        },
        400,
      );
    }, 300);
  }, [warningsData]);

  const handleRefresh = () => {
    if (userLocation) refresh();
    else requestPermission();
  };

  const locationName = getLocationName(warningsData);
  const warningCount = visibleWarnings.length;
  const hasWarnings = warningCount > 0;

  const initialMapRegion = {
    latitude: 47.7,
    longitude: 13.35,
    latitudeDelta: 5.0,
    longitudeDelta: 10.0,
  };

  const headerLabel = locationLoading
    ? 'Locating…'
    : debugMode === 'london'
      ? 'London, UK (debug)'
      : debugMode === 'graz'
        ? 'Graz, Austria (debug)'
        : debugMode === '503'
          ? `${locationDisplayName ?? locationName ?? 'Current location'} (503 debug)`
          : (locationDisplayName ?? locationName ?? 'Unknown location');

  const statusIcon =
    warningsLoading || locationLoading
      ? 'timer-sand'
      : serviceUnavailable || !!warningsError || (!!locationError && !userLocation)
        ? 'alert'
        : 'check-circle';

  const statusColor =
    warningsLoading || locationLoading
      ? colors.textMuted
      : serviceUnavailable || !!warningsError || (!!locationError && !userLocation)
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
              <Text className={styles.addButtonText}>+</Text>
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
          {(warningsData?.geometry?.coordinates ?? []).flatMap((polygon, polyIdx) =>
            polygon.map((ring, ringIdx) => (
              <Polygon
                key={`geosphere-${polyIdx}-${ringIdx}`}
                coordinates={ring.map(([lon, lat]) => ({ latitude: lat, longitude: lon }))}
                fillColor={`${colors.warning}40`}
                strokeColor={`${colors.warning}CC`}
                strokeWidth={2}
              />
            )),
          )}

          {radiationExpanded &&
            radiationState.nearbyStations.map((station) => {
              const level = classifyRadiation(station.messwert);
              const circleColor =
                level === 'normal'
                  ? colors.success
                  : level === 'elevated'
                    ? colors.warning
                    : colors.error;
              return (
                <Circle
                  key={`rad-${station.nummer}`}
                  center={{ latitude: station.latitude, longitude: station.longitude }}
                  radius={4000}
                  fillColor={`${circleColor}66`}
                  strokeColor={circleColor}
                  strokeWidth={1.5}
                />
              );
            })}
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
                <Text className={styles.sheetTitle} numberOfLines={1}>
                  {headerLabel}{' '}
                  <MaterialCommunityIcons name={statusIcon as any} size={20} color={statusColor} />
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
            {locationLoading && <LoadingState message="Getting your location…" />}

            {(warningsError || (locationError && !userLocation)) && !warningsLoading && (
              <ErrorBanner message={warningsError || locationError || ''} />
            )}

            {serviceUnavailable && !warningsLoading && (
              <RTRAlertSummaryButton
                loading={false}
                hasAlerts={false}
                totalCount={0}
                isUnavailable
                onPress={handleRefresh}
              />
            )}

            {!locationLoading &&
              !warningsError &&
              !serviceUnavailable &&
              !(locationError && !userLocation) && (
                <APIWeatherAlertsCard warnings={visibleWarnings} />
              )}

            <APIWeatherCard data={weatherData} loading={weatherLoading} error={weatherError} />

            <APIAirQualityCard data={aqiData} loading={aqiLoading} error={aqiError} />

            <APIRadiationLevelCard
              {...radiationState}
              expanded={radiationExpanded}
              onToggle={() => setRadiationExpanded((v) => !v)}
            />

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
