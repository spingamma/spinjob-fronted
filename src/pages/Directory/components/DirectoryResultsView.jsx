import ProfessionalCard from '../../../components/ProfessionalCard';

export default function DirectoryResultsView({
  verTodos,
  searchTerm,
  handleCleanFilters,
  cargandoLista,
  profesionales,
  visibleProfessionals,
  lastElementRef,
  isLoggedIn,
  isAdmin,
  handleCardClick,
  userCoords,
  isMobile,
  cargandoMas
}) {
  return (
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
            data-testid="back-to-categories-btn"
            onClick={handleCleanFilters}
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
                data-testid="clear-filters-empty-btn"
                onClick={handleCleanFilters}
                className="mt-4 text-[#F9842C] font-bold hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
