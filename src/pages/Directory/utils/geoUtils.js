export const getCountryFromCoords = (lat, lng) => {
  if (lat >= -56 && lat <= -21 && lng >= -74 && lng <= -53) return 'Argentina';
  if (lat >= -23 && lat <= -9 && lng >= -70 && lng <= -57) return 'Bolivia';
  if (lat >= -19 && lat <= 0 && lng >= -82 && lng <= -68) return 'Perú';
  if (lat >= -4.5 && lat <= 13 && lng >= -79 && lng <= -66) return 'Colombia';
  return null;
};
