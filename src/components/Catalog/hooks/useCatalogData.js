import { useState, useEffect } from 'react';
import { API_URL } from '../../../config/api';

export function useCatalogData(slug, isPremium, carouselOrder, ownerId) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [prevSlug, setPrevSlug] = useState(slug);

  if (slug !== prevSlug) {
    setPrevSlug(slug);
    setLoading(!!slug);
  }

  const userStr = localStorage.getItem('spingamma_user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const isOwner = currentUser && (currentUser.is_admin || (ownerId && String(currentUser.id) === String(ownerId)));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSearchTerm('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!slug) {
      return;
    }
    fetch(`${API_URL}/businesses/${slug}/products`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        if (isOwner) {
          setProducts(data);
        } else {
          setProducts(data.filter(p => p.is_visible !== false));
        }
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [slug, isOwner]);

  const visibleProducts = isOwner ? products : products.filter(p => p.is_visible !== false);
  const filteredProducts = visibleProducts.filter(p => 
    (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  return {
    products,
    loading,
    searchTerm,
    setSearchTerm,
    filteredProducts,
    grouped,
    carouselKeys,
    isOwner
  };
}
