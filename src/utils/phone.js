// Archivo: src/utils/phone.js

/**
 * Mapa centralizado de países admitidos en el sistema con sus respectivos códigos y formatos de validación.
 */
export const COUNTRIES = {
  Bolivia: { code: '+591', cleanCode: '591', flag: '🇧🇴', length: 8 },
  // A futuro agregar países de forma extensible aquí:
  // Argentina: { code: '+54', cleanCode: '54', flag: '🇦🇷', length: 10 },
};

/**
 * Retorna la configuración de un país buscando por su nombre.
 */
export const getCountryByName = (name) => {
  if (!name) return null;
  return COUNTRIES[name] || null;
};

/**
 * Limpia un número de WhatsApp (removiendo no-dígitos) para la API wa.me.
 * Dado que todos los números se guardan unificados con su prefijo, basta con limpiar de no-dígitos.
 */
export const cleanWhatsappNumber = (number) => {
  if (!number) return '';
  return number.replace(/[^0-9]/g, '');
};

/**
 * Parsea un número de teléfono completo extrayendo su parte local de acuerdo al país asignado.
 */
export const parsePhoneNumber = (phone, countryName = 'Bolivia') => {
  const country = getCountryByName(countryName) || Object.values(COUNTRIES)[0];
  if (!phone) return { country, number: '' };
  
  if (phone.startsWith(country.code)) {
    return { country, number: phone.substring(country.code.length) };
  }
  return { country, number: phone };
};
