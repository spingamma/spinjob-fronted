import React, { useState, useEffect } from 'react';
import { Search, Loader2, Plus, X } from 'lucide-react';
import fetchAuth from '../../../../utils/fetchAuth';

const COLORS = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-accent)', '#6B7280', 'var(--color-primary)', 'var(--color-secondary)', 'var(--color-accent)'];

export default function AnalyticsCompareSearch({ API_URL, selectedBusinesses, setSelectedBusinesses }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchTerm.trim().length === 0 && !showDropdown) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetchAuth(`${API_URL}/admin/businesses/search?q=${encodeURIComponent(searchTerm)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Error buscando negocios:", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, showDropdown, API_URL]);

  const handleAddAllBusinesses = async () => {
    setIsLoadingAll(true);
    try {
      const res = await fetchAuth(`${API_URL}/admin/businesses/search?q=`);
      if (res.ok) {
        const data = await res.json();
        const newSelected = [];
        data.forEach((b, index) => {
          newSelected.push({ ...b, color: COLORS[(index + 2) % COLORS.length] });
        });
        setSelectedBusinesses(newSelected);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAll(false);
    }
  };

  const handleAddBusiness = (business) => {
    if (selectedBusinesses.some(b => b.slug === business.slug)) return;
    if (selectedBusinesses.length >= 50) {
      alert("Máximo 50 negocios para comparar a la vez.");
      return;
    }
    const color = COLORS[(selectedBusinesses.length + 2) % COLORS.length];
    setSelectedBusinesses([...selectedBusinesses, { ...business, color }]);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleRemoveBusiness = (slug) => {
    setSelectedBusinesses(prev => prev.filter(b => b.slug !== slug));
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative z-10">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-4">
        <h3 className="font-bold text-gray-500">Selecciona Negocios a Comparar</h3>
        <button 
          onClick={handleAddAllBusinesses}
          disabled={isLoadingAll}
          className="text-sm font-bold bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isLoadingAll ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Cargar Todos (Top 50)
        </button>
      </div>
      
      <div className="relative">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input 
          type="text" 
          placeholder="Selecciona o busca negocios para graficar..." 
          value={searchTerm}
          onFocus={() => setShowDropdown(true)}
          onClick={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          className="w-full bg-white border border-gray-200 py-3.5 pl-12 pr-10 rounded-2xl outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all font-medium text-primary shadow-sm"
        />
        {isSearching && <Loader2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary animate-spin" />}

        {showDropdown && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-[100] max-h-72 overflow-y-auto">
            {searchResults.map(b => (
              <button 
                key={b.slug}
                onMouseDown={(e) => { e.preventDefault(); handleAddBusiness(b); }}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between border-b border-gray-50 last:border-0"
              >
                <div>
                  <p className="font-bold text-primary">{b.name}</p>
                  <p className="text-xs text-gray-500">{b.category}</p>
                </div>
                <Plus size={18} className="text-secondary" />
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedBusinesses.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
          {selectedBusinesses.map(b => (
            <div 
              key={b.slug}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold text-sm"
              style={{ borderColor: b.color, backgroundColor: `${b.color}10`, color: b.color }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }}></div>
              {b.name}
              <button onClick={() => handleRemoveBusiness(b.slug)} className="hover:opacity-70 ml-1">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
