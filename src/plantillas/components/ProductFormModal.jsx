import React, { useState, useRef, useEffect } from 'react';
import { X, Save, Pencil, Image as ImageIcon, Package } from 'lucide-react';
import CropModal from '../../components/CropModal';

export default function ProductFormModal({
  isOpen,
  onClose,
  product,
  onSubmit,
  isPremium,
  availableCarousels = ['Catálogo'],
  onHasUnsavedProduct
}) {
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCarousel, setFormCarousel] = useState('Catálogo');
  const [formImage, setFormImage] = useState(null);
  const [formPreview, setFormPreview] = useState(null);
  
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);

  const textareaRef = useRef(null);

  // Initialize or reset form when modal opens/closes or product changes
  useEffect(() => {
    if (isOpen) {
      if (product) {
        // Editing mode
        setFormName(product.name || '');
        setFormDesc(product.description || '');
        setFormPrice(product.price || '');
        
        const cName = product.carousel_name || 'Catálogo';
        setFormCarousel(cName);
        setFormPreview(product.image_url || null);
        setFormImage(null);
      } else {
        // Creation mode
        setFormName('');
        setFormDesc('');
        setFormPrice('');
        setFormCarousel(availableCarousels[0] || 'Catálogo');
        setFormImage(null);
        setFormPreview(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, product]);

  // Adjust description textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [formDesc, isOpen]);

  // Handle unsaved changes notification
  useEffect(() => {
    if (onHasUnsavedProduct) {
      const isUnsaved = isOpen && (
        formName.trim() !== (product?.name || '').trim() ||
        formDesc.trim() !== (product?.description || '').trim() ||
        formPrice.trim() !== (product?.price || '').trim() ||
        formImage !== null
      );
      onHasUnsavedProduct(!!isUnsaved);
    }
  }, [isOpen, formName, formDesc, formPrice, formImage, product, onHasUnsavedProduct]);

  if (!isOpen) return null;

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formName.trim()) return;

    onSubmit({
      id: product?.id,
      tempId: product?.tempId,
      name: formName.trim(),
      description: formDesc.trim(),
      price: formPrice.trim(),
      carousel_name: formCarousel.trim() || 'Catálogo',
      image_url: formPreview,
      imageFile: formImage,
      is_visible: product ? product.is_visible : true,
      isModified: true
    });
  };

  return (
    <>
      <div 
        data-testid="product-modal-backdrop"
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A535C]/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div 
          data-testid="product-modal-content"
          className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1A535C] to-[#32698F] p-5 relative shrink-0 flex items-center justify-between">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay"></div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Package size={20} className="text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-extrabold text-white">
                {product ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <p className="text-white/70 text-xs">
                {product ? 'Modifica los detalles de tu producto' : 'Añade un nuevo producto a tu catálogo'}
              </p>
            </div>
          </div>
          <button 
            data-testid="product-modal-close-btn"
            type="button" 
            onClick={onClose} 
            aria-label="Cerrar modal" 
            className="relative z-10 text-white/80 hover:text-white transition-colors p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-left flex-1">
          {/* Image upload */}
          <div className="flex items-center gap-4">
            <label htmlFor="productImageInput" className="cursor-pointer shrink-0 relative group">
              {formPreview ? (
                <>
                  <img src={formPreview} alt="Preview" className="w-20 h-20 rounded-2xl object-cover border-2 border-[#F9842C] shadow-sm" />
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Pencil size={18} className="text-white" />
                  </div>
                </>
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gray-50 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#F9842C] hover:bg-orange-50/30 transition-all">
                  <ImageIcon size={28} className="text-gray-400" />
                  <span className="text-[10px] font-bold text-gray-400 mt-1">Subir foto</span>
                </div>
              )}
              <input 
                data-testid="product-image-input"
                id="productImageInput" 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                onClick={(e) => { e.target.value = null }} 
                className="hidden" 
              />
            </label>
            <div className="flex-1 space-y-3">
              <div>
                <label className="text-xs font-bold text-[#1A535C] block mb-1">Nombre del producto <span className="text-red-500">*</span></label>
                <input
                  data-testid="product-name-input"
                  type="text" 
                  value={formName} 
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Nombre del producto"
                  required
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-[#1A535C] outline-none focus:border-[#F9842C] focus:ring-1 focus:ring-[#F9842C] transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#1A535C] block mb-1">Precio</label>
              <input
                data-testid="product-price-input"
                type="text" 
                value={formPrice} 
                onChange={(e) => setFormPrice(e.target.value)}
                placeholder="Precio (ej. Bs. 120 o Consultar)"
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-[#1A535C] outline-none focus:border-[#F9842C] focus:ring-1 focus:ring-[#F9842C] transition-all"
              />
            </div>

            {isPremium && (
              <div>
                <label className="text-xs font-bold text-[#1A535C] block mb-1">Catálogo / Sección del menú</label>
                <select
                  data-testid="product-carousel-select"
                  value={formCarousel}
                  onChange={(e) => setFormCarousel(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-[#1A535C] outline-none focus:border-[#F9842C] focus:ring-1 focus:ring-[#F9842C] transition-all cursor-pointer"
                >
                  {availableCarousels.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-[#1A535C] block mb-1">Descripción del producto</label>
            <div className="relative">
              <textarea
                data-testid="product-desc-input"
                ref={textareaRef}
                value={formDesc} 
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Escribe una breve descripción del producto..."
                rows="3"
                maxLength={400}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 pb-8 text-sm text-[#1A535C] outline-none focus:border-[#F9842C] focus:ring-1 focus:ring-[#F9842C] transition-all resize-none overflow-y-auto"
              />
              <div className="absolute bottom-2.5 right-3.5 text-[10px] font-bold text-gray-400 bg-white/80 px-1 backdrop-blur-sm rounded">
                {formDesc.length}/400
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button 
              data-testid="product-modal-cancel-btn"
              type="button" 
              onClick={onClose} 
              className="flex-1 py-3 rounded-xl text-sm font-bold text-[#757778] bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
            >
              Cancelar
            </button>
            <button 
              data-testid="product-modal-submit-btn"
              type="submit" 
              disabled={!formName.trim()} 
              className={`flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all ${!formName.trim() ? 'bg-gray-200 cursor-not-allowed text-gray-400' : 'bg-[#F9842C] hover:bg-[#e06516]'}`}
            >
              <Save size={16} />
              {product ? 'Actualizar' : 'Añadir'}
            </button>
          </div>
        </form>
      </div>
    </div>

    <CropModal
      isOpen={showCropModal}
      imageSrc={cropImageSrc}
      onClose={() => { setShowCropModal(false); setCropImageSrc(null); }}
      onCropDone={handleCropDone}
      cropShape="rect"
    />
  </>
);
}
