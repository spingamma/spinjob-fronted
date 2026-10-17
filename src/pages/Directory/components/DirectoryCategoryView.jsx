import { Download } from 'lucide-react';
import CategoryGrid from '../../../components/CategoryGrid';
import { usePwaInstall } from '../../../hooks/usePwaInstall';

export default function DirectoryCategoryView({ 
  isLoggedIn, 
  userName, 
  metadata, 
  setSearchParams, 
  handleSelectCategory 
}) {
  const { isStandalone, handleInstallClick } = usePwaInstall();

  return (
    <>
      <div className="flex justify-between items-center mb-4 w-full gap-4">
        <h2 className="text-base md:text-lg font-bold text-accent leading-tight">
          {isLoggedIn && userName ? (
            <>
              ¡Hola <span className="text-primary">{userName.split(' ')[0]}</span>! 👋 qué visitaremos hoy?
            </>
          ) : (
            "¡Hola! 👋 qué visitaremos hoy?"
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

      {!isStandalone && (
        <div className="mb-6 w-full">
          <button
            onClick={handleInstallClick}
            data-testid="download-app-btn"
            className="w-full flex items-center justify-center gap-2.5 bg-secondary hover:bg-secondary/90 text-white font-bold text-sm sm:text-base py-3 px-5 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
          >
            <Download size={20} className="shrink-0" />
            <span>Descarga la aplicación</span>
          </button>
        </div>
      )}

      {!metadata ? (
        <div className="text-center py-20 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-secondary mb-4"></div>
          <p className="text-primary font-bold text-lg mb-2">Cargando categorías...</p>
        </div>
      ) : (
        <CategoryGrid
          categories={metadata.groupedCategories}
          adminBusiness={metadata.admin_business}
          onSelectCategory={handleSelectCategory}
        />
      )}
    </>
  );
}
