import React from 'react';
import { Settings2, QrCode, X, Upload, ChevronUp, ChevronDown, Check, Pencil, Trash2 } from 'lucide-react';
import PickupPointSelector from './PickupPointSelector';
import PaymentQrUploader from './PaymentQrUploader';
import { useCatalogSettings } from '../hooks/useCatalogSettings';

export default function CatalogSettings({
  isPremium,
  ordersEnabled,
  setOrdersEnabled,
  paymentQrImage,
  setPaymentQrImage,
  deliveryMethods,
  setDeliveryMethods
}) {
  const {
    isDeliveryOpen,
    setIsDeliveryOpen,
    newDeliveryMethod,
    setNewDeliveryMethod,
    editingDeliveryIndex,
    setEditingDeliveryIndex,
    editingDeliveryText,
    setEditingDeliveryText,
    isSelectingPickupPoint,
    setIsSelectingPickupPoint,
    enablePaqueterias,
    handleOrdersEnabledChange,
    handleAddDeliveryMethod,
    handleRemoveDeliveryMethod,
    handleStartEditDelivery,
    handleSaveEditDelivery,
    handleSelectPickupPoint
  } = useCatalogSettings({
    deliveryMethods,
    setDeliveryMethods,
    setOrdersEnabled
  });

  return (
    <div className="pt-2">
      <h4 className="text-sm font-bold text-primary flex items-center gap-2 mb-4">
        <Settings2 size={16} className="text-secondary" /> Configuración de Catálogo
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
              className="w-4 h-4 text-secondary focus:ring-secondary border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="ordersEnabledCheckbox" className="text-xs font-bold text-primary cursor-pointer select-none">
              Habilitar "Mis pedidos" (Carrito de compras)
            </label>
          </div>

          {ordersEnabled && (
            <div className="mt-4 border-t border-gray-100 pt-4 space-y-4">
              {/* Rediseño UX Premium: Carga de QR Bancario */}
              <PaymentQrUploader paymentQrImage={paymentQrImage} setPaymentQrImage={setPaymentQrImage} />

              <div 
                className="flex justify-between items-center cursor-pointer mb-2"
                onClick={() => setIsDeliveryOpen(!isDeliveryOpen)}
              >
                <label className="text-xs font-bold text-primary cursor-pointer">Métodos de entrega</label>
                <div className="text-gray-400">
                  {isDeliveryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {isDeliveryOpen && (
                <div className="space-y-3 mt-3 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <form onSubmit={handleAddDeliveryMethod} className="flex flex-1 gap-2">
                      <input
                        data-testid="delivery-method-input"
                        type="text"
                        value={newDeliveryMethod}
                        onChange={(e) => setNewDeliveryMethod(e.target.value)}
                        placeholder="Añadir opción (ej. Envío a domicilio)"
                        className="flex-1 min-w-0 text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-secondary"
                      />
                      <button
                        data-testid="add-delivery-btn"
                        type="submit"
                        disabled={!newDeliveryMethod.trim()}
                        className="shrink-0 bg-secondary hover:bg-secondary/90 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                      >
                        Añadir
                      </button>
                    </form>
                    {enablePaqueterias && (
                      <button
                        type="button"
                        onClick={() => setIsSelectingPickupPoint(true)}
                        className="shrink-0 bg-primary hover:bg-primary/90 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap sm:w-auto w-full"
                      >
                        Añadir Paquetería
                      </button>
                    )}
                  </div>
                  
                  {isSelectingPickupPoint && (
                    <PickupPointSelector 
                      onCancel={() => setIsSelectingPickupPoint(false)}
                      onSelect={handleSelectPickupPoint}
                    />
                  )}

                  <div className="space-y-2">
                    {deliveryMethods.map((method, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-lg p-2 px-3">
                        {editingDeliveryIndex === idx ? (
                          <div className="flex flex-1 gap-2">
                            <input
                              type="text"
                              value={editingDeliveryText}
                              onChange={(e) => setEditingDeliveryText(e.target.value)}
                              className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-secondary"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEditDelivery(idx)}
                              data-testid={`save-delivery-${idx}`}
                              className="text-green-600 bg-green-50 p-1 rounded hover:bg-green-100 transition-colors"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingDeliveryIndex(null)}
                              data-testid={`cancel-delivery-${idx}`}
                              className="text-gray-400 bg-gray-100 p-1 rounded hover:bg-gray-200 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-xs font-semibold text-gray-700">
                              {method.startsWith('PAQUETERIA|') 
                                ? `📦 Paquetería: ${method.split('|')[2]} (Tarifa: ${method.split('|')[3]} Bs)`
                                : method}
                            </span>
                            <div className="flex gap-2 ml-2">
                              {!method.startsWith('PAQUETERIA|') && (
                                <button
                                  type="button"
                                  onClick={() => handleStartEditDelivery(idx, method)}
                                  data-testid={`edit-delivery-${idx}`}
                                  className="text-gray-400 hover:text-accent transition-colors"
                                >
                                  <Pencil size={14} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveDeliveryMethod(idx)}
                                data-testid={`remove-delivery-btn-${idx}`}
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
  );
}
