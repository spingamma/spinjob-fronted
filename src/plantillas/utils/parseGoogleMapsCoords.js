export const parseGoogleMapsCoords = (url) => {
  if (!url) return null;
  // 1. Pin data: !3dLat!4dLng
  let match = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (match) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  }
  // 2. Query parameter: q=lat,lng
  match = url.match(/[?&](q|query)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) {
    return { lat: parseFloat(match[2]), lng: parseFloat(match[3]) };
  }
  // 3. Path place: /place/lat,lng
  match = url.match(/\/place\/(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  }
  // 4. Viewport/Camera fallback: @lat,lng
  match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  }
  // 5. Direct coordinates: "lat,lng"
  match = url.match(/^\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*$/);
  if (match) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  }
  return null;
};
