// src/utils/deliveryConstants.js

export const DELIVERY_METHOD_PICKUP = "Entrega en el local";
export const DELIVERY_METHOD_COURIER = "Delivery";

export const DEFAULT_DELIVERY_METHODS = [DELIVERY_METHOD_PICKUP, DELIVERY_METHOD_COURIER];

/**
 * Normaliza métodos de entrega existentes o provenientes de la API
 * asegurando consistencia con las constantes canónicas.
 * 
 * @param {string|string[]|null|undefined} rawMethods
 * @returns {string[]} Lista de métodos normalizados
 */
export function normalizeDeliveryMethods(rawMethods) {
  if (!rawMethods) return [DELIVERY_METHOD_PICKUP];

  let list = [];
  try {
    list = typeof rawMethods === 'string' ? JSON.parse(rawMethods) : rawMethods;
    if (!Array.isArray(list)) list = [];
  } catch {
    list = [];
  }

  const normalized = new Set();
  list.forEach(item => {
    const str = String(item).trim().toLowerCase();
    if (str.includes('local') || str.includes('recojo') || str.includes('tienda') || str.includes('presencial')) {
      normalized.add(DELIVERY_METHOD_PICKUP);
    } else if (str.includes('delivery') || str.includes('envio') || str.includes('envío') || str.includes('domicilio')) {
      normalized.add(DELIVERY_METHOD_COURIER);
    }
  });

  return normalized.size > 0 ? Array.from(normalized) : [DELIVERY_METHOD_PICKUP];
}

/**
 * Determina si un comercio ofrece la opción de delivery según su configuración
 * de catálogo y órdenes activas.
 *
 * @param {string|string[]|null|undefined} rawMethods
 * @param {boolean} [ordersEnabled=true]
 * @returns {boolean}
 */
export function hasDeliveryOption(rawMethods, ordersEnabled = true) {
  if (ordersEnabled === false) return false;
  if (!rawMethods) return false;
  try {
    const list = typeof rawMethods === 'string' ? JSON.parse(rawMethods) : rawMethods;
    if (!Array.isArray(list)) return false;
    return list.some(item => {
      const str = String(item).trim().toLowerCase();
      return str.includes('delivery') || str.includes('domicilio') || str.includes('envio') || str.includes('envío');
    });
  } catch {
    return false;
  }
}
