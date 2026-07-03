import React, { useState, useRef, useEffect } from 'react';
import { Plus, Package, Trash2, Image as ImageIcon, Save, Pencil, Eye, EyeOff } from 'lucide-react';
import CropModal from '../../components/CropModal';

export default function ProfileCatalogEdit({ localProducts, setLocalProducts, deletedProductsIds, setDeletedProductsIds, isPremium, onHasUnsavedProduct, ordersEnabled = true, setOrdersEnabled }) {
  const [showForm, setShowForm] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);

  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCarousel, setFormCarousel] = useState('Catálogo');
  const [selectedCarouselOption, setSelectedCarouselOption] = useState('Catálogo');
  const [newCarouselName, setNewCarouselName] = useState('');
  const [formImage, setFormImage] = useState(null);
  const [formPreview, setFormPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const textareaRef = useRef(null);

  const limit = isPremium ? 15 : 3;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 250)}px`;
    }
  }, [formDesc, showForm]);

  useEffect(() => {
    if (onHasUnsavedProduct) {
      const isUnsaved = showForm && (formName || formDesc || formPrice || formPreview || formImage || newCarouselName);
      onHasUnsavedProduct(!!isUnsaved);
    }
  }, [showForm, formName, formDesc, formPrice, formPreview, formImage, newCarouselName, onHasUnsavedProduct]);

  const resetForm = () => {
    setFormName('');
    setFormDesc('');
    setFormPrice('');
    setFormCarousel('Catálogo');
    setSelectedCarouselOption('Catálogo');
    setNewCarouselName('');
    setFormImage(null);
    setFormPreview(null);
    setEditingId(null);
    setShowForm(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropImageSrc(reader.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropDone = (croppedFile) => {
    setFormImage(croppedFile);
    const reader = new FileReader();
    reader.onloadend = () => setFormPreview(reader.result);
    reader.readAsDataURL(croppedFile);
    setShowCropModal(false);
    setCropImageSrc(null);
  };

  const openEditForm = (product) => {
    setFormName(product.name);
    setFormDesc(product.description || '');
    setFormPrice(product.price || '');
    
    const cName = product.carousel_name || 'Catálogo';
    setFormCarousel(cName);
    
    const existing = Array.from(new Set(
      localProducts.map(p => p.carousel_name || 'Catálogo')
    )).filter(Boolean);
    
    if (existing.includes(cName)) {
      setSelectedCarouselOption(cName);
      setNewCarouselName('');
    } else {
      setSelectedCarouselOption('__NEW__');
      setNewCarouselName(cName);
    }
    
    setFormPreview(product.image_url || null);
    setFormImage(null); // Local image to upload
    setEditingId(product.id || product.tempId); // Use id or tempId for local
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const finalCarousel = (selectedCarouselOption === '__NEW__' ? newCarouselName : selectedCarouselOption).trim() || 'Catálogo';

    if (editingId) {
      // Edit existing in localProducts
      setLocalProducts(prev => prev.map(p => {
        if (p.id === editingId || p.tempId === editingId) {
          return {
            ...p,
            name: formName.trim(),
            description: formDesc.trim(),
            price: formPrice.trim(),
            carousel_name: finalCarousel,
            image_url: formPreview || p.image_url,
            imageFile: formImage || p.imageFile,
            isModified: true
          };
        }
        return p;
      }));
    } else {
      // Add new
      const newProduct = {
        tempId: Date.now().toString(), // unique string
        name: formName.trim(),
        description: formDesc.trim(),
        price: formPrice.trim(),
        carousel_name: finalCarousel,
        image_url: formPreview, // local preview
        imageFile: formImage,
        is_visible: true,
        isModified: true
      };
      setLocalProducts(prev => [...prev, newProduct]);
    }
    resetForm();
  };

  const handleDelete = (product) => {
    if (!window.confirm("¿Eliminar este producto del catálogo?")) return;
    
    // If it has a real DB ID, add to deleted array
    if (product.id) {
      setDeletedProductsIds(prev => [...prev, product.id]);
    }

    // Remove from local array
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

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-[#1A535C] mb-4 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-[#6A431F] rounded-full"></span> Catálogo de Productos
      </h3>

      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm">
        {isPremium && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-orange-50/50 rounded-2xl border border-orange-100/50">
            <input
              type="checkbox"
              id="ordersEnabledCheckbox"
              checked={ordersEnabled}
              onChange={(e) => setOrdersEnabled(e.target.checked)}
              className="w-4 h-4 text-[#F9842C] focus:ring-[#F9842C] border-gray-300 rounded"
            />
            <label htmlFor="ordersEnabledCheckbox" className="text-sm font-bold text-[#1A535C] cursor-pointer select-none">
              Habilitar pedidos para este catálogo (carrito de compras)
            </label>
          </div>
        )}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
            <h4 className="font-bold text-[#1A535C] text-sm">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h4>

            {/* Image upload */}
            <div className="flex items-center gap-3">
              <label htmlFor="productImageInput" className="cursor-pointer shrink-0 relative group">
                {formPreview ? (
                  <>
                    <img src={formPreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border-2 border-[#F9842C]" />
                    <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Pencil size={16} className="text-white" />
                    </div>
                  </>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#F9842C] transition-colors">
                    <ImageIcon size={24} className="text-gray-400" />
                  </div>
                )}
                <input id="productImageInput" type="file" accept="image/*" onChange={handleImageChange} onClick={(e) => { e.target.value = null }} className="hidden" />
              </label>
              <div className="flex-1 space-y-2">
                <input
                  type="text" value={formName} onChange={(e) => setFormName(e.target.value)}
                  placeholder="Nombre del producto *"
                  required
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#1A535C] outline-none focus:border-[#F9842C] focus:ring-1 focus:ring-[#F9842C] transition-all"
                />
                <input
                  type="text" value={formPrice} onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="Precio (ej. Bs. 120)"
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#1A535C] outline-none focus:border-[#F9842C] focus:ring-1 focus:ring-[#F9842C] transition-all"
                />
                {isPremium && (
                  <div className="space-y-1 text-left">
                    <label className="text-[11px] font-bold text-[#1A535C]/80 block">Catálogo / Sección del menú:</label>
                    <select
                      value={selectedCarouselOption}
                      onChange={(e) => {
                        setSelectedCarouselOption(e.target.value);
                        if (e.target.value !== '__NEW__') {
                          setNewCarouselName('');
                        }
                      }}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#1A535C] outline-none focus:border-[#F9842C] focus:ring-1 focus:ring-[#F9842C] transition-all cursor-pointer"
                    >
                      {Array.from(new Set(['Catálogo', ...localProducts.map(p => p.carousel_name || 'Catálogo')]))
                        .filter(Boolean)
                        .map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))
                      }
                      <option value="__NEW__">+ Crear nuevo catálogo/carrusel...</option>
                    </select>
                    
                    {selectedCarouselOption === '__NEW__' && (
                      <input
                        type="text"
                        value={newCarouselName}
                        onChange={(e) => setNewCarouselName(e.target.value)}
                        placeholder="Nombre del nuevo catálogo (ej. Bebidas)"
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#1A535C] outline-none focus:border-[#F9842C] focus:ring-1 focus:ring-[#F9842C] transition-all mt-1.5"
                        required
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <textarea
                ref={textareaRef}
                value={formDesc} onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Descripción breve (opcional)"
                rows="2"
                maxLength={400}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 pb-7 text-sm text-[#1A535C] outline-none focus:border-[#F9842C] focus:ring-1 focus:ring-[#F9842C] transition-all resize-none overflow-y-auto"
              />
              <div className="absolute bottom-2 right-3 text-[10px] font-medium text-gray-400 bg-white/80 px-1 backdrop-blur-sm rounded">
                {formDesc.length}/400
              </div>
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={resetForm} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#757778] bg-gray-100 hover:bg-gray-200 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={!formName.trim()} className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all ${!formName.trim() ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#F9842C] hover:bg-[#e06516]'}`}>
                <Save size={16} />
                {editingId ? 'Actualizar' : 'Añadir'}
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-3">
          {!showForm && localProducts.length < limit && (
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center aspect-square hover:border-[#F9842C] hover:bg-orange-50 transition-all group min-h-[160px]"
            >
              <Plus size={36} className="text-gray-300 group-hover:text-[#F9842C] transition-colors mb-1" />
              <span className="text-xs font-bold text-gray-400 group-hover:text-[#F9842C] transition-colors">Añadir Producto</span>
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
                      onClick={(e) => { e.stopPropagation(); toggleVisibility(product); }}
                      className={`p-1.5 rounded-lg transition-colors border shadow-sm ${product.is_visible !== false ? 'text-[#F9842C] bg-orange-50 border-orange-100 hover:bg-orange-100' : 'text-gray-400 bg-gray-50 border-gray-100 hover:bg-gray-100'}`}
                      title={product.is_visible !== false ? "Ocultar elemento" : "Hacer visible"}
                    >
                      {product.is_visible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditForm(product); }}
                      className="p-1.5 text-gray-400 hover:text-[#6A431F] bg-gray-50 hover:bg-[#6A431F]/10 rounded-lg transition-colors border border-gray-100 shadow-sm"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
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

      <CropModal
        isOpen={showCropModal}
        imageSrc={cropImageSrc}
        onClose={() => { setShowCropModal(false); setCropImageSrc(null); }}
        onCropDone={handleCropDone}
        cropShape="rect"
      />
    </div>
  );
}
