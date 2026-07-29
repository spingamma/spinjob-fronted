import React from 'react';
import { Star, X, ChevronDown } from 'lucide-react';

export default function RatingFilter({ activeRating, openDropdown, toggleDropdown, handleSelectOption }) {
  return (
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
            className="p-0.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#F9842C] transition-colors ml-1 cursor-pointer"
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
              className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors cursor-pointer
                ${activeRating === opt.value ? 'bg-[#F9842C]/10 text-[#F9842C]' : 'text-[#757778] hover:bg-gray-50'}
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
