// Archivo: src/pages/Directory/Directory.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Header from '../../components/Header';
import CountryModal from '../../components/CountryModal';
import AuthModal from '../../components/AuthModal';
import BottomNavbar from '../../components/BottomNavbar';
import DirectoryFilterBar from '../../components/DirectoryFilterBar';
import CategoryGrid from '../../components/CategoryGrid';
import ProfessionalCard from '../../components/ProfessionalCard';
import { useDirectoryFilters } from '../../hooks/useDirectoryFilters';
import SeoMeta from '../../components/SeoMeta';

export default function Directory() {
  const [profesionales, setProfesionales] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [hayMas, setHayMas] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const navigate = useNavigate();
  const { categoria, estado } = useParams();

  // Estados de Autenticación
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('spingamma_user') !== null);
  const [userName, setUserName] = useState(() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try { return JSON.parse(stored).nombre; } catch (e) { return ''; }
    }
    return '';
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.is_admin === true || parsed.is_vendedor === true;
      } catch (e) { return false; }
    }
    return false;
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingSlug, setPendingSlug] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const getCountryFromCoords = (lat, lng) => {
    if (lat >= -56 && lat <= -21 && lng >= -74 && lng <= -53) return 'Argentina';
    if (lat >= -23 && lat <= -9 && lng >= -70 && lng <= -57) return 'Bolivia';
    if (lat >= -19 && lat <= 0 && lng >= -82 && lng <= -68) return 'Perú';
    if (lat >= -4.5 && lat <= 13 && lng >= -79 && lng <= -66) return 'Colombia';
    return null;
  };

  const [selectedCountry, setSelectedCountry] = useState(() => {
    const userStr = localStorage.getItem('spingamma_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.country) return user.country;
      } catch (e) {}
    }
    const saved = localStorage.getItem('spingamma_selected_country');
    if (saved) return saved;

    // Detect country by timezone
    let detected = 'Bolivia';
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.includes('La_Paz')) detected = 'Bolivia';
      else if (tz.includes('Bogota')) detected = 'Colombia';
      else if (tz.includes('Lima')) detected = 'Perú';
      else if (tz.includes('Argentina') || tz.includes('Buenos_Aires') || tz.includes('Cordoba') || tz.includes('Mendoza')) detected = 'Argentina';
    } catch (e) {}

    localStorage.setItem('spingamma_selected_country', detected);
    return detected;
  });

  // Geolocation cache for calculating distances to businesses
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

          // Detect country from coords if not manually selected yet
          const hasSaved = localStorage.getItem('spingamma_selected_country');
          if (!hasSaved) {
            const detected = getCountryFromCoords(coords.lat, coords.lng);
            if (detected) {
              setSelectedCountry(detected);
              localStorage.setItem('spingamma_selected_country', detected);
            }
          }
        },
        (error) => {
          // Geolocalización opcional o denegada
        },
        { enableHighAccuracy: false, timeout: 8000 }
      );
    }
  }, [userCoords]);

  // --- Infinite Scroll State ---
  const observer = useRef(null);

  // Hook para detectar Mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filterHook = useDirectoryFilters(profesionales, metadata, userCoords);
  const { activeCategory, activeState, searchTerm, activeNeighborhood, activeRating, activeSubcategory } = filterHook.states;
  const [searchParams, setSearchParams] = useSearchParams();
  const verTodos = searchParams.get('ver') === 'todos';

  // Determine if we should show the category grid (home state)
  const showCategoryGrid = activeCategory === 'Todos' && !searchTerm && !verTodos;

  // 1. Fetch Metadata (Dropdown options)
  useEffect(() => {
    if (!selectedCountry) return;
    let isMounted = true;
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

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
  // Skip fetch when showing the category grid (no category selected & no search)
  useEffect(() => {
    if (!selectedCountry) return;
    // If showing category grid, clear professionals and skip fetch
    if (showCategoryGrid) {
      setProfesionales([]);
      setCargandoLista(false);
      return;
    }

    let isMounted = true;
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

    async function cargarDirectorio() {
      setCargandoLista(true);
      try {
        let url = `${API_URL}/businesses/?skip=0&limit=10&country=${encodeURIComponent(selectedCountry)}`;
        if (activeCategory && activeCategory !== 'Todos') url += `&category=${encodeURIComponent(activeCategory)}`;
        if (activeState && activeState !== 'Todas') url += `&state=${encodeURIComponent(activeState)}`;
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
      } catch (err) {
        if (isMounted) {
          setProfesionales([]);
          setCargandoLista(false);
        }
      }
    }

    // Si no hay slugs en la URL, podemos hacer el fetch en paralelo con la metadata. 
    // Si hay slugs, DEBEMOS esperar a la metadata para mapearlos correctamente.
    if (metadata || (!categoria && !estado)) {
      cargarDirectorio();
    }

    return () => { isMounted = false; };
  }, [selectedCountry, metadata, activeCategory, activeState, searchTerm, activeNeighborhood, activeRating, activeSubcategory, categoria, estado, showCategoryGrid]);

  const cargarMas = async () => {
    if (!selectedCountry) return;
    setCargandoMas(true);
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    try {
      const currentSkip = profesionales.length;
      let url = `${API_URL}/businesses/?skip=${currentSkip}&limit=10&country=${encodeURIComponent(selectedCountry)}`;
      if (activeCategory && activeCategory !== 'Todos') url += `&category=${encodeURIComponent(activeCategory)}`;
      if (activeState && activeState !== 'Todas') url += `&state=${encodeURIComponent(activeState)}`;
      if (activeNeighborhood && activeNeighborhood !== 'Todas') url += `&neighborhood=${encodeURIComponent(activeNeighborhood)}`;
      if (activeSubcategory && activeSubcategory !== 'Todas') url += `&subcategory=${encodeURIComponent(activeSubcategory)}`;
      if (activeRating && activeRating !== 'Todos') url += `&rating=${encodeURIComponent(activeRating)}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

      const res = await fetch(url);
      const data = await res.json();

      setProfesionales(prev => [...prev, ...data]);
      setHayMas(data.length === 10);
    } catch (err) {
      console.error(err);
    } finally {
      setCargandoMas(false);
    }
  };

  const categoryStr = filterHook.states.activeCategory !== 'Todos' ? filterHook.states.activeCategory : '';
  const stateStr = filterHook.states.activeState !== 'Todas' ? `en ${filterHook.states.activeState}` : '';

  let seoTitle = 'Tarjetoso | Directorio de Profesionales y Negocios en Bolivia';
  let seoDesc = 'Encuentra, contacta y califica a los mejores profesionales independientes y negocios locales de Bolivia. Tu directorio de tarjetas digitales profesionales.';

  if (categoryStr || stateStr) {
    seoTitle = `${categoryStr || 'Profesionales'} ${stateStr} | Tarjetoso`.trim();
    seoDesc = `Encuentra los mejores ${categoryStr ? categoryStr.toLowerCase() : 'profesionales'} ${stateStr} en Tarjetoso. Tu directorio de confianza.`.trim();
  }

  const handleLogout = () => {
    localStorage.removeItem('spingamma_user');
    setIsLoggedIn(false);
    setUserName('');
    setIsAdmin(false);
  };

  const handleRegisterSuccess = (formData) => {
    localStorage.setItem('spingamma_user', JSON.stringify(formData));
    setIsLoggedIn(true);
    setUserName(formData.nombre);
    setIsAdmin(formData.is_admin === true || formData.is_vendedor === true);
    setAuthModalOpen(false);
    
    if (formData.country) {
      setSelectedCountry(formData.country);
      localStorage.setItem('spingamma_selected_country', formData.country);
    }
    
    if (pendingSlug) {
      navigate(`/perfil/${pendingSlug}`);
      setPendingSlug(null);
    }
  };

  const handleCardClick = (slug) => {
    setPendingSlug(slug);
    setAuthModalOpen(true);
  };

  // --- Category Grid: select a category ---
  const handleSelectCategory = (categoryName) => {
    filterHook.actions.handleSelectOption('category', categoryName);
  };

  // --- Intersection Observer for Infinite Scroll ---
  const lastElementRef = useCallback((node) => {
    if (cargandoLista || cargandoMas || !hayMas) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        cargarMas();
      }
    });

    if (node) observer.current.observe(node);
  }, [cargandoLista, cargandoMas, hayMas]);

  // Usamos filteredProfessionals de todos modos por compatibilidad con el render
  const visibleProfessionals = filterHook.computed.filteredProfessionals;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A535C] font-sans pb-12 antialiased selection:bg-[#F9842C] selection:text-white relative">
      <SeoMeta
        title={categoryStr || stateStr ? `${categoryStr || 'Profesionales'} ${stateStr}` : null}
        description={seoDesc}
        url={window.location.href}
      />

      {/* HEADER GLOBAL */}
      <Header
        searchTerm={filterHook.states.searchTerm}
        setSearchTerm={filterHook.setters.setSearchTerm}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userName={userName}
        isUserMenuOpen={isUserMenuOpen}
        setIsUserMenuOpen={setIsUserMenuOpen}
        handleLogout={handleLogout}
        setAuthModalOpen={setAuthModalOpen}
        onHomeClick={filterHook.actions.handleCleanFilters}
        isMobile={isMobile}
        onLocationChange={(c) => setSelectedCountry(c)}
      />

      {/* FILTER BAR (only shows when category is selected) */}
      <DirectoryFilterBar
        isMobile={isMobile}
        states={filterHook.states}
        setters={filterHook.setters}
        computed={filterHook.computed}
        actions={filterHook.actions}
        userCoords={userCoords}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">

        {/* HOME STATE: Category Grid */}
        {showCategoryGrid ? (
          <>
            {/* Welcome Section / Header */}
            <div className="flex justify-between items-center mb-6 w-full gap-4">
              <h2 className="text-base md:text-lg font-bold text-[#6A431F] leading-tight">
                {isLoggedIn && userName ? (
                  <>
                    <span className="text-[#1A535C]">{userName}</span> qué visitaremos hoy?
                  </>
                ) : (
                  "Qué visitaremos hoy?"
                )}
              </h2>
              {metadata && (
                <button
                  onClick={() => setSearchParams({ ver: 'todos' })}
                  data-testid="dir-view-all-button"
                  className="px-2.5 py-1 bg-[#F9842C] hover:bg-[#e06516] text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
                >
                  Ver todos
                </button>
              )}
            </div>

            {!metadata ? (
              <div className="text-center py-20 flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#F9842C] mb-4"></div>
                <p className="text-[#1A535C] font-bold text-lg mb-2">Cargando categorías...</p>
              </div>
            ) : (
              <CategoryGrid
                categories={metadata.groupedCategories}
                onSelectCategory={handleSelectCategory}
              />
            )}
          </>
        ) : (
          /* FILTERED STATE: Professional Cards */
          <>
            {(verTodos || searchTerm) && (
              <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-base sm:text-lg font-bold text-[#1A535C]">
                  {searchTerm ? (
                    <span>Resultados para &quot;<span className="text-[#F9842C]">{searchTerm}</span>&quot;</span>
                  ) : (
                    'Todos los profesionales'
                  )}
                </h3>
                <button
                  onClick={filterHook.actions.handleCleanFilters}
                  className="text-xs sm:text-sm font-bold text-[#F9842C] hover:text-[#e06516] transition-colors flex items-center gap-1 focus:outline-none"
                >
                  ← Volver a categorías
                </button>
              </div>
            )}


            {cargandoLista && profesionales.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#F9842C] mb-4"></div>
                <p className="text-[#1A535C] font-bold text-lg mb-2">Cargando profesionales...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5">
                  {visibleProfessionals.map((prof, index) => {
                    const isLast = index === visibleProfessionals.length - 1;
                    return (
                      <div key={prof.slug} ref={isLast ? lastElementRef : null}>
                        <ProfessionalCard
                          professional={prof}
                          isLoggedIn={isLoggedIn}
                          isAdmin={isAdmin}
                          onCardClick={handleCardClick}
                          userCoords={userCoords}
                          isMobile={isMobile}
                        />
                      </div>
                    );
                  })}
                </div>
                {/* Loading Indicator for Infinite Scroll */}
                {cargandoMas && (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F9842C]"></div>
                  </div>
                )}

                {/* Empty State */}
                {!cargandoLista && visibleProfessionals.length === 0 && (
                  <div className="text-center py-20 text-[#757778]">
                    <p>No se encontraron profesionales con estos filtros.</p>
                    <button
                      onClick={filterHook.actions.handleCleanFilters}
                      className="mt-4 text-[#F9842C] font-bold hover:underline"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Spacer explícito para el BottomNavbar en móviles */}
        <div className="h-28 md:h-12 w-full shrink-0"></div>
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleRegisterSuccess}
      />



      {/* BARRA DE NAVEGACIÓN MOBILE */}
      <BottomNavbar
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        onHomeClick={filterHook.actions.handleCleanFilters}
      />
    </div>
  );
}
