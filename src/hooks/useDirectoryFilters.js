// Archivo: src/hooks/useDirectoryFilters.js
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { slugify, matchSlugToName } from '../utils/slugs';

const normalizeText = (text) => {
  if (!text) return '';
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

const isValidValue = (val) => {
  if (!val) return false;
  const normalized = val.toString().trim().toLowerCase();
  return !['n/a', 'na', 'null', 'undefined', 'ninguno', 'ninguna', '-', 'none'].includes(normalized);
};

export function useDirectoryFilters(professionals = [], metadataOverride = null, userCoords = null) {
  const { categoria, estado } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [openDropdown, setOpenDropdown] = useState(null); // 'category', 'location', 'rating', 'subcategory'
  const [catSearch, setCatSearch] = useState('');
  const [locSearch, setLocSearch] = useState('');
  const [subSearch, setSubSearch] = useState('');

  // Extract base lists
  const groupedCategories = useMemo(() => {
    if (metadataOverride?.groupedCategories) return metadataOverride.groupedCategories;
    const catsFromDB = [...new Set(professionals.map(p => p.category).filter(isValidValue))].sort();
    return catsFromDB.map(c => {
      const allSubs = professionals
        .filter(p => p.category === c)
        .flatMap(p => {
          try {
            const parsed = JSON.parse(p.subcategories || '[]');
            return parsed.length > 0 ? parsed : (p.subcategory ? [p.subcategory] : []);
          } catch { return p.subcategory ? [p.subcategory] : (p.subcategories ? [p.subcategories] : []); }
        })
        .filter(isValidValue);
      const subs = [...new Set(allSubs)].sort();
      return { category: c, subcategories: subs };
    });
  }, [professionals, metadataOverride]);

  const groupedLocations = useMemo(() => {
    if (metadataOverride?.groupedLocations) return metadataOverride.groupedLocations;
    const statesFromDB = [...new Set(professionals.map(p => p.state).filter(isValidValue))].sort();
    return statesFromDB.map(s => {
      const neighs = [...new Set(professionals.filter(p => p.state === s).map(p => p.neighborhood).filter(isValidValue))].sort();
      return { state: s, neighborhoods: neighs };
    });
  }, [professionals, metadataOverride]);

  // Compute active values from URL
  const activeCategory = useMemo(() => {
    const cats = groupedCategories.map(g => g.category);
    return matchSlugToName(categoria, cats, 'Todos');
  }, [categoria, groupedCategories]);

  const activeState = useMemo(() => {
    const states = groupedLocations.map(g => g.state);
    return matchSlugToName(estado, states, 'Todas');
  }, [estado, groupedLocations]);

  // Read other filters from search parameters
  const searchTerm = searchParams.get('buscar') || '';
  const activeNeighborhood = searchParams.get('barrio') || 'Todas';
  const activeRating = searchParams.get('rating') || 'Todos';
  const activeSubcategory = searchParams.get('subcategoria') || 'Todas';
  const activeDistance = searchParams.get('distancia') || 'Todos';

  // State update helpers
  const updateSearchParams = useCallback((newParams) => {
    const currentParams = Object.fromEntries([...searchParams]);
    const merged = { ...currentParams, ...newParams };
    
    if (!merged.buscar) delete merged.buscar;
    if (!merged.barrio || merged.barrio === 'Todas') delete merged.barrio;
    if (!merged.rating || merged.rating === 'Todos') delete merged.rating;
    if (!merged.subcategoria || merged.subcategoria === 'Todas') delete merged.subcategoria;
    if (!merged.distancia || merged.distancia === 'Todos') delete merged.distancia;

    setSearchParams(merged);
  }, [searchParams, setSearchParams]);

  const setSearchTerm = useCallback((val) => {
    updateSearchParams({ buscar: val });
  }, [updateSearchParams]);

  const handleCleanFilters = useCallback(() => {
    setSearchParams({});
    navigate('/');
  }, [navigate, setSearchParams]);

  // Dropdown Filtering Logic
  const filteredGroupedCategories = useMemo(() => {
    const search = normalizeText(catSearch);
    if (!search) return groupedCategories;
    return groupedCategories.map(group => {
      const matchCategory = normalizeText(group.category).includes(search);
      const filteredSubs = group.subcategories.filter(sub => normalizeText(sub).includes(search));
      if (matchCategory || filteredSubs.length > 0) {
        return { ...group, subcategories: filteredSubs };
      }
      return null;
    }).filter(Boolean);
  }, [groupedCategories, catSearch]);

  const filteredGroupedLocations = useMemo(() => {
    const search = normalizeText(locSearch);
    if (!search) return groupedLocations;
    return groupedLocations.map(group => {
      const matchState = normalizeText(group.state).includes(search);
      const filteredNeighs = group.neighborhoods.filter(n => normalizeText(n).includes(search));
      if (matchState || filteredNeighs.length > 0) {
        return { ...group, neighborhoods: filteredNeighs };
      }
      return null;
    }).filter(Boolean);
  }, [groupedLocations, locSearch]);

  // Final Directory Filtering
  const filteredProfessionals = useMemo(() => {
    return professionals
      .filter(p => {
        const matchCategory = activeCategory === 'Todos' || p.category === activeCategory;
        const searchNormalized = normalizeText(searchTerm);
        const matchSearch = normalizeText(p.name).includes(searchNormalized) || 
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
  }, [professionals, activeCategory, searchTerm, activeState, activeNeighborhood, activeSubcategory, activeRating, activeDistance, userCoords]);

  // Interactions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.custom-dropdown')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const toggleDropdown = useCallback((id) => {
    const isNowOpen = openDropdown !== id;
    setOpenDropdown(isNowOpen ? id : null);
    if (!isNowOpen) {
      setCatSearch('');
      setLocSearch('');
      setSubSearch('');
    }
  }, [openDropdown]);

  const handleSelectOption = useCallback((type, value, subValue = null) => {
    const currentParams = Object.fromEntries([...searchParams]);

    if (type === 'category') {
      const slugCat = value === 'Todos' ? '' : slugify(value);
      const currentLocSlug = estado || '';
      
      let url = '/';
      if (slugCat) {
        url = `/directorio/${slugCat}`;
        if (currentLocSlug) url += `/${currentLocSlug}`;
      } else if (currentLocSlug) {
        url = `/directorio/todos/${currentLocSlug}`;
      }

      if (subValue && subValue !== 'Todas') {
        currentParams.subcategoria = subValue;
      } else {
        delete currentParams.subcategoria;
      }
      
      const newSearch = new URLSearchParams(currentParams).toString();
      navigate({ pathname: url, search: newSearch ? `?${newSearch}` : '' });
    }
    else if (type === 'subcategory') {
      currentParams.subcategoria = value;
      const newSearch = new URLSearchParams(currentParams).toString();
      setSearchParams(newSearch);
    }
    else if (type === 'location') {
      const currentCatSlug = categoria || 'todos';
      const slugLoc = value === 'Todas' ? '' : slugify(value);
      
      let url = '/';
      if (slugLoc) {
        url = `/directorio/${currentCatSlug}/${slugLoc}`;
      } else if (currentCatSlug !== 'todos') {
        url = `/directorio/${currentCatSlug}`;
      }

      if (subValue && subValue !== 'Todas') {
        currentParams.barrio = subValue;
      } else {
        delete currentParams.barrio;
      }
      
      const newSearch = new URLSearchParams(currentParams).toString();
      navigate({ pathname: url, search: newSearch ? `?${newSearch}` : '' });
    }
    else if (type === 'rating') {
      currentParams.rating = value;
      const newSearch = new URLSearchParams(currentParams).toString();
      setSearchParams(newSearch);
    }
    else if (type === 'distance') {
      currentParams.distancia = value;
      const newSearch = new URLSearchParams(currentParams).toString();
      setSearchParams(newSearch);
    }
    
    setOpenDropdown(null);
    setCatSearch('');
    setLocSearch('');
    setSubSearch('');
  }, [categoria, estado, navigate, searchParams, setSearchParams]);

  const activeCategoryData = useMemo(() => {
    return groupedCategories.find(g => g.category === activeCategory);
  }, [groupedCategories, activeCategory]);

  const currentSubcategories = activeCategoryData ? activeCategoryData.subcategories : [];
  
  const filteredSubcategories = useMemo(() => {
    const search = normalizeText(subSearch);
    if (!search) return currentSubcategories;
    return currentSubcategories.filter(sub => normalizeText(sub).includes(search));
  }, [currentSubcategories, subSearch]);

  return {
    states: {
      activeCategory,
      searchTerm,
      activeState,
      activeNeighborhood,
      activeRating,
      activeSubcategory,
      activeDistance,
      openDropdown,
      catSearch,
      locSearch,
      subSearch
    },
    setters: {
      setSearchTerm,
      setCatSearch,
      setLocSearch,
      setSubSearch
    },
    computed: {
      filteredProfessionals,
      filteredGroupedCategories,
      filteredGroupedLocations,
      filteredSubcategories
    },
    actions: {
      handleCleanFilters,
      toggleDropdown,
      handleSelectOption
    }
  };
}
