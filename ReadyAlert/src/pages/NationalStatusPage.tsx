/**
 * National Status screen – RTR Austria Alerting System
 * Full-screen Austria map with alert polygons and a draggable bottom sheet.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Polygon, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColors } from '../styles/themeColors';
import {
  ALL_ALERT_LEVELS,
  fetchRtrAlerts,
  getAlertLevelColor,
  getAlertLevelLabel,
  sortAlertsBySeverity,
} from '../api';
import { RtrAlert, RtrAlertLevel } from '../api';
import { mockRtrResponseNoAlerts, mockRtrResponseWithAlerts } from '../api/mockData';

// FOR TEST ONLY -
// Set to true to bypass the real API and use local fixture data instead.
const USE_MOCK_DATA = false;
// When USE_MOCK_DATA is true: true = 3-alert storm fixture, false = empty fixture.
const USE_MOCK_WITH_ALERTS = true;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PEEK_HEIGHT = 88;
const HALF_HEIGHT = Math.round(SCREEN_HEIGHT * 0.5);
const MAX_TRANSLATE_Y = HALF_HEIGHT - PEEK_HEIGHT;

// Initial map region for the Austria-wide view.
// latitudeDelta / longitudeDelta are the north–south and east–west span of the rendered region in degrees — larger values = more zoomed out.
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
  const color = getAlertLevelColor(level);
  const shortLabel: Record<RtrAlertLevel, string> = {
    AlertLevel1: 'Emergency',
    AlertLevel2: 'Extreme',
    AlertLevel3: 'Severe',
    AlertLevel4: 'Info',
    Amber: 'Other',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        paddingHorizontal: 11,
        paddingVertical: 4,
        borderRadius: 999,
        marginRight: 6,
        borderWidth: 1.5,
        borderColor: color,
        backgroundColor: active ? color : 'transparent',
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: '600', color: active ? '#fff' : color }}>
        {shortLabel[level]}
      </Text>
    </TouchableOpacity>
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
  const levelColor = getAlertLevelColor(alert.alert_level);
  const levelLabel = getAlertLevelLabel(alert.alert_level);

  const formatTime = (iso?: string) => {
    if (!iso) return null;
    try {
      return new Date(iso).toLocaleString('en-AT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const startStr = formatTime(alert.begin_date);
  const endStr = formatTime(alert.end_date);
  const timeRange = startStr && endStr ? `${startStr} – ${endStr}` : startStr ?? endStr;

  // Plain-text body: prefer info_description (authority plain text) over HTML description
  const bodyText = alert.info_description?.trim() ?? '';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`rounded-xl border mt-2 overflow-hidden ${
        isDark ? 'border-red-500/30' : 'border-amber-200'
      }`}
      style={{
        borderColor: isDark ? `${levelColor}44` : `${levelColor}77`,
        backgroundColor: isDark ? `${levelColor}14` : `${levelColor}0e`,
      }}
    >
      <View style={{ height: 3, backgroundColor: levelColor }} />
      <View style={{ padding: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <View
            style={{
              paddingHorizontal: 7,
              paddingVertical: 2,
              borderRadius: 5,
              backgroundColor: levelColor,
              alignSelf: 'flex-start',
              marginTop: 1,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{levelLabel}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text
              className={`text-[13px] font-bold leading-[18px] ${isDark ? 'text-red-300' : 'text-red-700'}`}
            >
              {alert.title ?? alert.info_area_description ?? '(No title)'}
            </Text>
            {alert.info_area_description && alert.title ? (
              <Text className={`text-[11px] mt-0.5 ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`}>
                {alert.info_area_description}
                {alert.sender ? ` · ${alert.sender}` : ''}
              </Text>
            ) : alert.sender ? (
              <Text className={`text-[11px] mt-0.5 ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`}>
                {alert.sender}
              </Text>
            ) : null}
            {timeRange ? (
              <Text className={`text-[11px] mt-0.5 ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`}>
                {timeRange}
              </Text>
            ) : null}
          </View>

          <Ionicons
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
            <Text className={`text-[11px] leading-[17px] ${isDark ? 'text-text-dark' : 'text-text'}`}>
              {bodyText}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

// ─── Weather placeholder ──────────────────────────────────────────────────────

interface StateWeatherOverviewProps {
  isDark: boolean;
  colors: ReturnType<typeof getThemeColors>;
}

function StateWeatherOverview({ isDark, colors }: StateWeatherOverviewProps) {
  const states = [
    'Vienna', 'Lower Austria', 'Upper Austria', 'Styria',
    'Tyrol', 'Carinthia', 'Salzburg', 'Vorarlberg', 'Burgenland',
  ];

  return (
    <View style={{ marginTop: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Ionicons name="partly-sunny-outline" size={16} color={colors.primary} />
        <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#f5f5f5' : '#111' }}>
          Weather by State
        </Text>
        <View
          style={{
            marginLeft: 4,
            paddingHorizontal: 7,
            paddingVertical: 2,
            borderRadius: 6,
            backgroundColor: isDark ? '#3a3a3a' : '#e5e7eb',
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: '600', color: colors.textMuted }}>
            Coming soon
          </Text>
        </View>
      </View>

      {states.map((state) => (
        <View
          key={state}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 9,
            paddingHorizontal: 12,
            borderRadius: 10,
            marginBottom: 6,
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
          }}
        >
          <Text style={{ fontSize: 13, color: isDark ? '#d1d5db' : '#374151' }}>{state}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View
              style={{
                width: 60,
                height: 8,
                borderRadius: 4,
                backgroundColor: isDark ? '#3a3a3a' : '#e5e7eb',
              }}
            />
            <Ionicons name="ellipse-outline" size={14} color={colors.textMuted} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function NationalStatusPage() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  // Data state
  const [allAlerts, setAllAlerts] = useState<RtrAlert[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeLevels, setActiveLevels] = useState<Set<RtrAlertLevel>>(new Set(ALL_ALERT_LEVELS));

  // Controlled map region – initialised to AUSTRIA_REGION on every mount so returning to this tab always shows the full-country view.
  // Updated via onRegionChangeComplete to preserve user panning within a session.
  const [mapRegion, setMapRegion] = useState(AUSTRIA_REGION);

  // Bottom sheet animation
  const sheetAnim = useRef(new Animated.Value(MAX_TRANSLATE_Y)).current;
  const expandedRef = useRef(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  const snapSheet = (toValue: number) => {
    const isExpanded = toValue === 0;
    expandedRef.current = isExpanded;
    setSheetExpanded(isExpanded);
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

      let count: number;
      let data: RtrAlert[];

      if (USE_MOCK_DATA) {
        // Simulate a small network delay so loading state is visible
        await new Promise((resolve) => setTimeout(resolve, 600));
        const mock = USE_MOCK_WITH_ALERTS ? mockRtrResponseWithAlerts : mockRtrResponseNoAlerts;
        count = mock.totalCount;
        data = mock.alerts;
        console.log('[RTR] Using mock data –', count, 'alert(s)');
      } else {
        // Always request all levels, but chip toggles filter the already-fetched list locally
        const result = await fetchRtrAlerts({ alertLevels: ALL_ALERT_LEVELS });
        count = result.totalCount;
        data = result.alerts;
      }
      setTotalCount(count);
      setAllAlerts(sortAlertsBySeverity(data));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load alerts';
      console.error('[RTR] ', msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);

  // Auto-expand sheet once first load completes
  useEffect(() => { if (!loading) snapSheet(0); }, [loading]);

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

  const openAlertsView = () => {
    setSheetView('alerts');
    snapSheet(0);
  };

  const closeAlertsView = () => {
    setSheetView('main');
  };

  return (
    <View className="flex-1" style={{ paddingTop: insets.top }}>
      <View
        className={`flex-row items-center justify-between px-4 h-14 border-b shadow-sm ${
          isDark ? 'bg-surface-dark border-[#333]' : 'bg-surface border-gray-200'
        }`}
      >
        <View className="flex-row items-center flex-1 gap-2">
          <Ionicons name="earth" size={18} color={colors.primary} />
          <Text
            className={`text-[15px] font-semibold flex-1 ${isDark ? 'text-text-dark' : 'text-text'}`}
            numberOfLines={1}
          >
            Austria – National Alerts
          </Text>
        </View>
        <TouchableOpacity
          onPress={loadAlerts}
          disabled={loading}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="refresh"
            size={20}
            color={loading ? colors.textMuted : colors.primary}
          />
        </TouchableOpacity>
      </View>
      <View className="flex-1">
        <MapView
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
          provider={PROVIDER_DEFAULT}
          mapPadding={{ top: 0, right: 0, bottom: HALF_HEIGHT, left: 0 }}
        >
          {alerts.flatMap((alert) => {
            const color = getAlertLevelColor(alert.alert_level);
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

            {sheetView === 'main' ? (
              <View className="flex-row items-center justify-between mb-3">
                <Text className={`text-base font-bold ${isDark ? 'text-text-dark' : 'text-text'}`}>
                  National Status
                </Text>
                <TouchableOpacity onPress={() => snapSheet(sheetExpanded ? MAX_TRANSLATE_Y : 0)}>
                  <Ionicons
                    name={sheetExpanded ? 'chevron-down' : 'chevron-up'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex-row items-center justify-between mb-2">
                <TouchableOpacity
                  onPress={closeAlertsView}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                >
                  <Ionicons name="chevron-back" size={18} color={colors.primary} />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>
                    Overview
                  </Text>
                </TouchableOpacity>

                <View className="flex-row items-center gap-2">
                  <Ionicons
                    name={hasAlerts ? 'alert-circle' : 'checkmark-circle'}
                    size={18}
                    color={hasAlerts ? '#EF4444' : '#22C55E'}
                  />
                  <Text className={`text-sm font-bold ${isDark ? 'text-text-dark' : 'text-text'}`}>
                    {loading
                      ? 'Loading…'
                      : hasAlerts
                        ? `${totalCount} Alert${totalCount !== 1 ? 's' : ''}`
                        : 'No Alerts'}
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
            )}

            {sheetView === 'alerts' && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 6 }}
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
            )}
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
            scrollEnabled={sheetExpanded}
            keyboardShouldPersistTaps="handled"
          >
            {sheetView === 'main' ? (
              <>
                <TouchableOpacity
                  onPress={openAlertsView}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 13,
                    paddingHorizontal: 14,
                    borderRadius: 12,
                    marginBottom: 14,
                    backgroundColor: isDark
                      ? hasAlerts ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)'
                      : hasAlerts ? '#FEF2F2' : '#F3F4F6',
                    borderWidth: 1,
                    borderColor: isDark
                      ? hasAlerts ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)'
                      : hasAlerts ? '#FECACA' : '#E5E7EB',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Ionicons
                      name={loading ? 'hourglass-outline' : hasAlerts ? 'alert-circle' : 'checkmark-circle'}
                      size={22}
                      color={hasAlerts ? '#EF4444' : '#22C55E'}
                    />
                    <View>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: isDark ? '#f5f5f5' : '#111' }}>
                        All Alerts
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>
                        {loading
                          ? 'Loading…'
                          : hasAlerts
                            ? `${totalCount} active alert${totalCount !== 1 ? 's' : ''} across Austria`
                            : 'No active alerts'}
                      </Text>
                    </View>
                  </View>
                  {!loading && totalCount > 0 && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        backgroundColor: '#EF4444',
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 12,
                      }}
                    >
                      <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{totalCount}</Text>
                      <Ionicons name="chevron-forward" size={12} color="#fff" />
                    </View>
                  )}
                  {!loading && totalCount === 0 && (
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  )}
                </TouchableOpacity>

                <StateWeatherOverview isDark={isDark} colors={colors} />
              </>
            ) : (
              <>
                {loading && (
                  <View className="items-center py-6">
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text className={`mt-3 text-sm ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`}>
                      Loading alerts…
                    </Text>
                  </View>
                )}

                {error && !loading && (
                  <View>
                    <View
                      className={`flex-row items-start gap-2 p-3 rounded-[10px] mt-1 ${
                        isDark ? 'bg-red-600/[0.12]' : 'bg-red-100'
                      }`}
                    >
                      <Ionicons name="warning-outline" size={16} color={isDark ? '#FCA5A5' : '#B91C1C'} />
                      <Text className={`text-[13px] flex-1 leading-[18px] ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                        {error}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={loadAlerts}
                      className="self-center mt-3 px-5 py-2 rounded-[10px]"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>Try again</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {!loading && !error && !hasAlerts && (
                  <View
                    className={`items-center p-6 rounded-[14px] mt-1 gap-2.5 ${
                      isDark ? 'bg-green-500/[0.12]' : 'bg-green-100'
                    }`}
                  >
                    <Ionicons name="checkmark-circle" size={28} color={isDark ? '#86EFAC' : '#16A34A'} />
                    <Text className={`text-sm font-medium text-center ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                      No active alerts in Austria
                    </Text>
                  </View>
                )}

                {!loading && !error && hasAlerts &&
                  alerts.map((alert) => (
                    <AlertCard
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

            <View className="h-4" />
          </ScrollView>
        </Animated.View>
      </View>
    </View>
  );
}
