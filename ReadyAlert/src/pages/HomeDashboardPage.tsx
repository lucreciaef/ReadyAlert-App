import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColors } from '../styles/themeColors';
import { fetchWarningsForLocation, getLocationName, getWarningCount, OutsideAustriaError } from '../api';
import { GeosphereResponse, Warning } from '../api';
import { useLocationContext } from '../context/LocationContext';
import { Toast } from '../components/Toast';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PEEK_HEIGHT = 88;
const HALF_HEIGHT = Math.round(SCREEN_HEIGHT * 0.5);
const MAX_TRANSLATE_Y = HALF_HEIGHT - PEEK_HEIGHT;

export function HomeDashboardPage() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  const { coords: userLocation, loading: locationLoading, error: locationError, requestPermission, isDebugMode } = useLocationContext();

  const [apiData, setApiData] = useState<GeosphereResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedWarning, setExpandedWarning] = useState<number | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' } | null>(null);

  // ── Bottom sheet animation ──────────────────────────────────────────────────
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
    })
  ).current;

  // ── Data fetching ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (userLocation && !locationLoading) {
      loadWarnings(userLocation.longitude, userLocation.latitude);
    }
  }, [userLocation, locationLoading]);

  // Auto-expand sheet once data arrives
  useEffect(() => {
    if (!loading && apiData) {
      snapSheet(0);
    }
  }, [loading, apiData]);

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
    ? { latitude: userLocation.latitude, longitude: userLocation.longitude, latitudeDelta: REGION_DELTA, longitudeDelta: REGION_DELTA }
    : { latitude: 48.2082, longitude: 16.3738, latitudeDelta: REGION_DELTA, longitudeDelta: REGION_DELTA };

  const headerLabel = locationLoading
    ? 'Locating…'
    : isDebugMode
    ? '🐛 London, UK (debug)'
    : apiData
    ? locationName
    : userLocation
    ? `${userLocation.latitude.toFixed(3)}°, ${userLocation.longitude.toFixed(3)}°`
    : 'Unknown location';

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ── HEADER BAR ── */}
      <View style={[styles.headerBar, { backgroundColor: colors.surface, borderBottomColor: isDark ? '#333' : '#E5E7EB' }]}>
        <View style={styles.headerLeft}>
          <Ionicons name="location" size={18} color={colors.primary} />
          <Text style={[styles.locationText, { color: colors.text }]} numberOfLines={1}>
            {headerLabel}
          </Text>
        </View>
        {/* Right-side action area — add more buttons here as needed */}
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

      {/* ── MAP + SHEET AREA ── */}
      <View style={styles.mapArea}>

        {/* Map — mapPadding.bottom matches the sheet height so the native map
            engine centres the pin in the visible area above the sheet */}
        <MapView
          style={StyleSheet.absoluteFill}
          region={mapRegion}
          showsUserLocation
          showsMyLocationButton={false}
          provider={PROVIDER_DEFAULT}
          mapPadding={{ top: 0, right: 0, bottom: HALF_HEIGHT, left: 0 }}
        />

      {/* ── BOTTOM SHEET ── */}
      <Animated.View
        style={[
          styles.sheet,
          { height: HALF_HEIGHT, backgroundColor: colors.surface },
          { transform: [{ translateY: sheetAnim }] },
        ]}
      >
        {/* Handle + title row — drag target */}
        <View {...panResponder.panHandlers} style={styles.handleArea}>
          <View style={[styles.handleBar, { backgroundColor: isDark ? '#555' : '#D1D5DB' }]} />

          <View style={styles.sheetTitleRow}>
            <View style={styles.sheetTitleLeft}>
              <Ionicons
                name={hasWarnings ? 'alert-circle' : 'checkmark-circle'}
                size={20}
                color={hasWarnings ? '#EF4444' : '#22C55E'}
              />
              <Text style={[styles.sheetTitle, { color: colors.text }]}>
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

        {/* Scrollable content */}
        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={styles.sheetScrollContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={sheetExpanded}
          keyboardShouldPersistTaps="handled"
        >
          {/* Loading */}
          {(loading || locationLoading) && (
            <View style={styles.centeredState}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.statusText, { color: colors.textMuted }]}>
                {locationLoading ? 'Getting your location…' : 'Loading warnings…'}
              </Text>
            </View>
          )}

          {/* Location / network error */}
          {(error || (locationError && !userLocation)) && !loading && (
            <View style={[styles.alertBox, { backgroundColor: isDark ? 'rgba(220,38,38,0.12)' : '#FEE2E2' }]}>
              <Ionicons name="warning-outline" size={16} color={isDark ? '#FCA5A5' : '#B91C1C'} />
              <Text style={[styles.alertText, { color: isDark ? '#FCA5A5' : '#B91C1C' }]}>
                {error || locationError}
              </Text>
            </View>
          )}

          {/* No warnings */}
          {!loading && apiData && !hasWarnings && (
            <View style={[styles.noWarningsBox, { backgroundColor: isDark ? 'rgba(34,197,94,0.12)' : '#DCFCE7' }]}>
              <Ionicons name="checkmark-circle" size={28} color={isDark ? '#86EFAC' : '#16A34A'} />
              <Text style={[styles.noWarningsText, { color: isDark ? '#86EFAC' : '#15803D' }]}>
                No active warnings in this area
              </Text>
            </View>
          )}

          {/* Warning cards */}
          {!loading &&
            hasWarnings &&
            warnings.map((warning: Warning, index: number) => (
              <TouchableOpacity
                key={`${warning.properties.warnid}-${index}`}
                onPress={() => setExpandedWarning(expandedWarning === index ? null : index)}
                activeOpacity={0.8}
                style={[
                  styles.warningCard,
                  {
                    backgroundColor: isDark ? 'rgba(239,68,68,0.10)' : '#FFFBEB',
                    borderColor: isDark ? 'rgba(239,68,68,0.30)' : '#FDE68A',
                  },
                ]}
              >
                <View style={styles.warningCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.warningTitle, { color: isDark ? '#FCA5A5' : '#B91C1C' }]}>
                      {warning.properties.text}
                    </Text>
                    <Text style={[styles.warningDates, { color: colors.textMuted }]}>
                      {warning.properties.begin} – {warning.properties.end}
                    </Text>
                  </View>
                  <Ionicons
                    name={expandedWarning === index ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textMuted}
                  />
                </View>

                {expandedWarning === index && (
                  <View
                    style={[
                      styles.warningDetails,
                      { borderTopColor: isDark ? 'rgba(239,68,68,0.20)' : '#FDE68A' },
                    ]}
                  >
                    {[
                      { label: 'Auswirkungen', value: warning.properties.auswirkungen },
                      { label: 'Empfehlungen', value: warning.properties.empfehlungen },
                      { label: 'Meteorologischer Hintergrund', value: warning.properties.meteotext },
                    ]
                      .filter((d) => !!d.value)
                      .map((d) => (
                        <View key={d.label} style={styles.detailBlock}>
                          <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{d.label}:</Text>
                          <Text style={[styles.detailValue, { color: colors.text }]}>{d.value}</Text>
                        </View>
                      ))}
                  </View>
                )}
              </TouchableOpacity>
            ))}

          <View style={{ height: 24 }} />
        </ScrollView>
      </Animated.View>
      </View>{/* end mapArea */}

      {/* ── TOAST ── */}
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

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Header bar ──
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },

  // ── Map area (fills space below header) ──
  mapArea: {
    flex: 1,
  },

  // ── Sheet ──
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 10,
  },
  handleArea: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sheetTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sheetScroll: {
    flex: 1,
  },
  sheetScrollContent: {
    paddingHorizontal: 16,
  },

  // ── States ──
  centeredState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  statusText: {
    marginTop: 12,
    fontSize: 14,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  alertText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  noWarningsBox: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 14,
    marginTop: 4,
    gap: 10,
  },
  noWarningsText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },

  // ── Warning cards ──
  warningCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  warningCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  warningDates: {
    fontSize: 11,
    marginTop: 4,
  },
  warningDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  detailBlock: {
    gap: 2,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 11,
    lineHeight: 16,
  },
});

