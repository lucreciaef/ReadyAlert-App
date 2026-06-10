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
import MapView, { Polygon, PROVIDER_DEFAULT } from 'react-native-maps';
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
} from '../api';
import { RtrAlert, RtrAlertLevel } from '../api';
import { mockRtrResponseNoAlerts, mockRtrResponseWithAlerts } from '../api/mockData';
import { APIResultButton } from '../components/APIResultButton';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';

const USE_MOCK_DATA = false;
const USE_MOCK_WITH_ALERTS = true;

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
  const color = getAlertLevelColor(level);
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
  const levelColor = getAlertLevelColor(alert.alert_level);
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
    <View style={{ marginTop: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <MaterialCommunityIcons name="weather-partly-cloudy" size={18} color={colors.primary} />
        <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>
          Weather in Austria
        </Text>
      </View>

      {states.map((state) => (
        <View
          key={state}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 8,
            marginBottom: 6,
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(21,101,192,0.04)',
          }}
        >
          <Text style={{ fontSize: 14, color: isDark ? colors.text : '#374151' }}>{state}</Text>
          <View
            style={{
              width: 64,
              height: 8,
              borderRadius: 4,
              backgroundColor: isDark ? '#3a3a3a' : '#E3E8F8',
            }}
          />
        </View>
      ))}
    </View>
  );
}

interface NationalStatusPageProps {
  onSettingsPress?: () => void;
}

export function NationalStatusPage({ onSettingsPress }: NationalStatusPageProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const topBar = getTopAppBarStyles(isDark);

  const [allAlerts, setAllAlerts] = useState<RtrAlert[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeLevels, setActiveLevels] = useState<Set<RtrAlertLevel>>(new Set(ALL_ALERT_LEVELS));
  const [mapRegion, setMapRegion] = useState(AUSTRIA_REGION);

  const sheetAnim = useRef(new Animated.Value(MAX_TRANSLATE_Y)).current;
  const expandedRef = useRef(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  const snapSheet = (toValue: number) => {
    const isExpanded = toValue === 0;
    expandedRef.current = isExpanded;
    setSheetExpanded(isExpanded);
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
      let count: number;
      let data: RtrAlert[];
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        const mock = USE_MOCK_WITH_ALERTS ? mockRtrResponseWithAlerts : mockRtrResponseNoAlerts;
        count = mock.totalCount;
        data = mock.alerts;
      } else {
        const result = await fetchRtrAlerts({ alertLevels: ALL_ALERT_LEVELS });
        count = result.totalCount;
        data = result.alerts;
      }
      setTotalCount(count);
      setAllAlerts(sortAlertsBySeverity(data));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load alerts';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);
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
      <View className={topBar.container} style={{ elevation: 0 }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 8 }}>
          <MaterialCommunityIcons name="earth" size={20} color={colors.primary} />
          <Text style={{ flex: 1, fontSize: 18, fontWeight: '500', color: colors.text }} numberOfLines={1}>
            Austria – National Alerts
          </Text>
        </View>
        <Pressable
          onPress={loadAlerts}
          disabled={loading}
          android_ripple={{ color: colors.ripple, borderless: true }}
          style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24 }}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={24}
            color={loading ? colors.textMuted : colors.primary}
          />
        </Pressable>
      </View>

      <View style={{ flex: 1 }}>
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
                      color={hasAlerts ? '#EF5350' : '#4CAF50'}
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
                <APIResultButton
                  loading={loading}
                  hasAlerts={hasAlerts}
                  totalCount={totalCount}
                  onPress={() => { setSheetView('alerts'); snapSheet(0); }}
                />
                <StateWeatherOverview isDark={isDark} colors={colors} />
              </>
            ) : (
              <>
                {loading && <LoadingState message="Loading alerts…" />}
                {error && !loading && <ErrorBanner message={error} onRetry={loadAlerts} />}
                {!loading && !error && !hasAlerts && <EmptyState message="No active alerts in Austria" />}
                {!loading && !error && hasAlerts && alerts.map((alert) => (
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
