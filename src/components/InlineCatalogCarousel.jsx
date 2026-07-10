import React, { useState, useEffect, useRef } from 'react';
import { Package, ExternalLink, Loader2, MoreHorizontal, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cleanWhatsappNumber } from '../utils/phone';
import miCarrito from '../assets/oso-carrito.webp';

export default function InlineCatalogCarousel({ slug, catalogUrl, whatsappNumber, businessName, country = 'Bolivia', theme = 'light', isPremium = false, ordersEnabled = true, carouselOrder, deliveryMethods }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [limitMsg, setLimitMsg] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    fetch(`${API_URL}/businesses/${slug}/products`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setProducts(data.filter(p => p.is_visible !== false)))
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

  // Agrupar productos por carousel_name
  let grouped = {};
  if (isPremium) {
    products.forEach(p => {
      const cname = p.carousel_name || 'Catálogo';
      if (!grouped[cname]) grouped[cname] = [];
      grouped[cname].push(p);
    });
  } else {
    grouped['Catálogo'] = products;
  }

  // Tomar hasta 3 carruseles si es premium, si no 1
  const maxCarousels = isPremium ? 3 : 1;
  let carouselKeys = Object.keys(grouped);
  if (isPremium && carouselOrder) {
    try {
      const orderList = JSON.parse(carouselOrder);
      if (Array.isArray(orderList) && orderList.length > 0) {
        carouselKeys.sort((a, b) => {
          const indexA = orderList.indexOf(a);
          const indexB = orderList.indexOf(b);
          const posA = indexA === -1 ? Infinity : indexA;
          const posB = indexB === -1 ? Infinity : indexB;
          return posA - posB;
        });
      }
    } catch (e) {
      console.error("Error parsing carouselOrder in InlineCatalogCarousel:", e);
    }
  }
  carouselKeys = carouselKeys.slice(0, maxCarousels);

  const updateCart = (product, delta) => {
    let limitReached = false;
    setCart(prev => {
      const current = prev[product.id]?.quantity || 0;
      const newQuantity = current + delta;

      if (delta > 0 && product.stock !== undefined && product.stock !== null && product.stock !== '') {
        if (newQuantity > product.stock) {
          limitReached = true;
          return prev;
        }
      }

      if (newQuantity <= 0) {
        const newCart = { ...prev };
        delete newCart[product.id];
        return newCart;
      }
      return {
        ...prev,
        [product.id]: { product, quantity: newQuantity }
      };
    });

    if (limitReached) {
      setLimitMsg(product.id);
      setTimeout(() => setLimitMsg(null), 2000);
    }
  };

  const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = Object.values(cart).reduce((sum, item) => {
    // try to parse price as float. e.g., "Bs. 120" -> 120
    const priceNum = parseFloat((item.product.price || "0").replace(/[^\d.-]/g, ''));
    return sum + (priceNum || 0) * item.quantity;
  }, 0);

  const handleOrder = () => {
    const token = localStorage.getItem('spingamma_token');
    if (!token) {
      alert("Para realizar un pedido necesitas iniciar sesión. Por favor ve a la página principal e ingresa a tu cuenta.");
      return;
    }
    navigate(`/perfil/${slug}/orden`, { state: { cart, businessName, slug, deliveryMethods } });
  };

  return (
    <div className="w-full relative">
      {carouselKeys.length > 0 ? (
        <div className="flex flex-col gap-4">
          {carouselKeys.map((cname, idx) => (
            <CarouselBlock
              key={idx}
              title={cname.toUpperCase()}
              products={grouped[cname]}
              isDark={isDark}
              whatsappNumber={whatsappNumber}
              businessName={businessName}
              country={country}
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
      {isPremium && ordersEnabled && totalItems > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-[90] flex justify-center animate-in slide-in-from-bottom-10">
          <button
            data-testid="order-checkout-btn"
            onClick={handleOrder}
            className="w-full max-w-sm bg-[#F9842C] hover:bg-[#e06516] text-white font-bold py-4 px-6 rounded-2xl shadow-xl flex items-center justify-between transition-all transform hover:scale-[1.02]"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                <img src={miCarrito} alt="Carrito" className="w-7 h-7 object-contain drop-shadow-md" />
              </div>
              <span className="text-lg">Ordenar ({totalItems})</span>
            </div>
            <span className="text-lg">Bs. {totalPrice.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  );
}

const CarouselBlock = ({ title, products, isDark, whatsappNumber, businessName, country, isPremium, ordersEnabled, cart, updateCart, limitMsg }) => {
  // Crear un carrusel pseudo-infinito repitiendo los productos 20 veces (nadie hace swipe 50+ veces)
  const displayProducts = products.length > 0 ? Array(20).fill(products).flat() : [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedProducts, setExpandedProducts] = useState({});
  const containerRef = useRef(null);

  const toggleExpand = (idx, e) => {
    e.stopPropagation();
    setExpandedProducts(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

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

  const productsKey = products.map(p => p.id).join(',');

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
  }, [productsKey]);

  const handleProductClick = (product) => {
    // A pedido del usuario, no redirigir automáticamente a WhatsApp al hacer click en el producto.
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
        className="flex items-center overflow-x-auto snap-x snap-mandatory hide-scroll px-[calc(50%-97.5px)] sm:px-[calc(50%-117.5px)] md:px-[calc(50%-135px)] gap-4 sm:gap-6 pb-4 pt-2 -mb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`.hide-scroll::-webkit-scrollbar { display: none; }`}</style>

        {displayProducts.map((product, idx) => {
          const isActive = activeIndex === idx;

          return (
            <div
              key={`${product.id}-${idx}`}
              data-product-idx={idx}
              className={`snap-center shrink-0 h-fit w-[195px] sm:w-[235px] md:w-[270px] transition-all duration-300 ease-out flex flex-col rounded-[1.25rem] overflow-hidden border cursor-pointer ${isActive
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
              {product.image_url && (
                <div className="relative w-full flex flex-col justify-start">
                  <img src={product.image_url} alt={product.name} className="w-full h-auto max-h-[240px] sm:max-h-[280px] md:max-h-[320px] object-contain transition-transform duration-500 hover:scale-105 drop-shadow-sm" />
                </div>
              )}

              {/* Info inferior con fondo blanco/oscuro */}
              <div className="flex flex-col p-4 sm:p-5 pt-3 sm:pt-4 w-full text-left flex-1 justify-between">
                <div>
                  <h4 className={`font-bold text-sm sm:text-base leading-tight mb-1.5 line-clamp-2 ${isDark ? 'text-white' : 'text-[#1A535C]'}`}>
                    {product.name}
                  </h4>
                  {product.description && (
                    <div className="mb-1">
                      <p className={`text-[11px] sm:text-xs whitespace-pre-wrap ${expandedProducts[idx] ? '' : 'line-clamp-2'} ${isDark ? 'text-gray-400' : 'text-[#757778]'}`}>
                        {product.description}
                      </p>
                      {product.description.length > 60 && (
                        <button
                          onClick={(e) => toggleExpand(idx, e)}
                          className={`text-[10px] font-bold mt-1 cursor-pointer hover:underline block ${isDark ? 'text-[#C8A721]' : 'text-[#F9842C]'}`}
                        >
                          {expandedProducts[idx] ? 'Ver menos' : 'Ver más'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-end justify-between mt-1">
                  {product.price ? (
                    <p className={`font-black text-base sm:text-lg ${isDark ? 'text-[#C8A721]' : 'text-[#1A535C]'}`}>
                      {product.price}
                    </p>
                  ) : (
                    <p className="font-bold text-base sm:text-lg text-transparent select-none">-</p>
                  )}

                  {isPremium && ordersEnabled && (
                    product.stock === 0 ? (
                      <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-lg p-1.5 px-3">
                        <span className="font-bold text-xs uppercase tracking-wider">Agotado</span>
                      </div>
                    ) : (
                      <div
                        className="flex items-center gap-2 bg-gray-100 rounded-lg p-1"
                        onClick={(e) => e.stopPropagation()} // Prevent carousel item click
                      >
                        <button
                          onClick={() => updateCart(product, -1)}
                          data-testid={`remove-from-cart-btn-${product.id}`}
                          className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-red-500"
                        >
                          <Minus size={14} />
                        </button>
                        <span data-testid={`cart-quantity-${product.id}`} className="font-bold text-sm min-w-[1.2rem] text-center text-[#1A535C]">
                          {cart[product.id]?.quantity || 0}
                        </span>
                        <div className="relative">
                          <button
                            onClick={() => updateCart(product, 1)}
                            data-testid={`add-to-cart-btn-${product.id}`}
                            className={`w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm transition-colors ${
                              product.stock !== undefined && product.stock !== null && product.stock !== '' && (cart[product.id]?.quantity || 0) >= product.stock
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-[#1A535C] hover:text-[#F9842C]'
                            }`}
                          >
                            <Plus size={14} />
                          </button>
                          {limitMsg === product.id && (
                            <div className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-gray-800 text-white text-[10px] font-bold rounded shadow-md whitespace-nowrap z-50">
                              Stock máximo
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
