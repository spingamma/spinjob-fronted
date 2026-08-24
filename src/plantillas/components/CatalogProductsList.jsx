import React, { useState } from 'react';
import { Plus, Package, Trash2, ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
import CatalogProductItem from './CatalogProductItem';

export default function CatalogProductsList({
  isPremium,
  localProducts,
  orderedCarousels,
  expandedCatalogs,
  toggleCatalog,
  moveCarousel,
  handleRemoveSection,
  handleStockChange,
  toggleVisibility,
  handleDelete,
  handleOpenEdit,
  handleOpenCreate,
  limitRegistered,
  limitVisible,
  setPremiumModalData,
  onAddSection
}) {
  const [newSectionName, setNewSectionName] = useState('');
  const [sectionError, setSectionError] = useState('');

  const submitAddSection = (e) => {
    e.preventDefault();
    setSectionError('');
    const cleanName = newSectionName.trim();
    if (!cleanName) return;

    if (orderedCarousels.some(c => c.toLowerCase() === cleanName.toLowerCase())) {
      setSectionError("Ya existe una sección con este nombre.");
      return;
    }

    if (onAddSection) {
      onAddSection(cleanName);
    }
    setNewSectionName('');
  };

  return (
    <div className="pt-2 border-t border-gray-200">
      {localProducts.length < limitRegistered && (
        <button
          data-testid="add-product-btn"
          onClick={handleOpenCreate}
          className="w-full bg-primary hover:bg-primary/90 text-white px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm mb-6 mt-4"
        >
          <Plus size={18} />
          Añadir Producto
        </button>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-primary flex items-center gap-2">
            <Package size={16} className="text-secondary" /> Productos Registrados
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
              if (empty && catalogName === 'Catálogo') return null;
              
              const isExpanded = !!expandedCatalogs[catalogName];

              return (
                <div key={catalogName} className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
                  <div
                    data-testid={`toggle-catalog-${catalogName}`}
                    onClick={() => toggleCatalog(catalogName)}
                    className="w-full bg-gray-50 hover:bg-gray-100 px-4 py-3 flex items-center justify-between transition-colors border-b border-gray-100 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary text-sm">{catalogName}</span>
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
                        <CatalogProductItem
                          key={product.id || product.tempId}
                          product={product}
                          isPremium={isPremium}
                          limitVisible={limitVisible}
                          localProductsCountVisible={localProducts.filter(p => p.is_visible !== false).length}
                          handleStockChange={handleStockChange}
                          handleOpenEdit={handleOpenEdit}
                          toggleVisibility={toggleVisibility}
                          handleDelete={handleDelete}
                        />
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
                <form onSubmit={submitAddSection} className="flex flex-col sm:flex-row gap-2 p-4 bg-white border border-gray-100 rounded-xl shadow-sm transition-all duration-300">
                  <input
                    data-testid="input-new-section-name"
                    type="text"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    placeholder="Nueva Sección"
                    className="w-full sm:flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-primary outline-none focus:border-secondary transition-all"
                    required
                  />
                  {newSectionName.trim().length > 0 && (
                    <button
                      data-testid="btn-add-section"
                      type="submit"
                      className="bg-secondary hover:bg-secondary/90 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 animate-in fade-in zoom-in-95 duration-200"
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
                    className="mt-2 text-xs font-bold text-secondary hover:text-secondary/80 underline"
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
  );
}
