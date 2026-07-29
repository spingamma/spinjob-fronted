import React from 'react';
import { MapPin, Search, Navigation, X, Loader2 } from 'lucide-react';
import { useLeafletMap } from '../hooks/useLeafletMap';

export default function MapSelectorModal({ isOpen, onClose, onConfirm, initialCoords, selectedState }) {
  const {
    leafletLoaded,
    loadingError,
    searchQuery,
    setSearchQuery,
    searching,
    coords,
    gpsLoading,
    mapRef,
    handleSearch,
    handleGpsLocation
  } = useLeafletMap({ isOpen, initialCoords, selectedState });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#1A535C]/50 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#F8F9FA]">
          <div className="flex items-center gap-2">
            <MapPin size={22} className="text-[#F9842C]" />
            <h3 className="text-lg font-bold text-[#1A535C]">Seleccionar Ubicación</h3>
          </div>
          <button 
            onClick={onClose}
            data-testid="map-close-button"
            className="text-gray-400 hover:text-[#1A535C] p-2 hover:bg-gray-200/50 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 flex-1 flex flex-col gap-4 overflow-y-auto">
          {loadingError ? (
            <div className="text-center py-10 text-red-500 text-sm font-semibold">
              {loadingError}
            </div>
          ) : !leafletLoaded ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 size={36} className="animate-spin text-[#F9842C]" />
              <span className="text-sm font-medium text-[#757778]">Cargando mapa interactivo...</span>
            </div>
          ) : (
            <>
              {/* Search & Actions Bar */}
              <div className="flex flex-col sm:flex-row gap-2">
                <form onSubmit={handleSearch} className="flex-1 flex gap-1.5">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar zona, calle, plaza en Bolivia..."
                    data-testid="map-search-input"
                    className="flex-1 text-sm bg-gray-50 border border-gray-200 focus:border-[#F9842C] focus:bg-white rounded-xl px-3 py-2.5 outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={searching}
                    data-testid="map-search-button"
                    className="bg-[#1A535C] hover:bg-[#154249] text-white p-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50"
                    title="Buscar"
                  >
                    {searching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                  </button>
                </form>
                
                <button
                  type="button"
                  onClick={handleGpsLocation}
                  disabled={gpsLoading}
                  data-testid="map-gps-button"
                  className="bg-white hover:bg-gray-50 text-[#1A535C] border border-gray-200 px-3 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 font-bold text-xs cursor-pointer disabled:opacity-50"
                  title="Usar ubicación actual por GPS"
                >
                  {gpsLoading ? <Loader2 size={16} className="animate-spin text-[#F9842C]" /> : <Navigation size={16} className="text-[#F9842C] fill-[#F9842C]/10" />}
                  <span>Mi Ubicación</span>
                </button>
              </div>

              {/* Leaflet Map Div */}
              <div className="relative border border-gray-200 rounded-2xl overflow-hidden shadow-inner h-[320px] w-full z-10 bg-gray-100">
                <div ref={mapRef} className="w-full h-full" />
              </div>

              {/* Instructions & Lat/Lng Output */}
              <div className="bg-[#F8F9FA] rounded-xl p-3 border border-gray-100 flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#757778]">Ayuda</span>
                <p className="text-[11px] text-[#757778]">Haz clic en el mapa para posicionar el pin rojo en el lugar exacto de tu negocio, o arrastra el pin directamente.</p>
                {coords && (
                  <div className="flex justify-between items-center mt-1 border-t border-gray-200/60 pt-1 text-[11px] font-bold text-[#1A535C]">
                    <span>Pin colocado en el mapa</span>
                    <span className="text-[#F9842C]">✓ Ubicación lista</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-gray-100 bg-[#F8F9FA] flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-[#757778] border border-gray-200 font-bold text-sm transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => coords && onConfirm(coords)}
            disabled={!leafletLoaded || !coords}
            data-testid="map-confirm-button"
            className="px-6 py-2.5 rounded-xl bg-[#F9842C] hover:bg-[#e06516] text-white font-bold text-sm shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <MapPin size={16} />
            Confirmar Ubicación
          </button>
        </div>
      </div>
    </div>
  );
}
