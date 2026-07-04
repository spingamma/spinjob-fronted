import React, { useState } from 'react';
import { Check } from 'lucide-react';

export default function ProfileAbout({ 
  profesional, 
  isEditing, 
  editFormData, 
  handleEditChange,
  setEditFormData,
  specialtiesData
}) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const isLongDescription = profesional?.description?.length > 70;

  if (!profesional.experience_years && !profesional.credentials && !profesional.description && !isEditing) {
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-[#1A535C] mb-4 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-[#6A431F] rounded-full"></span> Acerca de mí
      </h3>
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm">
      
      {/* E-E-A-T Datos Estructurados */}
      {(profesional.experience_years || profesional.credentials || isEditing) && (
        <div className="flex flex-wrap gap-3 mb-4">
          {(profesional.experience_years || isEditing) && (
            <div className="flex flex-wrap items-center gap-1.5 bg-[#1A535C]/5 text-[#1A535C] px-3 py-1.5 rounded-lg text-sm font-medium border border-[#1A535C]/20">
              {isEditing ? (
                <>
                  <input name="experience_years" value={editFormData.experience_years} onChange={handleEditChange} type="number" className="w-12 text-center font-bold bg-white border border-dashed border-gray-400 rounded outline-none focus:border-[#F9842C]" placeholder="0" />
                  <span>Años de Experiencia</span>
                </>
              ) : (
                <><span className="font-bold">{profesional.experience_years}</span> Años de Experiencia</>
              )}
            </div>
          )}
          {(profesional.credentials || isEditing) && (
            <div className="flex flex-wrap items-center gap-1.5 bg-[#1A535C]/5 text-[#1A535C] px-3 py-1.5 rounded-lg text-sm font-medium border border-[#1A535C]/20">
              <span>Matrícula/Credencial:</span>
              {isEditing ? (
                <input name="credentials" value={editFormData.credentials} onChange={handleEditChange} className="w-24 font-bold bg-white border border-dashed border-gray-400 rounded px-1.5 py-0.5 outline-none focus:border-[#F9842C]" placeholder="Ej. 12345" />
              ) : (
                <span className="font-bold">{profesional.credentials}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* 🚀 WHITESPACE-PRE-LINE para respetar saltos de línea de la BD */}
      {(profesional.description || isEditing) && (
        <div className="relative">
          {isEditing ? (
            <div className="relative">
              <textarea
                name="description"
                value={editFormData.description}
                onChange={handleEditChange}
                className="w-full min-h-[120px] text-[#757778] leading-relaxed text-sm sm:text-base bg-white/60 border border-dashed border-gray-400 rounded-xl p-3 outline-none focus:border-[#F9842C] focus:bg-white resize-y pr-6"
                placeholder="Describe tus servicios, experiencia, y lo que te hace único..."
              />
              <span className="absolute top-2 right-3 text-red-500 font-bold text-lg" title="Campo obligatorio">*</span>
            </div>
          ) : (
            <>
              <p className={`text-[#757778] leading-relaxed whitespace-pre-line text-sm sm:text-base ${!isDescriptionExpanded ? 'line-clamp-2' : ''}`}>
                {profesional.description}
              </p>
              {isLongDescription && (
                <button 
                  data-testid="button-ver-mas"
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-[#F9842C] hover:text-[#e0701b] font-medium text-sm mt-1 focus:outline-none"
                >
                  {isDescriptionExpanded ? 'Ver menos' : 'Ver más'}
                </button>
              )}
            </>
          )}
        </div>
      )}


      </div>
    </div>
  );
}
