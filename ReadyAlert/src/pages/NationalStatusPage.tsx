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
import { getThemeColors } from '../styles/themeColors';
import { getTopAppBarStyles } from '../styles/appStyles';
import {
  ALL_ALERT_LEVELS,
  fetchRtrAlerts,
  getAlertLevelColor,
  getAlertLevelLabel,
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

interface LevelChipProps {
  level: RtrAlertLevel;
  active: boolean;
  onPress: () => void;
}

function LevelChip({ level, active, onPress }: LevelChipProps) {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const color = getAlertLevelColor(level, isDark);
  const shortLabel: Record<RtrAlertLevel, string> = {
    AlertLevel1: 'Emergency',
    AlertLevel2: 'Extreme',
    AlertLevel3: 'Severe',
    AlertLevel4: 'Info',
    Amber: 'Other',
  };

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: active ? colors.rippleOnPrimary : colors.ripple }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 8,
        borderWidth: 1.5,
        borderColor: active ? color : colors.border,
        backgroundColor: active ? color : 'transparent',
        overflow: 'hidden',
      }}
    >
      {active && (
        <MaterialCommunityIcons name="check" size={14} color="#fff" />
      )}
      <Text
        style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.5, color: active ? '#fff' : color }}
      >
        {shortLabel[level]}
      </Text>
    </Pressable>
  );
}

interface AlertCardProps {
  alert: RtrAlert;
  expanded: boolean;
  onPress: () => void;
  isDark: boolean;
  colors: ReturnType<typeof getThemeColors>;
}

function AlertCard({ alert, expanded, onPress, isDark, colors }: AlertCardProps) {
  const levelColor = getAlertLevelColor(alert.alert_level, isDark);
  const levelLabel = getAlertLevelLabel(alert.alert_level);

  const formatTime = (iso?: string) => {
    if (!iso) return null;
    try {
      return new Date(iso).toLocaleString('en-AT', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return iso; }
  };

  const startStr = formatTime(alert.begin_date);
  const endStr = formatTime(alert.end_date);
  const timeRange = startStr && endStr ? `${startStr} – ${endStr}` : startStr ?? endStr;
  const bodyText = alert.info_description?.trim() ?? '';

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: colors.ripple }}
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 8,
      }}
    >
      <View
        style={{
          borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? `${levelColor}44` : `${levelColor}77`,
          backgroundColor: isDark ? `${levelColor}12` : `${levelColor}0e`,
        }}
      >
      <View style={{ height: 3, backgroundColor: levelColor }} />
      <View style={{ padding: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
              backgroundColor: levelColor,
              alignSelf: 'flex-start',
              marginTop: 1,
            }}
          >
            <Text
              style={{ color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.4 }}
            >
              {levelLabel}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: 14, fontWeight: '500', lineHeight: 20, color: isDark ? '#EF9A9A' : '#B71C1C' }}
            >
              {alert.title ?? alert.info_area_description ?? '(No title)'}
            </Text>
            {alert.info_area_description && alert.title ? (
              <Text style={{ fontSize: 11, marginTop: 2, color: colors.textMuted }}>
                {alert.info_area_description}{alert.sender ? ` · ${alert.sender}` : ''}
              </Text>
            ) : alert.sender ? (
              <Text style={{ fontSize: 11, marginTop: 2, color: colors.textMuted }}>{alert.sender}</Text>
            ) : null}
            {timeRange ? (
              <Text style={{ fontSize: 11, marginTop: 2, color: colors.textMuted }}>{timeRange}</Text>
            ) : null}
          </View>

          <MaterialCommunityIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textMuted}
          />
        </View>

        {expanded && bodyText ? (
          <View
            style={{
              marginTop: 10,
              paddingTop: 10,
              borderTopWidth: 1,
              borderTopColor: isDark ? `${levelColor}33` : `${levelColor}44`,
            }}
          >
            <Text style={{ fontSize: 12, lineHeight: 18, color: colors.text }}>{bodyText}</Text>
          </View>
        ) : null}
      </View>
      </View>
    </Pressable>
  );
}

// Weather placeholder... until the real API is implemented.
function StateWeatherOverview({ isDark, colors }: { isDark: boolean; colors: ReturnType<typeof getThemeColors> }) {
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
            <Text style={{ fontSize: 14, color: isDark ? colors.text : '#374151' }}>{state}</Text>
            <View
              style={{
                width: 64,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.surfaceContainer,
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
  const colors = getThemeColors(isDark);
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
            const color = getAlertLevelColor(alert.alert_level, isDark);
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
            backgroundColor: isDark ? colors.surfaceContainer : colors.surface,
            transform: [{ translateY: sheetAnim }],
            shadowColor: '#000',
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
                backgroundColor: isDark ? '#555' : '#CAC4D0',
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
                    <MaterialCommunityIcons name="chevron-left" size={20} color={colors.primary} />
                    <Text style={{ fontSize: 14, fontWeight: '500', color: colors.primary }}>Overview</Text>
                  </Pressable>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <MaterialCommunityIcons
                      name={hasAlerts ? 'alert-circle' : 'check-circle'}
                      size={18}
                      color={hasAlerts ? colors.error : colors.success}
                    />
                    <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>
                      {loading ? 'Loading…' : hasAlerts ? `${totalCount} Alert${totalCount !== 1 ? 's' : ''}` : 'No Alerts'}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => snapSheet(sheetExpanded ? MAX_TRANSLATE_Y : 0)}
                    android_ripple={{ color: colors.ripple, borderless: true }}
                    style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 }}
                  >
                    <MaterialCommunityIcons
                      name={sheetExpanded ? 'chevron-down' : 'chevron-up'}
                      size={22}
                      color={colors.textMuted}
                    />
                  </Pressable>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 8 }}
                >
                  {ALL_ALERT_LEVELS.map((level) => (
                    <LevelChip
                      key={level}
                      level={level}
                      active={activeLevels.has(level)}
                      onPress={() => toggleLevel(level)}
                    />
                  ))}
                </ScrollView>
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
                  <AlertCard
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
