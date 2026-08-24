import React from 'react';
import { Search, X } from 'lucide-react';

export default function CatalogSearchBar({ searchTerm, setSearchTerm, isDark }) {
  return (
    <div className="px-4 mb-4">
      <div className={`relative flex items-center rounded-2xl border px-3 py-2.5 transition-all ${
        isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-primary shadow-sm'
      }`}>
        <Search size={18} className="text-gray-400 mr-2 shrink-0" />
        <input
          type="text"
          data-testid="catalog-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar producto por nombre o descripción..."
          className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-gray-400"
        />
        {searchTerm && (
          <button
            type="button"
            data-testid="clear-catalog-search-btn"
            onClick={() => setSearchTerm('')}
            className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-400 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
