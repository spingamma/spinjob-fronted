import React from 'react';
import { LayoutGrid, X } from 'lucide-react';

export default function CategoryBadge({ activeCategory, handleSelectOption }) {
  return (
    <div
      data-testid="filter-active-category"
      className="flex items-center gap-1.5 bg-primary text-white px-2 py-1.5 md:px-3.5 md:py-2 rounded-xl shadow-sm transition-all duration-300"
    >
      <LayoutGrid size={13} className="flex-shrink-0 opacity-80 sm:w-[14px] sm:h-[14px]" />
      <span className="text-xs md:text-sm font-bold whitespace-normal line-clamp-2 max-w-[115px] md:max-w-none leading-tight">
        {activeCategory}
      </span>
      <button
        data-testid="filter-clear-category"
        onClick={() => handleSelectOption('category', 'Todos')}
        className="p-0.5 hover:bg-white/20 rounded-lg transition-colors ml-0.5 flex-shrink-0 cursor-pointer"
        aria-label="Limpiar categoría"
      >
        <X size={13} className="sm:w-[14px] sm:h-[14px]" />
      </button>
    </div>
  );
}
