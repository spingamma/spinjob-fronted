import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import AuthModal from '../../components/AuthModal';
import BottomNavbar from '../../components/BottomNavbar';
import DirectoryFilterBar from '../../components/DirectoryFilterBar';
import SeoMeta from '../../components/SeoMeta';

import { useDirectoryFilters } from '../../hooks/useDirectoryFilters';
import { useDirectoryAuth } from './hooks/useDirectoryAuth';
import { useDirectoryData } from './hooks/useDirectoryData';
import DirectoryCategoryView from './components/DirectoryCategoryView';
import DirectoryResultsView from './components/DirectoryResultsView';

export default function Directory() {
  const { categoria, estado } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const verTodos = searchParams.get('ver') === 'todos';
  const navigate = useNavigate();

  // 1. Hook de Autenticación
  const auth = useDirectoryAuth({
    onLocationChange: (c) => data.setSelectedCountry(c)
  });

  // Hook para detectar Mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. Setup preliminar para filtros
  const tempSearchTerm = searchParams.get('buscar') || '';
  const tempActiveCategory = categoria || 'Todos';

  const showCategoryGrid = tempActiveCategory === 'Todos' && !tempSearchTerm && !verTodos;

  // 3. Hook de Datos (Fetching & Geo)
  const data = useDirectoryData({
    activeCategory: tempActiveCategory,
    activeState: estado || 'Todas',
    searchTerm: tempSearchTerm,
    activeNeighborhood: searchParams.get('neighborhood') || 'Todas',
    activeRating: searchParams.get('rating') || 'Todos',
    activeSubcategory: searchParams.get('subcategory') || 'Todas',
    categoria,
    estado,
    showCategoryGrid
  });

  // 4. Hook de Filtros Locales y Computados
  const filterHook = useDirectoryFilters(data.profesionales, data.metadata, data.userCoords, { serverFiltered: true });
  const { activeCategory, activeState, searchTerm } = filterHook.states;

  const categoryStr = activeCategory !== 'Todos' ? activeCategory : '';
  const stateStr = activeState !== 'Todas' ? `en ${activeState}` : '';

  let seoDesc = 'Encuentra, contacta y califica a los mejores profesionales independientes y negocios locales de Bolivia. Tu directorio de tarjetas digitales profesionales.';
  if (categoryStr || stateStr) {
    seoDesc = `Encuentra los mejores ${categoryStr ? categoryStr.toLowerCase() : 'profesionales'} ${stateStr} en Tarjetoso. Tu directorio de confianza.`.trim();
  }

  // Interacción: Seleccionar Categoría desde la Grilla
  const handleSelectCategory = (categoryName) => {
    if (categoryName?.toLowerCase() === 'tarjetoso') {
      if (auth.isLoggedIn) {
        navigate('/perfil/spingamma');
      } else {
        auth.handleCardClick('spingamma');
      }
      return;
    }
    filterHook.actions.handleSelectOption('category', categoryName);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-primary font-sans pb-12 antialiased selection:bg-secondary selection:text-white relative">
      <SeoMeta
        title={categoryStr || stateStr ? `${categoryStr || 'Profesionales'} ${stateStr}` : null}
        description={seoDesc}
        url={window.location.href}
      />

      <Header
        searchTerm={searchTerm}
        setSearchTerm={filterHook.setters.setSearchTerm}
        isLoggedIn={auth.isLoggedIn}
        isAdmin={auth.isAdmin}
        userName={auth.userName}
        isUserMenuOpen={auth.isUserMenuOpen}
        setIsUserMenuOpen={auth.setIsUserMenuOpen}
        handleLogout={auth.handleLogout}
        setAuthModalOpen={auth.setAuthModalOpen}
        onHomeClick={filterHook.actions.handleCleanFilters}
        isMobile={isMobile}
        onLocationChange={(c) => data.setSelectedCountry(c)}
      />

      <DirectoryFilterBar
        isMobile={isMobile}
        states={filterHook.states}
        setters={filterHook.setters}
        computed={filterHook.computed}
        actions={filterHook.actions}
        userCoords={data.userCoords}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {showCategoryGrid ? (
          <DirectoryCategoryView
            isLoggedIn={auth.isLoggedIn}
            userName={auth.userName}
            metadata={data.metadata}
            setSearchParams={setSearchParams}
            handleSelectCategory={handleSelectCategory}
          />
        ) : (
          <DirectoryResultsView
            verTodos={verTodos}
            searchTerm={searchTerm}
            handleCleanFilters={filterHook.actions.handleCleanFilters}
            cargandoLista={data.cargandoLista}
            profesionales={data.profesionales}
            visibleProfessionals={filterHook.computed.filteredProfessionals}
            lastElementRef={data.lastElementRef}
            isLoggedIn={auth.isLoggedIn}
            isAdmin={auth.isAdmin}
            handleCardClick={auth.handleCardClick}
            userCoords={data.userCoords}
            isMobile={isMobile}
            cargandoMas={data.cargandoMas}
          />
        )}
        <div className="h-28 md:h-12 w-full shrink-0"></div>
      </main>

      <AuthModal
        isOpen={auth.authModalOpen}
        onClose={() => auth.setAuthModalOpen(false)}
        onSuccess={auth.handleRegisterSuccess}
      />

      <BottomNavbar
        isLoggedIn={auth.isLoggedIn}
        isAdmin={auth.isAdmin}
        onHomeClick={filterHook.actions.handleCleanFilters}
      />
    </div>
  );
}
