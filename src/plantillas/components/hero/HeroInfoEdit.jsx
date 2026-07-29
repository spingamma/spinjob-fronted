import React from 'react';
import { Check, MapPin, Loader2 } from 'lucide-react';

export default function HeroInfoEdit({
  editFormData,
  setEditFormData,
  handleEditChange,
  isCreateMode,
  specialtiesData,
  countriesList,
  setIsMapOpen,
  resolvingUrl,
  detectedCoords
}) {
  return (
    <>
      <div className="flex items-center gap-1 mb-1 w-full relative">
        <input
          name="name"
          value={editFormData.name || ''}
          onChange={handleEditChange}
          maxLength={30}
          className="w-full text-3xl font-extrabold text-[#1A535C] leading-tight bg-white/60 border border-dashed border-gray-400 focus:border-[#F9842C] focus:bg-white rounded px-2 outline-none transition-all pr-6"
          placeholder="Nombre del Negocio"
        />
        <span className="absolute right-2 text-red-500 font-bold text-xl" title="Campo obligatorio">*</span>
      </div>
      <div className="flex items-center gap-1 mt-1 w-full relative">
        <input
          name="title"
          value={editFormData.title || ''}
          onChange={handleEditChange}
          className="w-full text-[#6A431F] text-sm font-bold uppercase tracking-widest bg-white/60 border border-dashed border-gray-400 focus:border-[#F9842C] focus:bg-white rounded px-2 outline-none transition-all pr-6"
          placeholder="Título o Especialidad"
        />
        <span className="absolute right-2 text-red-500 font-bold text-lg" title="Campo obligatorio">*</span>
      </div>

      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <div className="flex-1 flex flex-col">
          <label className="text-xs font-bold text-gray-500 mb-1">Categoría Principal <span className="text-red-500" title="Campo obligatorio">*</span></label>
          <select
            name="category"
            value={editFormData.category || ''}
            onChange={(e) => {
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
              data-testid="input-seller-code"
              name="seller_code"
              value={editFormData.seller_code || ''}
              onChange={handleEditChange}
              className="w-full text-sm bg-white/80 border border-dashed border-gray-400 focus:border-[#F9842C] focus:bg-white rounded p-2 outline-none transition-all"
              placeholder="Ej. ma567"
            />
          </div>
        )}
      </div>

      {editFormData?.category && (() => {
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
                  <button data-testid={`subcategory-btn-${s.subcategory}`}
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

      <div className="mt-4 grid grid-cols-2 gap-3 bg-white/50 p-4 rounded-xl border border-gray-200 shadow-sm">
        <p className="col-span-2 text-sm font-extrabold text-[#1A535C] flex items-center gap-2">
          <MapPin size={16} className="text-[#F9842C]" /> Ubicación Geográfica
        </p>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-gray-500 mb-1">País <span className="text-red-500" title="Campo obligatorio">*</span></label>
          <select
            name="country"
            value={editFormData.country || 'Bolivia'}
            onChange={(e) => {
              setEditFormData(prev => ({ ...prev, country: e.target.value, state: '' }));
            }}
            className="w-full text-sm bg-white/80 border border-dashed border-gray-400 focus:border-[#F9842C] rounded p-2 outline-none cursor-pointer"
          >
            {countriesList.length === 0 ? (
              <option value="Bolivia">Bolivia</option>
            ) : (
              countriesList.map(c => (
                <option key={c.country} value={c.country}>{c.country}</option>
              ))
            )}
          </select>
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
            {countriesList.find(c => c.country === (editFormData.country || 'Bolivia'))?.departments?.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            )) || (
              <>
                <option value="La Paz">La Paz</option>
                <option value="Santa Cruz">Santa Cruz</option>
                <option value="Cochabamba">Cochabamba</option>
                <option value="Oruro">Oruro</option>
                <option value="Potosí">Potosí</option>
                <option value="Chuquisaca">Chuquisaca</option>
                <option value="Tarija">Tarija</option>
                <option value="Beni">Beni</option>
                <option value="Pando">Pando</option>
              </>
            )}
          </select>
        </div>

        <div className="flex flex-col col-span-2">
          <label className="text-xs font-bold text-gray-500 mb-1">¿Realiza entregas a domicilio?</label>
          <select
            value={editFormData.national_delivery ? "national" : (editFormData.home_delivery ? "local" : "no")}
            onChange={(e) => {
              const val = e.target.value;
              setEditFormData(prev => ({
                ...prev,
                home_delivery: val === 'local',
                national_delivery: val === 'national'
              }));
            }}
            className="w-full text-sm bg-white/80 border border-dashed border-gray-400 focus:border-[#F9842C] rounded p-2 outline-none cursor-pointer"
          >
            <option value="no">No realizo envíos / entregas</option>
            <option value="local">Sí, realizo entregas a domicilio (Departamental)</option>
            <option value="national">Sí, realizo envíos nacionales ✈️</option>
          </select>
        </div>

        <div className="flex flex-col col-span-2 gap-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-gray-500">Enlace de Google Maps</label>
            <button
              type="button"
              onClick={() => setIsMapOpen(true)}
              data-testid="open-map-selector-button"
              className="text-xs font-bold text-[#F9842C] hover:text-[#e06516] flex items-center gap-1.5 bg-[#F9842C]/5 px-3 py-1.5 rounded-xl border border-[#F9842C]/20 hover:bg-[#F9842C]/10 transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <MapPin size={14} className="text-[#F9842C]" />
              <span>Elegir en el Mapa</span>
            </button>
          </div>

          <div className="relative flex items-center">
            <input
              name="ubicacion_url"
              value={editFormData.ubicacion_url || ''}
              onChange={handleEditChange}
              className="w-full text-sm bg-white/80 border border-dashed border-gray-400 focus:border-[#F9842C] rounded-xl p-2.5 pr-10 outline-none transition-all"
              placeholder="https://maps.app.goo.gl/..."
            />
            {resolvingUrl && (
              <div className="absolute right-3 flex items-center justify-center">
                <Loader2 size={16} className="animate-spin text-[#F9842C]" />
              </div>
            )}
          </div>

          {detectedCoords && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/50 p-2 rounded-xl mt-1 animate-in fade-in duration-200">
              <Check size={12} className="bg-emerald-600 text-white rounded-full p-0.5" />
              <span>Ubicación detectada correctamente</span>
            </div>
          )}

          {!detectedCoords && editFormData.ubicacion_url && !resolvingUrl && (
            <div className="text-[10px] font-medium text-amber-600 bg-amber-50/50 border border-amber-200/30 p-2 rounded-xl mt-1 italic">
              No pudimos extraer coordenadas del enlace. El mapa usará el centrado de departamento, o puedes elegir con un pin haciendo clic en "Elegir en el Mapa".
            </div>
          )}
        </div>
      </div>
    </>
  );
}
