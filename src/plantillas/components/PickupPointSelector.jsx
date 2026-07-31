import React, { useState, useEffect } from 'react';
import { Search, MapPin, Check } from 'lucide-react';
import { API_URL } from '../../config/api';

export default function PickupPointSelector({ onSelect, onCancel }) {
  const [query, setQuery] = useState('');
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPoints = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/businesses/?category=Logística`);
        if (res.ok) {
          const data = await res.json();
          setPoints(data);
        }
      } catch (err) {
        console.error("Error fetching pickup points:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPoints();
  }, []);

  const filteredPoints = points.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.state.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm w-full mt-2 animate-in zoom-in-95">
      <div className="flex justify-between items-center mb-3">
        <h5 className="font-bold text-[#1A535C] text-sm">Seleccionar Paquetería</h5>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-xs font-semibold">Cancelar</button>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
        <input 
          type="text" 
          placeholder="Buscar por nombre o ciudad..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full text-xs pl-9 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#F9842C]"
        />
      </div>

      <div className="max-h-48 overflow-y-auto space-y-2">
        {loading ? (
          <p className="text-xs text-center text-gray-500 py-4">Cargando...</p>
        ) : filteredPoints.length > 0 ? (
          filteredPoints.map((point) => (
            <div 
              key={point.id} 
              onClick={() => onSelect(point)}
              className="flex justify-between items-center p-2 border border-gray-100 rounded-lg hover:border-[#F9842C] hover:bg-orange-50 cursor-pointer transition-colors"
            >
              <div>
                <p className="text-xs font-bold text-[#1A535C]">{point.name}</p>
                <p className="text-[10px] text-gray-500 flex items-center gap-1">
                  <MapPin size={10} /> {point.state}, {point.country}
                </p>
                {point.pickup_fee !== null && point.pickup_fee !== undefined && (
                  <p className="text-[10px] text-[#F9842C] font-semibold mt-0.5">Tarifa recojo: {point.pickup_fee} Bs</p>
                )}
              </div>
              <div className="text-gray-300">
                <Check size={16} />
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-center text-gray-500 py-4">No se encontraron paqueterías</p>
        )}
      </div>
    </div>
  );
}
