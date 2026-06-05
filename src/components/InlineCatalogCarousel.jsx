import React, { useState, useEffect } from 'react';
import { Package, MessageCircle, ExternalLink, Loader2 } from 'lucide-react';
import { cleanWhatsappNumber } from '../utils/phone';

export default function InlineCatalogCarousel({ slug, catalogUrl, whatsappNumber, businessName, country = 'Bolivia', theme = 'light' }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    fetch(`${API_URL}/businesses/${slug}/products`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-400 w-full mb-8">
        <Loader2 size={24} className="animate-spin mb-2" />
        <p className="text-xs font-medium">Cargando catálogo...</p>
      </div>
    );
  }

  if (products.length === 0 && !catalogUrl) {
    return null;
  }

  const isDark = theme === 'dark';
  
  return (
    <div className="mb-8 w-full px-2 sm:px-0">
      <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white font-seasons' : 'text-[#1E3D51]'}`}>
        <span className={`w-1.5 h-6 rounded-full ${isDark ? 'bg-[#C8A721]' : 'bg-[#F67927]'}`}></span> 
        Catálogo de Productos
      </h3>
      
      {products.length > 0 ? (
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scroll" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`.hide-scroll::-webkit-scrollbar { display: none; }`}</style>
          
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              whatsappNumber={whatsappNumber} 
              businessName={businessName} 
              country={country}
              isDark={isDark}
            />
          ))}

          {catalogUrl && (
             <div className="snap-center shrink-0 w-[220px] flex items-center justify-center">
               <a href={catalogUrl} target="_blank" rel="noopener noreferrer" className={`flex flex-col items-center justify-center h-full w-full rounded-2xl border border-dashed transition-all p-6 ${isDark ? 'border-[#C8A721]/30 hover:bg-[#C8A721]/10' : 'border-[#F67927]/30 hover:bg-[#F67927]/5'}`}>
                 <ExternalLink size={24} className={`mb-2 ${isDark ? 'text-[#C8A721]' : 'text-[#F67927]'}`} />
                 <span className={`font-bold text-center text-sm ${isDark ? 'text-white' : 'text-[#1E3D51]'}`}>Ver catálogo completo</span>
               </a>
             </div>
          )}
        </div>
      ) : catalogUrl ? (
        <a href={catalogUrl} target="_blank" rel="noopener noreferrer" className={`w-full flex items-center justify-center gap-3 font-bold py-4 px-6 rounded-2xl shadow-sm transition-all hover:-translate-y-0.5 border ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-gray-200 text-[#1E3D51] hover:border-[#F67927]/30'}`}>
           <ExternalLink size={20} /> Ir al catálogo externo
        </a>
      ) : null}
    </div>
  );
}

const ProductCard = ({ product, whatsappNumber, businessName, country, isDark }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = product.description && product.description.length > 60;

  // Limpiar número WhatsApp y construir URL con mensaje prellenado
  const cleanWa = cleanWhatsappNumber(whatsappNumber, country);
  const waMessage = encodeURIComponent(`Hola ${businessName || ''}, me interesa ${product.name}`);
  const waUrl = cleanWa ? `https://wa.me/${cleanWa}?text=${waMessage}` : null;

  return (
    <div className={`snap-center shrink-0 w-[220px] rounded-2xl overflow-hidden flex flex-col border transition-all ${isDark ? 'bg-white/5 border-white/10 backdrop-blur-md' : 'bg-white border-gray-100 shadow-sm hover:shadow-md'}`}>
      <div className={`relative overflow-hidden aspect-square flex items-center justify-center ${isDark ? 'bg-[#121212]' : 'bg-gray-50'}`}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=${isDark ? '1F2937' : 'F0FDFA'}&color=${isDark ? 'D1D5DB' : '0D9488'}&size=400&font-size=0.33`; }}
          />
        ) : (
          <Package size={36} className={isDark ? 'text-gray-600' : 'text-gray-300'} />
        )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h4 className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-[#1E3D51]'}`} title={product.name}>{product.name}</h4>
        
        {product.description && (
          <div className="mt-1">
            <p className={`text-[11px] whitespace-pre-wrap leading-snug ${!expanded ? 'line-clamp-2' : ''} ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {product.description}
            </p>
            {isLong && (
              <button 
                onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                className={`font-bold text-[10px] mt-1 hover:underline uppercase ${isDark ? 'text-[#C8A721]' : 'text-[#F67927]'}`}
              >
                {expanded ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </div>
        )}
        
        <div className="mt-auto pt-3 flex items-center justify-between">
          {product.price ? (
            <p className={`font-bold text-sm ${isDark ? 'text-[#C8A721]' : 'text-teal-600'}`}>{product.price}</p>
          ) : <div></div>}
        </div>

        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1fb855] text-white text-xs font-bold py-2 px-3 rounded-xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97]"
          >
            <MessageCircle size={14} className="fill-white" />
            Me interesa
          </a>
        )}
      </div>
    </div>
  );
};
