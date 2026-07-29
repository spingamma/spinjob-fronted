import { useState, useRef, useEffect } from 'react';

export function useCarouselScroll(products) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

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
  }, [productsKey, products.length]);

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

  const handleCardClick = (idx, isActive, product, handleProductClick) => {
    if (!isActive && containerRef.current) {
      const child = containerRef.current.children[idx];
      if (child) {
        child.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    } else {
      if (handleProductClick) {
        handleProductClick(product);
      }
    }
  };

  return {
    activeIndex,
    containerRef,
    handleScroll,
    handleCardClick
  };
}
