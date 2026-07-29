import React from 'react';

export default function MyOrdersFilters({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  todayStr
}) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Desde:</span>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            data-testid="my-orders-start-date-input"
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#1A535C] outline-none focus:border-[#F9842C] transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hasta:</span>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            data-testid="my-orders-end-date-input"
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#1A535C] outline-none focus:border-[#F9842C] transition-all"
          />
        </div>
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
         <button 
           onClick={() => { setStartDate(todayStr); setEndDate(todayStr); }} 
           data-testid="my-orders-today-filter-btn"
           className="flex-1 sm:flex-none px-4 py-2.5 bg-[#F9842C]/10 text-[#F9842C] hover:bg-[#F9842C]/20 text-xs font-bold rounded-xl transition-colors"
         >
           Hoy
         </button>
      </div>
    </div>
  );
}
