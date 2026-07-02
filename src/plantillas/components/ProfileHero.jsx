import React from 'react';
import { DoorOpen, LogOut, Share2, QrCode, Edit3, Bookmark, Star, MapPin, Camera, Check, CheckCircle2 } from 'lucide-react';

export default function ProfileHero({
  profesional,
  volverAtras,
  isLoggedIn,
  userName,
  handleLogout,
  onProtectedAction,
  handleShare,
  toggleQR,
  isOwner,
  isEditing,
  setIsEditing,
  toggleSaveCard,
  isSaving,
  isSaved,
  editFormData,
  handleEditChange,
  handleLinkClick,
  links,
  imagePreview,
  setEditFormData,
  isCreateMode,
  specialtiesData
}) {
  return (
    <>
      {/* 🖼️ BARRA DE NAVEGACIÓN SUPERIOR (FLOTANTE) */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-start z-50 pointer-events-none">
        <button 
          onClick={volverAtras}
          aria-label="Salir del negocio"
          className="flex items-center gap-2 bg-white/80 backdrop-blur-md rounded-full px-4 py-2 hover:bg-white text-[#1A535C] hover:text-[#6A431F] border border-gray-200 transition-all shadow-md shrink-0 pointer-events-auto font-medium text-sm"
        >
          <DoorOpen size={18} />
          <span>Salir del negocio</span>
        </button>
        
        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          {/* 🚀 BOTÓN LOGOUT TIPO PILL EN LA ESQUINA SUPERIOR */}
          {isLoggedIn ? (
             <button 
               onClick={handleLogout} 
               aria-label="Cerrar sesión"
               className="flex items-center gap-2 bg-white/90 backdrop-blur-md border border-gray-200 p-1 pr-3 rounded-full hover:bg-white transition-all shadow-md group"
               title="Cerrar sesión"
             >
               <div className="w-8 h-8 rounded-full bg-[#F9842C] flex items-center justify-center text-white font-bold text-sm font-sans">
                 {userName ? userName.charAt(0).toUpperCase() : 'U'}
               </div>
               <LogOut size={16} className="text-[#757778] group-hover:text-red-500 transition-colors" />
             </button>
          ) : (
             <button 
               onClick={() => onProtectedAction(null)} 
               aria-label="Ingresar para ver más detalles"
               className="h-10 px-4 bg-white/90 backdrop-blur-md border border-gray-200 rounded-full flex items-center justify-center hover:bg-white transition-all text-xs font-bold uppercase text-[#1A535C] tracking-widest gap-2 shadow-md"
             >
               <DoorOpen size={16} className="text-[#F9842C]"/> Ingresar
             </button>
          )}
        </div>
      </div>

      {/* 🖼️ HEADER BANNER IMAGE */}
      <div className="relative overflow-hidden mb-6 pt-16 bg-[#F8F9FA] sm:bg-transparent">
        <div className="relative z-10 flex flex-col">
          {/* Hero Banner Image */}
          <div className="relative w-full max-w-4xl mx-auto mb-4 md:px-4 lg:px-6">
            <div className="relative aspect-video overflow-hidden md:rounded-[2.5rem] bg-[#F8F9FA]">
              <img 
                src={imagePreview || profesional.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profesional.name)}&background=F8F9FA&color=1E3D51&size=512`} 
                onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profesional.name)}&background=F8F9FA&color=1E3D51&size=512`; }}
                alt={`Foto de perfil de ${profesional.name}`} 
                className="w-full h-full object-cover"
              />
              {isEditing && (
                <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center cursor-pointer hover:bg-black/50 transition-colors z-20">
                  <Camera size={48} className="text-white mb-2" />
                  <span className="text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-full">Cambiar Portada</span>
                  <input type="file" accept="image/*" name="image" onChange={handleEditChange} className="hidden" />
                </label>
              )}
            </div>
            {/* Difuminado por FUERA del overflow-hidden para borrar completamente el borde de la imagen */}
            <div className="absolute bottom-[-5px] left-[-5px] right-[-5px] h-20 sm:h-24 bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA]/80 to-[#F8F9FA]/0 pointer-events-none z-10"></div>
            
            {/* BOTONES COMPARTIR Y QR (Top Left del Logo) */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:left-10 flex gap-2 z-30">
              <button 
                onClick={handleShare}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md backdrop-blur-md border active:scale-95 bg-white/80 border-white/50 text-[#1A535C] hover:bg-white hover:text-[#6A431F]"
                title="Compartir"
              >
                <Share2 size={24} />
              </button>
              <button 
                onClick={toggleQR}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md backdrop-blur-md border active:scale-95 bg-white/80 border-white/50 text-[#1A535C] hover:bg-white hover:text-[#6A431F]"
                title="Mostrar QR"
              >
                <QrCode size={24} />
              </button>
            </div>
            
            {/* BOTÓN GUARDAR (Top Right del Logo) */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:right-10 flex gap-2 z-30">
              {isOwner && !isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-md border border-white/50 active:scale-95 bg-[#F9842C] text-white hover:bg-[#e06516] mr-2 animate-bounce-short"
                  title="Editar Perfil"
                >
                  <Edit3 size={22} />
                </button>
              )}
              <button 
                onClick={toggleSaveCard}
                disabled={isSaving}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md backdrop-blur-md border active:scale-95 ${isSaved ? 'bg-[#6A431F] border-[#6A431F] text-white hover:bg-[#523317]' : 'bg-white/80 border-white/50 text-[#1A535C] hover:bg-white hover:text-[#6A431F]'}`}
                title={isSaved ? "Quitar del tarjetero" : "Guardar en mi tarjetero"}
              >
                <Bookmark size={24} className={isSaved ? 'fill-white' : ''} />
              </button>
            </div>

            {/* BADGES OVERLAY */}
            <div className="absolute bottom-6 right-6 flex gap-2 z-20">
              {profesional.reviews_count > 0 && (
                <div className="bg-white px-2 py-1.5 rounded-lg border border-gray-100 shadow-lg flex items-center gap-1 z-30">
                  <Star size={16} className="text-[#F9842C] fill-[#F9842C]" />
                  <span className="font-bold text-[#1A535C] text-sm">{profesional.rating}</span>
                </div>
              )}
            </div>
          </div>

          {/* TITULO, PROFESION Y UBICACION */}
          <div className="flex justify-between items-start px-6 sm:px-8 md:px-6 lg:px-8 max-w-4xl mx-auto w-full gap-4">
            <div className="text-left flex-1">
              {isEditing ? (
                <>
                  <div className="flex items-center gap-1 mb-1 w-full relative">
                    <input 
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      className="w-full text-3xl font-extrabold text-[#1A535C] leading-tight bg-white/60 border border-dashed border-gray-400 focus:border-[#F9842C] focus:bg-white rounded px-2 outline-none transition-all pr-6"
                      placeholder="Nombre del Profesional / Negocio"
                    />
                    <span className="absolute right-2 text-red-500 font-bold text-xl" title="Campo obligatorio">*</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 w-full relative">
                    <input 
                      name="title"
                      value={editFormData.title}
                      onChange={handleEditChange}
                      className="w-full text-[#F9842C] text-sm font-bold uppercase tracking-widest bg-white/60 border border-dashed border-gray-400 focus:border-[#F9842C] focus:bg-white rounded px-2 outline-none transition-all pr-6"
                      placeholder="Título o Especialidad"
                    />
                    <span className="absolute right-2 text-red-500 font-bold text-lg" title="Campo obligatorio">*</span>
                  </div>
                  
                  {/* Edición de Categoría y Código de Vendedor */}
                  <div className="mt-3 flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 flex flex-col">
                      <label className="text-xs font-bold text-gray-500 mb-1">Categoría Principal <span className="text-red-500" title="Campo obligatorio">*</span></label>
                      <select 
                        name="category" 
                        value={editFormData.category || ''} 
                        onChange={(e) => {
                           // Reset subcategories when category changes
                           setEditFormData({ ...editFormData, category: e.target.value, subcategories: [] });
                        }} 
                        className="w-full text-sm bg-white/80 border border-dashed border-gray-400 focus:border-[#F9842C] rounded p-2 outline-none cursor-pointer"
                      >
                        <option value="">Selecciona una Categoría...</option>
                        {specialtiesData && specialtiesData.map(g => (
                          <option key={g.category} value={g.category}>{g.category}</option>
                        ))}
                      </select>
                    </div>
                    {isCreateMode && (
                      <div className="flex-1 flex flex-col">
                        <label className="text-xs font-bold text-gray-500 mb-1">Cód. Referido (Opcional)</label>
                        <input 
                          name="seller_code" 
                          value={editFormData.seller_code || ''} 
                          onChange={handleEditChange} 
                          className="w-full text-sm bg-white/80 border border-dashed border-gray-400 focus:border-[#F9842C] focus:bg-white rounded p-2 outline-none transition-all"
                          placeholder="Ej. maria"
                        />
                      </div>
                    )}
                  </div>

                  {/* 🛠️ SUBCATEGORÍAS MÚLTIPLES */}
                  {isEditing && editFormData?.category && (() => {
                    const group = specialtiesData?.find(g => g.category === editFormData.category);
                    const subs = group ? group.subcategories : [];
                    if (!subs || subs.length === 0) return null;
                    
                    return (
                      <div className="mt-3 flex flex-col bg-white/50 p-3 rounded-xl border border-gray-200 shadow-sm">
                        <label className="text-xs font-bold text-gray-500 mb-2">Subcategorías (puedes elegir varias) <span className="text-red-500" title="Campo obligatorio">*</span></label>
                        <div className="flex flex-wrap gap-2">
                          {subs.map(s => {
                            const checked = (editFormData.subcategories || []).includes(s.subcategory);
                            return (
                              <button
                                type="button"
                                key={s.subcategory}
                                onClick={() => {
                                  const prev = editFormData.subcategories || [];
                                  const newSubs = checked ? prev.filter(x => x !== s.subcategory) : [...prev, s.subcategory];
                                  setEditFormData({ ...editFormData, subcategories: newSubs });
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${checked
                                    ? 'bg-[#F9842C] text-white border-[#F9842C] shadow-sm'
                                    : 'bg-white text-[#757778] border-gray-200 hover:border-[#F9842C]/50 hover:text-[#F9842C]'
                                  }`}
                              >
                                {checked && <Check size={14} className="inline mr-1 -mt-0.5" />}
                                {s.subcategory}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* Edición de Ubicación */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/50 p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="col-span-1 sm:col-span-2 text-sm font-extrabold text-[#1A535C] flex items-center gap-2">
                      <MapPin size={16} className="text-[#F9842C]" /> Ubicación Geográfica
                    </p>
                    
                    <div className="flex flex-col">
                      <label className="text-xs font-bold text-gray-500 mb-1">País</label>
                      <input 
                        name="country" 
                        value="Bolivia" 
                        disabled 
                        className="w-full text-sm bg-gray-100 border border-gray-200 text-gray-500 rounded p-2 outline-none cursor-not-allowed" 
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-xs font-bold text-gray-500 mb-1">Departamento <span className="text-red-500" title="Campo obligatorio">*</span></label>
                      <select 
                        name="state" 
                        value={editFormData.state || ''} 
                        onChange={handleEditChange} 
                        className="w-full text-sm bg-white/80 border border-dashed border-gray-400 focus:border-[#F9842C] rounded p-2 outline-none cursor-pointer"
                      >
                        <option value="">Selecciona un departamento...</option>
                        <option value="La Paz">La Paz</option>
                        <option value="Santa Cruz">Santa Cruz</option>
                        <option value="Cochabamba">Cochabamba</option>
                        <option value="Oruro">Oruro</option>
                        <option value="Potosí">Potosí</option>
                        <option value="Chuquisaca">Chuquisaca</option>
                        <option value="Tarija">Tarija</option>
                        <option value="Beni">Beni</option>
                        <option value="Pando">Pando</option>
                      </select>
                    </div>

                    <div className="flex flex-col sm:col-span-2">
                      <label className="text-xs font-bold text-gray-500 mb-1">¿Realiza entregas a domicilio?</label>
                      <select 
                        name="home_delivery" 
                        value={editFormData.home_delivery ? "true" : "false"} 
                        onChange={(e) => handleEditChange({ target: { name: 'home_delivery', value: e.target.value === 'true' } })} 
                        className="w-full text-sm bg-white/80 border border-dashed border-gray-400 focus:border-[#F9842C] rounded p-2 outline-none cursor-pointer"
                      >
                        <option value="false">No, no hago entregas a domicilio</option>
                        <option value="true">Sí, entrego a domicilio</option>
                      </select>
                    </div>

                    <div className="flex flex-col sm:col-span-2">
                      <label className="text-xs font-bold text-gray-500 mb-1">Pega aquí el enlace de Google Maps</label>
                      <input 
                        name="ubicacion_url" 
                        value={editFormData.ubicacion_url || ''} 
                        onChange={handleEditChange} 
                        className="w-full text-sm bg-white/80 border border-dashed border-gray-400 focus:border-[#F9842C] rounded p-2 outline-none" 
                        placeholder="https://maps.app.goo.gl/..." 
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-extrabold text-[#1A535C] leading-tight mb-1 flex items-center gap-1.5 flex-wrap">
                    <span>{profesional.name}</span>
                    {profesional.premium && (
                      <CheckCircle2 size={22} className="text-[#F9842C] fill-[#F9842C]/10 shrink-0" title="Negocio Premium Verificado" />
                    )}
                  </h1>
                  <p className="text-[#F9842C] text-sm font-bold uppercase tracking-widest mb-1">{profesional.title}</p>
                  {profesional.home_delivery && (
                    <span className="inline-flex items-center gap-1 bg-[#1A535C]/10 text-[#1A535C] text-xs font-bold px-2 py-1 rounded-md">
                      📦 Entrega a Domicilio
                    </span>
                  )}
                </>
              )}
            </div>
            {links.ubicacion && (
              <button 
                onClick={(e) => handleLinkClick(e, 'Ubicación', links.ubicacion)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 mt-1 rounded-xl bg-white text-[#1A535C] font-bold hover:bg-gray-50 transition-all border border-gray-200 shadow-sm text-sm active:scale-[0.98] shrink-0"
              >
                <MapPin size={18} className="text-[#F9842C]" />
                <span>Ubicación</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
