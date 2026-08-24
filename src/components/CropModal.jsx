// Archivo: src/components/CropModal.jsx
import { useState, useCallback } from 'react';
import { X, Check } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { getCroppedImgFile } from '../utils/cropImage';

export default function CropModal({ isOpen, imageSrc, onClose, onCropDone, cropShape = "round", aspect = 1 }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleApply = async () => {
    try {
      const file = await getCroppedImgFile(imageSrc, croppedAreaPixels);
      onCropDone(file);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div 
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col h-[80vh] max-h-[600px]">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-primary text-lg">Recortar Imagen</h3>
          <button data-testid="crop-close-btn" onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1">
            <X size={24} />
          </button>
        </div>

        <div className="relative flex-1 bg-gray-900 w-full">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        <div className="p-5 bg-white space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Zoom</label>
            <input
              data-testid="crop-zoom-input"
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-secondary"
            />
          </div>
          <div className="flex gap-3">
            <button
              data-testid="crop-cancel-btn"
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              data-testid="crop-submit-btn"
              type="button"
              onClick={handleApply}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-secondary hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
            >
              <Check size={20} />
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
