import React from 'react';
import { MapPin, X, ChevronDown, Search } from 'lucide-react';

export default function LocationFilter({
  activeState,
  activeNeighborhood,
  openDropdown,
  locSearch,
  setLocSearch,
  filteredGroupedLocations,
  toggleDropdown,
  handleSelectOption
}) {
  return (
    <div data-testid="filter-container-location" className="relative custom-dropdown">
      <div 
        data-testid="filter-trigger-location"
        onClick={() => toggleDropdown('location')}
        className={`flex items-center bg-white border rounded-xl px-3 py-2 shadow-sm transition-all hover:bg-gray-50 cursor-pointer
          ${openDropdown === 'location' ? 'border-secondary ring-1 ring-secondary/30' : 'border-gray-200'}
        `}
      >
        <MapPin size={14} className={`mr-1.5 flex-shrink-0 transition-colors ${openDropdown === 'location' ? 'text-secondary' : 'text-primary/80'}`} />
        <span className="text-xs sm:text-sm text-primary font-bold truncate">
          {activeState === 'Todas' ? 'Ubicación' : (activeNeighborhood !== 'Todas' ? activeNeighborhood : activeState)}
        </span>
        {activeState !== 'Todas' && (
          <button 
            data-testid="filter-clear-location"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectOption('location', 'Todas');
            }}
            className="p-0.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-secondary transition-colors ml-1 cursor-pointer"
          >
            <X size={12} />
          </button>
        )}
        <ChevronDown size={11} className={`text-gray-400 ml-1 flex-shrink-0 transition-transform duration-300 ${openDropdown === 'location' ? 'rotate-180 text-secondary' : ''}`} />
      </div>

      {openDropdown === 'location' && (
        <div className="absolute top-full mt-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl z-50 py-2 w-[260px] md:w-[280px] max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-200 left-0">
          <div className="px-4 py-2 sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-50 mb-1">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus-within:ring-1 focus-within:ring-secondary/50">
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
            data-testid="location-option-all"
            onClick={() => handleSelectOption('location', 'Todas')}
            className={`w-full text-left px-5 py-3 text-sm font-extrabold transition-colors cursor-pointer
              ${activeState === 'Todas' ? 'bg-secondary/10 text-secondary' : 'text-secondary hover:bg-gray-50'}
            `}
          >
            🌎 Toda Bolivia
          </button>
          {filteredGroupedLocations.map(group => (
            <div key={group.state} className="border-t border-gray-100 my-1 pt-2 pb-1">
              <button
                data-testid={`location-option-${group.state}`}
                onClick={() => handleSelectOption('location', group.state)}
                className={`w-full text-left px-5 py-2 text-sm font-bold transition-colors cursor-pointer
                  ${activeState === group.state && activeNeighborhood === 'Todas' ? 'text-secondary bg-orange-50/50' : 'text-primary hover:bg-gray-50'}
                `}
              >
                📍 {group.state}
              </button>
              {(group.neighborhoods || []).map(neigh => (
                <button
                  key={neigh}
                  data-testid={`location-option-${group.state}-${neigh}`}
                  onClick={() => handleSelectOption('location', group.state, neigh)}
                  className={`w-full text-left pl-9 pr-5 py-2 text-sm font-medium transition-colors cursor-pointer
                    ${activeNeighborhood === neigh ? 'text-secondary font-bold bg-secondary/5' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}
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
  );
}
