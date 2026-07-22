/**
 * Expandable card that shows the current radiation level for the nearest
 * Austrian monitoring station (Strahlenschutz).
 *
 * Collapsed: headline value (nSv/h) + level label for the closest station.
 * Expanded: table of all nearby stations (<= 100 km) sorted by distance.
 */

import { Text, View } from 'react-native';
import { classifyRadiation, RADIATION_LEVEL_LABEL } from '../api';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';
import { ExpandableInfoCard } from './ExpandableInfoCard';
import { RadiationState } from '../hooks/useRadiationLevel';

function radiationColour(
  nsvh: number,
  c: ReturnType<typeof getThemeColours>,
): string {
  const level = classifyRadiation(nsvh);
  if (level === 'normal' || level === 'elevated')   return c.success;
  if (level === 'high') return c.warning;
  return c.error;
}

interface Props extends RadiationState {
  expanded: boolean;
  onToggle: () => void;
}

export function APIRadiationLevelCard({
  nearbyStations,
  closestStation,
  measurementTime,
  loading,
  error,
  expanded,
  onToggle,
}: Props) {
  const { isDark } = useTheme();
  const colours = getThemeColours(isDark);

  const timeLabel = measurementTime
    ? measurementTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <ExpandableInfoCard
      icon="radioactive"
      title="Radiation Levels"
      expanded={expanded}
      onToggle={onToggle}
      colours={colours}
      summary={
        <>
          {loading && !closestStation && (
            <Text style={{ color: colours.textMuted, fontSize: 14, marginTop: 10 }}>
              Loading radiation data…
            </Text>
          )}

          {error && !closestStation && (
            <Text style={{ color: colours.warning, fontSize: 14, marginTop: 10 }}>
              {error}
            </Text>
          )}

          {!loading && !error && !closestStation && (
            <Text style={{ color: colours.textMuted, fontSize: 14, marginTop: 10 }}>
              No stations within 100 km — data covers Austria only.
            </Text>
          )}

          {closestStation && (
            <View style={{ marginTop: 6, gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                <Text
                  style={{
                    fontSize: 26,
                    fontWeight: '700',
                    color: radiationColour(closestStation.messwert, colours),
                  }}
                >
                  {closestStation.messwert}
                </Text>
                <Text style={{ fontSize: 14, color: colours.textMuted }}>
                  nSv/h ·{' '}
                  {RADIATION_LEVEL_LABEL[classifyRadiation(closestStation.messwert)]}
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: colours.textMuted }}>
                {closestStation.name}
                {' · '}
                {closestStation.distanceKm < 1
                  ? '< 1 km away'
                  : `${Math.round(closestStation.distanceKm)} km away`}
                {timeLabel ? `  ·  Updated ${timeLabel}` : ''}
              </Text>
            </View>
          )}
        </>
      }
    >
      {nearbyStations.length > 0 && (
        <View style={{ marginTop: 12, gap: 4 }}>
          {/* Column headers */}
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: 4,
              paddingBottom: 4,
              borderBottomWidth: 1,
              borderBottomColor: colours.divider,
            }}
          >
            <Text style={{ flex: 1, fontSize: 11, color: colours.textMuted, fontWeight: '600' }}>
              Station
            </Text>
            <Text style={{ width: 68, fontSize: 11, color: colours.textMuted, fontWeight: '600', textAlign: 'right' }}>
              nSv/h
            </Text>
            <Text style={{ width: 60, fontSize: 11, color: colours.textMuted, fontWeight: '600', textAlign: 'right' }}>
              Distance
            </Text>
          </View>

          {nearbyStations.slice(0, 10).map((s) => {
            const col = radiationColour(s.messwert, colours);
            return (
              <View
                key={s.nummer}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 5,
                  paddingHorizontal: 4,
                  borderRadius: 6,
                  backgroundColor:
                    s.nummer === closestStation?.nummer
                      ? isDark
                        ? `${colours.primary}22`
                        : `${colours.primary}11`
                      : 'transparent',
                }}
              >
                {/* Colored dot */}
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: col,
                    marginRight: 8,
                  }}
                />
                <Text
                  style={{ flex: 1, fontSize: 13, color: colours.text }}
                  numberOfLines={1}
                >
                  {s.name}
                </Text>
                <Text
                  style={{
                    width: 68,
                    fontSize: 13,
                    fontWeight: '600',
                    color: col,
                    textAlign: 'right',
                  }}
                >
                  {s.messwert}
                </Text>
                <Text
                  style={{
                    width: 60,
                    fontSize: 12,
                    color: colours.textMuted,
                    textAlign: 'right',
                  }}
                >
                  {s.distanceKm < 1 ? '< 1 km' : `${Math.round(s.distanceKm)} km`}
                </Text>
              </View>
            );
          })}

          <Text
            style={{
              fontSize: 10,
              color: colours.textMuted,
              fontStyle: 'italic',
              marginTop: 4,
            }}
          >
            Source: BMSGPK / Strahlenschutz Austria · nSv/h = nanosieverts per hour
          </Text>
        </View>
      )}
    </ExpandableInfoCard>
  );
}


