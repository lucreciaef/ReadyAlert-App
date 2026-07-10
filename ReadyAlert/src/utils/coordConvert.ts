/**
 * Convertion from Austrian Lambert (MGI / Austria Lambert, EPSG:31287) projected coordinates (received from Geosphere API)
 * to WGS84 lon/lat.
 *
 * Conversion done with proj4js: a JavaScript port of the PROJ / PROJ4 library (https://github.com/OSGeo/PROJ)
 *
 * Sources:
 *   - proj4js https://github.com/proj4js/proj4js
 *   - PROJ https://github.com/OSGeo/PROJ/
 *   - EPSG:31287 definition / verification https://epsg.io/31287
 */

import proj4 from 'proj4';

// Source: https://epsg.io/31287.proj4 definition provided
const EPSG_31287_DEF =
  '+proj=lcc +lat_1=46 +lat_2=49 +lat_0=47.5 +lon_0=13.333333333333334 ' +
  '+x_0=400000 +y_0=400000 +ellps=bessel +towgs84=577.326,90.129,463.919,5.1366,1.4742,5.297,2.4232 +units=m +no_defs';

proj4.defs('EPSG:31287', EPSG_31287_DEF);

/**
 * Convert a single Austrian Lambert coordinate pair [easting, northing] to WGS84 [longitude, latitude].
 * Returns the original values unchanged if they already look like WGS84 (within valid lon/lat ranges), to allow for mixed input.
 */
export function mgiAustriaLambertToWgs84(rawE: number, rawN: number): [number, number] {
  // If values are already in WGS84 range, pass through
  if (Math.abs(rawE) <= 180 && Math.abs(rawN) <= 90) {
    return [rawE, rawN];
  }

  const [lon, lat] = proj4('EPSG:31287', 'EPSG:4326', [rawE, rawN]);
  return [lon, lat];
}

//Convert all coordinates in a GeosphereResponse geometry from Austrian Lambert to WGS84 in-place.
export function convertGeosphereCoordinates(coordinates: number[][][][]): number[][][][] {
  return coordinates.map((polygon) =>
    polygon.map((ring) => ring.map(([e, n]) => mgiAustriaLambertToWgs84(e, n))),
  );
}
