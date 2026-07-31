// src/components/OrderSummary/TrackingSection.jsx

import React from 'react';
import { ArrowLeft, Download, Upload, ShieldAlert, CheckCircle2, Loader2, QrCode, Key, Send } from 'lucide-react';

/**
 * Displays tracking (order status) view, QR download and receipt upload.
 * All business logic (state, handlers) is provided via props.
 */
export default function TrackingSection({
  navigate,
  order,
  displayQr,
  isPending,
  handleDownloadQr,
  receiptPreview,
  setReceiptPreview,
  receiptError,
  isUploading,
  handleFileChange,
  handleUploadReceipt,
  handleConfirmReceived,
  handleReportIssue,
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans text-[#1A535C]">
      <div className="bg-white px-4 py-4 sticky top-0 z-50 shadow-sm flex items-center gap-4">
        <button onClick={() => navigate('/mis-compras')} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors" data-testid="back-button-tracking">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-extrabold tracking-tight">Seguimiento de Pedido</h1>
      </div>

      <div className="max-w-xl mx-auto px-4 mt-6 space-y-6">
        {/* Order header */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#757778] uppercase tracking-wider mb-1">
                Orden #{order?.order_number || String(order?.id || '').slice(0, 8)}
              </h2>
              <span className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-md ${
                getStatusColor(order)
              }`}>{getStatusText(order)}</span>
            </div>
            <div className="text-right">
              {order?.delivery_method?.startsWith('PAQUETERIA|') ? (
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500 font-bold uppercase">Productos:</span>
                    <span className="font-bold text-[#1A535C]">Bs. {parseFloat(order?.total_price || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-red-500">
                    <span className="font-bold uppercase">A Pagar (Recojo):</span>
                    <span className="font-bold">Bs. {parseFloat(order?.delivery_method.split('|')[3] || 0).toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <>
                  <span className="text-xs text-gray-500 font-bold block mb-1">Total</span>
                  <span className="text-xl font-black text-[#1A535C]">Bs. {parseFloat(order?.total_price || 0).toFixed(2)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* QR payment */}
        {isPending && displayQr && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center relative overflow-hidden">
            <h3 className="font-extrabold text-[#1A535C] mb-4 flex items-center justify-center gap-2">
              <QrCode size={18} className="text-[#F9842C]" /> Realiza el pago
            </h3>
            <div className="bg-gray-50 p-2 rounded-2xl inline-block border border-gray-100 shadow-inner mb-4">
              <img src={displayQr} alt="QR de Pago" className="w-48 h-48 object-contain rounded-xl" />
            </div>
            <button
              type="button"
              data-testid="download-qr-btn"
              onClick={handleDownloadQr}
              className="text-xs font-bold text-[#F9842C] hover:text-[#e06516] flex items-center justify-center gap-1.5 mx-auto mb-4 py-2 px-4 bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-200/60 transition-colors"
            >
              <Download size={16} /> Descargar Imagen de QR
            </button>
            <p className="text-xs text-gray-500 font-medium mb-4 max-w-[250px] mx-auto">
              Escanea este QR desde la app de tu banco o descárgalo. Luego sube la captura de pantalla del comprobante exitoso abajo.
            </p>
          </div>
        )}

        {/* Receipt upload (when pending or waiting verification) */}
        {(isPending || (order?.status === 'pago_enviado' && !order?.receipt_url)) && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-extrabold text-[#1A535C] mb-4 flex items-center gap-2 text-sm">
              <Upload size={16} className="text-[#F9842C]" /> Sube tu comprobante
            </h3>
            <form onSubmit={handleUploadReceipt} className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center bg-gray-50 hover:bg-orange-50/30 transition-colors relative">
                {receiptPreview ? (
                  <div className="relative inline-block">
                    <img src={receiptPreview} alt="Comprobante" className="max-h-48 rounded-xl shadow-sm border border-gray-200" />
                    <button type="button" onClick={() => setReceiptPreview(null)} className="absolute -top-3 -right-3 bg-red-100 text-red-600 rounded-full p-1 border border-red-200 shadow-sm hover:bg-red-200">✕</button>
                  </div>
                ) : (
                  <>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="flex flex-col items-center justify-center gap-2 pointer-events-none py-4">
                      <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400"><Key size={20} /></div>
                      <span className="text-sm font-bold text-[#1A525C]">Toca para seleccionar imagen</span>
                      <span className="text-[10px] text-gray-400">Solo imágenes (JPG, PNG). Máx 5MB.</span>
                    </div>
                  </>
                )}
              </div>
              {receiptError && <p className="text-xs text-red-500 font-bold text-center">{receiptError}</p>}
              {receiptPreview && (
                <button type="submit" disabled={isUploading} className="w-full py-3.5 bg-[#F9842C] hover:bg-[#e06516] text-white font-bold text-sm rounded-xl shadow-md transition-all flex justify-center items-center gap-2 disabled:opacity-60" data-testid="submit-receipt-btn">
                  {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Enviar Comprobante
                </button>
              )}
            </form>
          </div>
        )}

        {/* Pickup Code (when ready for pickup) */}
        {order?.status === 'ready_for_pickup' && (
          <div className="bg-[#1A535C] rounded-3xl p-6 shadow-md text-center text-white relative overflow-hidden">
            <h3 className="font-extrabold mb-2 text-sm flex items-center justify-center gap-2">
              <Key size={18} className="text-[#F9842C]" /> Listo para Recojo
            </h3>
            <p className="text-white/80 text-xs mb-4">
              Tu paquete ya está en la paquetería. Pasa a recogerlo con el siguiente código y tu carnet de identidad.
            </p>
            <div className="bg-white/10 rounded-2xl p-4 inline-block mb-4 border border-white/20">
              <span className="text-4xl font-black tracking-widest text-[#F9842C]">
                #TRJ-{order?.order_number || String(order?.id || '').slice(0, 4).toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Confirmation and Issue actions (when order is paid or ready) */}
        {(order?.status === 'pagado' || order?.status === 'entregado' || order?.status === 'pago_enviado' || order?.status === 'ready_for_pickup') && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-3">
            {(!order?.delivery_method?.startsWith('PAQUETERIA|') || order?.status === 'ready_for_pickup') && (
              <button type="button" data-testid="confirm-received-btn" onClick={handleConfirmReceived} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all">
                <CheckCircle2 size={18} /> {order?.status === 'ready_for_pickup' ? 'Confirmar Recojo' : 'Confirmar Producto Recibido'}
              </button>
            )}
            <button type="button" data-testid="report-issue-btn" onClick={handleReportIssue} className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-red-200/60">
              <ShieldAlert size={16} /> Hacer Reclamo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function getStatusText(order) {
  const status = order?.status;
  const isPaqueteria = order?.delivery_method?.startsWith('PAQUETERIA|');
  
  switch (status) {
    case 'pendiente':
    case 'pendiente_de_pago':
      return 'Pendiente de Pago';
    case 'pago_enviado':
      return 'Pago en Verificación';
    case 'pagado':
      return 'Pago Confirmado (Preparando)';
    case 'entregado':
      return isPaqueteria ? 'En Camino a Paquetería' : 'Enviado / Entregado';
    case 'ready_for_pickup':
      return 'Listo para Recojo';
    case 'completado':
      return 'Completado';
    case 'cancelado':
      return 'Cancelado';
    default:
      return 'Desconocido';
  }
}

function getStatusColor(order) {
  const status = order?.status;
  const isPaqueteria = order?.delivery_method?.startsWith('PAQUETERIA|');

  switch (status) {
    case 'pendiente':
    case 'pendiente_de_pago':
      return 'bg-amber-100 text-amber-800';
    case 'pago_enviado':
      return 'bg-orange-100 text-orange-800';
    case 'pagado':
      return 'bg-blue-100 text-blue-800';
    case 'entregado':
      return isPaqueteria ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800';
    case 'ready_for_pickup':
      return 'bg-[#F9842C] text-white';
    case 'completado':
      return 'bg-emerald-100 text-emerald-800';
    case 'cancelado':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
