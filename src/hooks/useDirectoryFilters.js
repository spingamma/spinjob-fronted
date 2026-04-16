// Archivo: src/hooks/useDirectoryFilters.js
import { useState, useMemo, useCallback, useEffect } from 'react';

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
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeState, setActiveState] = useState('Todas');
  const [activeNeighborhood, setActiveNeighborhood] = useState('Todas');
  const [activeRating, setActiveRating] = useState('Todos');
  const [activeSubcategory, setActiveSubcategory] = useState('Todas');
  const [openDropdown, setOpenDropdown] = useState(null); // 'category', 'location', 'rating', 'subcategory'
  const [catSearch, setCatSearch] = useState('');
  const [locSearch, setLocSearch] = useState('');
  const [subSearch, setSubSearch] = useState('');

  const handleCleanFilters = useCallback(() => {
    setActiveCategory('Todos');
    setActiveSubcategory('Todas');
    setActiveState('Todas');
    setActiveNeighborhood('Todas');
    setActiveRating('Todos');
    setSearchTerm('');
  }, []);

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
    if (type === 'category') {
      setActiveCategory(value);
      setActiveSubcategory(subValue || 'Todas');
    }
    if (type === 'subcategory') {
      setActiveSubcategory(value);
    }
    if (type === 'location') {
      setActiveState(value);
      setActiveNeighborhood(subValue || 'Todas');
    }
    if (type === 'rating') setActiveRating(value);
    setOpenDropdown(null);
    setCatSearch('');
    setLocSearch('');
    setSubSearch('');
  }, []);

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
