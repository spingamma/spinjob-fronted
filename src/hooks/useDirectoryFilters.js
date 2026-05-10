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

export function useDirectoryFilters(professionals = []) {
  const { categoria, estado } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [openDropdown, setOpenDropdown] = useState(null); // 'category', 'location', 'rating', 'subcategory'
  const [catSearch, setCatSearch] = useState('');
  const [locSearch, setLocSearch] = useState('');
  const [subSearch, setSubSearch] = useState('');

  // Extract base lists
  const groupedCategories = useMemo(() => {
    const catsFromDB = [...new Set(professionals.map(p => p.category).filter(isValidValue))].sort();
    return catsFromDB.map(c => {
      const subs = [...new Set(professionals.filter(p => p.category === c).map(p => p.subcategory).filter(isValidValue))].sort();
      return { category: c, subcategories: subs };
    });
  }, [professionals]);

  const groupedLocations = useMemo(() => {
    const statesFromDB = [...new Set(professionals.map(p => p.state).filter(isValidValue))].sort();
    return statesFromDB.map(s => {
      const neighs = [...new Set(professionals.filter(p => p.state === s).map(p => p.neighborhood).filter(isValidValue))].sort();
      return { state: s, neighborhoods: neighs };
    });
  }, [professionals]);

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

  // State update helpers
  const updateSearchParams = useCallback((newParams) => {
    const currentParams = Object.fromEntries([...searchParams]);
    const merged = { ...currentParams, ...newParams };
    
    if (!merged.buscar) delete merged.buscar;
    if (!merged.barrio || merged.barrio === 'Todas') delete merged.barrio;
    if (!merged.rating || merged.rating === 'Todos') delete merged.rating;
    if (!merged.subcategoria || merged.subcategoria === 'Todas') delete merged.subcategoria;

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
        const matchSubcategory = activeSubcategory === 'Todas' || p.subcategory === activeSubcategory;
        
        let matchRating = true;
        if (activeRating === '5 Estrellas') matchRating = (p.rating || 0) >= 5;
        else if (activeRating === '4+ Estrellas') matchRating = (p.rating || 0) >= 4;
        else if (activeRating === '3+ Estrellas') matchRating = (p.rating || 0) >= 3;

        return matchCategory && matchSearch && matchState && matchNeighborhood && matchRating && matchSubcategory;
      })
      .sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }, [professionals, activeCategory, searchTerm, activeState, activeNeighborhood, activeSubcategory, activeRating]);

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
