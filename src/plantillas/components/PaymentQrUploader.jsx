import React from 'react';
import { QrCode, X, Upload } from 'lucide-react';
import { compressImage } from '../../utils/imageUtils';

export default function PaymentQrUploader({ paymentQrImage, setPaymentQrImage }) {
  return (
    <div className="bg-brand-bg p-4 rounded-2xl border border-gray-200/80">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-bold text-primary flex items-center gap-1.5">
          <QrCode size={16} className="text-secondary" /> QR de Pago Bancario (QR Simple) <span className="text-secondary">*</span>
        </label>
        <span className="text-[10px] font-extrabold bg-secondary/10 text-secondary px-2 py-0.5 rounded-full border border-secondary/20 uppercase">
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
          <label className="w-full h-28 border-2 border-dashed border-gray-300 hover:border-secondary bg-white hover:bg-orange-50/30 rounded-2xl flex flex-col items-center justify-center p-3 cursor-pointer transition-all shadow-sm group">
            <Upload size={22} className="text-secondary group-hover:scale-110 transition-transform mb-1" />
            <span className="text-xs font-bold text-primary group-hover:text-secondary transition-colors">
              Subir Imagen de QR de Pago
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5">Formats: PNG, JPG (Máx 5MB)</span>
            <input
              type="file"
              accept="image/*"
              data-testid="payment-qr-file-input"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  try {
                    const compressedFile = await compressImage(file);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      if (setPaymentQrImage) setPaymentQrImage(reader.result, compressedFile);
                    };
                    reader.readAsDataURL(compressedFile);
                  } catch (err) {
                    console.error("Error comprimiendo QR", err);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      if (setPaymentQrImage) setPaymentQrImage(reader.result, file);
                    };
                    reader.readAsDataURL(file);
                  }
                }
              }}
              className="hidden"
            />
          </label>
        )}
      </div>

      <p className="text-[11px] text-gray-500 mt-2.5 flex items-center gap-1.5 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block"></span>
        Tus clientes verán este QR al momento de confirmar su pedido.
      </p>
    </div>
  );
}
