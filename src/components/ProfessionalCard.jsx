// Archivo: src/components/ProfessionalCard.jsx
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

export default function ProfessionalCard({ professional, isLoggedIn, onCardClick }) {
  return (
    <Link 
      to={isLoggedIn ? `/perfil/${professional.slug}` : "#"}
      onClick={(e) => {
        if (!isLoggedIn) {
          e.preventDefault();
          onCardClick(professional.slug);
        }
      }}
      className="group flex flex-col h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-3 sm:p-4 transform hover:-translate-y-1 border border-gray-100 hover:border-[#B95221]/30"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50 mb-3 sm:mb-4">
        <img 
          src={professional.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(professional.name)}&background=F8F9FA&color=1E3D51&size=256`} 
          alt={`Foto de perfil de ${professional.name}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(professional.name)}&background=F8F9FA&color=1E3D51&size=256`;
          }}
        />
        {/*
        {professional.verified && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/90 backdrop-blur-sm px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm border border-gray-100">
            <CheckCircle2 size={12} className="text-[#B95221] sm:w-[16px] sm:h-[16px]" />
            <span className="text-[10px] sm:text-xs font-bold text-[#1E3D51] uppercase tracking-wider">Verificado</span>
          </div>
        )}
        */}
        {professional.reviews_count > 0 && (
           <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/95 backdrop-blur-sm px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg flex items-center gap-1 shadow-sm border border-gray-100">
            <Star size={12} className="fill-[#B95221] text-[#B95221] sm:w-[14px] sm:h-[14px]" />
            <span className="text-xs sm:text-sm font-bold text-gray-900">{professional.rating}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1">
        <h3 className="font-bold text-[#1E3D51] text-base sm:text-xl leading-tight line-clamp-1 pr-1 sm:pr-2">
          {professional.name}
        </h3>
        <p className="text-[#B95221] font-semibold text-xs sm:text-sm mb-3 line-clamp-2 leading-snug">
          {professional.title}
        </p>
      </div>
      
      <div className="mt-auto pt-2 w-full">
        <div className="w-full flex items-center justify-center border-2 border-[#32698F] text-[#32698F] group-hover:bg-[#32698F] group-hover:text-white font-bold py-1.5 sm:py-2 px-3 rounded-full transition-colors text-xs sm:text-sm">
          Contactar
        </div>
      </div>
    </Link>
  );
}
