import React, { useEffect, useRef, useState } from 'react';
import { Bike, MapPin, Store, Navigation } from 'lucide-react';
import { parseGoogleMapsCoords } from '../../plantillas/utils/parseGoogleMapsCoords';

const loadLeaflet = () => {
  return new Promise((resolve, reject) => {
    if (window.L) {
      resolve(window.L);
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve(window.L);
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
};

export default function LiveDriverMap({ order }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  const hasDriverCoords = typeof order?.driver_lat === 'number' && typeof order?.driver_lng === 'number';
  const restCoords = parseGoogleMapsCoords(order?.business_location_url);
  const clientCoords = parseGoogleMapsCoords(order?.delivery_location_url);

  // Inicializar mapa con Leaflet gratuito
  useEffect(() => {
    let isMounted = true;

    loadLeaflet().then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const initialCenter = hasDriverCoords
          ? [order.driver_lat, order.driver_lng]
          : clientCoords
          ? [clientCoords.lat, clientCoords.lng]
          : restCoords
          ? [restCoords.lat, restCoords.lng]
          : [-16.5000, -68.1500];

        const map = L.map(mapContainerRef.current, {
          center: initialCenter,
          zoom: 14,
          zoomControl: false,
          attributionControl: false
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19
        }).addTo(map);

        mapInstanceRef.current = map;

        // Marcador Restaurante
        if (restCoords) {
          const restIcon = L.divIcon({
            html: '<div style="background:#f59e0b;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:16px;">🏪</div>',
            className: '',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });
          L.marker([restCoords.lat, restCoords.lng], { icon: restIcon })
            .bindPopup(`<b>${order.business_name || 'Restaurante'}</b><br>Punto de salida`)
            .addTo(map);
        }

        // Marcador Cliente
        if (clientCoords) {
          const clientIcon = L.divIcon({
            html: '<div style="background:#10b981;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:16px;">🏠</div>',
            className: '',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });
          L.marker([clientCoords.lat, clientCoords.lng], { icon: clientIcon })
            .bindPopup(`<b>${order.customer_name}</b><br>Lugar de entrega`)
            .addTo(map);
        }

        setMapReady(true);
      }
    }).catch(err => {
      console.warn("No se pudo cargar Leaflet:", err);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actualizar posición del repartidor en vivo
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !window.L) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    if (hasDriverCoords) {
      const driverLatLng = [order.driver_lat, order.driver_lng];

      if (!driverMarkerRef.current) {
        const bikeIcon = L.divIcon({
          html: '<div style="background:#2563eb;color:white;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(37,99,235,0.5);border:2px solid white;font-size:20px;" class="animate-bounce">🛵</div>',
          className: '',
          iconSize: [38, 38],
          iconAnchor: [19, 19]
        });

        driverMarkerRef.current = L.marker(driverLatLng, { icon: bikeIcon })
          .bindPopup(`<b>Repartidor: ${order.delivery_agent_name || 'En camino'}</b><br>Transmitiendo GPS en vivo`)
          .addTo(map);
      } else {
        driverMarkerRef.current.setLatLng(driverLatLng);
      }

      // Ajustar vista para abarcar conductor y cliente si están disponibles
      const points = [driverLatLng];
      if (clientCoords) points.push([clientCoords.lat, clientCoords.lng]);
      if (restCoords) points.push([restCoords.lat, restCoords.lng]);

      if (points.length > 1) {
        map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 16 });
      } else {
        map.panTo(driverLatLng);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, order?.driver_lat, order?.driver_lng, hasDriverCoords]);


  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-blue-100 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Bike size={18} />
          </div>
          <div>
            <h4 className="font-black text-primary text-sm sm:text-base leading-tight">
              {order.delivery_agent_name ? `${order.delivery_agent_name} va en camino` : 'Repartidor en camino'}
            </h4>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              Seguimiento GPS en vivo
            </span>
          </div>
        </div>

        {hasDriverCoords && (
          <span className="text-[10px] bg-blue-50 text-blue-800 font-extrabold px-2.5 py-1 rounded-full border border-blue-200">
            📡 Posición en tiempo real
          </span>
        )}
      </div>

      {/* Contenedor del mapa Leaflet */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-gray-200 shadow-inner z-0" 
      />

      <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold pt-1">
        <span className="flex items-center gap-1">
          <Store size={12} className="text-amber-500" /> {order.business_name || 'Restaurante'}
        </span>
        <span className="text-gray-300">━━━━━ 🛵 ━━━━━</span>
        <span className="flex items-center gap-1">
          <MapPin size={12} className="text-emerald-500" /> {order.customer_name}
        </span>
      </div>
    </div>
  );
}
