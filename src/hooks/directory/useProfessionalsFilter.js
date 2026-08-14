import { useMemo } from 'react';
import { normalizeText } from '../../utils/slugs';

const parseGoogleMapsCoords = (url) => {
  if (!url) return null;
  let match = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  match = url.match(/[?&](q|query)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) return { lat: parseFloat(match[2]), lng: parseFloat(match[3]) };
  match = url.match(/\/place\/(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  match = url.match(/^\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*$/);
  if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  return null;
};

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export function useProfessionalsFilter({
  professionals,
  activeCategory,
  searchTerm,
  activeState,
  activeNeighborhood,
  activeSubcategory,
  activeRating,
  activeDistance,
  userCoords,
  serverFiltered
}) {
  const filteredProfessionals = useMemo(() => {
    return professionals
      .filter(p => {
        const matchCategory = activeCategory === 'Todos' || p.category === activeCategory;
        const searchNormalized = normalizeText(searchTerm);
        const matchSearch = serverFiltered ||
                            !searchTerm ||
                            normalizeText(p.name).includes(searchNormalized) || 
                            normalizeText(p.title).includes(searchNormalized);
        const matchState = activeState === 'Todas' || p.state === activeState;
        const matchNeighborhood = activeNeighborhood === 'Todas' || p.neighborhood === activeNeighborhood;
        const matchSubcategory = activeSubcategory === 'Todas' || (() => {
          try {
            const subs = JSON.parse(p.subcategories || '[]');
            if (subs.length > 0) return subs.includes(activeSubcategory);
            return p.subcategory === activeSubcategory;
          } catch { return p.subcategory === activeSubcategory || p.subcategories === activeSubcategory; }
        })();
        
        let matchRating = true;
        if (activeRating === '5 Estrellas') matchRating = (p.rating || 0) >= 5;
        else if (activeRating === '4+ Estrellas') matchRating = (p.rating || 0) >= 4;
        else if (activeRating === '3+ Estrellas') matchRating = (p.rating || 0) >= 3;

        let matchDistance = true;
        if (activeDistance !== 'Todos' && userCoords) {
          if (p.home_delivery || p.national_delivery) {
            matchDistance = true;
          } else {
            const bizCoords = parseGoogleMapsCoords(p.ubicacion_url);
            if (!bizCoords) {
              matchDistance = false;
            } else {
              const dist = getDistance(userCoords.lat, userCoords.lng, bizCoords.lat, bizCoords.lng);
              if (activeDistance === 'Minutos') matchDistance = dist < 6;
              else if (activeDistance === 'Pocas horas') matchDistance = dist >= 6 && dist < 24;
              else if (activeDistance === 'Horas') matchDistance = dist >= 24 && dist < 150;
              else if (activeDistance === 'Viajes') matchDistance = dist >= 150;
            }
          }
        }

        return matchCategory && matchSearch && matchState && matchNeighborhood && matchRating && matchSubcategory && matchDistance;
      })
      .sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }, [professionals, activeCategory, searchTerm, activeState, activeNeighborhood, activeSubcategory, activeRating, activeDistance, userCoords, serverFiltered]);

  return { filteredProfessionals };
}
