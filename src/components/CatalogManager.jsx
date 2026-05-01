// Archivo: src/components/CatalogManager.jsx
import { useState, useEffect } from 'react';
import { X, Plus, Loader2, Package, Trash2, Image as ImageIcon, Save } from 'lucide-react';
import fetchAuth from '../utils/fetchAuth';

export default function CatalogManager({ isOpen, onClose, business }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formImage, setFormImage] = useState(null);
  const [formPreview, setFormPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const isPremium = business?.premium === true;
  const limit = isPremium ? 10 : 5;
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
  const token = localStorage.getItem('spingamma_token');

  useEffect(() => {
    if (!isOpen || !business) return;
    fetchProducts();
  }, [isOpen, business]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/businesses/${business.slug}/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Error cargando productos:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormDesc('');
    setFormPrice('');
    setFormImage(null);
    setFormPreview(null);
    setEditingId(null);
    setShowForm(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setFormPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const openEditForm = (product) => {
    setFormName(product.name);
    setFormDesc(product.description || '');
    setFormPrice(product.price || '');
    setFormPreview(product.image_url || null);
    setFormImage(null);
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', formName.trim());
      if (formDesc.trim()) formData.append('description', formDesc.trim());
      if (formPrice.trim()) formData.append('price', formPrice.trim());
      if (formImage) formData.append('image', formImage);

      const isEdit = !!editingId;
      const url = isEdit
        ? `${API_URL}/businesses/${business.slug}/products/${editingId}`
        : `${API_URL}/businesses/${business.slug}/products`;

      const res = await fetchAuth(url, {
        method: isEdit ? 'PUT' : 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al guardar producto');
      }

      await fetchProducts();
      resetForm();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("¿Eliminar este producto del catálogo?")) return;
    setDeletingId(productId);
    try {
      const res = await fetchAuth(`${API_URL}/businesses/${business.slug}/products/${productId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId));
      }
    } catch (err) {
      console.error("Error eliminando producto:", err);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-[#1E3D51]/60 backdrop-blur-md" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1E3D51] to-[#32698F] p-5 relative shrink-0">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay"></div>
          <button onClick={onClose} aria-label="Cerrar gestor de catálogo" className="absolute top-4 right-4 z-20 text-white/80 hover:text-white transition-colors p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm">
            <X size={20} />
          </button>
          <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Package size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">Gestionar Catálogo</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-white/70 text-xs">{business?.name}</p>
                  <span className="bg-white/15 backdrop-blur-sm px-2 py-0.5 rounded-full text-white text-[10px] font-bold">{products.length}/{limit}</span>
                </div>
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
          ) : (
            <>
              {/* Form */}
              {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
                  <h4 className="font-bold text-[#1E3D51] text-sm">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h4>

                  {/* Image upload */}
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer shrink-0">
                      {formPreview ? (
                        <img src={formPreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border-2 border-[#B95221]" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#B95221] transition-colors">
                          <ImageIcon size={24} className="text-gray-400" />
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text" value={formName} onChange={(e) => setFormName(e.target.value)}
                        placeholder="Nombre del producto *"
                        required
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#1E3D51] outline-none focus:border-[#B95221] focus:ring-1 focus:ring-[#B95221] transition-all"
                      />
                      <input
                        type="text" value={formPrice} onChange={(e) => setFormPrice(e.target.value)}
                        placeholder="Precio (ej. Bs. 120)"
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#1E3D51] outline-none focus:border-[#B95221] focus:ring-1 focus:ring-[#B95221] transition-all"
                      />
                    </div>
                  </div>

                  <textarea
                    value={formDesc} onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Descripción breve (opcional)"
                    rows="2"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#1E3D51] outline-none focus:border-[#B95221] focus:ring-1 focus:ring-[#B95221] transition-all resize-none"
                  />

                  <div className="flex gap-2">
                    <button type="button" onClick={resetForm} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" disabled={isSubmitting || !formName.trim()} className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all ${isSubmitting || !formName.trim() ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#B95221] hover:bg-[#9A4219]'}`}>
                      {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {editingId ? 'Actualizar' : 'Guardar'}
                    </button>
                  </div>
                </form>
              )}

              {/* Grid */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {/* Add button */}
                {!showForm && products.length < limit && (
                  <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center aspect-square hover:border-[#B95221] hover:bg-orange-50 transition-all group"
                  >
                    <Plus size={36} className="text-gray-300 group-hover:text-[#B95221] transition-colors mb-1" />
                    <span className="text-xs font-bold text-gray-400 group-hover:text-[#B95221] transition-colors">Agregar</span>
                  </button>
                )}

                {products.map(product => (
                  <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 relative group">
                    <div className="relative overflow-hidden bg-gray-50">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full aspect-square object-cover"
                          onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=F0FDFA&color=0D9488&size=400&font-size=0.33`; }}
                        />
                      ) : (
                        <div className="w-full aspect-square flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                          <Package size={36} className="text-gray-300" />
                        </div>
                      )}
                      {/* Overlay acciones */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button onClick={() => openEditForm(product)} className="bg-white text-[#1E3D51] font-bold py-1.5 px-3 rounded-lg text-xs hover:bg-gray-100 transition-colors shadow">
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="bg-red-500 text-white font-bold py-1.5 px-3 rounded-lg text-xs hover:bg-red-600 transition-colors shadow disabled:opacity-50"
                        >
                          {deletingId === product.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold text-gray-800 text-sm truncate">{product.name}</h4>
                      {product.price && <p className="text-teal-600 font-bold text-sm mt-0.5">{product.price}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Limit indicator */}
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
                  <div className="flex gap-0.5">
                    {Array.from({ length: limit }).map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i < products.length ? 'bg-[#B95221]' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-500">{products.length}/{limit} fotos usadas</span>
                  {!isPremium && <span className="text-xs text-[#B95221] font-medium">(Premium: 10)</span>}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
