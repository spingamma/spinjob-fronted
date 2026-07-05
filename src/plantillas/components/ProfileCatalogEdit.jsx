import React, { useState, useMemo } from 'react';
import { Plus, Package, Trash2, Pencil, Eye, EyeOff } from 'lucide-react';
import ProductFormModal from './ProductFormModal';

export default function ProfileCatalogEdit({
  localProducts,
  setLocalProducts,
  deletedProductsIds,
  setDeletedProductsIds,
  isPremium,
  onHasUnsavedProduct,
  ordersEnabled = true,
  setOrdersEnabled,
  carouselOrder,
  setCarouselOrder
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newSectionName, setNewSectionName] = useState('');

  const limit = isPremium ? 15 : 3;

  // 1. Parse and merge sections to get orderedCarousels list
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

  const handleAddSection = (e) => {
    e.preventDefault();
    const cleanName = newSectionName.trim();
    if (!cleanName) return;

    // Check if already exists case-insensitively
    if (orderedCarousels.some(c => c.toLowerCase() === cleanName.toLowerCase())) {
      alert("Ya existe una sección con este nombre.");
      return;
    }

    const newList = [...orderedCarousels, cleanName];
    if (setCarouselOrder) {
      setCarouselOrder(JSON.stringify(newList));
    }
    setNewSectionName('');
  };

  const handleRemoveSection = (name) => {
    // Cannot remove if it has products
    const hasProducts = localProducts.some(p => (p.carousel_name || 'Catálogo') === name);
    if (hasProducts) {
      alert("No puedes eliminar una sección que contiene productos. Mueve o elimina los productos primero.");
      return;
    }

    if (!window.confirm(`¿Eliminar la sección "${name}"?`)) return;

    const newList = orderedCarousels.filter(c => c !== name);
    if (setCarouselOrder) {
      setCarouselOrder(JSON.stringify(newList));
    }
  };

  const hasProducts = (name) => {
    return localProducts.some(p => (p.carousel_name || 'Catálogo') === name);
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
      // Edit existing product
      setLocalProducts(prev => prev.map(p => {
        if ((productData.id && p.id === productData.id) || (productData.tempId && p.tempId === productData.tempId)) {
          return {
            ...p,
            ...productData
          };
        }
        return p;
      }));
    } else {
      // Create new product
      const newProduct = {
        ...productData,
        tempId: Date.now().toString()
      };
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
    setLocalProducts(prev => prev.map(p => {
      if ((p.id && p.id === product.id) || (p.tempId && p.tempId === product.tempId)) {
        return { ...p, is_visible: p.is_visible === false ? true : false, isModified: true };
      }
      return p;
    }));
  };

  const availableCarousels = orderedCarousels.length > 0 ? orderedCarousels : ['Catálogo'];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-[#1A535C] mb-4 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-[#6A431F] rounded-full"></span> Catálogo de Productos
      </h3>

      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm">
        {isPremium && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-orange-50/50 rounded-2xl border border-orange-100/50">
            <input
              data-testid="ordersEnabledCheckbox"
              type="checkbox"
              id="ordersEnabledCheckbox"
              checked={ordersEnabled}
              onChange={(e) => setOrdersEnabled(e.target.checked)}
              className="w-4 h-4 text-[#F9842C] focus:ring-[#F9842C] border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="ordersEnabledCheckbox" className="text-sm font-bold text-[#1A535C] cursor-pointer select-none">
              Habilitar pedidos para este catálogo (carrito de compras)
            </label>
          </div>
        )}

        {/* Section Reordering & Adding UI */}
        {isPremium && (
          <div className="mb-6 p-4 bg-orange-50/30 border border-orange-100 rounded-2xl text-left">
            <h4 className="text-xs font-bold text-[#1A535C] mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F9842C]"></span> Gestionar Secciones del Catálogo
            </h4>

            {/* List and Order */}
            <div className="space-y-1.5 mb-3.5">
              {orderedCarousels.map((name, idx) => {
                const empty = !hasProducts(name);
                return (
                  <div key={name} className="flex items-center justify-between bg-white px-3.5 py-2 rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-xs font-bold text-[#1A535C]">{name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        data-testid={`btn-move-up-${idx}`}
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveCarousel(idx, -1)}
                        className="p-1 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        title="Subir"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
                      </button>
                      <button
                        data-testid={`btn-move-down-${idx}`}
                        type="button"
                        disabled={idx === orderedCarousels.length - 1}
                        onClick={() => moveCarousel(idx, 1)}
                        className="p-1 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        title="Bajar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                      </button>
                      {empty && name !== 'Catálogo' && (
                        <button
                          data-testid={`btn-remove-section-${name}`}
                          type="button"
                          onClick={() => handleRemoveSection(name)}
                          className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors ml-1 border border-transparent hover:border-red-100"
                          title="Eliminar sección vacía"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Section Form */}
            <form onSubmit={handleAddSection} className="flex flex-col sm:flex-row gap-2">
              <input
                data-testid="input-new-section-name"
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="Nuevo Catalogo"
                className="w-full sm:flex-1 bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-[#1A535C] outline-none focus:border-[#F9842C] transition-all"
                required
              />
              <button
                data-testid="btn-add-section"
                type="submit"
                className="bg-[#F9842C] hover:bg-[#e06516] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shrink-0 w-full sm:w-auto"
              > Guardar
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-3">
          {localProducts.length < limit && (
            <button
              data-testid="add-product-btn"
              onClick={handleOpenCreate}
              className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-[#F9842C] hover:bg-orange-50 transition-all group h-20"
            >
              <Plus size={20} className="text-gray-300 group-hover:text-[#F9842C] transition-colors mb-0.5" />
              <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#F9842C] transition-colors">Añadir Producto</span>
            </button>
          )}

          {localProducts.map((product) => (
            <div key={product.id || product.tempId} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 relative group flex flex-col min-h-[160px]">
              <div className="relative overflow-hidden bg-gray-50 flex-shrink-0">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <Package size={36} className="text-gray-300" />
                  </div>
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <h4 className="font-semibold text-gray-800 text-sm truncate">{product.name}</h4>
                {product.description && (
                  <p className="text-xs text-[#757778] line-clamp-2 mt-0.5">{product.description}</p>
                )}
                <div className="mt-auto pt-3 flex items-center justify-between">
                  <p className="text-teal-600 font-bold text-sm">{product.price || ''}</p>
                  <div className="flex gap-1.5">
                    <button
                      data-testid={`visibility-btn-${product.id || product.tempId}`}
                      onClick={(e) => { e.stopPropagation(); toggleVisibility(product); }}
                      className={`p-1.5 rounded-lg transition-colors border shadow-sm ${product.is_visible !== false ? 'text-[#F9842C] bg-orange-50 border-orange-100 hover:bg-orange-100' : 'text-gray-400 bg-gray-50 border-gray-100 hover:bg-gray-100'}`}
                      title={product.is_visible !== false ? "Ocultar elemento" : "Hacer visible"}
                    >
                      {product.is_visible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button
                      data-testid={`edit-btn-${product.id || product.tempId}`}
                      onClick={(e) => { e.stopPropagation(); handleOpenEdit(product); }}
                      className="p-1.5 text-gray-400 hover:text-[#6A431F] bg-gray-50 hover:bg-[#6A431F]/10 rounded-lg transition-colors border border-gray-100 shadow-sm"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      data-testid={`delete-btn-${product.id || product.tempId}`}
                      onClick={(e) => { e.stopPropagation(); handleDelete(product); }}
                      className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors border border-gray-100 shadow-sm"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs font-bold text-[#757778]">{localProducts.length}/{limit} productos añadidos</p>
        </div>
      </div>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
        onSubmit={handleSubmitProduct}
        isPremium={isPremium}
        availableCarousels={availableCarousels}
        onHasUnsavedProduct={onHasUnsavedProduct}
      />
    </div>
  );
}
