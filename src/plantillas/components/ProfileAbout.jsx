import React, { useState } from 'react';
import { Check } from 'lucide-react';

export default function ProfileAbout({ 
  profesional, 
  isEditing, 
  editFormData, 
  handleEditChange,
  // eslint-disable-next-line no-unused-vars
  setEditFormData,
  // eslint-disable-next-line no-unused-vars
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
      {isEditing ? (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm">
          {/* E-E-A-T Datos Estructurados */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-1.5 bg-[#1A535C]/5 text-[#1A535C] px-3 py-1.5 rounded-lg text-sm font-medium border border-[#1A535C]/20">
              <input name="experience_years" value={editFormData.experience_years} onChange={handleEditChange} type="number" data-testid="experience-years-input" className="w-12 text-center font-bold bg-white border border-dashed border-gray-400 rounded outline-none focus:border-[#F9842C]" placeholder="0" />
              <span>Años de Experiencia</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 bg-[#1A535C]/5 text-[#1A535C] px-3 py-1.5 rounded-lg text-sm font-medium border border-[#1A535C]/20">
              <span>Matrícula/Credencial:</span>
              <input name="credentials" value={editFormData.credentials} onChange={handleEditChange} data-testid="credentials-input" className="w-24 font-bold bg-white border border-dashed border-gray-400 rounded px-1.5 py-0.5 outline-none focus:border-[#F9842C]" placeholder="Ej. 12345" />
            </div>
          </div>

          <div className="relative">
            <textarea
              name="description"
              value={editFormData.description}
              onChange={handleEditChange}
              data-testid="description-textarea"
              className="w-full min-h-[120px] text-[#1A535C] leading-relaxed text-sm sm:text-base bg-white/60 border border-dashed border-gray-400 rounded-xl p-3 outline-none focus:border-[#F9842C] focus:bg-white resize-y pr-6"
              placeholder="Describe tus servicios, experiencia, y lo que te hace único..."
            />
            <span className="absolute top-2 right-3 text-red-500 font-bold text-lg" title="Campo obligatorio">*</span>
          </div>
        </div>
      ) : (
        <div className="px-2">
          {/* E-E-A-T Datos Estructurados */}
          {(profesional.experience_years || profesional.credentials) && (
            <div className="flex flex-wrap gap-3 mb-4">
              {profesional.experience_years && (
                <div className="flex flex-wrap items-center gap-1.5 bg-[#1A535C]/5 text-[#1A535C] px-3 py-1.5 rounded-lg text-sm font-medium border border-[#1A535C]/20">
                  <span className="font-bold">{profesional.experience_years}</span> Años de Experiencia
                </div>
              )}
              {profesional.credentials && (
                <div className="flex flex-wrap items-center gap-1.5 bg-[#1A535C]/5 text-[#1A535C] px-3 py-1.5 rounded-lg text-sm font-medium border border-[#1A535C]/20">
                  <span>Matrícula/Credencial:</span>
                  <span className="font-bold">{profesional.credentials}</span>
                </div>
              )}
            </div>
          )}

          {profesional.description && (
            <div className="relative">
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
