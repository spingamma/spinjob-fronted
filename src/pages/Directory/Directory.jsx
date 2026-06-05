// Archivo: src/pages/Directory/Directory.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import AuthModal from '../../components/AuthModal';
import BottomNavbar from '../../components/BottomNavbar';
import DirectoryFilterBar from '../../components/DirectoryFilterBar';
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
      try { return JSON.parse(stored).nombre; } catch(e) { return ''; }
    }
    return '';
  });
  
  const [isAdmin, setIsAdmin] = useState(() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try { 
        const parsed = JSON.parse(stored);
        return parsed.is_admin === true || parsed.is_vendedor === true; 
      } catch(e) { return false; }
    }
    return false;
  });
  
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingSlug, setPendingSlug] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // --- Infinite Scroll State ---
  const observer = useRef(null);

  // Hook para detectar Mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filterHook = useDirectoryFilters(profesionales, metadata);
  const { activeCategory, activeState, searchTerm, activeNeighborhood, activeRating, activeSubcategory } = filterHook.states;

  // 1. Fetch Metadata (Dropdown options)
  useEffect(() => {
    let isMounted = true;
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

    async function cargarMetadata() {
      try {
        const res = await fetch(`${API_URL}/businesses/metadata`);
        if (!res.ok) throw new Error("Error en red");
        const data = await res.json();
        if (isMounted) setMetadata(data);
      } catch (err) {
        console.error("Error loading metadata", err);
      }
    }
    cargarMetadata();
    return () => { isMounted = false; };
  }, []);

  // 2. Fetch Directory List based on Backend Filtering
  useEffect(() => {
    let isMounted = true;
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

    async function cargarDirectorio() {
      setCargandoLista(true);
      try {
        let url = `${API_URL}/businesses/?skip=0&limit=10`;
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
  }, [metadata, activeCategory, activeState, searchTerm, activeNeighborhood, activeRating, activeSubcategory, categoria, estado]);

  const cargarMas = async () => {
    setCargandoMas(true);
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    try {
      const currentSkip = profesionales.length;
      let url = `${API_URL}/businesses/?skip=${currentSkip}&limit=10`;
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
    if (pendingSlug) {
      navigate(`/perfil/${pendingSlug}`);
      setPendingSlug(null);
    }
  };

  const handleCardClick = (slug) => {
    setPendingSlug(slug);
    setAuthModalOpen(true);
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
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E3D51] font-sans pb-12 antialiased selection:bg-[#F67927] selection:text-white relative">
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
      />

      {/* BARRA DE FILTROS PREMIUM CUSTOM */}
      <DirectoryFilterBar 
        isMobile={isMobile}
        states={filterHook.states}
        setters={filterHook.setters}
        computed={filterHook.computed}
        actions={filterHook.actions}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <h1 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Directorio de Profesionales</h1>
        {cargandoLista && profesionales.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#F67927] mb-4"></div>
            <p className="text-[#1E3D51] font-bold text-lg mb-2">Cargando profesionales...</p>
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
                      onCardClick={handleCardClick}
                    />
                  </div>
                );
              })}
            </div>
            {/* Loading Indicator for Infinite Scroll */}
            {cargandoMas && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F67927]"></div>
              </div>
            )}
            
            {/* Empty State */}
            {!cargandoLista && visibleProfessionals.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                <p>No se encontraron profesionales con estos filtros.</p>
                <button 
                  onClick={filterHook.actions.handleCleanFilters}
                  className="mt-4 text-[#F67927] font-bold hover:underline"
                >
                  Limpiar filtros
                </button>
              </div>
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
