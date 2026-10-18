// src/utils/deliveryCalculator.js

/**
 * Tarifa base de delivery por kilómetro (en Bolivianos Bs)
 */
export const DELIVERY_RATE_PER_KM = 4.5;

/**
 * Calcula la distancia ortodrómica en kilómetros entre dos coordenadas geográficas
 * utilizando la fórmula de Haversine.
 * 
 * @param {number} lat1 - Latitud del punto 1
 * @param {number} lon1 - Longitud del punto 1
 * @param {number} lat2 - Latitud del punto 2
 * @param {number} lon2 - Longitud del punto 2
 * @returns {number} Distancia en kilómetros redondeada a 2 decimales
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
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
 * Calcula la tarifa de envío en base a la distancia recorrida.
 * 
 * @param {number} distanceKm - Distancia en kilómetros
 * @param {number} ratePerKm - Tarifa por km (por defecto 4.5 Bs)
 * @returns {number} Costo de envío redondeado a 2 decimales
 */
export function calculateDeliveryFee(distanceKm, ratePerKm = DELIVERY_RATE_PER_KM) {
  const dist = parseFloat(distanceKm);
  if (isNaN(dist) || dist <= 0) return 0;
  return Math.round(dist * ratePerKm * 100) / 100;
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
