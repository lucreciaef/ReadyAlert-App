import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getCardStyles, getLayoutStyles, getTypographyStyles } from '../styles/appStyles';
import { getThemeColors } from '../styles/themeColors';
import { fetchWarningsForLocation, getLocationName, getWarningCount } from '../api';
import { GeosphereResponse, Warning } from '../api';
import { useLocation } from '../hooks/useLocation';

export function HomeDashboardPage() {
  const { isDark } = useTheme();
  const layout = getLayoutStyles(isDark);
  const typography = getTypographyStyles(isDark);
  const card = getCardStyles(isDark);
  const colors = getThemeColors(isDark);

  // Get user location
  const { coords: userLocation, loading: locationLoading, error: locationError, requestPermission } = useLocation();

  const [apiData, setApiData] = useState<GeosphereResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedWarning, setExpandedWarning] = useState<number | null>(null);

  // Fetch warnings when location is available
  useEffect(() => {
    if (userLocation && !locationLoading) {
      loadWarnings(userLocation.longitude, userLocation.latitude);
    }
  }, [userLocation, locationLoading]);

  const loadWarnings = async (lon: number, lat: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWarningsForLocation(lon, lat, 'en');
      setApiData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch warnings';
      setError(errorMessage);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (userLocation) {
      loadWarnings(userLocation.longitude, userLocation.latitude);
    } else {
      requestPermission();
    }
  };

  const warningCount = getWarningCount(apiData);
  const locationName = getLocationName(apiData);
  const hasWarnings = warningCount > 0;
  const warnings = apiData?.properties?.warnings || [];

  const isInitialLoading = locationLoading || !userLocation;

  return (
    <ScrollView className={layout.content} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <View className={card.container}>
        <View className="flex flex-row items-center justify-between mb-4">
          <Text className={typography.cardTitle}>Current Warnings</Text>
          <TouchableOpacity onPress={handleRefresh} disabled={loading || isInitialLoading}>
            <Ionicons
              name="refresh"
              size={20}
              color={loading || isInitialLoading ? colors.textMuted : colors.primary}
            />
          </TouchableOpacity>
        </View>

        {isInitialLoading && (
          <View className="py-8 items-center">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className={`mt-3 ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`}>
              Getting your location...
            </Text>
          </View>
        )}

        {locationError && !userLocation && (
          <View className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-100'}`}>
            <Text className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
              {locationError}
            </Text>
          </View>
        )}

        {loading && !isInitialLoading && (
          <View className="py-8 items-center">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className={`mt-3 ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`}>
              Loading warnings...
            </Text>
          </View>
        )}

        {error && (
          <View className={`p-4 rounded-lg ${isDark ? 'bg-red-900/20' : 'bg-red-100'}`}>
            <Text className={isDark ? 'text-red-300' : 'text-red-700'}>
              {error}
            </Text>
          </View>
        )}

        {!loading && !error && apiData && (
          <View className="gap-4">
            <View className="flex-row items-center justify-between">
              <Text className={`text-sm ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`}>
                Location
              </Text>
              <Text className={`font-semibold ${isDark ? 'text-text-dark' : 'text-text'}`}>
                {locationName}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className={`text-sm ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`}>
                Active Warnings
              </Text>
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name={hasWarnings ? 'alert-circle' : 'checkmark-circle'}
                  size={20}
                  color={hasWarnings ? '#FF3B30' : '#34C759'}
                />
                <Text className={`font-semibold ${isDark ? 'text-text-dark' : 'text-text'}`}>
                  {warningCount}
                </Text>
              </View>
            </View>

            {hasWarnings && (
              <View className={`p-3 rounded-lg mt-2 ${isDark ? 'bg-red-900/20' : 'bg-yellow-50'}`}>
                <Text className={`text-xs ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                  ⚠️ {warningCount} warning{warningCount !== 1 ? 's' : ''} active
                </Text>
              </View>
            )}

            {!hasWarnings && (
              <View className={`p-3 rounded-lg mt-2 ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
                <Text className={`text-xs ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                  ✓ No active warnings in this area
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Warnings List */}
      {!loading && !error && hasWarnings && (
        <View className="mt-4 gap-3">
          {warnings.map((warning: Warning, index: number) => (
            <TouchableOpacity
              key={`${warning.properties.warnid}-${index}`}
              onPress={() => setExpandedWarning(expandedWarning === index ? null : index)}
              className={`p-4 rounded-lg ${isDark ? 'bg-surface-dark border border-red-900/30' : 'bg-yellow-50 border border-yellow-200'}`}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className={`font-bold text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                    {warning.properties.text}
                  </Text>
                  <Text className={`text-xs mt-1 ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`}>
                    {warning.properties.begin} - {warning.properties.end}
                  </Text>
                </View>
                <Ionicons
                  name={expandedWarning === index ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={isDark ? '#f5f5f5' : '#222'}
                />
              </View>

              {expandedWarning === index && (
                <View className="mt-4 pt-4 border-t border-red-900/20 gap-3">
                  <View>
                    <Text className={`text-xs font-semibold ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`}>
                      Auswirkungen:
                    </Text>
                    <Text className={`text-xs mt-1 ${isDark ? 'text-text-dark' : 'text-text'}`}>
                      {warning.properties.auswirkungen}
                    </Text>
                  </View>

                  <View>
                    <Text className={`text-xs font-semibold ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`}>
                      Empfehlungen:
                    </Text>
                    <Text className={`text-xs mt-1 ${isDark ? 'text-text-dark' : 'text-text'}`}>
                      {warning.properties.empfehlungen}
                    </Text>
                  </View>

                  <View>
                    <Text className={`text-xs font-semibold ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`}>
                      Meteorologischer Hintergrund:
                    </Text>
                    <Text className={`text-xs mt-1 ${isDark ? 'text-text-dark' : 'text-text'}`}>
                      {warning.properties.meteotext}
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Debug Info */}
      {userLocation && (
        <View className={`mt-4 mb-4 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <Text className={`text-xs font-mono ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`}>
            📍 Your Location: Lat {userLocation.latitude.toFixed(4)}, Lon {userLocation.longitude.toFixed(4)}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
