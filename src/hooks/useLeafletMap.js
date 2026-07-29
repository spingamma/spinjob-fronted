import { useState, useEffect, useRef, useCallback } from 'react';

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

export function useLeafletMap({ isOpen, initialCoords, selectedState }) {
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
  const getInitialCenter = useCallback(() => {
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
  }, [initialCoords, selectedState]);

  const getInitialZoom = useCallback(() => {
    if (initialCoords && initialCoords.lat && initialCoords.lng) {
      return 15;
    }
    if (selectedState) {
      return 12; // Zoom to state city center
    }
    return DEFAULT_ZOOM; // Zoom to whole country
  }, [initialCoords, selectedState]);

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
  }, [leafletLoaded, isOpen, getInitialCenter, getInitialZoom]);

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

  return {
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
  };
}
