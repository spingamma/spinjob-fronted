import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryFeedSection from '../../../components/DirectoryFeed/CategoryFeedSection';

export default function DirectoryResultsView({
  verTodos,
  searchTerm,
  handleCleanFilters,
  cargandoLista,
  profesionales,
  visibleProfessionals = [],
  lastElementRef,
  isLoggedIn,
  handleCardClick,
  cargandoMas
}) {
  const navigate = useNavigate();

  const handleBusinessClick = (slug) => {
    if (isLoggedIn) {
      navigate(`/perfil/${slug}`);
    } else if (handleCardClick) {
      handleCardClick(slug);
    } else {
      navigate(`/perfil/${slug}`);
    }
  };

  const handleProductClick = (product, slug) => {
    if (isLoggedIn) {
      navigate(`/perfil/${slug}?product=${product.id}`);
    } else if (handleCardClick) {
      handleCardClick(slug);
    } else {
      navigate(`/perfil/${slug}?product=${product.id}`);
    }
  };

  // Agrupamos los negocios visibles por categoría/especialidad
  const groupedCategories = useMemo(() => {
    const groups = {};
    (visibleProfessionals || []).forEach((prof) => {
      const cat = prof.category || 'General';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(prof);
    });
    return groups;
  }, [visibleProfessionals]);

  const categoryNames = Object.keys(groupedCategories);

  return (
    <div data-testid="directory-feed-view" className="w-full">
      {/* Barra de cabecera con filtros activos / volver */}
      {(verTodos || searchTerm) && (
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
          <h3 className="text-base sm:text-lg font-bold text-primary">
            {searchTerm ? (
              <span>Resultados para &quot;<span className="text-secondary">{searchTerm}</span>&quot;</span>
            ) : (
              'Todos los negocios y menús'
            )}
          </h3>
          <button
            type="button"
            data-testid="back-to-categories-btn"
            onClick={handleCleanFilters}
            className="text-xs sm:text-sm font-bold text-secondary hover:text-secondary/80 transition-colors flex items-center gap-1 focus:outline-hidden cursor-pointer"
          >
            ← Volver a categorías
          </button>
        </div>
      )}

      {/* Spinner de carga inicial */}
      {cargandoLista && profesionales.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-secondary mb-4"></div>
          <p className="text-primary font-bold text-lg mb-2">Cargando menús y negocios...</p>
        </div>
      ) : (
        <>
          {/* Feed vertical por Especialidad/Categoría */}
          {categoryNames.map((catName, catIndex) => {
            const isLastCategory = catIndex === categoryNames.length - 1;
            const businessesInCat = groupedCategories[catName];

            return (
              <div
                key={catName}
                ref={isLastCategory ? lastElementRef : null}
              >
                <CategoryFeedSection
                  category={catName}
                  businesses={businessesInCat}
                  index={catIndex}
                  onBusinessClick={handleBusinessClick}
                  onProductClick={handleProductClick}
                />
              </div>
            );
          })}

          {/* Loading Indicator for Infinite Scroll */}
          {cargandoMas && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
            </div>
          )}

          {/* Empty State */}
          {!cargandoLista && visibleProfessionals.length === 0 && (
            <div className="text-center py-20 text-gray-500 bg-white rounded-3xl border border-gray-100 p-8 shadow-xs">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                🍽️
              </div>
              <p className="font-bold text-primary text-base mb-1">No se encontraron negocios con estos filtros.</p>
              <p className="text-sm text-gray-400">Intenta probar con otra categoría o ubicación.</p>
              <button
                type="button"
                data-testid="clear-filters-empty-btn"
                onClick={handleCleanFilters}
                className="mt-5 px-5 py-2.5 bg-secondary text-white rounded-xl text-sm font-bold hover:bg-secondary/90 transition-all shadow-xs cursor-pointer"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
