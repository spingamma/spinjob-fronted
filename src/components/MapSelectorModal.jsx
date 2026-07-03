import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Search, Navigation, X, Loader2 } from 'lucide-react';

const loadLeaflet = () => {
  return new Promise((resolve, reject) => {
    if (window.L) {
      resolve(window.L);
      return;
    }
    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => resolve(window.L);
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
};

const DEPARTAMENTOS_BO = {
  "la paz": [-16.5000, -68.1500],
  "santa cruz": [-17.7833, -63.1820],
  "cochabamba": [-17.3895, -66.1568],
  "oruro": [-17.9833, -67.1500],
  "potosi": [-19.5833, -65.7500],
  "potosí": [-19.5833, -65.7500],
  "chuquisaca": [-19.0333, -65.2627],
  "tarija": [-21.5355, -64.7299],
  "beni": [-14.8333, -64.9000],
  "pando": [-11.0264, -68.7692]
};

const DEFAULT_CENTER = [-16.2902, -63.5887]; // Center of Bolivia
const DEFAULT_ZOOM = 6;

export default function MapSelectorModal({ isOpen, onClose, onConfirm, initialCoords, selectedState }) {
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [coords, setCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);

  // Determine initial center
  const getInitialCenter = () => {
    if (initialCoords && initialCoords.lat && initialCoords.lng) {
      return [initialCoords.lat, initialCoords.lng];
    }
    if (selectedState) {
      const stateKey = selectedState.toLowerCase().trim();
      if (DEPARTAMENTOS_BO[stateKey]) {
        return DEPARTAMENTOS_BO[stateKey];
      }
    }
    return DEFAULT_CENTER;
  };

  const getInitialZoom = () => {
    if (initialCoords && initialCoords.lat && initialCoords.lng) {
      return 15;
    }
    if (selectedState) {
      return 12; // Zoom to state city center
    }
    return DEFAULT_ZOOM; // Zoom to whole country
  };

  // Load leaflet CDN dynamically
  useEffect(() => {
    if (isOpen) {
      loadLeaflet()
        .then(() => {
          setLeafletLoaded(true);
        })
        .catch((err) => {
          console.error("Error loading Leaflet maps:", err);
          setLoadingError("No se pudo cargar el mapa. Verifica tu conexión a internet.");
        });
    }
  }, [isOpen]);

  // Initialize and update Map
  useEffect(() => {
    if (!leafletLoaded || !isOpen || !mapRef.current) return;

    const L = window.L;
    const center = getInitialCenter();
    const zoom = getInitialZoom();

    setCoords({ lat: center[0], lng: center[1] });

    // Initialize Map Instance
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false // Custom controls/positions later if needed, we'll add standard
      }).setView(center, zoom);

      // Add Zoom control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

      // Add OSM Tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      // Define custom red marker icon to avoid path resolution bugs
      const redPinIcon = L.divIcon({
        html: `<div class="relative flex items-center justify-center">
                 <div class="absolute -top-7 flex flex-col items-center">
                   <div class="bg-red-500 rounded-full p-1.5 shadow-md border-2 border-white transition-all transform hover:scale-110">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-white fill-current"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/></svg>
                   </div>
                   <div class="w-1.5 h-2 bg-red-500 -mt-0.5 shadow-sm"></div>
                 </div>
               </div>`,
        className: 'custom-pin-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      // Create draggable Marker
      markerInstance.current = L.marker(center, {
        icon: redPinIcon,
        draggable: true
      }).addTo(mapInstance.current);

      // Map Click event
      mapInstance.current.on('click', (e) => {
        const { lat, lng } = e.latlng;
        markerInstance.current.setLatLng([lat, lng]);
        setCoords({ lat, lng });
      });

      // Marker Drag event
      markerInstance.current.on('dragend', () => {
        const pos = markerInstance.current.getLatLng();
        setCoords({ lat: pos.lat, lng: pos.lng });
      });
    } else {
      // If map already exists, update center
      mapInstance.current.setView(center, zoom);
      markerInstance.current.setLatLng(center);
    }

    // Cleanup on close
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerInstance.current = null;
      }
    };
  }, [leafletLoaded, isOpen]);

  // Handle address lookup using Nominatim
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstance.current) return;

    setSearching(true);
    try {
      const q = encodeURIComponent(searchQuery.trim());
      // Nominatim search restricted to Bolivia for precision
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&countrycodes=bo&limit=1`);
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        
        mapInstance.current.setView([newLat, newLng], 15);
        markerInstance.current.setLatLng([newLat, newLng]);
        setCoords({ lat: newLat, lng: newLng });
      } else {
        alert("No se encontraron resultados para la dirección en Bolivia. Intenta con otra búsqueda.");
      }
    } catch (err) {
      console.error("Search error:", err);
      alert("Hubo un problema al buscar la dirección.");
    } finally {
      setSearching(false);
    }
  };

  // Get user GPS Location
  const handleGpsLocation = () => {
    if (!navigator.geolocation) {
      alert("La geolocalización no está soportada por tu navegador.");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (mapInstance.current) {
          mapInstance.current.setView([latitude, longitude], 16);
          markerInstance.current.setLatLng([latitude, longitude]);
          setCoords({ lat: latitude, lng: longitude });
        }
        setGpsLoading(false);
      },
      (error) => {
        console.error("GPS Error:", error);
        alert("No se pudo obtener tu ubicación actual. Asegúrate de permitir el acceso al GPS.");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

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
            className="text-gray-400 hover:text-[#1A535C] p-2 hover:bg-gray-200/50 rounded-full transition-colors"
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
                    className="bg-[#1A535C] hover:bg-[#154249] text-white p-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center shrink-0"
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
                  className="bg-white hover:bg-gray-50 text-[#1A535C] border border-gray-200 px-3 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 font-bold text-xs"
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
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-[#757778] border border-gray-200 font-bold text-sm transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => coords && onConfirm(coords)}
            disabled={!leafletLoaded || !coords}
            data-testid="map-confirm-button"
            className="px-6 py-2.5 rounded-xl bg-[#F9842C] hover:bg-[#e06516] text-white font-bold text-sm shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <MapPin size={16} />
            Confirmar Ubicación
          </button>
        </div>
      </div>
    </div>
  );
}
