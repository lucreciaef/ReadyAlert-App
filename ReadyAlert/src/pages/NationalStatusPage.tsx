/**
 * National Status screen – RTR Austria Alerting System
 */

import { useCallback, useEffect, useRef, useState } from 'react';
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';
import { getTopAppBarStyles } from '../styles/appStyles';
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
import { useNotifications } from '../hooks/useNotifications';
import { RTRAlertCard } from '../components/RTRAlertCard';
import { RTRLevelChip } from '../components/RTRLevelChip';

let _prevRtrAlertCount = 0;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PEEK_HEIGHT = 88;
const HALF_HEIGHT = Math.round(SCREEN_HEIGHT * 0.5);
const MAX_TRANSLATE_Y = HALF_HEIGHT - PEEK_HEIGHT;

const AUSTRIA_REGION = {
  latitude: 47.7,
  longitude: 13.35,
  latitudeDelta: 5.0,
  longitudeDelta: 10.0,
};

// Weather placeholder... until the real API is implemented.
function StateWeatherOverview({ isDark, colors }: { isDark: boolean; colors: ReturnType<typeof getThemeColours> }) {
  const states = [
    'Vienna', 'Lower Austria', 'Upper Austria', 'Styria',
    'Tyrol', 'Carinthia', 'Salzburg', 'Vorarlberg', 'Burgenland',
  ];

  return (
    <View style={{ marginTop: 4 }} >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        
        <MaterialCommunityIcons name="weather-partly-cloudy" size={18} color={colors.primary} />
        <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>
          Weather in Austria
        </Text>
      </View>
        
      {states.map((state) => (
        <Pressable
          key={state}
          onPress={() => Alert.alert('Feature coming up soon')}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 8,
              marginBottom: 6,
              backgroundColor: colors.surface,
            }}
          >
            <Text style={{ fontSize: 14, color: colors.text }}>{state}</Text>
            <View
              style={{
                width: 64,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.surfaceAlt,
              }}
            />
          </View>
        </Pressable>
      ))}
    </View>
  );
}

export function NationalStatusPage() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);
  const topBar = getTopAppBarStyles(isDark);
  const { debugMode } = useLocationContext();

  const [allAlerts, setAllAlerts] = useState<RtrAlert[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceUnavailable, setServiceUnavailable] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeLevels, setActiveLevels] = useState<Set<RtrAlertLevel>>(new Set(ALL_ALERT_LEVELS));

  const sheetAnim = useRef(new Animated.Value(MAX_TRANSLATE_Y)).current;
  const [mapBottomPadding, setMapBottomPadding] = useState(PEEK_HEIGHT);
  const expandedRef = useRef(false);
  const { notifyRtrAlerts } = useNotifications();
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const debugModeRef = useRef(debugMode);
  useEffect(() => { debugModeRef.current = debugMode; }, [debugMode]);

  const snapSheet = (toValue: number) => {
    const isExpanded = toValue === 0;
    expandedRef.current = isExpanded;
    setSheetExpanded(isExpanded);
    setMapBottomPadding(isExpanded ? HALF_HEIGHT : PEEK_HEIGHT);
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
      }
      setTotalCount(count);
      setAllAlerts(sortAlertsBySeverity(data));
      if (count > 0 && count !== _prevRtrAlertCount) {
        const sorted = sortAlertsBySeverity(data);
        const highestLevel = sorted[0]?.alert_level ?? 'AlertLevel4';
        notifyRtrAlerts(count, highestLevel);
      }
      _prevRtrAlertCount = count;
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

  // Initial load and re-load when debugMode changes (but not on every remount)
  useEffect(() => { loadAlerts(); }, [loadAlerts, debugMode]);
  useEffect(() => {
    const interval = setInterval(() => { loadAlerts(); }, 30000);
    return () => clearInterval(interval);
  }, [loadAlerts]);
  useEffect(() => { if (!loading) snapSheet(0); }, [loading]);

  const toggleLevel = (level: RtrAlertLevel) => {
    setActiveLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) { if (next.size === 1) return prev; next.delete(level); }
      else { next.add(level); }
      return next;
    });
  };

  const alerts = allAlerts.filter((a) => activeLevels.has(a.alert_level));
  const hasAlerts = alerts.length > 0;
  const [sheetView, setSheetView] = useState<'main' | 'alerts'>('main');

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <View className={topBar.container} style={{ elevation: 0, paddingVertical:8 }}>
        <View style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            gap: 12 }}
        >
          <MaterialCommunityIcons name="map-outline" size={24} color={colors.primary} />
          <Text className={topBar.title} numberOfLines={1}>
            National view
          </Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
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
              />
            ));
          })}
        </MapView>

        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
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
          <View {...panResponder.panHandlers} style={{ paddingHorizontal: 16, paddingBottom: 4 }}>
            <View
              style={{
                width: 32,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.divider,
                alignSelf: 'center',
                marginTop: 12,
                marginBottom: 12,
              }}
            />

            {sheetView === 'main' ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>
                  National Status
                </Text>
              </View>
            ) : (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Pressable
                    onPress={() => setSheetView('main')}
                    android_ripple={{ color: colors.ripple, borderless: true }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4 }}
                  >
                    <MaterialCommunityIcons name="chevron-left" size={20} color={colors.text} />
                    <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>Overview</Text>
                  </Pressable>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <MaterialCommunityIcons
                      name={hasAlerts ? 'alert-circle' : 'check-circle'}
                      size={18}
                      color={hasAlerts ? colors.error : colors.success}
                    />
                    <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text, paddingRight: 16 }}>
                      {loading ? 'Loading…' : hasAlerts ? `${totalCount} Alert${totalCount !== 1 ? 's' : ''}` : 'No Alerts'}
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

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
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
                  onPress={serviceUnavailable ? loadAlerts : () => { setSheetView('alerts'); snapSheet(0); }}
                />
                <StateWeatherOverview isDark={isDark} colors={colors} />
              </>
            ) : (
              <>
                {loading && <LoadingState message="Loading alerts…" />}
                {error && !loading && <ErrorBanner message={error} onRetry={loadAlerts} />}
                {!loading && !error && !serviceUnavailable && !hasAlerts && <EmptyState message="No active alerts in Austria" />}
                {!loading && !error && !serviceUnavailable && hasAlerts && alerts.map((alert) => (
                  <RTRAlertCard
                    key={alert.consolidation_identifier}
                    alert={alert}
                    expanded={expandedId === alert.consolidation_identifier}
                    onPress={() => setExpandedId(
                      expandedId === alert.consolidation_identifier ? null : alert.consolidation_identifier,
                    )}
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
