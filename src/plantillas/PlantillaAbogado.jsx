// Archivo: src/plantillas/PlantillaAbogado.jsx
import React, { useEffect, useState } from 'react';
import { 
  LogOut, DoorOpen, X, Share2, QrCode, Star, ArrowLeft, 
  Phone, MessageCircle, MapPin, Globe, Facebook, Instagram, Linkedin, Bookmark, ShoppingBag, Download
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import useAccionesPerfil from '../hooks/useAccionesPerfil';
import ReviewModal from '../components/ReviewModal';
import ModalVerificacion from '../components/ModalVerificacion';
import InlineCatalogCarousel from '../components/InlineCatalogCarousel';
import { cleanWhatsappNumber } from '../utils/phone';

export default function PlantillaAbogado({ profesional, volverAtras, onProtectedAction }) {
  const [loaded, setLoaded] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const isLongDescription = profesional?.description?.length > 150;

  // 🚀 Lógica de negocio centralizada
  const {
    mostrarQR, toggleQR, handleDownloadQR, mostrarCalificacion, isLoggedIn, userName,
    handleShare, handleLinkClick, handleCalificarClick, handleCerrarPanelCalificacion, handleLogout,
    mostrarModalCalificando, setMostrarModalCalificando, calificacionPrevia, isSubmittingReview, handleSubmitReview,
    mostrarModalVerificacion, setMostrarModalVerificacion,
    isSaved, isSaving, toggleSaveCard
  } = useAccionesPerfil(profesional, onProtectedAction);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!profesional) return null;

  const TiktokIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );

  const WhatsappIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
    </svg>
  );

  // Parsear whatsapp_numbers (JSON array) con fallback al campo viejo
  let waNumbers = [];
  try { waNumbers = JSON.parse(profesional?.whatsapp_numbers || '[]'); } catch { waNumbers = []; }
  if (waNumbers.length === 0 && profesional?.whatsapp) waNumbers = [profesional.whatsapp];

  // 📱 Mapeo de redes sociales incluyendo el teléfono como un icono estándar
  const enlacesSociales = [
    { id: 'phone', icon: Phone, url: profesional.phone ? `tel:${profesional.phone.replace(/[^0-9]/g, '')}` : null, label: 'Llamar' },
    ...waNumbers.map((num, idx) => {
      const clean = cleanWhatsappNumber(num, profesional?.country || 'Bolivia');
      return { id: `whatsapp-${idx}`, icon: WhatsappIcon, url: clean ? `https://wa.me/${clean}` : null, label: waNumbers.length > 1 ? `WhatsApp ${idx + 1}` : 'WhatsApp' };
    }),
    { id: 'ubicacion', icon: MapPin, url: profesional.ubicacion_url, label: 'Ubicación' },
    { id: 'website', icon: Globe, url: profesional.website, label: 'Sitio Web' },
    { id: 'facebook', icon: Facebook, url: profesional.facebook, label: 'Facebook' },
    { id: 'instagram', icon: Instagram, url: profesional.instagram, label: 'Instagram' },
    { id: 'tiktok', icon: TiktokIcon, url: profesional.tiktok, label: 'TikTok' },
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
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#E9CE3F]/20 text-gray-300 hover:text-[#6A431F] transition-all shadow-md font-medium text-sm"
          >
            <DoorOpen size={18} />
            <span>Salir del negocio</span>
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
                <DoorOpen size={16} /> Ingresar
              </button>
            )}
            
            <div className="flex gap-3">
              <button onClick={toggleQR} className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#E9CE3F]/20 flex items-center justify-center text-gray-300 hover:text-[#6A431F] shadow-md">
                <QrCode size={16} />
              </button>
              <button onClick={() => handleShare(window.location.href)} className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#E9CE3F]/20 flex items-center justify-center text-gray-300 hover:text-[#6A431F] shadow-md">
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
          
          {(profesional.experience_years || profesional.credentials) && (
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {profesional.experience_years && (
                <div className="bg-[#1a1a1a] border border-[#F9842C]/30 text-gray-300 px-3 py-1.5 rounded-full text-xs font-seasons flex items-center gap-1.5 shadow-sm">
                  <Star size={12} className="text-[#F9842C]" /> {profesional.experience_years} Años de Experiencia
                </div>
              )}
              {profesional.credentials && (
                <div className="bg-[#1a1a1a] border border-[#E9CE3F]/30 text-gray-300 px-3 py-1.5 rounded-full text-xs font-seasons flex items-center gap-1.5 shadow-sm">
                  <Bookmark size={12} className="text-[#E9CE3F]" /> Matrícula/Credencial: {profesional.credentials}
                </div>
              )}
            </div>
          )}

          {profesional.description && (
            <div className="relative">
              <p className={`text-gray-400 text-sm md:text-base leading-relaxed max-w-sm mx-auto font-seasons whitespace-pre-line px-2 ${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
                {profesional.description}
              </p>
              {isLongDescription && (
                <button 
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-[#E9CE3F] hover:text-white font-seasons font-medium text-sm mt-2 focus:outline-none"
                >
                  {isDescriptionExpanded ? 'Ver menos' : 'Ver más'}
                </button>
              )}
            </div>
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
          {/* BOTÓN GUARDAR (Top Right de la imagen) */}
          <button 
            onClick={toggleSaveCard}
            disabled={isSaving}
            className={`absolute top-0 -right-2 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-sm z-30 ${isSaved ? 'bg-[#6A431F] text-white border-transparent' : 'bg-[#1a1a1a] text-gray-300 border border-[#E9CE3F]/50 hover:text-[#6A431F] hover:bg-[#222]'}`}
            title={isSaved ? "Quitar del tarjetero" : "Guardar en mi tarjetero"}
          >
            <Bookmark size={18} className={isSaved ? 'fill-white' : ''} />
          </button>
          {/*
          {profesional.verified && (
            <div className="absolute bottom-2 right-2 bg-[#E9CE3F] text-[#121212] p-1.5 rounded-full shadow-lg">
              <Star size={14} className="fill-current" />
            </div>
          )}
          */}
        </div>

        {/* Contacto Digital */}
        <div className="w-full max-w-sm">
          <h3 className="text-center text-xs text-[#757778] uppercase tracking-[0.3em] mb-8 font-semibold flex items-center gap-4 before:content-[''] before:flex-1 before:h-px before:bg-gray-800 after:content-[''] after:flex-1 after:h-px after:bg-gray-800">
            Contacto Digital
          </h3>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-8">
            {enlacesSociales.map((link) => {
              const Icono = link.icon;
              return (
                <button 
                  data-testid={`link-${link.id}`}
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

        {/* 📦 CATÁLOGO INLINE (CARRUSEL) */}
        <InlineCatalogCarousel 
          slug={profesional.slug} 
          catalogUrl={profesional.catalog_url}
          whatsappNumber={waNumbers[0] || null}
          businessName={profesional.name}
          country={profesional.country || 'Bolivia'}
          theme="dark"
        />
        {/* Botón Calificar */}
        <div className="mt-8 flex justify-center w-full z-10 relative">
          <button
              data-testid="button-calificar"
              onClick={handleCalificarClick}
              className="px-8 py-3.5 rounded-full bg-[#F9842C] hover:bg-[#e07323] text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 w-full max-w-xs font-seasons"
          >
              <Star size={18} className="fill-white text-white" /> Danos tu opinión
          </button>
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
            <div className="bg-white p-4 rounded-2xl border border-gray-200 flex justify-center items-center">
              <QRCodeCanvas 
                id="qr-canvas"
                value={window.location.href}
                size={1024}
                className="w-48 h-48 md:w-52 md:h-52"
                style={{ width: "100%", height: "100%" }}
                bgColor={"#ffffff"}
                fgColor={"#1D565F"}
                level={"H"}
                includeMargin={true}
                imageSettings={{
                  src: "/paw.png",
                  height: 256,
                  width: 256,
                  excavate: true,
                }}
              />
            </div>

            <button 
              data-testid="button-descargar-qr"
              onClick={() => handleDownloadQR('1D565F', 'FFFFFF')}
              aria-label="Descargar código QR"
              className="mt-8 w-full bg-[#E9CE3F] hover:bg-[#FFF3A3] text-[#1a1a1a] font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Download size={18} /> Descargar QR
            </button>
          </div>
        </div>
      )}

      <footer className="w-full text-center pb-6 mt-4">
          <a href="https://spingamma.github.io/spingamma-landing/" target="_blank" rel="noopener noreferrer" className="text-[10px] tracking-[0.25em] font-medium uppercase text-[#757778] hover:text-[#E9CE3F] transition-colors">
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

      <ModalVerificacion 
        isOpen={mostrarModalVerificacion}
        onClose={() => setMostrarModalVerificacion(false)}
        onSuccess={() => {
          setMostrarModalVerificacion(false);
          setMostrarModalCalificando(true);
        }}
        userName={userName}
      />
    </div>
  );
}