// Archivo: src/components/DirectoryFilterBar.jsx
import { useState, useEffect } from 'react';
import { LayoutGrid, X, ChevronDown, Search, LayoutList, MapPin, Star, Download } from 'lucide-react';

export default function DirectoryFilterBar({ 
  isMobile, 
  states, 
  setters, 
  computed, 
  actions 
}) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsStandalone(true);
      return;
    }
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setIsIOS(true);
    }
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      alert("Para instalar en iPhone/iPad: Toca el ícono 'Compartir' en Safari y selecciona 'Agregar a inicio'.");
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const {
    activeCategory, activeSubcategory, activeState, activeNeighborhood, activeRating,
    openDropdown, catSearch, locSearch, subSearch
  } = states;

  const {
    setCatSearch, setLocSearch, setSubSearch
  } = setters;

  const {
    filteredGroupedCategories, filteredSubcategories, filteredGroupedLocations
  } = computed;

  const {
    toggleDropdown, handleSelectOption
  } = actions;

  return (
    <div className="bg-white/70 backdrop-blur-md sticky top-16 md:top-20 z-30 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 md:py-4">
        <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-4">
          
          <div className={`grid w-full gap-2 md:gap-4 transition-all duration-300 ${
            activeCategory !== 'Todos' 
              ? (isMobile ? 'grid-cols-2' : 'grid-cols-4') 
              : (isMobile ? 'grid-cols-1' : 'grid-cols-3')
          }`}>
            
            {/* Categoría Principal */}
            <div className="flex flex-col gap-1 relative custom-dropdown">
              <label className="text-[10px] md:text-xs font-bold text-[#1D565F] uppercase tracking-widest ml-1 hidden sm:block">
                Categoría
              </label>
              <div className="flex gap-2">
                <div 
                  onClick={() => toggleDropdown('category')}
                  className={`flex-1 flex items-center bg-white border rounded-xl px-1.5 md:px-3 py-2.5 md:py-2.5 shadow-sm transition-all hover:bg-gray-50 group focus:outline-none cursor-pointer
                    ${openDropdown === 'category' ? 'border-[#1D565F] ring-1 ring-[#1D565F]/30' : 'border-gray-200'}
                  `}
                >
                  <LayoutGrid size={14} className={`mr-1 md:mr-2 flex-shrink-0 transition-colors ${openDropdown === 'category' ? 'text-[#1D565F]' : 'text-[#32698F]'}`} />
                  <span className="w-full text-left text-xs sm:text-sm text-[#1E3D51] font-extrabold truncate">
                    {activeCategory === 'Todos' ? 'Todas las Categorías' : activeCategory}
                  </span>
                  
                  {activeCategory !== 'Todos' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectOption('category', 'Todos');
                      }}
                      className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#1D565F] transition-colors ml-1"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <ChevronDown size={11} className={`text-gray-400 ml-0.5 md:ml-1 flex-shrink-0 transition-transform duration-300 ${openDropdown === 'category' ? 'rotate-180 text-[#1D565F]' : ''}`} />
                </div>

                {(!isStandalone && (deferredPrompt || isIOS)) && (
                  <button
                    onClick={handleInstallClick}
                    className="flex flex-col items-center justify-center bg-[#1D565F] hover:bg-[#123940] text-white rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 min-w-[70px] px-1.5 shrink-0"
                    title="Descargar App"
                  >
                    <Download size={16} className="mb-0.5" />
                    <span className="text-[9px] font-bold tracking-wider uppercase">Descargar</span>
                  </button>
                )}
              </div>

              {openDropdown === 'category' && (
                <div className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl z-50 py-2 w-[260px] md:w-full max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-2 sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-50 mb-1">
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus-within:ring-1 focus-within:ring-[#1D565F]/50">
                      <Search size={14} className="text-gray-400 mr-2" />
                      <input 
                        type="text"
                        placeholder="Buscar categoría..."
                        value={catSearch}
                        onChange={(e) => setCatSearch(e.target.value)}
                        className="w-full bg-transparent text-sm outline-none placeholder-gray-400"
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectOption('category', 'Todos')}
                    className={`w-full text-left px-5 py-3 text-sm font-extrabold transition-colors
                      ${activeCategory === 'Todos' ? 'bg-[#1D565F]/10 text-[#1D565F]' : 'text-[#1D565F] hover:bg-gray-50'}
                    `}
                  >
                    Mostrar todo
                  </button>
                  {filteredGroupedCategories.map(group => (
                    <button
                      key={group.category}
                      onClick={() => handleSelectOption('category', group.category)}
                      className={`w-full text-left px-5 py-2.5 text-sm font-bold transition-colors border-t border-gray-50/50
                        ${activeCategory === group.category ? 'text-[#1D565F] bg-teal-50/20' : 'text-[#1E3D51] hover:bg-gray-50'}
                      `}
                    >
                      {group.category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Subcategoría (Condicional) */}
            {activeCategory !== 'Todos' && (
              <div className="flex flex-col gap-1 relative custom-dropdown animate-in fade-in zoom-in-95 duration-300">
                <label className="text-[10px] md:text-xs font-bold text-[#1D565F] uppercase tracking-widest ml-1 hidden sm:block">
                  Subcategoría
                </label>
                <div 
                  onClick={() => toggleDropdown('subcategory')}
                  className={`flex items-center bg-white border rounded-xl px-1.5 md:px-3 py-2.5 md:py-2.5 shadow-sm transition-all hover:bg-gray-50 group focus:outline-none cursor-pointer
                    ${openDropdown === 'subcategory' ? 'border-[#1D565F] ring-1 ring-[#1D565F]/30' : 'border-gray-200'}
                  `}
                >
                  <LayoutList size={14} className={`mr-1 md:mr-2 flex-shrink-0 transition-colors ${openDropdown === 'subcategory' ? 'text-[#1D565F]' : 'text-[#32698F]'}`} />
                  <span className="w-full text-left text-xs sm:text-sm text-[#1E3D51] font-extrabold truncate">
                    {activeSubcategory === 'Todas' ? 'Todas las Subcategorías' : activeSubcategory}
                  </span>
                  {activeSubcategory !== 'Todas' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectOption('subcategory', 'Todas');
                      }}
                      className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#1D565F] transition-colors ml-1"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <ChevronDown size={11} className={`text-gray-400 ml-0.5 md:ml-1 flex-shrink-0 transition-transform duration-300 ${openDropdown === 'subcategory' ? 'rotate-180 text-[#1D565F]' : ''}`} />
                </div>

                {openDropdown === 'subcategory' && (
                  <div className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl z-50 py-2 w-[260px] md:w-full max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-2 sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-50 mb-1">
                      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus-within:ring-1 focus-within:ring-[#1D565F]/50">
                        <Search size={14} className="text-gray-400 mr-2" />
                        <input 
                          type="text"
                          placeholder="Buscar subcategoría..."
                          value={subSearch}
                          onChange={(e) => setSubSearch(e.target.value)}
                          className="w-full bg-transparent text-sm outline-none placeholder-gray-400"
                          autoFocus
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectOption('subcategory', 'Todas')}
                      className={`w-full text-left px-5 py-3 text-sm font-extrabold transition-colors
                        ${activeSubcategory === 'Todas' ? 'bg-[#1D565F]/10 text-[#1D565F]' : 'text-[#1D565F] hover:bg-gray-50'}
                      `}
                    >
                      Todas las subcategorías
                    </button>
                    {filteredSubcategories.map(sub => (
                      <button
                        key={sub}
                        onClick={() => handleSelectOption('subcategory', sub)}
                        className={`w-full text-left px-5 py-2.5 text-sm font-medium transition-colors border-t border-gray-50/50
                          ${activeSubcategory === sub ? 'text-[#1D565F] bg-teal-50/20 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}
                        `}
                      >
                        • {sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Ubicación */}
            <div className={`flex flex-col gap-1 relative custom-dropdown ${isMobile && openDropdown !== 'location' ? 'hidden' : ''}`}>
              {!isMobile && (
                <>
                  <label className="text-[10px] md:text-xs font-bold text-[#1D565F] uppercase tracking-widest ml-1 hidden sm:block">
                    Ubicación
                  </label>
                  <div 
                    onClick={() => toggleDropdown('location')}
                    className={`flex items-center bg-white border rounded-xl px-1.5 md:px-3 py-2.5 md:py-2.5 shadow-sm transition-all hover:bg-gray-50 group focus:outline-none cursor-pointer
                      ${openDropdown === 'location' ? 'border-[#1D565F] ring-1 ring-[#1D565F]/30' : 'border-gray-200'}
                    `}
                  >
                    <MapPin size={14} className={`mr-1 md:mr-2 flex-shrink-0 transition-colors ${openDropdown === 'location' ? 'text-[#1D565F]' : 'text-[#32698F]'}`} />
                    <span className="w-full text-left text-xs sm:text-sm text-[#1E3D51] font-extrabold truncate">
                      {activeState === 'Todas' ? 'Cualquier Ubicación' : (activeNeighborhood !== 'Todas' ? activeNeighborhood : activeState)}
                    </span>
                    {activeState !== 'Todas' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectOption('location', 'Todas');
                        }}
                        className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#1D565F] transition-colors ml-1"
                      >
                        <X size={14} />
                      </button>
                    )}
                    <ChevronDown size={11} className={`text-gray-400 ml-0.5 md:ml-1 flex-shrink-0 transition-transform duration-300 ${openDropdown === 'location' ? 'rotate-180 text-[#1D565F]' : ''}`} />
                  </div>
                </>
              )}

              {openDropdown === 'location' && (
                <div className={`absolute top-full mt-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl z-50 py-2 w-[260px] md:w-full max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-200
                  ${isMobile ? 'left-0' : 'left-1/2 -translate-x-1/2'}
                `}>
                  <div className="px-4 py-2 sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-50 mb-1">
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus-within:ring-1 focus-within:ring-[#1D565F]/50">
                      <Search size={14} className="text-gray-400 mr-2" />
                      <input 
                        type="text"
                        placeholder="Buscar ubicación..."
                        value={locSearch}
                        onChange={(e) => setLocSearch(e.target.value)}
                        className="w-full bg-transparent text-sm outline-none placeholder-gray-400"
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectOption('location', 'Todas')}
                    className={`w-full text-left px-5 py-3 text-sm font-extrabold transition-colors
                      ${activeState === 'Todas' ? 'bg-[#1D565F]/10 text-[#1D565F]' : 'text-[#1D565F] hover:bg-gray-50'}
                    `}
                  >
                    🌎 Toda Bolivia
                  </button>
                  {filteredGroupedLocations.map(group => (
                    <div key={group.state} className="border-t border-gray-100 my-1 pt-2 pb-1">
                      <button
                        onClick={() => handleSelectOption('location', group.state)}
                        className={`w-full text-left px-5 py-2 text-sm font-bold transition-colors
                          ${activeState === group.state && activeNeighborhood === 'Todas' ? 'text-[#1D565F] bg-teal-50/50' : 'text-[#1E3D51] hover:bg-gray-50'}
                        `}
                      >
                        📍 {group.state}
                      </button>
                      {group.neighborhoods.map(neigh => (
                        <button
                          key={neigh}
                          onClick={() => handleSelectOption('location', group.state, neigh)}
                          className={`w-full text-left pl-9 pr-5 py-2 text-sm font-medium transition-colors
                            ${activeNeighborhood === neigh ? 'text-[#1D565F] font-bold bg-[#1D565F]/5' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}
                          `}
                        >
                          • {neigh}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calificación */}
            <div className={`flex flex-col gap-1 relative custom-dropdown ${isMobile && openDropdown !== 'rating' ? 'hidden' : ''}`}>
              {!isMobile && (
                <>
                  <label className="text-[10px] md:text-xs font-bold text-[#1D565F] uppercase tracking-widest ml-1 hidden sm:block">
                    Ranking
                  </label>
                  <div 
                    onClick={() => toggleDropdown('rating')}
                    className={`flex items-center bg-white border rounded-xl px-1.5 md:px-3 py-2.5 md:py-2.5 shadow-sm transition-all hover:bg-gray-50 group focus:outline-none cursor-pointer
                      ${openDropdown === 'rating' ? 'border-[#1D565F] ring-1 ring-[#1D565F]/30' : 'border-gray-200'}
                    `}
                  >
                    <Star size={14} className={`mr-1 md:mr-2 flex-shrink-0 transition-colors ${openDropdown === 'rating' ? 'fill-[#1D565F] text-[#1D565F]' : 'text-[#1D565F]'}`} />
                    <span className="w-full text-left text-xs md:text-sm text-[#1E3D51] font-extrabold truncate">
                      {activeRating === 'Todos' ? 'Cualquier Ranking' : activeRating.replace(' Estrellas', '')}
                    </span>
                    {activeRating !== 'Todos' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectOption('rating', 'Todos');
                        }}
                        className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#1D565F] transition-colors ml-1"
                      >
                        <X size={14} />
                      </button>
                    )}
                    <ChevronDown size={11} className={`text-gray-400 ml-0.5 md:ml-1 flex-shrink-0 transition-transform duration-300 ${openDropdown === 'rating' ? 'rotate-180 text-[#1D565F]' : ''}`} />
                  </div>
                </>
              )}

              {openDropdown === 'rating' && (
                <div className={`absolute top-full right-0 mt-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl z-50 py-2 w-[220px] md:w-full animate-in fade-in zoom-in-95 duration-200`}>
                  {[
                    { label: 'Cualquiera', value: 'Todos' },
                    { label: 'Solo 5 Estrellas', value: '5 Estrellas' },
                    { label: '4+ Estrellas', value: '4+ Estrellas' },
                    { label: '3+ Estrellas', value: '3+ Estrellas' }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleSelectOption('rating', opt.value)}
                      className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors
                        ${activeRating === opt.value ? 'bg-[#1D565F]/10 text-[#1D565F]' : 'text-gray-600 hover:bg-gray-50'}
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
