import React, { useState, useEffect, useRef } from 'react';
import { Package, ExternalLink, Loader2, MoreHorizontal } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 w-full mb-8">
        <Loader2 size={32} className="animate-spin mb-3 text-[#F9842C]" />
        <p className="text-sm font-bold uppercase tracking-widest text-[#1A535C]">Cargando productos...</p>
      </div>
    );
  }

  if (products.length === 0 && !catalogUrl) {
    return null;
  }

  const isDark = theme === 'dark';

  // Dividimos los productos en chunks de 5 para simular categorías si no las tienen
  const chunks = [products.slice(0, 5), products.slice(5, 10)].filter(chunk => chunk.length > 0);

  return (
    <div className="w-full relative">
      {chunks.length > 0 ? (
        <div className="flex flex-col gap-4">
          {chunks.map((chunk, chunkIdx) => (
            <CarouselBlock 
              key={chunkIdx}
              title={chunkIdx === 0 ? "NUESTROS PRODUCTOS" : "MÁS PRODUCTOS"}
              products={chunk}
              isDark={isDark}
              whatsappNumber={whatsappNumber}
              businessName={businessName}
              country={country}
            />
          ))}
          
          {/* Si hay URL de catálogo externo y ya mostramos productos, lo ofrecemos al final */}
          {catalogUrl && (
             <div className="px-4 mt-2 mb-8">
               <a href={catalogUrl} target="_blank" rel="noopener noreferrer" className={`w-full flex items-center justify-center gap-3 font-bold py-4 px-6 rounded-2xl shadow-sm transition-all hover:-translate-y-0.5 border ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-gray-200 text-[#1A535C] hover:border-[#F9842C]/30'}`}>
                 <ExternalLink size={20} /> Ver catálogo completo
               </a>
             </div>
          )}
        </div>
      ) : catalogUrl ? (
        <div className="px-4 mb-8">
          <a href={catalogUrl} target="_blank" rel="noopener noreferrer" className={`w-full flex items-center justify-center gap-3 font-bold py-4 px-6 rounded-2xl shadow-sm transition-all hover:-translate-y-0.5 border ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-gray-200 text-[#1A535C] hover:border-[#F9842C]/30'}`}>
             <ExternalLink size={20} /> Ir al catálogo externo
          </a>
        </div>
      ) : null}
    </div>
  );
}

const CarouselBlock = ({ title, products, isDark, whatsappNumber, businessName, country }) => {
  // Crear un carrusel pseudo-infinito repitiendo los productos 20 veces (nadie hace swipe 50+ veces)
  const displayProducts = products.length > 0 ? Array(20).fill(products).flat() : [];
  
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollLeft = container.scrollLeft;
    const containerCenter = scrollLeft + container.offsetWidth / 2;
    
    let closestIndex = 0;
    let minDistance = Infinity;
    
    Array.from(container.children).forEach((child) => {
      if (!child.hasAttribute('data-product-idx')) return;
      
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const distance = Math.abs(childCenter - containerCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = parseInt(child.getAttribute('data-product-idx'), 10);
      }
    });
    
    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  };

  useEffect(() => {
    if (products.length === 0 || !containerRef.current) return;
    
    // Inicializar en el medio de las copias para tener scroll "infinito" hacia ambos lados
    const startIndex = products.length * 10;
    
    const initTimer = setTimeout(() => {
      if (!containerRef.current) return;
      const targetChild = containerRef.current.children[startIndex + 1]; // +1 por <style>
      if (targetChild) {
        containerRef.current.scrollLeft = targetChild.offsetLeft - (containerRef.current.offsetWidth / 2) + (targetChild.offsetWidth / 2);
        setActiveIndex(startIndex);
      }
    }, 100);

    return () => clearTimeout(initTimer);
  }, [products]);

  const handleProductClick = (product) => {
    const cleanWa = cleanWhatsappNumber(whatsappNumber, country);
    if (!cleanWa) return;
    const msg = `Hola ${businessName}, me interesa este producto: ${product.name}`;
    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="w-full overflow-hidden mb-2">
      <h3 className={`text-xs font-extrabold tracking-widest mb-4 flex items-center gap-2 px-4 uppercase ${isDark ? 'text-white' : 'text-[#1A535C]'}`}>
        <span className={`w-1 h-4 rounded-full ${isDark ? 'bg-[#C8A721]' : 'bg-[#1D565F]'}`}></span> 
        {title}
      </h3>
      
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory hide-scroll px-[calc(50%-97.5px)] sm:px-[calc(50%-117.5px)] md:px-[calc(50%-135px)] gap-4 sm:gap-6 pb-4 pt-2 -mb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`.hide-scroll::-webkit-scrollbar { display: none; }`}</style>
        
        {displayProducts.map((product, idx) => {
          const isActive = activeIndex === idx;
          
          return (
            <div 
              key={`${product.id}-${idx}`} 
              data-product-idx={idx}
              className={`snap-center shrink-0 w-[195px] sm:w-[235px] md:w-[270px] transition-all duration-300 ease-out flex flex-col rounded-[1.25rem] overflow-hidden border cursor-pointer ${
                isActive 
                  ? (isDark ? 'bg-[#1e1e1e] border-white/10 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)] scale-100 z-10' : 'bg-white border-transparent shadow-[0_15px_30px_-10px_rgba(30,61,81,0.15)] scale-100 z-10') 
                  : (isDark ? 'bg-[#1e1e1e]/50 border-white/5 scale-90 opacity-100 z-0' : 'bg-white border-gray-200 scale-90 opacity-100 z-0 hover:bg-gray-50')
              }`}
              onClick={() => {
                if (!isActive && containerRef.current) {
                  const child = containerRef.current.children[idx];
                  if (child) {
                    child.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                  }
                } else {
                  handleProductClick(product);
                }
              }}
            >
              {/* Imagen/Icono en la parte superior */}
              <div className="relative w-full flex flex-col justify-start">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-auto max-h-[240px] sm:max-h-[280px] md:max-h-[320px] object-contain transition-transform duration-500 hover:scale-105 drop-shadow-sm" />
                ) : (
                  <div className="w-full h-[180px] sm:h-[220px] flex items-center justify-center">
                    <Package size={48} className={`sm:w-16 sm:h-16 ${isDark ? 'text-[#757778]' : 'text-[#1A535C]/20'}`} strokeWidth={1.5} />
                  </div>
                )}
                
                {/* Botón superior derecho (...) */}
                <div className="absolute top-3 right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm text-[#1A535C] border border-gray-100 z-10 transition-colors hover:bg-gray-50">
                  <MoreHorizontal size={18} className="sm:w-5 sm:h-5" />
                </div>
              </div>

              {/* Info inferior con fondo blanco/oscuro */}
              <div className="flex flex-col p-4 sm:p-5 pt-3 sm:pt-4 w-full text-left flex-1 justify-between">
                <div>
                  <h4 className={`font-bold text-sm sm:text-base leading-tight mb-1.5 line-clamp-2 ${isDark ? 'text-white' : 'text-[#1A535C]'}`}>
                    {product.name}
                  </h4>
                  {product.description && (
                    <p className={`text-[11px] sm:text-xs line-clamp-2 mb-3 ${isDark ? 'text-gray-400' : 'text-[#757778]'}`}>
                      {product.description}
                    </p>
                  )}
                </div>
                {product.price ? (
                  <p className={`font-black text-base sm:text-lg mt-2 ${isDark ? 'text-[#C8A721]' : 'text-[#1A535C]'}`}>
                    {product.price}
                  </p>
                ) : (
                  <p className="font-bold text-base sm:text-lg text-transparent select-none mt-2">-</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
