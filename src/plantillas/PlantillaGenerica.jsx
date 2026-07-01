// Archivo: src/plantillas/PlantillaGenerica.jsx
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Share2, QrCode, MapPin, Phone, MessageCircle, 
  Facebook, Instagram, Linkedin, Globe, Github, X, CheckCircle2, Star, LogOut, DoorOpen, Bookmark, ShoppingBag, Download
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

import useAccionesPerfil from '../hooks/useAccionesPerfil';
import ReviewModal from '../components/ReviewModal';
import ModalVerificacion from '../components/ModalVerificacion';
import InlineCatalogCarousel from '../components/InlineCatalogCarousel';
import { cleanWhatsappNumber } from '../utils/phone';

export default function PlantillaGenerica({ profesional, volverAtras, onProtectedAction }) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const isLongDescription = profesional?.description?.length > 70;
  
  // 🚀 EXTRAÍDO AL HOOK: Lógica centralizada
  const {
    mostrarQR, toggleQR, handleDownloadQR, mostrarCalificacion, isLoggedIn, userName, handleLogout,
    handleShare, handleLinkClick, handleCalificarClick, handleCerrarPanelCalificacion,
    mostrarModalCalificando, setMostrarModalCalificando, calificacionPrevia, isSubmittingReview, handleSubmitReview,
    mostrarModalVerificacion, setMostrarModalVerificacion,
    isSaved, isSaving, toggleSaveCard
  } = useAccionesPerfil(profesional, onProtectedAction);

  // 🧹 LIMPIEZA Y FORMATEO DE ENLACES
  // Parsear whatsapp_numbers (JSON array) con fallback al campo viejo
  let waNumbers = [];
  try { waNumbers = JSON.parse(profesional?.whatsapp_numbers || '[]'); } catch { waNumbers = []; }
  if (waNumbers.length === 0 && profesional?.whatsapp) waNumbers = [profesional.whatsapp];
  const cleanPhone = profesional?.phone?.replace(/[^0-9]/g, '');
  
  const links = {
    phone: cleanPhone ? `tel:${cleanPhone}` : null,
    facebook: profesional?.facebook,
    instagram: profesional?.instagram,
    linkedin: profesional?.linkedin,
    website: profesional?.website,
    github: profesional?.github,
    tiktok: profesional?.tiktok,
    ubicacion: profesional?.ubicacion_url
  };

  const TiktokIcon = ({ size, className }) => (
    <svg width={size} height={size} className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );

  const SocialButton = ({ icon: Icon, label, url, colorClass }) => {
    if (!url) return null;

    return (
      <button 
        onClick={(e) => handleLinkClick(e, label, url)}
        aria-label={`Ir a ${label}`}
        title={label}
        className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm hover:text-white transition-all active:scale-95 border border-gray-100 group ${colorClass}`}
      >
        <Icon size={24} className="transition-transform group-hover:scale-110" />
      </button>
    );
  };

  const WhatsappIcon = ({ className, size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
    </svg>
  );

  if (!profesional) return null;

  const ubicacionTexto = [profesional.neighborhood, profesional.state, profesional.country]
    .filter(val => Boolean(val) && val.toUpperCase() !== 'NA' && val.toUpperCase() !== 'N/A')
    .join(', ');

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A535C] pb-24 font-sans antialiased selection:bg-[#F9842C] selection:text-white relative">
      
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
                src={profesional.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profesional.name)}&background=F8F9FA&color=1E3D51&size=512`} 
                onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profesional.name)}&background=F8F9FA&color=1E3D51&size=512`; }}
                alt={`Foto de perfil de ${profesional.name}`} 
                className="w-full h-full object-cover"
              />
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
              {/*
              {profesional.verified && (
                <div className="bg-teal-500 text-white p-1.5 rounded-lg border-2 border-white shadow-lg flex items-center justify-center z-30">
                  <CheckCircle2 size={20} className="text-white" />
                </div>
              )}
              */}
            </div>
          </div>

          {/* TITULO, PROFESION Y UBICACION */}
          <div className="flex justify-between items-start px-6 sm:px-8 md:px-6 lg:px-8 max-w-4xl mx-auto w-full gap-4">
            <div className="text-left flex-1">
              <h1 className="text-3xl font-extrabold text-[#1A535C] leading-tight mb-1">{profesional.name}</h1>
              <p className="text-[#F9842C] text-sm font-bold uppercase tracking-widest">{profesional.title}</p>
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

      {/* 🧑‍💼 INFO PRINCIPAL DEL PERFIL */}
      <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-6 lg:px-8 relative z-20">

        {/* 📦 CATÁLOGO INLINE (CARRUSEL) */}
        <div className="-mx-4 sm:mx-0 mb-2">
          <InlineCatalogCarousel 
            slug={profesional.slug} 
            catalogUrl={profesional.catalog_url}
            whatsappNumber={waNumbers[0] || null}
            businessName={profesional.name}
            country={profesional.country || 'Bolivia'}
            theme="light"
          />
        </div>



        {/* 📝 ACERCA DE */}
        {(profesional.experience_years || profesional.credentials || profesional.description) && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-[#1A535C] mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#6A431F] rounded-full"></span> Acerca de mí
            </h3>
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm">
            
            {/* E-E-A-T Datos Estructurados */}
            {(profesional.experience_years || profesional.credentials) && (
              <div className="flex flex-wrap gap-3 mb-4">
                {profesional.experience_years && (
                  <div className="flex items-center gap-1.5 bg-[#1A535C]/5 text-[#1A535C] px-3 py-1.5 rounded-lg text-sm font-medium border border-[#1A535C]/20">
                    <span className="font-bold">{profesional.experience_years}</span> Años de Experiencia
                  </div>
                )}
                {profesional.credentials && (
                  <div className="flex items-center gap-1.5 bg-[#1A535C]/5 text-[#1A535C] px-3 py-1.5 rounded-lg text-sm font-medium border border-[#1A535C]/20">
                    Matrícula/Credencial: <span className="font-bold">{profesional.credentials}</span>
                  </div>
                )}
              </div>
            )}

            {/* 🚀 WHITESPACE-PRE-LINE para respetar saltos de línea de la BD */}
            {profesional.description && (
              <div className="relative">
                <p className={`text-[#757778] leading-relaxed whitespace-pre-line text-sm sm:text-base ${!isDescriptionExpanded ? 'line-clamp-2' : ''}`}>
                  {profesional.description}
                </p>
                {isLongDescription && (
                  <button 
                    data-testid="button-ver-mas"
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="text-[#F9842C] hover:text-[#e0701b] font-medium text-sm mt-1 focus:outline-none"
                  >
                    {isDescriptionExpanded ? 'Ver menos' : 'Ver más'}
                  </button>
                )}
              </div>
            )}
            </div>
          </div>
        )}

        {/* 📱 WHATSAPP Y LLAMADAS */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-[#1A535C] flex items-center gap-2 mb-4">
            <span className="w-1.5 h-6 bg-[#6A431F] rounded-full"></span> Contáctanos
          </h3>
          <div className="flex flex-wrap gap-4">
            {waNumbers.map((num, idx) => {
              const clean = cleanWhatsappNumber(num, profesional?.country || 'Bolivia');
              if (!clean) return null;
              return (
                <button 
                  data-testid={`button-whatsapp-${idx}`}
                  key={`wa-${idx}`}
                  onClick={(e) => handleLinkClick(e, `WhatsApp ${idx + 1}`, `https://wa.me/${clean}`)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white text-[#1A535C] font-bold flex items-center justify-center shadow-sm hover:bg-[#25D366] hover:text-white border border-gray-200 hover:border-[#25D366] hover:shadow-lg active:scale-[0.98] transition-all group relative"
                  title={`WhatsApp ${idx + 1}`}
                >
                  <WhatsappIcon size={32} className="text-[#25D366] group-hover:text-white transition-colors" />
                  {waNumbers.length > 1 && (
                    <span className="absolute -bottom-2 -right-2 bg-[#25D366] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 border-white shadow-sm">{idx + 1}</span>
                  )}
                </button>
              );
            })}
            
            {links.phone && (
              <button 
                data-testid="button-phone"
                onClick={(e) => handleLinkClick(e, 'Llamar', links.phone)}
                className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-2xl bg-white text-[#1A535C] font-bold hover:bg-[#1A535C] hover:text-white transition-colors border border-gray-200 hover:border-[#1A535C] hover:shadow-lg shadow-sm group"
                title="Llamar"
              >
                <Phone size={32} className="text-[#1A535C] group-hover:text-white transition-colors" />
              </button>
            )}
          </div>
        </div>

        {/* 📱 REDES DE CONTACTO */}
        {(links.website || links.facebook || links.instagram || links.linkedin || links.tiktok || links.github) && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4 gap-4">
            <h3 className="text-lg font-bold text-[#1A535C] flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#6A431F] rounded-full"></span> Redes Sociales
            </h3>
          </div>
          <div className="flex flex-wrap justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-200/60 gap-2">
            <SocialButton icon={Globe} label="Sitio Web" url={links.website} colorClass="text-purple-500 hover:bg-purple-500" />
            <SocialButton icon={Facebook} label="Facebook" url={links.facebook} colorClass="text-blue-600 hover:bg-blue-600" />
            <SocialButton icon={Instagram} label="Instagram" url={links.instagram} colorClass="text-pink-600 hover:bg-pink-600" />
            <SocialButton icon={Linkedin} label="LinkedIn" url={links.linkedin} colorClass="text-sky-600 hover:bg-sky-600" />
            <SocialButton icon={TiktokIcon} label="TikTok" url={links.tiktok} colorClass="text-black hover:bg-black" />
            <SocialButton icon={Github} label="GitHub" url={links.github} colorClass="text-[#757778] hover:bg-gray-700" />
          </div>
        </div>
        )}



        {/* ==========================================
            BOTÓN CALIFICAR EN LA PARTE INFERIOR
            ========================================== */}
        <div className="mt-8 flex justify-center w-full z-10 relative px-4">
          <button
              onClick={handleCalificarClick}
              className="px-8 py-4 rounded-xl bg-[#F9842C] hover:bg-[#e07323] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 w-full max-w-sm border border-gray-200"
          >
              <Star size={18} className="fill-white text-white" /> Danos tu opinión
          </button>
        </div>

        {/* 🚀 FOOTER SPINGAMMA */}
        <div className="mt-12 mb-8 text-center flex flex-col items-center justify-center">
            <a 
              href="https://spingamma.github.io/spingamma-landing/" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Ir a la página de SpinGamma"
              className="group flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
            >
              <span className="text-xs text-[#757778] font-medium">Tecnología desarrollada por</span>
              <span className="text-sm font-extrabold text-[#1A535C] tracking-wider group-hover:text-[#F9842C] transition-colors">SPINGAMMA</span>
            </a>
        </div>

      </div>

      {/* ==========================================
          MODAL DE CÓDIGO QR
          ========================================== */}
      {mostrarQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A535C]/50 backdrop-blur-sm transition-opacity" onClick={toggleQR}>
          <div className="bg-white border border-gray-200 rounded-3xl shadow-2xl max-w-sm w-full p-8 relative animate-in zoom-in duration-300 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={toggleQR}
              aria-label="Cerrar modal de código QR"
              className="absolute top-4 right-4 text-gray-400 hover:text-[#1A535C] transition-colors p-2 bg-gray-100 rounded-full hover:bg-gray-200"
            >
              <X size={20} />
            </button>
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-4">
              <QrCode size={24} className="text-[#F9842C]" />
            </div>
            <h3 className="text-xl font-bold text-[#1A535C] mb-1 text-center">Compartir Perfil</h3>
            <p className="text-[#757778] text-sm mb-6 text-center">Escanea este código para ver mi tarjeta digital en cualquier dispositivo.</p>
            
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex justify-center items-center">
              <QRCodeCanvas 
                id="qr-canvas"
                value={window.location.href}
                size={1024}
                className="w-48 h-48"
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
            
            <div className="mt-8 w-full flex flex-col gap-3">
              <button 
                onClick={() => handleDownloadQR('1D565F')}
                aria-label="Descargar código QR"
                className="w-full bg-[#1A535C] hover:bg-[#2A5A6E] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Download size={18} /> Descargar QR
              </button>
              <button 
                onClick={handleShare}
                aria-label="Compartir enlace de perfil"
                className="w-full bg-[#F9842C] hover:bg-[#e06516] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Share2 size={18} /> Enviar enlace
              </button>
          </div>
        </div>
      </div>
      )}


      {/* ==========================================
          MODAL DE CALIFICACIÓN (NUEVO)
          ========================================== */}
      <ReviewModal 
        isOpen={mostrarModalCalificando}
        onClose={() => setMostrarModalCalificando(false)}
        onSubmit={handleSubmitReview}
        isSubmitting={isSubmittingReview}
        calificacionPrevia={calificacionPrevia}
        profesionalName={profesional.name}
      />

      {/* ==========================================
          MODAL DE VERIFICACIÓN (NUEVO)
          ========================================== */}
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