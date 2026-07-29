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
            className="p-0.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#F9842C] transition-colors ml-1 cursor-pointer"
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
            className={`w-full text-left px-5 py-3 text-sm font-extrabold transition-colors cursor-pointer
              ${activeState === 'Todas' ? 'bg-[#F9842C]/10 text-[#F9842C]' : 'text-[#F9842C] hover:bg-gray-50'}
            `}
          >
            🌎 Toda Bolivia
          </button>
          {filteredGroupedLocations.map(group => (
            <div key={group.state} className="border-t border-gray-100 my-1 pt-2 pb-1">
              <button
                onClick={() => handleSelectOption('location', group.state)}
                className={`w-full text-left px-5 py-2 text-sm font-bold transition-colors cursor-pointer
                  ${activeState === group.state && activeNeighborhood === 'Todas' ? 'text-[#F9842C] bg-orange-50/50' : 'text-[#1A535C] hover:bg-gray-50'}
                `}
              >
                📍 {group.state}
              </button>
              {group.neighborhoods.map(neigh => (
                <button
                  key={neigh}
                  onClick={() => handleSelectOption('location', group.state, neigh)}
                  className={`w-full text-left pl-9 pr-5 py-2 text-sm font-medium transition-colors cursor-pointer
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
  );
}
