// Archivo: src/components/ProfessionalCard.jsx
import { Link } from 'react-router-dom';
import { Star, Edit3, DoorOpen, CheckCircle2, Truck, Plane } from 'lucide-react';

export default function ProfessionalCard({ professional, isLoggedIn, isAdmin, onCardClick, userCoords, isMobile }) {
  // Parsers coordinates from business URL
  const parseGoogleMapsCoords = (url) => {
    if (!url) return null;
    let match = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    match = url.match(/[?&](q|query)=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) return { lat: parseFloat(match[2]), lng: parseFloat(match[3]) };
    match = url.match(/\/place\/(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    match = url.match(/^\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*$/);
    if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    return null;
  };

  // Calculates distance in km using the Haversine formula
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Determines the travel time category based on distance brackets
  const getTravelTimeMessage = () => {
    const isTabletOrMobile = typeof window !== 'undefined' && 
      (window.innerWidth < 1025 && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
    if (!isTabletOrMobile || !userCoords) return null;
    const bizCoords = parseGoogleMapsCoords(professional.ubicacion_url);
    if (!bizCoords) return null;

    const dist = getDistance(userCoords.lat, userCoords.lng, bizCoords.lat, bizCoords.lng);
    
    if (dist < 6) {
      return "Minutos";
    } else if (dist >= 6 && dist < 24) {
      return "Pocas horas";
    } else if (dist >= 24 && dist < 150) {
      return "Horas";
    } else {
      return "Viajes";
    }
  };

  const travelMessage = getTravelTimeMessage();

  return (
    <Link
      data-testid="professional-card"
      to={isLoggedIn ? `/perfil/${professional.slug}` : "#"}
      onClick={(e) => {
        if (!isLoggedIn) {
          e.preventDefault();
          onCardClick(professional.slug);
        }
      }}
      className="group flex flex-col h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 hover:border-[#F9842C]/30 overflow-hidden"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={professional.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(professional.name)}&background=F8F9FA&color=1E3D51&size=256`}
          alt={`Foto de perfil de ${professional.name}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(professional.name)}&background=F8F9FA&color=1E3D51&size=256`;
          }}
        />

        {professional.premium && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/95 backdrop-blur-sm p-1 sm:p-1.5 rounded-full flex items-center justify-center shadow-sm border border-gray-100" title="Verificado">
            <CheckCircle2 size={13} className="text-[#F9842C] sm:w-[16px] sm:h-[16px]" />
          </div>
        )}
        {professional.reviews_count > 0 && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/95 backdrop-blur-sm px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg flex items-center gap-1 shadow-sm border border-gray-100">
            <Star size={12} className="fill-[#F9842C] text-[#F9842C] sm:w-[14px] sm:h-[14px]" />
            <span className="text-xs sm:text-sm font-bold text-gray-900">{professional.rating}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 p-3 sm:p-4">
        <div className="flex flex-col flex-1">
          <h3 className="font-bold text-[#1A535C] text-base sm:text-lg leading-tight pr-1 sm:pr-2 break-words">
            {professional.name}
          </h3>
          <p className="text-[#6A431F] font-semibold text-xs sm:text-sm mb-1.5 break-words leading-snug">
            {professional.title}
          </p>
        </div>

        {/* 🚗 Travel Distance & Delivery Row */}
        {(travelMessage || professional.home_delivery || professional.national_delivery) && (
          <div 
            data-testid="card-location-row"
            className="grid grid-cols-2 gap-2 mt-1 mb-2.5 text-[10px] sm:text-xs border-t border-gray-100 pt-2 w-full"
          >
            <div className="text-gray-500 font-medium flex items-center gap-1 text-left min-w-0">
              {travelMessage && (
                <span className="text-[#6A431F] font-semibold flex items-center gap-1.5 break-words leading-tight w-full" title={travelMessage}>
                  <span className="shrink-0">🚗</span>
                  <span>{travelMessage}</span>
                </span>
              )}
            </div>
            
            <div className="flex flex-col items-end gap-1 min-w-0">
              {professional.home_delivery && (
                <div 
                  data-testid="card-delivery-badge"
                  className="px-1.5 py-0.5 rounded-lg bg-[#1A535C]/5 text-[#1A535C] border border-[#1A535C]/10 flex items-start gap-1 font-bold text-[9px] sm:text-[10px] w-[65px] sm:w-[75px] leading-tight text-left"
                >
                  <span className="shrink-0">📦</span>
                  <span>Delivery</span>
                </div>
              )}
              {professional.national_delivery && (
                <div 
                  data-testid="card-national-delivery-badge"
                  className="px-1.5 py-0.5 rounded-lg bg-[#1A535C]/5 text-[#1A535C] border border-[#1A535C]/10 flex items-start gap-1 font-bold text-[9px] sm:text-[10px] w-[65px] sm:w-[75px] leading-tight text-left"
                >
                  <span className="shrink-0">✈️</span>
                  <span className="break-words">Delivery Nacional</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-auto pt-2 w-full">
          <div className="w-full flex items-center justify-center gap-1.5 border-2 border-[#6A431F] text-[#6A431F] group-hover:bg-[#6A431F] group-hover:text-white font-bold py-1.5 sm:py-2 px-3 rounded-full transition-colors text-xs sm:text-sm">
            <DoorOpen size={14} /> Visitar
          </div>
        </div>
      </div>
    </Link>
  );
}
