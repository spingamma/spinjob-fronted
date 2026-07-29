import React from 'react';
import { MapPin, X, ChevronDown } from 'lucide-react';

export default function DistanceFilter({ activeDistance, openDropdown, toggleDropdown, handleSelectOption, showDistanceFilter }) {
  if (!showDistanceFilter) return null;

  return (
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
            className="p-0.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#F9842C] transition-colors ml-1 cursor-pointer"
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
              className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors border-t border-gray-50/50 first:border-none cursor-pointer
                ${activeDistance === opt.value ? 'bg-[#F9842C]/10 text-[#F9842C]' : 'text-[#757778] hover:bg-gray-50'}
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
