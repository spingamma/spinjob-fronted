import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Package, Trash2, Pencil, Eye, EyeOff, Layers, Settings2, X, Archive, ChevronDown, ChevronRight, ChevronUp, Check } from 'lucide-react';
import ProductFormModal from './ProductFormModal';
import PremiumModal from '../../components/PremiumModal';

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
  setCarouselOrder,
  deliveryMethods = [],
  setDeliveryMethods,
  onModalOpenChange
}) {
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [premiumModalData, setPremiumModalData] = useState({ isOpen: false, featureName: '' });
  const [expandedCatalogs, setExpandedCatalogs] = useState({});

  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [newDeliveryMethod, setNewDeliveryMethod] = useState('');
  const [editingDeliveryIndex, setEditingDeliveryIndex] = useState(null);
  const [editingDeliveryText, setEditingDeliveryText] = useState('');
  const [sectionError, setSectionError] = useState('');

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

  const handleAddSection = (e) => {
    e.preventDefault();
    setSectionError('');
    const cleanName = newSectionName.trim();
    if (!cleanName) return;

    if (orderedCarousels.some(c => c.toLowerCase() === cleanName.toLowerCase())) {
      setSectionError("Ya existe una sección con este nombre.");
      return;
    }

    const newList = [...orderedCarousels, cleanName];
    if (setCarouselOrder) {
      setCarouselOrder(JSON.stringify(newList));
    }
    setNewSectionName('');
  };

  const handleRemoveSection = (name) => {
    const hasProducts = localProducts.some(p => (p.carousel_name || 'Catálogo') === name);
    if (hasProducts) {
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

  const handleOrdersEnabledChange = (e) => {
    const isChecked = e.target.checked;
    setOrdersEnabled(isChecked);
    if (isChecked && (!deliveryMethods || deliveryMethods.length === 0)) {
      if (setDeliveryMethods) {
        setDeliveryMethods(["Entrega en el local"]);
      }
    }
  };

  const handleAddDeliveryMethod = (e) => {
    e.preventDefault();
    if (!newDeliveryMethod.trim() || !setDeliveryMethods) return;
    setDeliveryMethods([...deliveryMethods, newDeliveryMethod.trim()]);
    setNewDeliveryMethod('');
  };

  const handleRemoveDeliveryMethod = (index) => {
    if (!setDeliveryMethods) return;
    setDeliveryMethods(deliveryMethods.filter((_, idx) => idx !== index));
  };

  const handleStartEditDelivery = (index, text) => {
    setEditingDeliveryIndex(index);
    setEditingDeliveryText(text);
  };

  const handleSaveEditDelivery = (index) => {
    if (!setDeliveryMethods || !editingDeliveryText.trim()) return;
    const newMethods = [...deliveryMethods];
    newMethods[index] = editingDeliveryText.trim();
    setDeliveryMethods(newMethods);
    setEditingDeliveryIndex(null);
    setEditingDeliveryText('');
  };

  const handleCloseInventory = () => {
    if (isPremium && ordersEnabled && (!deliveryMethods || deliveryMethods.length === 0)) {
      alert("Debes agregar al menos un método de entrega antes de salir, o desmarcar la casilla de pedidos.");
      return;
    }
    setIsInventoryOpen(false);
  };

  const availableCarousels = orderedCarousels.length > 0 ? orderedCarousels : ['Catálogo'];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-[#1A535C] mb-4 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-[#6A431F] rounded-full"></span> Catálogo de Productos
      </h3>

      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center py-10">
        <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
          Gestiona todos tus productos, opciones de inventario y categorías desde un solo lugar.
        </p>
        <button
          data-testid="open-inventory-btn"
          onClick={() => setIsInventoryOpen(true)}
          className="bg-[#F9842C] hover:bg-[#e06516] text-white px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95"
        >
          <Layers size={20} />
          Catálogo e Inventario
        </button>
      </div>

      {isInventoryOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#1A535C]/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onMouseDown={handleCloseInventory}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in zoom-in-95 duration-200"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-[#1A535C] to-[#32698F] p-5 relative shrink-0 flex items-center justify-between rounded-t-3xl">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay rounded-t-3xl"></div>
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Archive size={20} className="text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-extrabold text-white">Catálogo e Inventario</h3>
                  <p className="text-white/70 text-xs">Gestiona tus productos y secciones</p>
                </div>
              </div>
              <button
                data-testid="close-inventory-btn"
                onClick={handleCloseInventory}
                className="relative z-10 text-white/80 hover:text-white transition-colors p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-left flex-1 bg-gray-50/50">

              {/* El bloque antiguo de Gestionar Secciones fue movido a Productos Registrados */}

              {/* 2. Configuración de Catálogo */}
              <div className="pt-2">
                <h4 className="text-sm font-bold text-[#1A535C] flex items-center gap-2 mb-4">
                  <Settings2 size={16} className="text-[#F9842C]" /> Configuración de Catálogo
                </h4>

                {isPremium && (
                  <div className="mb-2 p-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2">
                      <input
                        data-testid="ordersEnabledCheckbox"
                        type="checkbox"
                        id="ordersEnabledCheckbox"
                        checked={ordersEnabled}
                        onChange={handleOrdersEnabledChange}
                        className="w-4 h-4 text-[#F9842C] focus:ring-[#F9842C] border-gray-300 rounded cursor-pointer"
                      />
                      <label htmlFor="ordersEnabledCheckbox" className="text-xs font-bold text-[#1A535C] cursor-pointer select-none">
                        Habilitar "Mis pedidos" (Carrito de compras)
                      </label>
                    </div>

                    {ordersEnabled && (
                      <div className="mt-4 border-t border-gray-100 pt-4">
                        <div 
                          className="flex justify-between items-center cursor-pointer mb-2"
                          onClick={() => setIsDeliveryOpen(!isDeliveryOpen)}
                        >
                          <label className="text-xs font-bold text-[#1A535C] cursor-pointer">Métodos de entrega</label>
                          <div className="text-gray-400">
                            {isDeliveryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>

                        {isDeliveryOpen && (
                          <div className="space-y-3 mt-3 animate-in fade-in zoom-in-95 duration-200">
                            <form onSubmit={handleAddDeliveryMethod} className="flex gap-2">
                              <input
                                data-testid="delivery-method-input"
                                type="text"
                                value={newDeliveryMethod}
                                onChange={(e) => setNewDeliveryMethod(e.target.value)}
                                placeholder="Añadir opción (ej. Envío a domicilio)"
                                className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#F9842C]"
                              />
                              <button
                                data-testid="add-delivery-btn"
                                type="submit"
                                disabled={!newDeliveryMethod.trim()}
                                className="bg-[#F9842C] hover:bg-[#e06516] text-white px-3 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                              >
                                Añadir
                              </button>
                            </form>

                            <div className="space-y-2">
                              {deliveryMethods.map((method, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-lg p-2 px-3">
                                  {editingDeliveryIndex === idx ? (
                                    <div className="flex flex-1 gap-2">
                                      <input
                                        type="text"
                                        value={editingDeliveryText}
                                        onChange={(e) => setEditingDeliveryText(e.target.value)}
                                        className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-[#F9842C]"
                                        autoFocus
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleSaveEditDelivery(idx)}
                                        className="text-green-600 bg-green-50 p-1 rounded hover:bg-green-100 transition-colors"
                                      >
                                        <Check size={14} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingDeliveryIndex(null)}
                                        className="text-gray-400 bg-gray-100 p-1 rounded hover:bg-gray-200 transition-colors"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <span className="text-xs font-semibold text-gray-700">{method}</span>
                                      <div className="flex gap-2 ml-2">
                                        <button
                                          type="button"
                                          onClick={() => handleStartEditDelivery(idx, method)}
                                          className="text-gray-400 hover:text-[#6A431F] transition-colors"
                                        >
                                          <Pencil size={14} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveDeliveryMethod(idx)}
                                          className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              ))}
                              {deliveryMethods.length === 0 && (
                                <p className="text-[10px] text-red-500 font-bold bg-red-50 p-2 rounded-lg text-center">Debes agregar al menos una opción de entrega</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Botón Añadir Producto y Listado */}
              <div className="pt-2 border-t border-gray-200">
                {localProducts.length < limitRegistered && (
                  <button
                    data-testid="add-product-btn"
                    onClick={handleOpenCreate}
                    className="w-full bg-[#1A535C] hover:bg-[#133d44] text-white px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm mb-6 mt-4"
                  >
                    <Plus size={18} />
                    Añadir Producto
                  </button>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-[#1A535C] flex items-center gap-2">
                      <Package size={16} className="text-[#F9842C]" /> Productos Registrados
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                        {localProducts.length}/{limitRegistered}
                      </span>
                      {!isPremium && (
                        <button
                          data-testid="upload-limit-premium-btn"
                          onClick={() => setPremiumModalData({ isOpen: true, featureName: 'Límite de Productos' })}
                          className="flex items-center justify-center px-2.5 py-1 bg-orange-100 rounded-lg text-xs font-bold w-full sm:w-auto text-orange-600 hover:text-orange-700 hover:bg-orange-200 transition-colors gap-1 shadow-sm"
                          title="Mejora a Premium para subir hasta 50 productos"
                        >
                          🔒 {localProducts.length}/50
                        </button>
                      )}
                    </div>
                  </div>

                  {localProducts.length === 0 ? (
                    <div className="text-center py-8 bg-white border border-gray-100 rounded-2xl">
                      <p className="text-sm text-gray-500">No hay productos en tu catálogo.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orderedCarousels.map((catalogName, idx) => {
                        const catalogProducts = localProducts.filter(p => (p.carousel_name || 'Catálogo') === catalogName);
                        const empty = catalogProducts.length === 0;
                        if (empty && catalogName === 'Catálogo') return null; // Don't show default Catálogo if empty, but maybe show other custom empty sections?
                        // Actually let's show all sections so they can delete them if empty, just like before.
                        
                        const isExpanded = !!expandedCatalogs[catalogName];

                        return (
                          <div key={catalogName} className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
                            <div
                              data-testid={`toggle-catalog-${catalogName}`}
                              onClick={() => toggleCatalog(catalogName)}
                              className="w-full bg-gray-50 hover:bg-gray-100 px-4 py-3 flex items-center justify-between transition-colors border-b border-gray-100 cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#1A535C] text-sm">{catalogName}</span>
                                <span className="text-xs bg-white px-2 py-0.5 rounded-md border border-gray-200 text-gray-500 font-semibold">
                                  {catalogProducts.length}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                {isPremium && (
                                  <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-0.5 shadow-sm" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      data-testid={`btn-move-up-${idx}`}
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={(e) => { e.stopPropagation(); moveCarousel(idx, -1); }}
                                      className="p-1 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                    >
                                      <ChevronUp size={16} />
                                    </button>
                                    <button
                                      data-testid={`btn-move-down-${idx}`}
                                      type="button"
                                      disabled={idx === orderedCarousels.length - 1}
                                      onClick={(e) => { e.stopPropagation(); moveCarousel(idx, 1); }}
                                      className="p-1 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                    >
                                      <ChevronDown size={16} />
                                    </button>
                                    {empty && catalogName !== 'Catálogo' && (
                                      <button
                                        data-testid={`btn-remove-section-${catalogName}`}
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleRemoveSection(catalogName); }}
                                        className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    )}
                                  </div>
                                )}
                                <div className="text-gray-400">
                                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                </div>
                              </div>
                            </div>
                            
                            {isExpanded && (
                              <div className="p-2 space-y-2 bg-gray-50/50">
                                {catalogProducts.map((product) => (
                                  <div key={product.id || product.tempId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-hover hover:border-gray-200">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                      <div className="flex-1 min-w-0 flex items-center justify-between gap-2 pr-2">
                                        <h4 className="font-bold text-gray-800 text-sm truncate" title={product.name}>{product.name}</h4>
                                        <span className="text-xs text-teal-600 font-semibold flex-shrink-0 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">{product.price || 'Sin precio'}</span>
                                      </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 flex-shrink-0 mt-2 sm:mt-0">
                                      {isPremium && (
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-200">
                                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Stock</span>
                                          <input
                                            data-testid={`stock-input-${product.id || product.tempId}`}
                                            type="number"
                                            min="0"
                                            value={product.stock !== undefined && product.stock !== null ? product.stock : ''}
                                            onChange={(e) => handleStockChange(product, e.target.value)}
                                            placeholder="∞"
                                            disabled={product.stock === undefined || product.stock === null}
                                            className={`w-12 text-xs bg-white border rounded px-1.5 py-0.5 text-center font-semibold outline-none transition-colors ${
                                              product.stock === undefined || product.stock === null 
                                                ? 'opacity-50 cursor-not-allowed border-gray-200 text-[#1A535C]' 
                                                : product.stock === '' 
                                                  ? 'border-red-500 text-red-500 bg-red-50 focus:border-red-600' 
                                                  : 'border-gray-200 text-[#1A535C] focus:border-[#F9842C]'
                                            }`}
                                          />
                                          <label className="flex items-center gap-1 ml-1 cursor-pointer" title="Stock infinito">
                                            <input
                                              data-testid={`stock-infinite-check-${product.id || product.tempId}`}
                                              type="checkbox"
                                              className="w-3.5 h-3.5 accent-[#F9842C] cursor-pointer"
                                              checked={product.stock === undefined || product.stock === null}
                                              onChange={(e) => handleStockChange(product, e.target.checked ? null : '0')}
                                            />
                                            <span className="text-[12px] font-bold text-gray-500 leading-none pb-0.5">∞</span>
                                          </label>
                                        </div>
                                      )}

                                      <div className="flex gap-1.5">
                                        <button
                                          data-testid={`edit-btn-${product.id || product.tempId}`}
                                          onClick={() => handleOpenEdit(product)}
                                          className="p-1.5 text-gray-400 hover:text-[#6A431F] bg-gray-50 hover:bg-[#6A431F]/10 rounded-lg transition-colors border border-gray-100"
                                          title="Editar"
                                        >
                                          <Pencil size={14} />
                                        </button>
                                        {isPremium && (
                                          <div className="flex items-center gap-1">
                                            <button
                                              data-testid={`visibility-btn-${product.id || product.tempId}`}
                                              onClick={() => toggleVisibility(product)}
                                              className={`p-1.5 rounded-lg transition-colors border ${product.is_visible !== false ? 'text-[#F9842C] bg-orange-50 border-orange-100 hover:bg-orange-100' : 'text-gray-400 bg-gray-50 border-gray-100 hover:bg-gray-100'}`}
                                              title={product.is_visible !== false ? "Ocultar elemento" : (localProducts.filter(p => p.is_visible !== false).length >= limitVisible ? "Límite alcanzado" : "Hacer visible")}
                                            >
                                              {product.is_visible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                                            </button>
                                            <span className="text-[10px] font-bold text-gray-400 w-7 text-center" title="Productos visibles / Límite">
                                              {localProducts.filter(p => p.is_visible !== false).length}/{limitVisible}
                                            </span>
                                          </div>
                                        )}
                                        <button
                                          data-testid={`delete-btn-${product.id || product.tempId}`}
                                          onClick={() => handleDelete(product)}
                                          className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors border border-gray-100"
                                          title="Eliminar"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* Formulario de nueva sección integrado */}
                      {isPremium ? (
                        <div className="flex flex-col mt-6">
                          {sectionError && <span className="text-red-500 text-xs font-bold px-4 mb-1">{sectionError}</span>}
                          <form onSubmit={handleAddSection} className="flex flex-col sm:flex-row gap-2 p-4 bg-white border border-gray-100 rounded-xl shadow-sm transition-all duration-300">
                            <input
                            data-testid="input-new-section-name"
                            type="text"
                            value={newSectionName}
                            onChange={(e) => setNewSectionName(e.target.value)}
                            placeholder="Nueva Sección"
                            className="w-full sm:flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-[#1A535C] outline-none focus:border-[#F9842C] transition-all"
                            required
                          />
                          {newSectionName.trim().length > 0 && (
                            <button
                              data-testid="btn-add-section"
                              type="submit"
                              className="bg-[#F9842C] hover:bg-[#e06516] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 animate-in fade-in zoom-in-95 duration-200"
                            >
                              Guardar
                            </button>
                          )}
                          </form>
                        </div>
                      ) : (
                        <div className="mt-6 p-4 bg-orange-50/50 border border-orange-100 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
                          <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center p-4">
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-1 rounded-md font-extrabold mb-2 shadow-sm border border-amber-200">
                              🔒 Función Premium
                            </span>
                            <p className="text-xs text-gray-600 font-bold text-center">Mejora a Premium para crear nuevas secciones y ordenarlas</p>
                            <button
                              data-testid="premium-info-btn-sections"
                              onClick={() => setPremiumModalData({ isOpen: true, featureName: 'Secciones del Catálogo' })}
                              className="mt-2 text-xs font-bold text-[#F9842C] hover:text-[#e06516] underline"
                            >
                              Más información
                            </button>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 w-full opacity-30 pointer-events-none">
                            <input
                              type="text"
                              placeholder="Nueva Sección"
                              className="w-full sm:flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm"
                              disabled
                            />
                            <button className="bg-gray-300 text-white px-6 py-2.5 rounded-xl text-sm font-bold shrink-0" disabled>
                              Guardar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
        onSubmit={handleSubmitProduct}
        isPremium={isPremium}
        availableCarousels={availableCarousels}
        onHasUnsavedProduct={onHasUnsavedProduct}
      />

      <PremiumModal 
        isOpen={premiumModalData.isOpen} 
        onClose={() => setPremiumModalData({ isOpen: false, featureName: '' })} 
        featureName={premiumModalData.featureName} 
      />
    </div>
  );
}
