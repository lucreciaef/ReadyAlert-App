/**
 * National Status screen – RTR Austria Alerting System
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, Polygon, PROVIDER_DEFAULT } from 'react-native-maps';
import { DARK_MAP_STYLE, LIGHT_MAP_STYLE } from '../styles/mapStyles';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';
import {
  getBottomSheetStyles,
  getLayoutStyles,
  getNationalStatusPageStyles,
  getTopAppBarStyles,
} from '../styles/appStyles';
import {
  ALL_ALERT_LEVELS,
  fetchRtrAlerts,
  getAlertLevelColour,
  sortAlertsBySeverity,
  ServiceUnavailableError,
} from '../api';
import { RtrAlert, RtrAlertLevel } from '../api';
import { mockRtrResponseWithAlerts } from '../api/mockData';
import { useLocationContext } from '../context/LocationContext';
import { RTRAlertSummaryButton } from '../components/RTRAlertSummaryButton';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { useWeatherBatch } from '../hooks/useWeather';
import { setLastSeenAlertIds } from '../utils/rtrAlertStore';
import { RTRAlertCard } from '../components/RTRAlertCard';
import { RTRLevelChip } from '../components/RTRLevelChip';
import { StateWeatherOverview } from '../components/StateWeatherOverview';
import { AUSTRIAN_CAPITALS, AUSTRIAN_CAPITAL_COORDS } from '../utils/austrianCapitals';
import { getWeatherIcon } from '../utils/weatherIcon';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PEEK_HEIGHT = 88;
const HALF_HEIGHT = Math.round(SCREEN_HEIGHT * 0.5);
const MAX_TRANSLATE_Y = HALF_HEIGHT - PEEK_HEIGHT;

// Latitude is shifted south of Austria's true centre (47.7) so the country is visible above the fixed mid-height bottom sheet.
const AUSTRIA_REGION = {
  latitude: 43.45,
  longitude: 13.35,
  latitudeDelta: 5.0,
  longitudeDelta: 10.0,
};

export function NationalStatusPage() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);
  const layout = getLayoutStyles(isDark);
  const topBar = getTopAppBarStyles(isDark);
  const bottomSheet = getBottomSheetStyles(isDark);
  const styles = getNationalStatusPageStyles(isDark);
  const { debugMode } = useLocationContext();

  const {
    data: weatherData,
    loading: weatherLoading,
    error: weatherError,
  } = useWeatherBatch(AUSTRIAN_CAPITAL_COORDS);

  const [allAlerts, setAllAlerts] = useState<RtrAlert[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceUnavailable, setServiceUnavailable] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeLevels, setActiveLevels] = useState<Set<RtrAlertLevel>>(new Set(ALL_ALERT_LEVELS));

  const sheetAnim = useRef(new Animated.Value(0)).current;
  const [mapBottomPadding, setMapBottomPadding] = useState(HALF_HEIGHT);
  const expandedRef = useRef(true);
  const [sheetExpanded, setSheetExpanded] = useState(true);
  const debugModeRef = useRef(debugMode);
  useEffect(() => {
    debugModeRef.current = debugMode;
  }, [debugMode]);

  const snapSheet = (toValue: number) => {
    const isExpanded = toValue === 0;
    expandedRef.current = isExpanded;
    setSheetExpanded(isExpanded);
    setMapBottomPadding(isExpanded ? HALF_HEIGHT : PEEK_HEIGHT);
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

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setServiceUnavailable(false);
      let count: number;
      let data: RtrAlert[];
      const currentDebugMode = debugModeRef.current;
      if (currentDebugMode === '503') {
        await new Promise((resolve) => setTimeout(resolve, 600));
        throw new ServiceUnavailableError();
      }
      if (currentDebugMode === 'danger') {
        await new Promise((resolve) => setTimeout(resolve, 600));
        const mock = mockRtrResponseWithAlerts;
        count = mock.totalCount;
        data = mock.alerts;
      } else {
        const result = await fetchRtrAlerts({ alertLevels: ALL_ALERT_LEVELS });
        count = result.totalCount;
        data = result.alerts;
        // Mark these IDs as seen so the background task does not re-notify for alerts the user has already viewed in the foreground.
        await setLastSeenAlertIds(data.map((a) => a.consolidation_identifier));
      }
      setTotalCount(count);
      setAllAlerts(sortAlertsBySeverity(data));
    } catch (err) {
      if (err instanceof ServiceUnavailableError) {
        setServiceUnavailable(true);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load alerts');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load and re-load when debugMode changes
  useEffect(() => {
    loadAlerts();
  }, [loadAlerts, debugMode]);
  useEffect(() => {
    const interval = setInterval(() => {
      loadAlerts();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadAlerts]);
  const toggleLevel = (level: RtrAlertLevel) => {
    setActiveLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) {
        if (next.size === 1) return prev;
        next.delete(level);
      } else {
        next.add(level);
      }
      return next;
    });
  };

  const alerts = allAlerts.filter((a) => activeLevels.has(a.alert_level));
  const hasAlerts = alerts.length > 0;
  const [sheetView, setSheetView] = useState<'main' | 'alerts'>('main');

  return (
    <View className={layout.fill} style={{ paddingTop: insets.top }}>
      <View className={topBar.container} style={{ elevation: 0 }}>
        <Text className={topBar.title} numberOfLines={1}>
          National view
        </Text>
      </View>

      <View className={layout.fill}>
        <MapView
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          initialRegion={AUSTRIA_REGION}
          showsUserLocation={false}
          showsMyLocationButton={false}
          provider={PROVIDER_DEFAULT}
          customMapStyle={isDark ? DARK_MAP_STYLE : LIGHT_MAP_STYLE}
          mapPadding={{ top: 0, right: 0, bottom: mapBottomPadding, left: 0 }}
        >
          {alerts.flatMap((alert) => {
            const color = getAlertLevelColour(alert.alert_level, isDark);
            return (alert.polygons ?? []).map((ring, polyIdx) => (
              <Polygon
                key={`${alert.consolidation_identifier}-${polyIdx}`}
                coordinates={ring.map(([lat, lon]) => ({ latitude: lat, longitude: lon }))}
                fillColor={`${color}40`}
                strokeColor={color}
                strokeWidth={2}
                zIndex={1}
              />
            ));
          })}

          {weatherData &&
            AUSTRIAN_CAPITALS.map((city, idx) => {
              const cityData = weatherData[idx];
              if (!cityData) return null;
              const iconInfo = getWeatherIcon(cityData.daily.weatherCode, cityData.current.isDay);
              return (
                <Marker
                  key={`weather-${city.state}`}
                  coordinate={city.coords}
                  anchor={{ x: 0.5, y: 0.5 }}
                  tracksViewChanges={false}
                  title={city.capital}
                  description={iconInfo.label}
                  zIndex={1000}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: colors.surfaceAlt,
                      elevation: 2,
                      shadowColor: colors.shadow,
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 2,
                    }}
                  >
                    <MaterialCommunityIcons name={iconInfo.icon} size={20} color={colors.text} />
                  </View>
                </Marker>
              );
            })}
        </MapView>

        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: HALF_HEIGHT,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            backgroundColor: colors.surfaceAlt,
            transform: [{ translateY: sheetAnim }],
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.12,
            shadowRadius: 10,
            elevation: 8,
          }}
        >
          <View {...panResponder.panHandlers}>
            <View className={bottomSheet.handle} />

            <View style={{ paddingHorizontal: 20, paddingBottom: 4 }}>
              {sheetView === 'main' ? (
                <View className={styles.mainHeaderRow}>
                  <Text className={styles.mainHeaderTitle}>National RTR alert status</Text>
                </View>
              ) : (
                <>
                  <View className={styles.alertsHeaderRow}>
                    <Pressable
                      onPress={() => setSheetView('main')}
                      android_ripple={{ color: colors.ripple, borderless: true }}
                      className={styles.backButton}
                    >
                      <MaterialCommunityIcons name="chevron-left" size={20} color={colors.text} />
                      <Text className={styles.backButtonText}>Overview</Text>
                    </Pressable>

                    <View className={styles.alertsCountRow}>
                      <MaterialCommunityIcons
                        name={hasAlerts ? 'alert-circle' : 'check-circle'}
                        size={18}
                        color={hasAlerts ? colors.error : colors.success}
                      />
                      <Text className={styles.alertsCountText}>
                        {loading
                          ? 'Loading…'
                          : hasAlerts
                            ? `${totalCount} Alert${totalCount !== 1 ? 's' : ''}`
                            : 'No Alerts'}
                      </Text>
                    </View>
                  </View>

                  {allAlerts.length > 0 && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ paddingBottom: 8 }}
                    >
                      {ALL_ALERT_LEVELS.map((level) => (
                        <RTRLevelChip
                          key={level}
                          level={level}
                          active={activeLevels.has(level)}
                          onPress={() => toggleLevel(level)}
                        />
                      ))}
                    </ScrollView>
                  )}
                </>
              )}
            </View>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
            scrollEnabled={sheetExpanded}
            keyboardShouldPersistTaps="handled"
          >
            {sheetView === 'main' ? (
              <>
                <RTRAlertSummaryButton
                  loading={loading}
                  hasAlerts={hasAlerts}
                  totalCount={totalCount}
                  isUnavailable={serviceUnavailable}
                  onPress={
                    serviceUnavailable
                      ? loadAlerts
                      : () => {
                          setSheetView('alerts');
                          snapSheet(0);
                        }
                  }
                />
                <StateWeatherOverview
                  data={weatherData}
                  loading={weatherLoading}
                  error={weatherError}
                />
              </>
            ) : (
              <>
                {loading && <LoadingState message="Loading alerts…" />}
                {error && !loading && <ErrorBanner message={error} onRetry={loadAlerts} />}
                {!loading && !error && !serviceUnavailable && !hasAlerts && (
                  <EmptyState message="No active alerts in Austria" />
                )}
                {!loading &&
                  !error &&
                  !serviceUnavailable &&
                  hasAlerts &&
                  alerts.map((alert) => (
                    <RTRAlertCard
                      key={alert.consolidation_identifier}
                      alert={alert}
                      expanded={expandedId === alert.consolidation_identifier}
                      onPress={() =>
                        setExpandedId(
                          expandedId === alert.consolidation_identifier
                            ? null
                            : alert.consolidation_identifier,
                        )
                      }
                      isDark={isDark}
                      colors={colors}
                    />
                  ))}
              </>
            )}
            <View style={{ height: 16 }} />
          </ScrollView>
        </Animated.View>
      </View>
    </View>
  );
}
