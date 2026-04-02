// Archivo: src/components/ReviewModal.jsx
import React, { useState, useEffect } from 'react';
import { Star, X, ImagePlus, UploadCloud, Loader2 } from 'lucide-react';

export default function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  calificacionPrevia = null, // Si tiene algo, significa que está editando
  profesionalName = ""
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Al abrir el modal, poblamos con la calificación previa si la hubiera
  useEffect(() => {
    if (isOpen) {
      if (calificacionPrevia) {
        setRating(calificacionPrevia.rating || 0);
        setDescription(calificacionPrevia.descripcion || "");
        setImagePreview(calificacionPrevia.image_url || null);
        setImageFile(null); // No hay archivo porque ya está subida
      } else {
        setRating(0);
        setDescription("");
        setImageFile(null);
        setImagePreview(null);
      }
    }
  }, [isOpen, calificacionPrevia]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(calificacionPrevia?.image_url || null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      // Opcionalmente podrías poner un error state aquí
      alert("Por favor selecciona una calificación de estrellas.");
      return;
    }
    onSubmit({ rating, description, imageFile, esEdicion: !!calificacionPrevia });
  };

  const isEditing = !!calificacionPrevia;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-[#1E3D51]/60 backdrop-blur-md transition-opacity">
      <div 
        className="bg-white border border-gray-100 rounded-[2rem] shadow-2xl w-full max-w-lg relative animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera decorativa */}
        <div className="bg-gradient-to-br from-[#1E3D51] to-[#32698F] p-6 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay"></div>
          
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Cerrar modal de calificación"
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm disabled:opacity-50"
          >
            <X size={20} />
          </button>
          
          <div className="relative z-10 text-center">
            <h3 className="text-xl font-extrabold text-white mb-1">
              {isEditing ? 'Cambia tu Calificación' : 'Califica a'}
            </h3>
            {!isEditing && <p className="text-orange-200 font-medium text-lg">{profesionalName}</p>}
            {isEditing && <p className="text-orange-200 text-sm mt-1">Ya calificaste a este profesional antes.</p>}
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-6 sm:p-8 overflow-y-auto">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* ESTRELLAS */}
            <div className="flex flex-col items-center gap-2">
              <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                ¿Cuántas estrellas le das?
              </label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`Calificar con ${star} estrellas`}
                    className={`transition-all duration-200 ${isSubmitting ? 'cursor-not-allowed opacity-70' : 'hover:scale-110'}`}
                  >
                    <Star 
                      size={40} 
                      className={`
                        ${(hoverRating || rating) >= star 
                          ? "fill-[#B95221] text-[#B95221]" 
                          : "fill-gray-100 text-gray-300"} 
                        transition-colors
                      `} 
                    />
                  </button>
                ))}
              </div>
              {rating === 0 && <p className="text-xs text-red-400 mt-1">Requerido</p>}
            </div>

            {/* TEXTAREA OPINIÓN */}
            <div>
              <label htmlFor="descripcion_servicio" className="block text-sm font-bold text-[#1E3D51] mb-2">
                Describe tu experiencia (Opcional)
              </label>
              <textarea 
                id="descripcion_servicio"
                disabled={isSubmitting}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="¿Cómo fue el servicio, el trato, la puntualidad?"
                className="w-full bg-gray-50 border border-gray-200 text-[#1E3D51] rounded-2xl p-4 focus:ring-2 focus:ring-[#B95221]/30 focus:border-[#B95221] focus:bg-white outline-none transition-all resize-none disabled:opacity-60"
                rows="4"
              />
            </div>

            {/* SUBIDA DE IMAGEN */}
            <div>
              <label className="block text-sm font-bold text-[#1E3D51] mb-2">
                Adjuntar evidencia o foto de su trabajo (Opcional)
              </label>
              
              {!imagePreview ? (
                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-orange-50 hover:border-[#B95221]/50 transition-all ${isSubmitting ? 'pointer-events-none opacity-60' : ''}`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
                    <UploadCloud size={32} className="mb-2" />
                    <p className="mb-1 text-sm font-semibold text-gray-600">Haz clic para subir imagen</p>
                    <p className="text-xs">PNG, JPG o WEBP (MAX. 5MB)</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                  />
                </label>
              ) : (
                <div className="relative group rounded-2xl overflow-hidden border border-gray-200">
                  <img src={imagePreview} alt="Vista previa" className="w-full h-40 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleRemoveImage}
                      className="bg-red-500 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X size={16} /> Quitar imagen
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* BOTÓN ENVIAR */}
            <button 
              type="submit"
              disabled={isSubmitting || rating === 0}
              className={`w-full text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all flex justify-center items-center gap-2 mt-2
                ${(isSubmitting || rating === 0) 
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-none' 
                  : 'bg-[#B95221] hover:bg-[#9A4219] hover:-translate-y-0.5 hover:shadow-xl'
                }
              `}
            >
              {isSubmitting ? (
                <> <Loader2 size={20} className="animate-spin" /> Procesando... </>
              ) : (
                <>{isEditing ? "Actualizar Calificación" : "Enviar Calificación"}</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
