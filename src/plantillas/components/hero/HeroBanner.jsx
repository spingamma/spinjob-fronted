import React from 'react';
import { Camera, Star, Edit3, Share2, QrCode, MapPin, Bookmark } from 'lucide-react';

export default function HeroBanner({
  profesional,
  imagePreview,
  isEditing,
  setIsEditing,
  handleEditChange,
  isOwner,
  handleShare,
  toggleQR,
  isCreateMode,
  links,
  handleLinkClick,
  toggleSaveCard,
  isSaving,
  isSaved
}) {
  return (
    <div className="relative w-full max-w-5xl mx-auto mb-4 md:px-4 lg:px-6">
      <div className="relative aspect-video overflow-hidden md:rounded-[2.5rem] bg-[#F8F9FA]">
        <img
          src={imagePreview || profesional.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profesional.name || 'Negocio')}&background=F8F9FA&color=1E3D51&size=512`}
          onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profesional.name || 'Negocio')}&background=F8F9FA&color=1E3D51&size=512`; }}
          alt={`Foto de perfil de ${profesional.name}`}
          className="w-full h-full object-cover"
        />
        {isEditing && (
          <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center cursor-pointer hover:bg-black/50 transition-colors z-20">
            <Camera size={48} className="text-white mb-2" />
            <span className="text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-full">Ingresa el logo de tu negocio</span>
            <input type="file" accept="image/*" name="image" onChange={handleEditChange} data-testid="image-upload-input" className="hidden" />
          </label>
        )}
        
        {/* BADGES OVERLAY */}
        <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 flex flex-col gap-1.5 items-end z-30">
          {profesional.reviews_count > 0 && (
            <div className="bg-white/95 backdrop-blur-sm px-1.5 py-1 rounded-lg border border-gray-100 shadow-sm flex items-center gap-1">
              <Star size={12} className="text-[#F9842C] fill-[#F9842C] sm:w-[14px] sm:h-[14px]" />
              <span className="font-bold text-[#1A535C] text-[10px] sm:text-xs">{profesional.rating}</span>
            </div>
          )}
          {profesional.home_delivery && (
            <span className="inline-flex items-start gap-1.5 bg-white/95 backdrop-blur-sm border border-gray-100 text-[#1A535C] text-[9px] sm:text-[10px] font-extrabold px-1.5 py-1 rounded-lg shadow-sm w-[75px] sm:w-[85px] leading-tight text-left">
              <span className="shrink-0">📦</span>
              <span>Entrega Domicilio</span>
            </span>
          )}
          {profesional.national_delivery && (
            <span className="inline-flex items-start gap-1.5 bg-white/95 backdrop-blur-sm border border-gray-100 text-[#1A535C] text-[9px] sm:text-[10px] font-extrabold px-1.5 py-1 rounded-lg shadow-sm w-[75px] sm:w-[85px] leading-tight text-left">
              <span className="shrink-0">✈️</span>
              <span>Delivery Nacional</span>
            </span>
          )}
        </div>
      </div>
      
      {/* Fade para unir con el fondo */}
      <div className="absolute bottom-[-5px] left-[-5px] right-[-5px] h-20 sm:h-24 bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA]/80 to-[#F8F9FA]/0 pointer-events-none z-10"></div>

      {/* BOTÓN EDITAR */}
      {isOwner && !isEditing && (
        <div className="absolute bottom-2.5 left-2.5 sm:bottom-4 sm:left-4 z-30">
          <button
            onClick={() => setIsEditing(true)}
            data-testid="edit-profile-btn"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-md border border-white/50 active:scale-95 bg-[#F9842C] text-white hover:bg-[#e06516] animate-bounce-short"
            title="Editar Perfil"
          >
            <Edit3 size={18} />
          </button>
        </div>
      )}

      {/* BOTONES COMPARTIR Y QR */}
      {!isEditing && !isCreateMode && (
        <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 flex gap-2 z-30">
          <button
            onClick={handleShare}
            data-testid="profile-share-btn"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md backdrop-blur-md border active:scale-95 bg-white/80 border-white/50 text-[#1A535C] hover:bg-white hover:text-[#6A431F]"
            title="Compartir"
          >
            <Share2 size={20} />
          </button>
          <button
            onClick={toggleQR}
            data-testid="profile-qr-btn"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md backdrop-blur-md border active:scale-95 bg-white/80 border-white/50 text-[#1A535C] hover:bg-white hover:text-[#6A431F]"
            title="Mostrar QR"
          >
            <QrCode size={20} />
          </button>
        </div>
      )}

      {/* BOTONES UBICACIÓN Y GUARDAR */}
      <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 flex gap-2 z-30">
        {!isEditing && links?.ubicacion && (
          <button
            onClick={(e) => handleLinkClick(e, 'Ubicación', links.ubicacion)}
            data-testid="profile-location-btn"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md backdrop-blur-md border active:scale-95 bg-white/80 border-white/50 text-[#F9842C] hover:bg-white hover:text-[#e06516]"
            title="Ver ubicación"
          >
            <MapPin size={18} />
          </button>
        )}
        {!isEditing && !isCreateMode && (
          <button
            onClick={toggleSaveCard}
            disabled={isSaving}
            data-testid="profile-bookmark-btn"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md backdrop-blur-md border active:scale-95 ${isSaved ? 'bg-[#6A431F] border-[#6A431F] text-white hover:bg-[#523317]' : 'bg-white/80 border-white/50 text-[#1A535C] hover:bg-white hover:text-[#6A431F]'}`}
            title={isSaved ? "Quitar del tarjetero" : "Guardar en mi tarjetero"}
          >
            <Bookmark size={20} className={isSaved ? 'fill-white' : ''} />
          </button>
        )}
      </div>
    </div>
  );
}
