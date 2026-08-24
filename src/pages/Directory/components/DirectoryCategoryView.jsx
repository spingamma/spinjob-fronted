import CategoryGrid from '../../../components/CategoryGrid';

export default function DirectoryCategoryView({ 
  isLoggedIn, 
  userName, 
  metadata, 
  setSearchParams, 
  handleSelectCategory 
}) {
  return (
    <>
      <div className="flex justify-between items-center mb-6 w-full gap-4">
        <h2 className="text-base md:text-lg font-bold text-accent leading-tight">
          {isLoggedIn && userName ? (
            <>
              <span className="text-primary">{userName}</span> qué visitaremos hoy?
            </>
          ) : (
            "Qué visitaremos hoy?"
          )}
        </h2>
        {metadata && (
          <button
            onClick={() => setSearchParams({ ver: 'todos' })}
            data-testid="dir-view-all-button"
            className="px-2.5 py-1 bg-secondary hover:bg-secondary/90 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
          >
            Ver todos
          </button>
        )}
      </div>

      {!metadata ? (
        <div className="text-center py-20 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-secondary mb-4"></div>
          <p className="text-primary font-bold text-lg mb-2">Cargando categorías...</p>
        </div>
      ) : (
        <CategoryGrid
          categories={metadata.groupedCategories}
          onSelectCategory={handleSelectCategory}
        />
      )}
    </>
  );
}
