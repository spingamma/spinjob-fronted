import React from 'react';
import { Loader2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CatalogSearchGrid from './CatalogSearchGrid';
import { useCatalogData } from './Catalog/hooks/useCatalogData';
import { useCart } from './Catalog/hooks/useCart';
import CatalogSearchBar from './Catalog/CatalogSearchBar';
import CarouselBlock from './Catalog/CarouselBlock';
import FloatingOrderButton from './Catalog/FloatingOrderButton';

export default function InlineCatalogCarousel({ slug, catalogUrl, theme = 'light', isPremium = false, ordersEnabled = true, carouselOrder, deliveryMethods, paymentQrImage, ownerId }) {
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const {
    products,
    loading,
    searchTerm,
    setSearchTerm,
    filteredProducts,
    grouped,
    carouselKeys,
    isOwner
  } = useCatalogData(slug, isPremium, carouselOrder, ownerId);

  const {
    cart,
    limitMsg,
    updateCart,
    totalItems,
    totalPrice
  } = useCart();

  const handleOrder = () => {
    const token = localStorage.getItem('spingamma_token');
    if (!token) {
      alert("Para realizar un pedido necesitas iniciar sesión. Por favor ve a la página principal e ingresa a tu cuenta.");
      return;
    }
    navigate(`/perfil/${slug}/orden`, { state: { cart, slug, deliveryMethods, paymentQrImage, ownerId } });
  };

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

  return (
    <div className="w-full relative">
      {/* Buscador Global Superior */}
      <CatalogSearchBar 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        isDark={isDark} 
      />

      {searchTerm.trim() !== '' ? (
        <CatalogSearchGrid
          products={filteredProducts}
          isDark={isDark}
          isOwner={isOwner}
          isPremium={isPremium}
          ordersEnabled={ordersEnabled}
          cart={cart}
          updateCart={updateCart}
          limitMsg={limitMsg}
        />
      ) : carouselKeys.length > 0 ? (
        <div className="flex flex-col gap-4">
          {carouselKeys.map((cname, idx) => (
            <CarouselBlock
              key={idx}
              title={cname.toUpperCase()}
              products={grouped[cname]}
              isDark={isDark}
              isPremium={isPremium}
              ordersEnabled={ordersEnabled}
              cart={cart}
              updateCart={updateCart}
              limitMsg={limitMsg}
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

      {/* Floating Order Button */}
      <FloatingOrderButton 
        isPremium={isPremium}
        ordersEnabled={ordersEnabled}
        totalItems={totalItems}
        totalPrice={totalPrice}
        isOwner={isOwner}
        handleOrder={handleOrder}
      />
    </div>
  );
}
