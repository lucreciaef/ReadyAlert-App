import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColors } from '../styles/themeColors';
import { getTopAppBarStyles } from '../styles/appStyles';
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
      <MaterialCommunityIcons name="trophy-outline" size={TROPHY_SIZE} color="#CFD8DC" />
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
          <MaterialCommunityIcons name="trophy" size={TROPHY_SIZE} color={color} />
        </View>
      )}
    </View>
  );
}

export function HomeDashboardPage({ onPreparednessPress, onSettingsPress }: { onPreparednessPress?: () => void; onSettingsPress?: () => void }) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const topBar = getTopAppBarStyles(isDark);
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
    if (userLocation && !locationLoading) loadWarnings(userLocation.longitude, userLocation.latitude);
  }, [userLocation, locationLoading]);

  useEffect(() => {
    if (!loading && (apiData || error)) snapSheet(0);
  }, [loading, apiData, error]);

  const loadWarnings = async (lon: number, lat: number) => {
    try {
      setLoading(true);
      setError(null);
      setServiceUnavailable(false);
      setApiData(null);
      const data = await fetchWarningsForLocation(lon, lat, 'en');
      setApiData(data);
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

  const warningCount = getWarningCount(apiData);
  const locationName = getLocationName(apiData);
  const hasWarnings = warningCount > 0;
  const warnings = apiData?.properties?.warnings || [];

  const REGION_DELTA = 1.2;
  const mapRegion = userLocation
    ? { latitude: userLocation.latitude, longitude: userLocation.longitude, latitudeDelta: REGION_DELTA, longitudeDelta: REGION_DELTA }
    : { latitude: 48.2082, longitude: 16.3738, latitudeDelta: REGION_DELTA, longitudeDelta: REGION_DELTA };

  const headerLabel = locationLoading
    ? 'Locating…'
    : isDebugMode
      ? 'London, UK (debug)'
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
      ? '#F59E0B'
      : '#4CAF50';

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <View className={topBar.container} style={{ elevation: 0 }}>
        <Pressable
          onPress={handleRefresh}
          disabled={loading || locationLoading}
          android_ripple={{ color: colors.ripple, borderless: true }}
          style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24 }}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={24}
            color={loading || locationLoading ? colors.textMuted : colors.primary}
          />
        </Pressable>
        <View style={{ flex: 1 }} />
      </View>

      <View style={{ flex: 1 }}>
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
              elevation: 3,
              zIndex: 5,
              transform: [{ translateY: Animated.subtract(sheetAnim, MAX_TRANSLATE_Y) }],
            }}
          >
            <Pressable
              onPress={onPreparednessPress}
              android_ripple={{ color: colors.ripple }}
              style={{ borderRadius: 12, overflow: 'hidden' }}
            >
              <View
                style={{
                  backgroundColor: isDark ? colors.surfaceContainer : colors.surface,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.3 : 0.10,
                  shadowRadius: 6,
                  elevation: 3,
                }}
              >
                <Text style={{
                  fontSize: 11,
                  fontWeight: '600',
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  color: colors.textMuted,
                  marginBottom: 8,
                }}>
                  Preparedness score
                </Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {[0, 1, 2, 3, 4].map((i) => {
                    const trophyScore = preparedness.score / 20;
                    const fill = Math.min(1, Math.max(0, trophyScore - i));
                    return <TrophyIcon key={i} fill={fill} color={preparedness.color} />;
                  })}
                </View>
              </View>
            </Pressable>
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
            <View style={{
              width: 32,
              height: 4,
              borderRadius: 2,
              backgroundColor: isDark ? '#555' : '#CAC4D0',
              alignSelf: 'center',
              marginTop: 12,
              marginBottom: 12,
            }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialCommunityIcons name="map-marker" size={20} color={colors.primary} />
                <Text
                    style={{ flex: 1, fontSize: 18, fontWeight: '500', color: colors.text }}
                    numberOfLines={1}
                >
                  {headerLabel}
                </Text>
                <MaterialCommunityIcons name={statusIcon as any} size={20} color={statusColor} />
              </View>
              <Pressable
                onPress={() => snapSheet(expandedRef.current ? MAX_TRANSLATE_Y : 0)}
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
              <APIResultButton loading={false} hasAlerts={false} totalCount={0} isUnavailable onPress={handleRefresh} />
            )}

            {!loading && apiData && !hasWarnings && (
              <EmptyState message="No active warnings in this area" />
            )}

            {!loading && hasWarnings && warnings.map((warning: Warning, index: number) => (
              <ExpandableWarningCard key={`${warning.properties.warnid}-${index}`} warning={warning} />
            ))}

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
