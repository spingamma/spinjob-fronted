import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { slugify, matchSlugToName } from '../utils/slugs';
import { useCategoriesData } from './directory/useCategoriesData';
import { useLocationsData } from './directory/useLocationsData';
import { useProfessionalsFilter } from './directory/useProfessionalsFilter';

export function useDirectoryFilters(professionals = [], metadataOverride = null, userCoords = null, options = {}) {
  const { serverFiltered = false } = options;
  const { categoria, estado } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [openDropdown, setOpenDropdown] = useState(null); 
  const [catSearch, setCatSearch] = useState('');
  const [locSearch, setLocSearch] = useState('');
  const [subSearch, setSubSearch] = useState('');

  const searchTerm = searchParams.get('buscar') || '';
  const activeNeighborhood = searchParams.get('barrio') || 'Todas';
  const activeRating = searchParams.get('rating') || 'Todos';
  const activeSubcategory = searchParams.get('subcategoria') || 'Todas';
  const activeDistance = searchParams.get('distancia') || 'Todos';

  const { groupedLocations, filteredGroupedLocations } = useLocationsData(professionals, metadataOverride, locSearch);
  const activeState = useMemo(() => matchSlugToName(estado, groupedLocations.map(g => g.state), 'Todas'), [estado, groupedLocations]);

  // We need groupedCategories first to compute activeCategory
  const activeCategory = useMemo(() => {
    const catsFromMetadata = metadataOverride?.groupedCategories || [];
    let cats = catsFromMetadata.map(g => g.category);
    if (!metadataOverride) {
       cats = [...new Set(professionals.map(p => p.category))];
    }
    return matchSlugToName(categoria, cats, 'Todos');
  }, [categoria, professionals, metadataOverride]);

  const { filteredGroupedCategories, filteredSubcategories } = useCategoriesData(
    professionals, metadataOverride, catSearch, subSearch, activeCategory
  );

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

  const setSearchTerm = useCallback((val) => updateSearchParams({ buscar: val }), [updateSearchParams]);
  const handleCleanFilters = useCallback(() => { setSearchParams({}); navigate('/'); }, [navigate, setSearchParams]);

  const { filteredProfessionals } = useProfessionalsFilter({
    professionals, activeCategory, searchTerm, activeState, activeNeighborhood,
    activeSubcategory, activeRating, activeDistance, userCoords, serverFiltered
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.custom-dropdown')) setOpenDropdown(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const toggleDropdown = useCallback((id) => {
    const isNowOpen = openDropdown !== id;
    setOpenDropdown(isNowOpen ? id : null);
    if (!isNowOpen) { setCatSearch(''); setLocSearch(''); setSubSearch(''); }
  }, [openDropdown]);

  const handleSelectOption = useCallback((type, value, subValue = null) => {
    const currentParams = Object.fromEntries([...searchParams]);

    if (type === 'category') {
      const slugCat = value === 'Todos' ? '' : slugify(value);
      const currentLocSlug = estado || '';
      let url = '/';
      if (slugCat) url = `/directorio/${slugCat}${currentLocSlug ? `/${currentLocSlug}` : ''}`;
      else if (currentLocSlug) url = `/directorio/todos/${currentLocSlug}`;

      if (subValue && subValue !== 'Todas') currentParams.subcategoria = subValue;
      else delete currentParams.subcategoria;
      
      const newSearch = new URLSearchParams(currentParams).toString();
      navigate({ pathname: url, search: newSearch ? `?${newSearch}` : '' });
    }
    else if (type === 'subcategory') {
      currentParams.subcategoria = value;
      setSearchParams(new URLSearchParams(currentParams).toString());
    }
    else if (type === 'location') {
      const currentCatSlug = categoria || 'todos';
      const slugLoc = value === 'Todas' ? '' : slugify(value);
      let url = '/';
      if (slugLoc) url = `/directorio/${currentCatSlug}/${slugLoc}`;
      else if (currentCatSlug !== 'todos') url = `/directorio/${currentCatSlug}`;

      if (subValue && subValue !== 'Todas') currentParams.barrio = subValue;
      else delete currentParams.barrio;
      
      const newSearch = new URLSearchParams(currentParams).toString();
      navigate({ pathname: url, search: newSearch ? `?${newSearch}` : '' });
    }
    else if (type === 'rating') {
      currentParams.rating = value;
      setSearchParams(new URLSearchParams(currentParams).toString());
    }
    else if (type === 'distance') {
      currentParams.distancia = value;
      setSearchParams(new URLSearchParams(currentParams).toString());
    }
    
    setOpenDropdown(null);
    setCatSearch(''); setLocSearch(''); setSubSearch('');
  }, [categoria, estado, navigate, searchParams, setSearchParams]);

  return {
    states: {
      activeCategory, searchTerm, activeState, activeNeighborhood, activeRating,
      activeSubcategory, activeDistance, openDropdown, catSearch, locSearch, subSearch
    },
    setters: { setSearchTerm, setCatSearch, setLocSearch, setSubSearch },
    computed: { filteredProfessionals, filteredGroupedCategories, filteredGroupedLocations, filteredSubcategories },
    actions: { handleCleanFilters, toggleDropdown, handleSelectOption }
  };
}
