/**
 * Converts Austrian Lambert (MGI / Austria Lambert, EPSG:31287) projected coordinates
 * to WGS84 lon/lat.
 *
 * The Geosphere/ZAMG warnings API returns coordinates in the Austrian Lambert
 * Conformal Conic projection (Bessel ellipsoid, MGI datum):
 *   - Standard parallels: 46°N and 49°N
 *   - Central meridian: 13°20'E
 *   - Latitude of origin: 47°30'N
 *   - False easting: 400 000 m
 *   - False northing: 400 000 m
 *
 * Algorithm:
 *   1. Inverse Lambert Conformal Conic → MGI geographic (Bessel ellipsoid)
 *   2. Helmert 7-parameter transform MGI → WGS84
 *
 *   Sources:
 *   - Proj4j for Java https://github.com/locationtech/proj4j/
 *   - PROJ4 in C++ https://github.com/OSGeo/PROJ/
 *   - Converter to verify results https://epsg.io/transform#s_srs=31287&t_srs=4326&ops=1618&x=NaN&y=NaN
 *
 */

const DEG = Math.PI / 180;

// Bessel 1841 ellipsoid
const a_B = 6377397.155;
const f_B = 1 / 299.1528128;
const b_B = a_B * (1 - f_B);
const e2_B = 1 - (b_B * b_B) / (a_B * a_B);
const e_B = Math.sqrt(e2_B);

// WGS84 ellipsoid
const a_W = 6378137.0;
const f_W = 1 / 298.257223563;
const b_W = a_W * (1 - f_W);
const e2_W = 1 - (b_W * b_W) / (a_W * a_W);

// Helmert parameters: MGI -> WGS84 (EPSG:1618 / BEV official Austria-wide)
const dx = 577.326;
const dy = 90.129;
const dz = 463.919;
const rx = (5.1366 / 3600) * DEG;
const ry = (1.4742 / 3600) * DEG;
const rz = (5.2970 / 3600) * DEG;
const ds = 2.4232e-6;

// Austrian Lambert (EPSG:31287) parameters
const phi1 = 46.0 * DEG;   // standard parallel 1
const phi2 = 49.0 * DEG;   // standard parallel 2
const phi0 = 47.5 * DEG;   // latitude of origin
const lambda0 = (13.0 + 20.0 / 60.0) * DEG; // central meridian 13°20'E
const FE = 400000.0;        // false easting
const FN = 400000.0;        // false northing

/** Compute isometric latitude (conformal latitude) for LCC on ellipsoid */
function tFunc(phi: number, e: number): number {
  const sinPhi = Math.sin(phi);
  return Math.tan(Math.PI / 4 - phi / 2) /
    Math.pow((1 - e * sinPhi) / (1 + e * sinPhi), e / 2);
}

/** Compute m */
function mFunc(phi: number, e: number, e2: number): number {
  const sinPhi = Math.sin(phi);
  return Math.cos(phi) / Math.sqrt(1 - e2 * sinPhi * sinPhi);
}

// Precompute LCC constants for Bessel ellipsoid
const m1 = mFunc(phi1, e_B, e2_B);
const m2 = mFunc(phi2, e_B, e2_B);
const t1 = tFunc(phi1, e_B);
const t2 = tFunc(phi2, e_B);
const t0 = tFunc(phi0, e_B);

const n = Math.log(m1 / m2) / Math.log(t1 / t2);
const F = m1 / (n * Math.pow(t1, n));
const rho0 = a_B * F * Math.pow(t0, n);

/** Inverse Lambert Conformal Conic: (easting, northing) on Bessel */
function lccInverse(E: number, N: number): [number, number] {
  const x = E - FE;
  const y = N - FN;

  const rho_prime = Math.sign(n) * Math.sqrt(x * x + (rho0 - y) * (rho0 - y));
  const theta_prime = Math.atan2(x, rho0 - y);

  const t_prime = Math.pow(rho_prime / (a_B * F), 1 / n);

  // Iterative solution for phi
  let phi = Math.PI / 2 - 2 * Math.atan(t_prime);
  for (let i = 0; i < 10; i++) {
    const sinPhi = Math.sin(phi);
    phi = Math.PI / 2 - 2 * Math.atan(
      t_prime * Math.pow((1 - e_B * sinPhi) / (1 + e_B * sinPhi), e_B / 2)
    );
  }

  const lambda = theta_prime / n + lambda0;
  return [phi, lambda];
}

/** Geographic on Bessel → Cartesian ECEF */
function geogToECEF(phi: number, lambda: number, a: number, e2: number): [number, number, number] {
  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  const N = a / Math.sqrt(1 - e2 * sinPhi * sinPhi);
  return [N * cosPhi * Math.cos(lambda), N * cosPhi * Math.sin(lambda), N * (1 - e2) * sinPhi];
}

/** Cartesian ECEF → geographic on WGS84 (Bowring iteration) */
function ecefToGeog(X: number, Y: number, Z: number): [number, number] {
  const lambda = Math.atan2(Y, X);
  const p = Math.sqrt(X * X + Y * Y);
  let phi = Math.atan2(Z, p * (1 - e2_W));
  for (let i = 0; i < 10; i++) {
    const sinPhi = Math.sin(phi);
    const N = a_W / Math.sqrt(1 - e2_W * sinPhi * sinPhi);
    phi = Math.atan2(Z + e2_W * N * sinPhi, p);
  }
  return [phi, lambda];
}

/**
 * Convert a single Austrian Lambert coordinate pair [easting, northing] to WGS84 [longitude, latitude].
 * Returns the original values unchanged if they already look like WGS84 (i.e. within valid lon/lat ranges), to allow for mixed input.
 */
export function mgiAustriaLambertToWgs84(rawE: number, rawN: number): [number, number] {
  // If values are already in WGS84 range, pass through
  if (Math.abs(rawE) <= 180 && Math.abs(rawN) <= 90) {
    return [rawE, rawN];
  }

  // Step 1: inverse LCC projection → MGI geographic (Bessel)
  const [phi_mgi, lambda_mgi] = lccInverse(rawE, rawN);

  // Step 2: MGI geographic → ECEF
  const [X_mgi, Y_mgi, Z_mgi] = geogToECEF(phi_mgi, lambda_mgi, a_B, e2_B);

// Step 3: Helmert transform MGI → WGS84
// EPSG:1618 uses the Position Vector convention.
  const X_w = (1 + ds) * (X_mgi - rz * Y_mgi + ry * Z_mgi) + dx;
  const Y_w = (1 + ds) * (rz * X_mgi + Y_mgi - rx * Z_mgi) + dy;
  const Z_w = (1 + ds) * (-ry * X_mgi + rx * Y_mgi + Z_mgi) + dz;

  // Step 4: WGS84 ECEF → geographic
  const [phi_w, lambda_w] = ecefToGeog(X_w, Y_w, Z_w);

  return [lambda_w / DEG, phi_w / DEG]; // [lon, lat]
}

/**
 * Convert all coordinates in a GeosphereResponse geometry from Austrian Lambert to WGS84 in-place.
 */
export function convertGeosphereCoordinates(coordinates: number[][][][]): number[][][][] {
  return coordinates.map((polygon) =>
    polygon.map((ring) =>
      ring.map(([e, n]) => mgiAustriaLambertToWgs84(e, n))
    )
  );
}
