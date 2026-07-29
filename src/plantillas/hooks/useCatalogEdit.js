import { useState, useMemo, useEffect } from 'react';

export function useCatalogEdit({
  localProducts,
  setLocalProducts,
  setDeletedProductsIds,
  isPremium,
  onHasUnsavedProduct,
  ordersEnabled,
  carouselOrder,
  setCarouselOrder,
  deliveryMethods,
  paymentQrImage,
  onModalOpenChange
}) {
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [premiumModalData, setPremiumModalData] = useState({ isOpen: false, featureName: '' });
  const [expandedCatalogs, setExpandedCatalogs] = useState({});

  useEffect(() => {
    if (onModalOpenChange) {
      onModalOpenChange(isInventoryOpen || isModalOpen || premiumModalData.isOpen);
    }
  }, [isInventoryOpen, isModalOpen, premiumModalData.isOpen, onModalOpenChange]);

  const toggleCatalog = (catalogName) => {
    setExpandedCatalogs(prev => ({
      ...prev,
      [catalogName]: prev[catalogName] === undefined ? true : !prev[catalogName]
    }));
  };

  const limitRegistered = isPremium ? 50 : 3;
  const limitVisible = isPremium ? 15 : 3;

  const orderedCarousels = useMemo(() => {
    let savedList = [];
    if (isPremium && carouselOrder) {
      try {
        const parsed = JSON.parse(carouselOrder);
        if (Array.isArray(parsed)) {
          savedList = parsed.filter(Boolean);
        }
      } catch (e) {
        console.error("Error parsing carouselOrder:", e);
      }
    }

    const productCarousels = Array.from(new Set(
      localProducts.map(p => p.carousel_name || 'Catálogo')
    )).filter(Boolean);

    const mergedCarousels = Array.from(new Set([...savedList, ...productCarousels])).filter(Boolean);

    return mergedCarousels.length > 0 ? mergedCarousels : ['Catálogo'];
  }, [isPremium, carouselOrder, localProducts]);

  const moveCarousel = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= orderedCarousels.length) return;

    const newList = [...orderedCarousels];
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;

    if (setCarouselOrder) {
      setCarouselOrder(JSON.stringify(newList));
    }
  };

  const handleAddSection = (cleanName) => {
    const newList = [...orderedCarousels, cleanName];
    if (setCarouselOrder) {
      setCarouselOrder(JSON.stringify(newList));
    }
  };

  const handleRemoveSection = (name) => {
    const hasProducts = localProducts.some(p => (p.carousel_name || 'Catálogo') === name);
    if (hasProducts) return;

    if (!window.confirm(`¿Eliminar la sección "${name}"?`)) return;

    const newList = orderedCarousels.filter(c => c !== name);
    if (setCarouselOrder) {
      setCarouselOrder(JSON.stringify(newList));
    }
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    if (onHasUnsavedProduct) {
      onHasUnsavedProduct(false);
    }
  };

  const handleSubmitProduct = (productData) => {
    if (productData.id || productData.tempId) {
      setLocalProducts(prev => prev.map(p => {
        if ((productData.id && p.id === productData.id) || (productData.tempId && p.tempId === productData.tempId)) {
          return { ...p, ...productData };
        }
        return p;
      }));
    } else {
      const visibleCount = localProducts.filter(p => p.is_visible !== false).length;
      let isVisible = productData.is_visible;

      if (isVisible && visibleCount >= limitVisible) {
        isVisible = false;
      }

      const newProduct = { ...productData, tempId: Date.now().toString(), is_visible: isVisible };
      setLocalProducts(prev => [...prev, newProduct]);
    }
    handleCloseModal();
  };

  const handleDelete = (product) => {
    if (!window.confirm("¿Eliminar este producto del catálogo?")) return;

    if (product.id) {
      setDeletedProductsIds(prev => [...prev, product.id]);
    }

    setLocalProducts(prev => prev.filter(p => {
      if (product.id) return p.id !== product.id;
      return p.tempId !== product.tempId;
    }));
  };

  const toggleVisibility = (product) => {
    if (product.is_visible === false) {
      const visibleCount = localProducts.filter(p => p.is_visible !== false).length;
      if (visibleCount >= limitVisible) {
        return;
      }
    }

    setLocalProducts(prev => prev.map(p => {
      if ((p.id && p.id === product.id) || (p.tempId && p.tempId === product.tempId)) {
        return { ...p, is_visible: p.is_visible === false ? true : false, isModified: true };
      }
      return p;
    }));
  };

  const handleStockChange = (product, newStock) => {
    setLocalProducts(prev => prev.map(p => {
      if ((p.id && p.id === product.id) || (p.tempId && p.tempId === product.tempId)) {
        return { ...p, stock: newStock, isModified: true };
      }
      return p;
    }));
  };

  const handleCloseInventory = () => {
    if (isPremium && ordersEnabled) {
      if (!deliveryMethods || deliveryMethods.length === 0) {
        alert("Debes agregar al menos un método de entrega antes de salir, o desmarcar la casilla de pedidos.");
        return;
      }
      if (!paymentQrImage) {
        alert("Debes subir la imagen de tu QR de Pago Bancario antes de salir, o desmarcar la casilla de pedidos.");
        return;
      }
    }
    setIsInventoryOpen(false);
  };

  const availableCarousels = orderedCarousels.length > 0 ? orderedCarousels : ['Catálogo'];

  return {
    isInventoryOpen,
    setIsInventoryOpen,
    isModalOpen,
    selectedProduct,
    premiumModalData,
    setPremiumModalData,
    expandedCatalogs,
    limitRegistered,
    limitVisible,
    orderedCarousels,
    availableCarousels,
    toggleCatalog,
    moveCarousel,
    handleAddSection,
    handleRemoveSection,
    handleOpenEdit,
    handleOpenCreate,
    handleCloseModal,
    handleSubmitProduct,
    handleDelete,
    toggleVisibility,
    handleStockChange,
    handleCloseInventory
  };
}
