import { useState, useEffect, useCallback, useRef } from 'react';
import { getCountryFromCoords } from '../utils/geoUtils';
import { matchSlugToName } from '../../../utils/slugs';
import { API_URL } from '../../../config/api';

export function useDirectoryData({
  activeCategory, activeState, searchTerm, activeNeighborhood, activeRating, activeSubcategory,
  categoria, estado, showCategoryGrid
}) {
  const [profesionales, setProfesionales] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [hayMas, setHayMas] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);

  const resolvedCategory = metadata ? matchSlugToName(categoria, metadata.groupedCategories?.map(g => g.category) || [], 'Todos') : activeCategory;
  const resolvedState = metadata ? matchSlugToName(estado, metadata.groupedLocations?.map(g => g.state) || [], 'Todas') : activeState;

  const [selectedCountry, setSelectedCountry] = useState(() => {
    const userStr = localStorage.getItem('spingamma_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.country) return user.country;
      } catch { /* ignore */ }
    }
    const saved = localStorage.getItem('spingamma_selected_country');
    if (saved) return saved;

    let detected = 'Bolivia';
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.includes('La_Paz')) detected = 'Bolivia';
      else if (tz.includes('Bogota')) detected = 'Colombia';
      else if (tz.includes('Lima')) detected = 'Perú';
      else if (tz.includes('Argentina') || tz.includes('Buenos_Aires') || tz.includes('Cordoba') || tz.includes('Mendoza')) detected = 'Argentina';
    } catch { /* ignore */ }

    localStorage.setItem('spingamma_selected_country', detected);
    return detected;
  });

  const [userCoords, setUserCoords] = useState(() => {
    const stored = localStorage.getItem('spingamma_user_coords');
    if (stored) {
      try { return JSON.parse(stored); } catch { return null; }
    }
    return null;
  });

  useEffect(() => {
    if (navigator.geolocation && !userCoords) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserCoords(coords);
          localStorage.setItem('spingamma_user_coords', JSON.stringify(coords));

          const hasSaved = localStorage.getItem('spingamma_selected_country');
          if (!hasSaved) {
            const detected = getCountryFromCoords(coords.lat, coords.lng);
            if (detected) {
              setSelectedCountry(detected);
              localStorage.setItem('spingamma_selected_country', detected);
            }
          }
        },
        // eslint-disable-next-line no-unused-vars
        (error) => {
          // Geolocalización opcional o denegada
        },
        { enableHighAccuracy: false, timeout: 8000 }
      );
    }
  }, [userCoords]);

  // 1. Fetch Metadata
  useEffect(() => {
    if (!selectedCountry) return;
    let isMounted = true;

    async function cargarMetadata() {
      try {
        const res = await fetch(`${API_URL}/businesses/metadata?country=${encodeURIComponent(selectedCountry)}`);
        if (!res.ok) throw new Error("Error en red");
        const data = await res.json();
        if (isMounted) setMetadata(data);
      } catch (err) {
        console.error("Error loading metadata", err);
      }
    }
    cargarMetadata();
    return () => { isMounted = false; };
  }, [selectedCountry]);

  // 2. Fetch Directory List based on Backend Filtering
  useEffect(() => {
    if (!selectedCountry) return;
    if (showCategoryGrid) {
      setProfesionales([]);
      setCargandoLista(false);
      return;
    }

    let isMounted = true;

    async function cargarDirectorio() {
      setCargandoLista(true);
      try {
        let url = `${API_URL}/businesses/?skip=0&limit=10&country=${encodeURIComponent(selectedCountry)}`;
        if (resolvedCategory && resolvedCategory !== 'Todos') url += `&category=${encodeURIComponent(resolvedCategory)}`;
        if (resolvedState && resolvedState !== 'Todas') url += `&state=${encodeURIComponent(resolvedState)}`;
        if (activeNeighborhood && activeNeighborhood !== 'Todas') url += `&neighborhood=${encodeURIComponent(activeNeighborhood)}`;
        if (activeSubcategory && activeSubcategory !== 'Todas') url += `&subcategory=${encodeURIComponent(activeSubcategory)}`;
        if (activeRating && activeRating !== 'Todos') url += `&rating=${encodeURIComponent(activeRating)}`;
        if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Error en red");

        const data = await res.json();
        if (isMounted) {
          setProfesionales(data);
          setHayMas(data.length === 10);
          setCargandoLista(false);
        }
      } catch {
        if (isMounted) {
          setProfesionales([]);
          setCargandoLista(false);
        }
      }
    }

    if (metadata || (!categoria && !estado)) {
      cargarDirectorio();
    }

    return () => { isMounted = false; };
  }, [selectedCountry, metadata, resolvedCategory, resolvedState, searchTerm, activeNeighborhood, activeRating, activeSubcategory, categoria, estado, showCategoryGrid]);

  const cargarMas = useCallback(async () => {
    if (!selectedCountry || cargandoMas) return;
    setCargandoMas(true);
    try {
      const currentSkip = profesionales.length;
      let url = `${API_URL}/businesses/?skip=${currentSkip}&limit=10&country=${encodeURIComponent(selectedCountry)}`;
      if (resolvedCategory && resolvedCategory !== 'Todos') url += `&category=${encodeURIComponent(resolvedCategory)}`;
      if (resolvedState && resolvedState !== 'Todas') url += `&state=${encodeURIComponent(resolvedState)}`;
      if (activeNeighborhood && activeNeighborhood !== 'Todas') url += `&neighborhood=${encodeURIComponent(activeNeighborhood)}`;
      if (activeSubcategory && activeSubcategory !== 'Todas') url += `&subcategory=${encodeURIComponent(activeSubcategory)}`;
      if (activeRating && activeRating !== 'Todos') url += `&rating=${encodeURIComponent(activeRating)}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

      const res = await fetch(url);
      const data = await res.json();

      setProfesionales(prev => {
        const existingSlugs = new Set(prev.map(p => p.slug));
        const newItems = data.filter(p => !existingSlugs.has(p.slug));
        return [...prev, ...newItems];
      });
      setHayMas(data.length === 10);
    } catch (err) {
      console.error(err);
    } finally {
      setCargandoMas(false);
    }
  }, [
    selectedCountry, cargandoMas, profesionales.length, resolvedCategory,
    resolvedState, activeNeighborhood, activeSubcategory, activeRating, searchTerm
  ]);

  const observer = useRef(null);
  const lastElementRef = useCallback((node) => {
    if (cargandoLista || cargandoMas || !hayMas) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        cargarMas();
      }
    });

    if (node) observer.current.observe(node);
  }, [cargandoLista, cargandoMas, hayMas, cargarMas]);

  return {
    profesionales,
    setProfesionales,
    metadata,
    cargandoLista,
    hayMas,
    cargandoMas,
    selectedCountry,
    setSelectedCountry,
    userCoords,
    lastElementRef
  };
}
