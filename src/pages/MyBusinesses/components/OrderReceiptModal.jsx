import React from 'react';
import { Download, X } from 'lucide-react';
import { formatOrderCode } from '../../../utils/formatOrderCode';

export default function OrderReceiptModal({ order, onClose, onDownloadReceipt }) {
  if (!order || !order.receipt_url) return null;

  const handleBackdropClick = (e) => {
    if (e.target !== e.currentTarget) return;
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      data-testid="receipt-modal-preview"
    >
      <div 
        className="relative max-w-lg w-full max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="w-full flex justify-between items-center mb-3 text-white px-2">
          <span className="text-sm font-bold tracking-wide">
            Comprobante - Pedido #{formatOrderCode(order.order_number, order.id)}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownloadReceipt(order.receipt_url, order.order_number)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
              title="Descargar comprobante"
            >
              <Download size={18} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
              title="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-md max-h-[75vh] overflow-auto flex items-center justify-center border border-white/10 w-full">
          <img 
            src={order.receipt_url} 
            alt="Comprobante de Pago" 
            className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
          />
        </div>

        <div className="mt-3 flex gap-3 w-full">
          <button
            onClick={() => onDownloadReceipt(order.receipt_url, order.order_number)}
            className="flex-1 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download size={14} /> Descargar archivo
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-white text-gray-800 hover:bg-gray-100 rounded-xl text-xs font-bold transition-colors"
          >
            Cerrar vista previa
          </button>
        </div>
      </div>
    </div>
  );
}
