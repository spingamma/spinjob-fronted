import React, { useState } from 'react';
import { Settings2, QrCode, X, Upload, ChevronUp, ChevronDown, Check, Pencil, Trash2 } from 'lucide-react';

export default function CatalogSettings({
  isPremium,
  ordersEnabled,
  setOrdersEnabled,
  paymentQrImage,
  setPaymentQrImage,
  deliveryMethods,
  setDeliveryMethods
}) {
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [newDeliveryMethod, setNewDeliveryMethod] = useState('');
  const [editingDeliveryIndex, setEditingDeliveryIndex] = useState(null);
  const [editingDeliveryText, setEditingDeliveryText] = useState('');

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

  return (
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
            <div className="mt-4 border-t border-gray-100 pt-4 space-y-4">
              {/* Rediseño UX Premium: Carga de QR Bancario */}
              <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-gray-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#1A535C] flex items-center gap-1.5">
                    <QrCode size={16} className="text-[#F9842C]" /> QR de Pago Bancario (QR Simple) <span className="text-[#F9842C]">*</span>
                  </label>
                  <span className="text-[10px] font-extrabold bg-[#F9842C]/10 text-[#F9842C] px-2 py-0.5 rounded-full border border-[#F9842C]/20 uppercase">
                    Requerido
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
                  Sube la imagen del QR de tu banco (BCP, BNB, Bisa, Mercantil, etc.) para cobros de pedidos.
                </p>

                <div className="flex items-center gap-3">
                  {paymentQrImage ? (
                    <div className="relative w-32 h-32 bg-white rounded-2xl border border-gray-200 p-2 overflow-hidden shadow-sm">
                      <img src={paymentQrImage} alt="QR de Pago Bancario" className="w-full h-full object-contain" />
                      <button
                        type="button"
                        data-testid="remove-payment-qr-btn"
                        onClick={() => setPaymentQrImage && setPaymentQrImage('')}
                        className="absolute top-1.5 right-1.5 bg-gray-900/80 hover:bg-red-600 text-white p-1 rounded-full text-xs shadow transition-colors backdrop-blur-sm"
                        title="Cambiar o eliminar QR"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <label className="w-full h-28 border-2 border-dashed border-gray-300 hover:border-[#F9842C] bg-white hover:bg-orange-50/30 rounded-2xl flex flex-col items-center justify-center p-3 cursor-pointer transition-all shadow-sm group">
                      <Upload size={22} className="text-[#F9842C] group-hover:scale-110 transition-transform mb-1" />
                      <span className="text-xs font-bold text-[#1A535C] group-hover:text-[#F9842C] transition-colors">
                        Subir Imagen de QR de Pago
                      </span>
                      <span className="text-[10px] text-gray-400 mt-0.5">Formats: PNG, JPG (Máx 5MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        data-testid="payment-qr-file-input"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (setPaymentQrImage) setPaymentQrImage(reader.result, file);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <p className="text-[11px] text-gray-500 mt-2.5 flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F9842C] inline-block"></span>
                  Tus clientes verán este QR al momento de confirmar su pedido.
                </p>
              </div>

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
                            <span className="text-xs font-semibold text-gray-700">{method}</span>
                            <div className="flex gap-2 ml-2">
                              <button
                                type="button"
                                onClick={() => handleStartEditDelivery(idx, method)}
                                data-testid={`edit-delivery-${idx}`}
                                className="text-gray-400 hover:text-[#6A431F] transition-colors"
                              >
                                <Pencil size={14} />
                              </button>
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
