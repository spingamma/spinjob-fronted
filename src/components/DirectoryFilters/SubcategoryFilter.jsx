import React from 'react';
import { LayoutList, X, ChevronDown, Search } from 'lucide-react';

export default function SubcategoryFilter({
  activeSubcategory,
  openDropdown,
  subSearch,
  setSubSearch,
  filteredSubcategories,
  toggleDropdown,
  handleSelectOption
}) {
  if (filteredSubcategories.length === 0) return null;

  return (
    <div data-testid="filter-container-subcategory" className="relative custom-dropdown">
      <div
        data-testid="filter-trigger-subcategory"
        onClick={() => toggleDropdown('subcategory')}
        className={`flex items-center bg-white border rounded-xl px-3 py-2 shadow-sm transition-all hover:bg-gray-50 cursor-pointer
          ${openDropdown === 'subcategory' ? 'border-secondary ring-1 ring-secondary/30' : 'border-gray-200'}
        `}
      >
        <LayoutList size={14} className={`mr-1.5 flex-shrink-0 transition-colors ${openDropdown === 'subcategory' ? 'text-secondary' : 'text-primary/80'}`} />
        <span className="text-xs sm:text-sm text-primary font-bold truncate">
          {activeSubcategory === 'Todas' ? 'Subcategoría' : activeSubcategory}
        </span>
        {activeSubcategory !== 'Todas' && (
          <button
            data-testid="filter-clear-subcategory"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectOption('subcategory', 'Todas');
            }}
            className="p-0.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-secondary transition-colors ml-1 cursor-pointer"
          >
            <X size={12} />
          </button>
        )}
        <ChevronDown size={11} className={`text-gray-400 ml-1 flex-shrink-0 transition-transform duration-300 ${openDropdown === 'subcategory' ? 'rotate-180 text-secondary' : ''}`} />
      </div>

      {openDropdown === 'subcategory' && (
        <div className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl z-50 py-2 w-[260px] md:w-[280px] max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-2 sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-50 mb-1">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus-within:ring-1 focus-within:ring-secondary/50">
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
            className={`w-full text-left px-5 py-3 text-sm font-extrabold transition-colors cursor-pointer
              ${activeSubcategory === 'Todas' ? 'bg-secondary/10 text-secondary' : 'text-secondary hover:bg-gray-50'}
            `}
          >
            ✦ Todas las Subcategorías
          </button>
          {filteredSubcategories.map(sub => (
            <button
              key={sub}
              onClick={() => handleSelectOption('subcategory', sub)}
              className={`w-full text-left px-5 py-2.5 text-sm font-medium transition-colors border-t border-gray-50 cursor-pointer
                ${activeSubcategory === sub ? 'text-secondary font-bold bg-secondary/5' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}
              `}
            >
              {sub}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
