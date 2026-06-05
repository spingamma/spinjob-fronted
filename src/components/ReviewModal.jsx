// Archivo: src/components/ReviewModal.jsx
import React, { useState, useEffect } from 'react';
import { Star, X, Loader2 } from 'lucide-react';

export default function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  calificacionPrevia = null,
  profesionalName = ""
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [description, setDescription] = useState("");

  // Al abrir el modal, poblamos con la calificación previa si la hubiera
  useEffect(() => {
    if (isOpen) {
      if (calificacionPrevia) {
        setRating(calificacionPrevia.rating || 0);
        setDescription(calificacionPrevia.descripcion || "");
      } else {
        setRating(0);
        setDescription("");
      }
    }
  }, [isOpen, calificacionPrevia]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Por favor selecciona una calificación de estrellas.");
      return;
    }
    onSubmit({ rating, description, esEdicion: !!calificacionPrevia });
  };

  const isEditing = !!calificacionPrevia;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-[#1E3D51]/60 backdrop-blur-md transition-opacity" onClick={onClose}>
      <div 
        className="bg-white border border-gray-100 rounded-[2rem] shadow-2xl w-full max-w-lg relative animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera decorativa */}
        <div className="bg-gradient-to-br from-[#1E3D51] to-[#32698F] p-6 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay"></div>
          
          <button 
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Cerrar modal de calificación"
            className="absolute top-4 right-4 z-20 text-white/80 hover:text-white transition-colors p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm disabled:opacity-50"
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
                          ? "fill-[#F67927] text-[#F67927]" 
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
                className="w-full bg-gray-50 border border-gray-200 text-[#1E3D51] rounded-2xl p-4 focus:ring-2 focus:ring-[#F67927]/30 focus:border-[#F67927] focus:bg-white outline-none transition-all resize-none disabled:opacity-60"
                rows="4"
              />
            </div>

            {/* BOTÓN ENVIAR */}
            <button 
              type="submit"
              disabled={isSubmitting || rating === 0}
              className={`w-full text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all flex justify-center items-center gap-2 mt-2
                ${(isSubmitting || rating === 0) 
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-none' 
                  : 'bg-[#F67927] hover:bg-[#e06516] hover:-translate-y-0.5 hover:shadow-xl'
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
