// src/utils/deliveryCalculator.js

/**
 * Tarifa base de arranque de delivery (en Bolivianos Bs, equivalente al costo de 1 km)
 */
export const DELIVERY_BASE_FEE = 4.5;

/**
 * Tarifa de delivery por kilómetro recorrido (en Bolivianos Bs)
 */
export const DELIVERY_RATE_PER_KM = 4.5;

/**
 * Factor de sinuosidad urbana por defecto (circuity factor) en topografía de montaña/accidentada
 * como La Paz, Bolivia, donde la distancia real en calles es ~1.8x la distancia euclidiana en línea recta.
 */
export const URBAN_CIRCUITY_FACTOR = 1.8;

/**
 * Calcula la distancia ortodrómica en línea recta (a vuelo de pájaro) en km.
 * 
 * @param {number} lat1 - Latitud del punto 1
 * @param {number} lon1 - Longitud del punto 1
 * @param {number} lat2 - Latitud del punto 2
 * @param {number} lon2 - Longitud del punto 2
 * @returns {number} Distancia en línea recta en kilómetros
 */
export function calculateStraightDistanceKm(lat1, lon1, lat2, lon2) {
  const nLat1 = parseFloat(lat1);
  const nLon1 = parseFloat(lon1);
  const nLat2 = parseFloat(lat2);
  const nLon2 = parseFloat(lon2);

  if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2)) {
    return 0;
  }

  const R = 6371; // Radio medio de la Tierra en km
  const dLat = (nLat2 - nLat1) * (Math.PI / 180);
  const dLon = (nLon2 - nLon1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(nLat1 * (Math.PI / 180)) *
    Math.cos(nLat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100;
}

/**
 * Calcula la distancia vehicular estimada en kilómetros entre dos coordenadas geográficas.
 * Aplica por defecto el factor de sinuosidad urbana vial (1.8x en topografía de montaña)
 * sobre la distancia recta para reflejar fielmente el recorrido vehicular en calles.
 * 
 * @param {number} lat1 - Latitud del punto 1
 * @param {number} lon1 - Longitud del punto 1
 * @param {number} lat2 - Latitud del punto 2
 * @param {number} lon2 - Longitud del punto 2
 * @param {boolean} [applyCircuity=true] - Si aplica el factor vial urbano
 * @returns {number} Distancia vehicular en kilómetros redondeada a 2 decimales
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2, applyCircuity = true) {
  const straight = calculateStraightDistanceKm(lat1, lon1, lat2, lon2);
  if (straight <= 0) return 0;
  const factor = applyCircuity ? URBAN_CIRCUITY_FACTOR : 1.0;
  return Math.round(straight * factor * 100) / 100;
}

/**
 * Calcula la distancia vial real (en automóvil/motocicleta) utilizando OSRM (Open Source Routing Machine).
 * Si la red o el servicio OSRM no están disponibles o superan el timeout, aplica el factor de
 * sinuosidad urbana (1.7x) sobre la distancia recta para aproximar fielmente el recorrido vehicular.
 * 
 * @param {number} lat1 - Latitud origen
 * @param {number} lon1 - Longitud origen
 * @param {number} lat2 - Latitud destino
 * @param {number} lon2 - Longitud destino
 * @returns {Promise<number>} Distancia en kilómetros redondeada a 2 decimales
 */
export async function calculateRoadDistanceKm(lat1, lon1, lat2, lon2) {
  const nLat1 = parseFloat(lat1);
  const nLon1 = parseFloat(lon1);
  const nLat2 = parseFloat(lat2);
  const nLon2 = parseFloat(lon2);

  if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2)) {
    return 0;
  }

  const straightLine = calculateStraightDistanceKm(nLat1, nLon1, nLat2, nLon2);
  if (straightLine <= 0) return 0;
  const fallbackKm = Math.round(straightLine * URBAN_CIRCUITY_FACTOR * 100) / 100;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const url = `https://router.project-osrm.org/route/v1/driving/${nLon1},${nLat1};${nLon2},${nLat2}?overview=false`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.routes && data.routes.length > 0) {
        const roadMeters = data.routes[0].distance;
        if (typeof roadMeters === 'number' && roadMeters > 0) {
          return Math.round((roadMeters / 1000) * 100) / 100;
        }
      }
    }
  } catch (err) {
    console.warn('OSRM routing query fallback to circuity factor:', err);
  }

  return fallbackKm;
}

/**
 * Calcula la tarifa de envío en base a la tarifa base fija más la distancia recorrida.
 * 
 * @param {number} distanceKm - Distancia en kilómetros
 * @param {number} ratePerKm - Tarifa por km (por defecto 4.5 Bs)
 * @param {number} baseFee - Tarifa base inicial (por defecto 4.5 Bs)
 * @returns {number} Costo de envío redondeado a 2 decimales
 */
export function calculateDeliveryFee(
  distanceKm, 
  ratePerKm = DELIVERY_RATE_PER_KM, 
  baseFee = DELIVERY_BASE_FEE
) {
  const dist = parseFloat(distanceKm);
  if (isNaN(dist) || dist <= 0) return 0;
  return Math.round((baseFee + (dist * ratePerKm)) * 100) / 100;
}

/**
 * Genera un enlace estándar de Google Maps para las coordenadas dadas.
 * 
 * @param {number} lat 
 * @param {number} lng 
 * @returns {string} URL de Google Maps con query pin
 */
export function formatGoogleMapsUrl(lat, lng) {
  if (lat == null || lng == null) return '';
  return `https://www.google.com/maps?q=${lat},${lng}`;
}
