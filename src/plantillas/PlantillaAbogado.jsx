// Archivo: src/plantillas/PlantillaAbogado.jsx
import React, { useEffect, useState } from 'react';
import { 
  LogOut, UserPlus, X, Share2, QrCode, Star, ArrowLeft, 
  Phone, MessageCircle, MapPin, Globe, Facebook, Instagram, Linkedin 
} from 'lucide-react';
import useAccionesPerfil from '../hooks/useAccionesPerfil';
import ReviewModal from '../components/ReviewModal';

export default function PlantillaAbogado({ profesional, volverAtras, onProtectedAction }) {
  const [loaded, setLoaded] = useState(false);

  // 🚀 Lógica de negocio centralizada
  const {
    mostrarQR, toggleQR, mostrarCalificacion, isLoggedIn, userName,
    handleShare, handleLinkClick, handleCalificarClick, handleCerrarPanelCalificacion, handleLogout,
    mostrarModalCalificando, setMostrarModalCalificando, calificacionPrevia, isSubmittingReview, handleSubmitReview
  } = useAccionesPerfil(profesional, onProtectedAction);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!profesional) return null;

  // 📱 Mapeo de redes sociales incluyendo el teléfono como un icono estándar
  const enlacesSociales = [
    { id: 'phone', icon: Phone, url: profesional.phone ? `tel:${profesional.phone.replace(/[^0-9]/g, '')}` : null, label: 'Llamar' },
    { id: 'whatsapp', icon: MessageCircle, url: profesional.whatsapp ? `https://wa.me/${profesional.whatsapp.replace(/[^0-9]/g, '')}` : null, label: 'WhatsApp' },
    { id: 'ubicacion', icon: MapPin, url: profesional.ubicacion_url, label: 'Ubicación' },
    { id: 'website', icon: Globe, url: profesional.website, label: 'Sitio Web' },
    { id: 'facebook', icon: Facebook, url: profesional.facebook, label: 'Facebook' },
    { id: 'instagram', icon: Instagram, url: profesional.instagram, label: 'Instagram' },
    { id: 'linkedin', icon: Linkedin, url: profesional.linkedin, label: 'LinkedIn' }
  ].filter(link => link.url);

  return (
    <div className={`min-h-[100dvh] flex flex-col relative overflow-hidden bg-[#121212] text-white transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap');
        .font-seasons { font-family: 'Playfair Display', 'Times New Roman', Times, serif; }
        .bg-pattern {
            background-image: radial-gradient(#E9CE3F 0.5px, transparent 0.5px);
            background-size: 24px 24px;
            opacity: 0.03;
        }
      `}</style>

      {/* Fondos y gradientes */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#E9CE3F]/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#C2A562]/5 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-pattern"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center w-full max-w-xl mx-auto px-6 py-8">
        
        {/* Barra Superior con Logout Pill */}
        <div className="w-full flex justify-between items-start mb-6">
          <button 
            onClick={volverAtras}
            className="w-11 h-11 rounded-full bg-[#1a1a1a] border border-[#E9CE3F]/20 flex items-center justify-center text-gray-300 hover:text-[#E9CE3F] transition-all shadow-md"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="flex flex-col items-end gap-3">
            {isLoggedIn ? (
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 bg-[#1a1a1a] border border-[#E9CE3F]/30 p-1 pr-3 rounded-full hover:border-red-400/50 transition-all shadow-lg group"
              >
                <div className="w-8 h-8 rounded-full bg-[#C2A562] flex items-center justify-center text-[#121212] font-bold text-sm">
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
                <LogOut size={16} className="text-gray-400 group-hover:text-red-400 transition-colors" />
              </button>
            ) : (
              <button 
                onClick={() => onProtectedAction(null)} 
                className="h-10 px-4 rounded-full bg-[#1a1a1a] border border-[#E9CE3F]/20 flex items-center justify-center text-[#E9CE3F] text-xs font-bold uppercase tracking-widest gap-2 shadow-md"
              >
                <UserPlus size={16} /> Ingresar
              </button>
            )}
            
            <div className="flex gap-3">
              <button onClick={toggleQR} className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#E9CE3F]/20 flex items-center justify-center text-gray-300 hover:text-[#E9CE3F] shadow-md">
                <QrCode size={16} />
              </button>
              <button onClick={() => handleShare(window.location.href)} className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#E9CE3F]/20 flex items-center justify-center text-gray-300 hover:text-[#E9CE3F] shadow-md">
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ⚖️ LOGO DE BALANZA RESTAURADO */}
        <div className="mb-4">
            <svg className="w-16 h-16 text-[#E9CE3F]" viewBox="0 0 100 100" fill="currentColor">
                <path d="M 30 88 L 70 88 L 73 94 L 27 94 Z" /><path d="M 35 82 L 65 82 L 68 88 L 32 88 Z" /><path d="M 42 76 L 58 76 L 61 82 L 39 82 Z" /><rect x="47" y="20" width="6" height="56" /><polygon points="50,8 43,20 57,20" /><rect x="15" y="22" width="70" height="3" rx="1.5" />
                <line x1="17" y1="24" x2="5" y2="55" stroke="currentColor" strokeWidth="1.5" /><line x1="17" y1="24" x2="17" y2="55" stroke="currentColor" strokeWidth="1.5" /><line x1="17" y1="24" x2="29" y2="55" stroke="currentColor" strokeWidth="1.5" /><path d="M 3 55 Q 17 68 31 55 Z" />
                <line x1="83" y1="24" x2="71" y2="55" stroke="currentColor" strokeWidth="1.5" /><line x1="83" y1="24" x2="83" y2="55" stroke="currentColor" strokeWidth="1.5" /><line x1="83" y1="24" x2="95" y2="55" stroke="currentColor" strokeWidth="1.5" /><path d="M 69 55 Q 83 68 97 55 Z" />
            </svg>
        </div>

        {/* Textos Principales sin cursiva */}
        <div className="text-center mb-10 w-full px-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 font-seasons tracking-wide">
            {profesional.name}
          </h1>
          <h2 className="text-sm md:text-base text-[#E9CE3F] uppercase tracking-[0.2em] font-medium mb-6 font-seasons">
            {profesional.title}
          </h2>
          {profesional.description && (
            <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-sm mx-auto font-seasons whitespace-pre-line px-2">
              {profesional.description}
            </p>
          )}
        </div>

        {/* Avatar */}
        <div className="relative w-36 h-36 mb-10">
          <div className="absolute inset-0 rounded-full border border-[#E9CE3F]/50 animate-[spin_10s_linear_infinite]"></div>
          {profesional.image ? (
            <img 
              src={profesional.image} 
              alt={profesional.name} 
              className="w-full h-full object-cover rounded-full p-3 bg-[#121212]"
              onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profesional.name)}&background=1a1a1a&color=E9CE3F&size=256`; }}
            />
          ) : (
            <div className="w-full h-full rounded-full p-3 bg-[#121212] flex items-center justify-center">
              <span className="text-4xl text-[#E9CE3F] font-seasons font-bold">{profesional.name?.[0]}</span>
            </div>
          )}
          {profesional.verified && (
            <div className="absolute bottom-2 right-2 bg-[#E9CE3F] text-[#121212] p-1.5 rounded-full shadow-lg">
              <Star size={14} className="fill-current" />
            </div>
          )}
        </div>

        {/* Contacto Digital */}
        <div className="w-full max-w-sm">
          <h3 className="text-center text-xs text-gray-500 uppercase tracking-[0.3em] mb-8 font-semibold flex items-center gap-4 before:content-[''] before:flex-1 before:h-px before:bg-gray-800 after:content-[''] after:flex-1 after:h-px after:bg-gray-800">
            Contacto Digital
          </h3>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-8">
            {enlacesSociales.map((link) => {
              const Icono = link.icon;
              return (
                <button 
                  key={link.id}
                  onClick={(e) => handleLinkClick(e, link.label, link.url)} 
                  className="flex flex-col items-center gap-3 group w-[80px]"
                >
                  <div className="w-14 h-14 rounded-2xl border border-[#E9CE3F]/20 flex items-center justify-center bg-[#1a1a1a] shadow-lg group-hover:bg-[#E9CE3F]/10 group-hover:border-[#E9CE3F]/50 transition-all duration-300">
                    <Icono className="text-[#E9CE3F] w-6 h-6 group-hover:scale-110" />
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-[#E9CE3F] font-seasons tracking-wide">
                    {link.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal QR */}
      {mostrarQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md" onClick={toggleQR}>
          <div className="relative bg-[#1a1a1a] border border-[#E9CE3F]/30 p-8 rounded-3xl flex flex-col items-center z-10 shadow-2xl font-seasons" onClick={(e) => e.stopPropagation()}>
            <button onClick={toggleQR} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-[#222] rounded-full transition-colors">
              <X size={18} />
            </button>
            <p className="text-[#E9CE3F] text-xs uppercase tracking-[0.2em] mb-6 font-bold">Código QR</p>
            <div className="bg-white p-4 rounded-2xl border border-gray-200">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.href)}&color=121212&bgcolor=FFFFFF`} 
                alt="Código QR" 
                className="w-48 h-48 md:w-52 md:h-52 object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Panel de Calificación */}
      {mostrarCalificacion && isLoggedIn && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#1a1a1a]/95 backdrop-blur-md border-t border-[#E9CE3F]/20 z-50">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-bold text-[#E9CE3F] font-seasons">¿Qué te pareció mi perfil?</p>
            </div>
            <button
              onClick={handleCalificarClick}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#C2A562] to-[#E9CE3F] text-[#121212] font-bold text-sm shadow-md font-seasons"
            >
              <Star size={16} className="fill-[#121212]" /> Evaluar
            </button>
            <button
              onClick={handleCerrarPanelCalificacion}
              className="p-2 text-gray-500 hover:text-red-400 bg-[#222] rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <footer className="w-full text-center pb-6 mt-4">
          <a href="https://spingamma.github.io/spingamma-landing/" target="_blank" rel="noopener noreferrer" className="text-[0.55rem] tracking-[0.25em] font-medium uppercase text-gray-600 hover:text-[#E9CE3F] transition-colors">
              Tecnología desarrollada por SPINGAMMA
          </a>
      </footer>

      {/* Modal de Calificación */}
      <ReviewModal 
        isOpen={mostrarModalCalificando}
        onClose={() => setMostrarModalCalificando(false)}
        onSubmit={handleSubmitReview}
        isSubmitting={isSubmittingReview}
        calificacionPrevia={calificacionPrevia}
        profesionalName={profesional.name}
      />
    </div>
  );
}