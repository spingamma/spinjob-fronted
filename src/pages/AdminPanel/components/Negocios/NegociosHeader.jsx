import React from 'react';
import { Search } from 'lucide-react';

export default function NegociosHeader({
  negocioStatusFilter,
  setNegocioStatusFilter,
  searchNegocios,
  setSearchNegocios
}) {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 px-2">
      <h2 className="text-xl font-extrabold text-[#1A535C]">
        {negocioStatusFilter === 'pendientes' && 'Revisiones Pendientes'}
        {negocioStatusFilter === 'premium' && 'Negocios Premium'}
        {negocioStatusFilter === 'basico' && 'Negocios Plan Básico'}
        {negocioStatusFilter === 'todos' && 'Todos los Negocios'}
      </h2>
      
      <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
        {/* Select Filtro Negocios */}
        <select 
          value={negocioStatusFilter}
          onChange={(e) => setNegocioStatusFilter(e.target.value)}
          className="bg-white border border-gray-200 px-4 py-2.5 rounded-xl outline-none focus:border-[#F9842C] focus:ring-1 focus:ring-[#F9842C]/30 text-sm font-bold text-[#1A535C]"
        >
          <option value="pendientes">Pendientes</option>
          <option value="premium">Premium</option>
          <option value="basico">Básico</option>
          <option value="todos">Todos los Negocios</option>
        </select>

        {/* Input Búsqueda */}
        <div className="relative w-full sm:w-72">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o categoría..." 
            value={searchNegocios}
            onChange={(e) => setSearchNegocios(e.target.value)}
            className="w-full bg-white border border-gray-200 pl-11 pr-4 py-2.5 rounded-xl outline-none focus:border-[#F9842C] focus:ring-1 focus:ring-[#F9842C]/30 transition-all text-sm font-medium"
          />
        </div>
      </div>
    </div>
  );
}
