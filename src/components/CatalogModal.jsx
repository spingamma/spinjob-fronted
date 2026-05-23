// Archivo: src/components/CatalogModal.jsx
import { useState, useEffect } from 'react';
import { X, ShoppingBag, ExternalLink, Loader2, Package, MessageCircle } from 'lucide-react';
import { cleanWhatsappNumber } from '../utils/phone';

export default function CatalogModal({ isOpen, onClose, slug, catalogUrl, whatsappNumber, businessName, country = 'Bolivia' }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !slug) return;
    setLoading(true);
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    fetch(`${API_URL}/businesses/${slug}/products`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [isOpen, slug]);

  if (!isOpen) return null;

  // Si no hay productos pero sí catalog_url, redirigir
  if (!loading && products.length === 0 && catalogUrl) {
    window.open(catalogUrl, '_blank', 'noopener,noreferrer');
    onClose();
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-[#1E3D51]/60 backdrop-blur-md" onClick={onClose}>
      <div 
        className="bg-white w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1E3D51] to-[#32698F] p-5 relative shrink-0">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay"></div>
          <button onClick={onClose} aria-label="Cerrar catálogo" className="absolute top-4 right-4 z-20 text-white/80 hover:text-white transition-colors p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm">
            <X size={20} />
          </button>
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <ShoppingBag size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Catálogo</h3>
              <p className="text-white/70 text-xs">Productos y servicios disponibles</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Loader2 size={32} className="animate-spin mb-3" />
              <p className="text-sm font-medium">Cargando catálogo...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Package size={48} className="mb-3 opacity-50" />
              <p className="font-semibold text-gray-500">Sin productos aún</p>
              <p className="text-xs text-gray-400 mt-1">Este negocio todavía no ha publicado productos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-3">
              {products.map(product => (
                <ProductCard key={product.id} product={product} whatsappNumber={whatsappNumber} businessName={businessName} country={country} />
              ))}
            </div>
          )}
          {!loading && products.length > 0 && catalogUrl && (
            <div className="mt-6 text-center">
              <a href={catalogUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-[#32698F] hover:text-[#B95221] transition-colors">
                <ExternalLink size={16} /> Ver catálogo completo
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const ProductCard = ({ product, whatsappNumber, businessName, country }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = product.description && product.description.length > 70;

  // Limpiar número WhatsApp y construir URL con mensaje prellenado
  const cleanWa = cleanWhatsappNumber(whatsappNumber, country);
  const waMessage = encodeURIComponent(`Hola ${businessName || ''}, me interesa ${product.name}`);
  const waUrl = cleanWa ? `https://wa.me/${cleanWa}?text=${waMessage}` : null;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 group flex flex-col">
      <div className="relative overflow-hidden bg-gray-50">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=F0FDFA&color=0D9488&size=400&font-size=0.33`; }}
          />
        ) : (
          <div className="w-full aspect-square flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <Package size={36} className="text-gray-300" />
          </div>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <h4 className="font-semibold text-gray-800 text-sm truncate">{product.name}</h4>
        
        {product.description && (
          <div className="mt-0.5">
            <p className={`text-xs text-gray-500 whitespace-pre-wrap ${!expanded ? 'line-clamp-2' : ''}`}>
              {product.description}
            </p>
            {isLong && (
              <button 
                onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                className="text-[#B95221] font-bold text-[10px] mt-1 hover:underline uppercase"
              >
                {expanded ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </div>
        )}
        
        <div className="mt-auto pt-2">
          {product.price && <p className="text-teal-600 font-bold text-sm">{product.price}</p>}
        </div>

        {/* Botón "Me interesa" → redirige a WhatsApp */}
        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1fb855] text-white text-xs font-bold py-2 px-3 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97]"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageCircle size={14} className="fill-white" />
            Me interesa
          </a>
        )}
      </div>
    </div>
  );
};
