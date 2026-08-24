import React from 'react';
import { Search } from 'lucide-react';

export default function VendedorFilters({
  filter,
  setFilter,
  searchTerm,
  setSearchTerm
}) {
  return (
    <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3 items-start sm:items-center flex-wrap">
      <select 
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full sm:w-auto bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 text-sm font-bold text-primary appearance-none"
      >
        <option value="todos">Todos los Negocios</option>
        <option value="possible">Con Posible Dueño</option>
        <option value="none">Sin Usuario Registrado</option>
        <option value="assigned">Dueño Asignado</option>
      </select>

      <div className="relative w-full sm:w-64">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Buscar negocio..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-gray-200 py-2.5 pl-11 pr-4 rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/10 transition-all font-medium text-primary"
        />
      </div>
    </div>
  );
}
