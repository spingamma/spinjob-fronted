import React from 'react';
import { Pencil, Eye, EyeOff, Trash2 } from 'lucide-react';

export default function CatalogProductItem({
  product,
  isPremium,
  limitVisible,
  localProductsCountVisible,
  handleStockChange,
  handleOpenEdit,
  toggleVisibility,
  handleDelete
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-hover hover:border-gray-200">
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
                title={product.is_visible !== false ? "Ocultar elemento" : (localProductsCountVisible >= limitVisible ? "Límite alcanzado" : "Hacer visible")}
              >
                {product.is_visible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <span className="text-[10px] font-bold text-gray-400 w-7 text-center" title="Productos visibles / Límite">
                {localProductsCountVisible}/{limitVisible}
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
  );
}
