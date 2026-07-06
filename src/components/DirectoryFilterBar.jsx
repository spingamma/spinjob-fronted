// Archivo: src/components/DirectoryFilterBar.jsx
import { X, ChevronDown, Search, MapPin, Star, LayoutGrid, LayoutList } from 'lucide-react';

export default function DirectoryFilterBar({ 
  isMobile, 
  states, 
  setters, 
  computed, 
  actions,
  userCoords
}) {
  const {
    activeCategory, activeSubcategory, activeState, activeNeighborhood, activeRating,
    activeDistance,
    openDropdown, locSearch, subSearch
  } = states;

  const isTabletOrMobile = isMobile || (typeof window !== 'undefined' && window.innerWidth < 1025 && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
  const showDistanceFilter = !!userCoords && isTabletOrMobile;

  const { setLocSearch, setSubSearch } = setters;

  const { filteredSubcategories, filteredGroupedLocations } = computed;

  const { toggleDropdown, handleSelectOption } = actions;

  // Only render when a category is selected
  if (activeCategory === 'Todos') return null;

  return (
    <div className="bg-white/70 backdrop-blur-md sticky top-16 md:top-20 z-30 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 md:py-4">
        
        {/* Row 1: Active Category Badge + Location + Rating */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 md:gap-3">
          
          {/* Active Category Badge */}
          <div
            data-testid="filter-active-category"
            className="flex items-center gap-1.5 bg-[#1A535C] text-white px-2 py-1.5 md:px-3.5 md:py-2 rounded-xl shadow-sm transition-all duration-300"
          >
            <LayoutGrid size={13} className="flex-shrink-0 opacity-80 sm:w-[14px] sm:h-[14px]" />
            <span className="text-xs md:text-sm font-bold whitespace-normal line-clamp-2 max-w-[115px] md:max-w-none leading-tight">
              {activeCategory}
            </span>
            <button
              data-testid="filter-clear-category"
              onClick={() => handleSelectOption('category', 'Todos')}
              className="p-0.5 hover:bg-white/20 rounded-lg transition-colors ml-0.5 flex-shrink-0"
              aria-label="Limpiar categoría"
            >
              <X size={13} className="sm:w-[14px] sm:h-[14px]" />
            </button>
          </div>

          {/* Location Dropdown (Desktop only trigger) */}
          {!isMobile && (
            <div data-testid="filter-container-location" className="relative custom-dropdown">
              <div 
                data-testid="filter-trigger-location"
                onClick={() => toggleDropdown('location')}
                className={`flex items-center bg-white border rounded-xl px-3 py-2 shadow-sm transition-all hover:bg-gray-50 cursor-pointer
                  ${openDropdown === 'location' ? 'border-[#F9842C] ring-1 ring-[#F9842C]/30' : 'border-gray-200'}
                `}
              >
                <MapPin size={14} className={`mr-1.5 flex-shrink-0 transition-colors ${openDropdown === 'location' ? 'text-[#F9842C]' : 'text-[#32698F]'}`} />
                <span className="text-xs sm:text-sm text-[#1A535C] font-bold truncate">
                  {activeState === 'Todas' ? 'Ubicación' : (activeNeighborhood !== 'Todas' ? activeNeighborhood : activeState)}
                </span>
                {activeState !== 'Todas' && (
                  <button 
                    data-testid="filter-clear-location"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectOption('location', 'Todas');
                    }}
                    className="p-0.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#F9842C] transition-colors ml-1"
                  >
                    <X size={12} />
                  </button>
                )}
                <ChevronDown size={11} className={`text-gray-400 ml-1 flex-shrink-0 transition-transform duration-300 ${openDropdown === 'location' ? 'rotate-180 text-[#F9842C]' : ''}`} />
              </div>

              {openDropdown === 'location' && (
                <div className="absolute top-full mt-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl z-50 py-2 w-[260px] md:w-[280px] max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-200 left-0">
                  <div className="px-4 py-2 sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-50 mb-1">
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus-within:ring-1 focus-within:ring-[#F9842C]/50">
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
                      ${activeState === 'Todas' ? 'bg-[#F9842C]/10 text-[#F9842C]' : 'text-[#F9842C] hover:bg-gray-50'}
                    `}
                  >
                    🌎 Toda Bolivia
                  </button>
                  {filteredGroupedLocations.map(group => (
                    <div key={group.state} className="border-t border-gray-100 my-1 pt-2 pb-1">
                      <button
                        onClick={() => handleSelectOption('location', group.state)}
                        className={`w-full text-left px-5 py-2 text-sm font-bold transition-colors
                          ${activeState === group.state && activeNeighborhood === 'Todas' ? 'text-[#F9842C] bg-orange-50/50' : 'text-[#1A535C] hover:bg-gray-50'}
                        `}
                      >
                        📍 {group.state}
                      </button>
                      {group.neighborhoods.map(neigh => (
                        <button
                          key={neigh}
                          onClick={() => handleSelectOption('location', group.state, neigh)}
                          className={`w-full text-left pl-9 pr-5 py-2 text-sm font-medium transition-colors
                            ${activeNeighborhood === neigh ? 'text-[#F9842C] font-bold bg-[#F9842C]/5' : 'text-[#757778] hover:bg-gray-50 hover:text-gray-800'}
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
          )}

          {/* Rating Dropdown (Desktop only trigger) */}
          {!isMobile && (
            <div data-testid="filter-container-rating" className="relative custom-dropdown">
              <div 
                data-testid="filter-trigger-rating"
                onClick={() => toggleDropdown('rating')}
                className={`flex items-center bg-white border rounded-xl px-3 py-2 shadow-sm transition-all hover:bg-gray-50 cursor-pointer
                  ${openDropdown === 'rating' ? 'border-[#F9842C] ring-1 ring-[#F9842C]/30' : 'border-gray-200'}
                `}
              >
                <Star size={14} className={`mr-1.5 flex-shrink-0 transition-colors ${openDropdown === 'rating' ? 'fill-[#F9842C] text-[#F9842C]' : 'text-[#F9842C]'}`} />
                <span className="text-xs sm:text-sm text-[#1A535C] font-bold truncate">
                  {activeRating === 'Todos' ? 'Ranking' : activeRating.replace(' Estrellas', '★')}
                </span>
                {activeRating !== 'Todos' && (
                  <button 
                    data-testid="filter-clear-rating"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectOption('rating', 'Todos');
                    }}
                    className="p-0.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#F9842C] transition-colors ml-1"
                  >
                    <X size={12} />
                  </button>
                )}
                <ChevronDown size={11} className={`text-gray-400 ml-1 flex-shrink-0 transition-transform duration-300 ${openDropdown === 'rating' ? 'rotate-180 text-[#F9842C]' : ''}`} />
              </div>

              {openDropdown === 'rating' && (
                <div className="absolute top-full right-0 mt-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl z-50 py-2 w-[220px] animate-in fade-in zoom-in-95 duration-200">
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
                        ${activeRating === opt.value ? 'bg-[#F9842C]/10 text-[#F9842C]' : 'text-[#757778] hover:bg-gray-50'}
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Subcategory Dropdown */}
          {filteredSubcategories.length > 0 && (
            <div data-testid="filter-container-subcategory" className="relative custom-dropdown">
              <div
                data-testid="filter-trigger-subcategory"
                onClick={() => toggleDropdown('subcategory')}
                className={`flex items-center bg-white border rounded-xl px-3 py-2 shadow-sm transition-all hover:bg-gray-50 cursor-pointer
                  ${openDropdown === 'subcategory' ? 'border-[#F9842C] ring-1 ring-[#F9842C]/30' : 'border-gray-200'}
                `}
              >
                <LayoutList size={14} className={`mr-1.5 flex-shrink-0 transition-colors ${openDropdown === 'subcategory' ? 'text-[#F9842C]' : 'text-[#32698F]'}`} />
                <span className="text-xs sm:text-sm text-[#1A535C] font-bold truncate">
                  {activeSubcategory === 'Todas' ? 'Subcategoría' : activeSubcategory}
                </span>
                {activeSubcategory !== 'Todas' && (
                  <button
                    data-testid="filter-clear-subcategory"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectOption('subcategory', 'Todas');
                    }}
                    className="p-0.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#F9842C] transition-colors ml-1"
                  >
                    <X size={12} />
                  </button>
                )}
                <ChevronDown size={11} className={`text-gray-400 ml-1 flex-shrink-0 transition-transform duration-300 ${openDropdown === 'subcategory' ? 'rotate-180 text-[#F9842C]' : ''}`} />
              </div>

              {openDropdown === 'subcategory' && (
                <div className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl z-50 py-2 w-[260px] md:w-[280px] max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-2 sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-50 mb-1">
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus-within:ring-1 focus-within:ring-[#F9842C]/50">
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
                      ${activeSubcategory === 'Todas' ? 'bg-[#F9842C]/10 text-[#F9842C]' : 'text-[#F9842C] hover:bg-gray-50'}
                    `}
                  >
                    ✦ Todas las Subcategorías
                  </button>
                  {filteredSubcategories.map(sub => (
                    <button
                      key={sub}
                      onClick={() => handleSelectOption('subcategory', sub)}
                      className={`w-full text-left px-5 py-2.5 text-sm font-medium transition-colors border-t border-gray-50
                        ${activeSubcategory === sub ? 'text-[#F9842C] font-bold bg-[#F9842C]/5' : 'text-[#757778] hover:bg-gray-50 hover:text-gray-800'}
                      `}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Distance Dropdown (Mobiles & Tablets with GPS location only) */}
          {showDistanceFilter && (
            <div data-testid="filter-container-distance" className="relative custom-dropdown">
              <div
                data-testid="filter-trigger-distance"
                onClick={() => toggleDropdown('distance')}
                className={`flex items-center bg-white border rounded-xl px-3 py-2 shadow-sm transition-all hover:bg-gray-50 cursor-pointer
                  ${openDropdown === 'distance' ? 'border-[#F9842C] ring-1 ring-[#F9842C]/30' : 'border-gray-200'}
                `}
              >
                <MapPin size={14} className={`mr-1.5 flex-shrink-0 transition-colors ${openDropdown === 'distance' ? 'text-[#F9842C]' : 'text-[#32698F]'}`} />
                <span className="text-xs sm:text-sm text-[#1A535C] font-bold truncate">
                  {activeDistance === 'Todos' ? 'Distancia' : (
                    activeDistance === 'Minutos' ? 'Minutos' :
                    activeDistance === 'Pocas horas' ? 'Pocas horas' :
                    activeDistance === 'Horas' ? 'Horas' : 'Viajes'
                  )}
                </span>
                {activeDistance !== 'Todos' && (
                  <button
                    data-testid="filter-clear-distance"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectOption('distance', 'Todos');
                    }}
                    className="p-0.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#F9842C] transition-colors ml-1"
                  >
                    <X size={12} />
                  </button>
                )}
                <ChevronDown size={11} className={`text-gray-400 ml-1 flex-shrink-0 transition-transform duration-300 ${openDropdown === 'distance' ? 'rotate-180 text-[#F9842C]' : ''}`} />
              </div>

              {openDropdown === 'distance' && (
                <div className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl z-50 py-2 w-[220px] animate-in fade-in zoom-in-95 duration-200">
                  {[
                    { label: 'Cualquier distancia', value: 'Todos' },
                    { label: 'A minutos', value: 'Minutos' },
                    { label: 'A pocas horas', value: 'Pocas horas' },
                    { label: 'A horas', value: 'Horas' },
                    { label: 'Viajes', value: 'Viajes' }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleSelectOption('distance', opt.value)}
                      className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors border-t border-gray-50/50 first:border-none
                        ${activeDistance === opt.value ? 'bg-[#F9842C]/10 text-[#F9842C]' : 'text-[#757778] hover:bg-gray-50'}
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
