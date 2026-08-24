import React from 'react';
import { X, QrCode, Download, Share2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

export default function ProfileQRModal({ 
  isOpen, 
  onClose, 
  url, 
  handleDownloadQR, 
  handleShare 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/50 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div className="bg-white border border-gray-200 rounded-3xl shadow-2xl max-w-sm w-full p-8 relative animate-in zoom-in duration-300 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose}
          aria-label="Cerrar modal de código QR"
          data-testid="profile-qr-close-btn"
          className="absolute top-4 right-4 text-gray-400 hover:text-primary transition-colors p-2 bg-gray-100 rounded-full hover:bg-gray-200"
        >
          <X size={20} />
        </button>
        <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-4">
          <QrCode size={24} className="text-secondary" />
        </div>
        <h3 className="text-xl font-bold text-primary mb-1 text-center">Compartir Perfil</h3>
        <p className="text-gray-500 text-sm mb-6 text-center">Escanea este código para ver mi tarjeta digital en cualquier dispositivo.</p>
        
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex justify-center items-center">
          <QRCodeCanvas 
            id="qr-canvas"
            value={url}
            size={1024}
            className="w-48 h-48"
            style={{ width: "100%", height: "100%" }}
            bgColor={"#ffffff"}
            fgColor={"#1A535C"}
            level={"H"}
            includeMargin={true}
            imageSettings={{
              src: "/paw.webp",
              height: 256,
              width: 256,
              excavate: true,
            }}
          />
        </div>
        
        <div className="mt-8 w-full flex flex-col gap-3">
          <button 
            onClick={() => handleDownloadQR('1D565F')}
            aria-label="Descargar código QR"
            data-testid="profile-qr-download-btn"
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Download size={18} /> Descargar QR
          </button>
          <button 
            onClick={handleShare}
            aria-label="Compartir enlace de perfil"
            data-testid="profile-qr-share-btn"
            className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Share2 size={18} /> Enviar enlace
          </button>
        </div>
      </div>
    </div>
  );
}
