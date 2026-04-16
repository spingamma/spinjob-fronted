// Archivo: src/plantillas/PlantillaInmobiliaria.jsx
import React, { useEffect, useState } from 'react';
import { LogOut, UserPlus, X, Share2, QrCode, Star, Bookmark } from 'lucide-react';
import useAccionesPerfil from '../hooks/useAccionesPerfil';
import ReviewModal from '../components/ReviewModal';

export default function PlantillaInmobiliaria({ profesional, volverAtras, onProtectedAction }) {
  const [loaded, setLoaded] = useState(false);

  // 🚀 EXTRAÍDO AL HOOK: Lógica de UI limpia y enfocada en diseño
  const {
    mostrarQR, toggleQR, mostrarCalificacion, isLoggedIn, userName,
    handleShare, handleLinkClick, handleCalificarClick, handleCerrarPanelCalificacion, handleLogout,
    mostrarModalCalificando, setMostrarModalCalificando, calificacionPrevia, isSubmittingReview, handleSubmitReview,
    isSaved, isSaving, toggleSaveCard
  } = useAccionesPerfil(profesional, onProtectedAction);

  // Simulador del Loader
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!profesional) return null;

  return (
    <div className="h-screen w-full flex items-center justify-center p-3 sm:p-4 relative overflow-hidden bg-[#11181A] font-sans text-white">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .ambient-bg { background: radial-gradient(circle at 50% 50%, #1A2629 0%, #11181A 100%); }
        .glass-panel-dark {
          background: linear-gradient(145deg, rgba(66, 92, 99, 0.25) 0%, rgba(17, 24, 26, 0.6) 100%);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
        }
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes blobAnim {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(20px, -30px) scale(1.1); }
          100% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob-custom { animation: blobAnim 10s infinite alternate; }
        @keyframes spinRing {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinner-ring-custom {
           border: 2px solid rgba(66, 92, 99, 0.3); border-top: 2px solid #C8A721; border-right: 2px solid #425C63;
           animation: spinRing 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        }
      `}</style>

      {/* --- FONDO ANIMADO --- */}
      <div className="fixed inset-0 z-0 ambient-bg overflow-hidden">
        <div className="absolute top-[-15%] left-[-15%] w-[500px] h-[500px] bg-[#425C63] rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-blob-custom"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#C8A721] rounded-full mix-blend-screen filter blur-[150px] opacity-15 animate-blob-custom" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] bg-[#425C63] rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob-custom" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* --- LOADER --- */}
      {!loaded && (
        <div className="fixed inset-0 bg-[#11181A] flex flex-col items-center justify-center z-[1000]">
          <div className="relative flex justify-center items-center mb-6">
            <div className="w-[60px] h-[60px] rounded-full spinner-ring-custom absolute"></div>
            <div className="w-8 h-8 bg-[#425C63]/20 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-2 h-2 bg-[#C8A721] rounded-full"></div>
            </div>
          </div>
          <p className="text-[#C8A721] text-[0.65rem] tracking-[0.4em] uppercase font-semibold">Cargando</p>
        </div>
      )}

      {/* --- TARJETA PRINCIPAL --- */}
      <div className={`relative z-10 w-full max-w-[420px] h-[95vh] sm:h-full max-h-[850px] glass-panel-dark rounded-[2.5rem] pt-6 p-6 sm:p-8 flex flex-col items-center overflow-y-auto hide-scroll font-montserrat transition-all duration-1000 pb-28 ${loaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
        
        {/* ENCABEZADO SUPERIOR */}
        <div className="w-full flex justify-between items-start z-20 mb-2">
          <button onClick={volverAtras} className="text-sm flex items-center gap-2 text-gray-300 hover:text-white transition-colors p-2 shrink-0">
            ← <span className="hidden sm:inline">Volver</span><span className="sm:hidden">Volver</span>
          </button>

          <div className="flex flex-col items-end gap-3">
             {/* 🚀 BOTÓN LOGOUT TIPO PILL EN LA ESQUINA SUPERIOR */}
            {isLoggedIn ? (
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/5 border border-white/10 p-1 pr-3 rounded-full hover:border-red-400/50 transition-all shadow-lg backdrop-blur-sm group"
                title="Cerrar sesión"
              >
                <div className="w-8 h-8 rounded-full bg-[#C8A721] flex items-center justify-center text-[#11181A] font-bold text-sm font-sans">
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
                <LogOut size={16} className="text-gray-300 group-hover:text-red-400 transition-colors" />
              </button>
            ) : (
              <button onClick={() => onProtectedAction(null)} className="text-[0.65rem] uppercase tracking-wider font-bold flex items-center gap-1.5 bg-[#425C63] hover:bg-[#C8A721] hover:text-[#11181A] text-white py-2 px-3.5 rounded-full transition-all shadow-md">
                <UserPlus size={14} /> Ingresar
              </button>
            )}

            {/* 🚀 BOTONES DE ACCIÓN: GUARDAR, QR Y COMPARTIR */}
            <div className="flex gap-2.5">
              <button 
                onClick={toggleSaveCard}
                disabled={isSaving}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all backdrop-blur-sm shadow-md ${isSaved ? 'bg-[#C8A721] text-[#11181A] border-transparent' : 'bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-[#425C63]'} ${isSaving ? 'opacity-70' : ''}`}
                title={isSaved ? "Quitar del tarjetero" : "Guardar en mi tarjetero"}
              >
                <Bookmark size={18} className={isSaved ? 'fill-[#11181A]' : ''} />
              </button>
              <button onClick={toggleQR} className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 hover:bg-[#425C63] rounded-full transition-all text-gray-300 hover:text-white backdrop-blur-sm shadow-md" title="Mostrar QR">
                <QrCode size={18} />
              </button>
              <button onClick={handleShare} className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 hover:bg-[#425C63] rounded-full transition-all text-gray-300 hover:text-white backdrop-blur-sm shadow-md" title="Compartir">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* CONTENEDOR FOTO */}
        <div className="relative w-full flex flex-col items-center">
          <div className="relative flex-shrink-0 mt-6 mb-6">
            <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full p-[2px] bg-gradient-to-br from-[#425C63] via-[#C8A721]/50 to-[#425C63] flex items-center justify-center shadow-[0_0_30px_rgba(66,92,99,0.5)]">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#11181A] border-[4px] border-[#1A2629]">
                <img 
                  src={profesional.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profesional.name)}&background=11181A&color=C8A721&size=256`} 
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profesional.name)}&background=11181A&color=C8A721&size=256`; }}
                  alt={profesional.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* TEXTOS */}
        <div className="text-center w-full mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-md">{profesional.name}</h1>
          <p className="text-[0.7rem] font-bold tracking-[0.25em] text-[#C8A721] mt-3 uppercase">{profesional.title}</p>
          <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-[#425C63] to-transparent mx-auto mt-4 mb-4 opacity-70"></div>
          <p className="text-gray-300 text-[0.85rem] mt-3 leading-relaxed whitespace-pre-line px-2 font-light">{profesional.description}</p>
        </div>

        {/* BOTONES REDES */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 w-full mt-2">
            {profesional.phone && (
              <a href={`tel:${profesional.phone}`} onClick={(e) => handleLinkClick(e, 'Llamar', `tel:${profesional.phone}`)} className="group flex flex-col items-center justify-center w-[30%] min-w-[90px] aspect-square bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-[#425C63] rounded-2xl transition-all shadow-lg hover:-translate-y-1">
                  <div className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 group-hover:bg-[#425C63] text-gray-200 group-hover:text-white transition-all mb-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  </div>
                  <span className="font-semibold text-[0.6rem] text-gray-300 group-hover:text-white uppercase tracking-wider">Llamar</span>
              </a>
            )}

            {profesional.whatsapp && (
              <a href={`https://wa.me/${profesional.whatsapp.replace(/[^0-9]/g, '')}`} onClick={(e) => handleLinkClick(e, 'WhatsApp', `https://wa.me/${profesional.whatsapp.replace(/[^0-9]/g, '')}`)} className="group flex flex-col items-center justify-center w-[30%] min-w-[90px] aspect-square bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-[#25D366] rounded-2xl transition-all shadow-lg hover:-translate-y-1">
                  <div className="w-11 h-11 flex items-center justify-center rounded-full bg-[#25D366]/20 group-hover:bg-[#25D366] text-[#25D366] group-hover:text-white transition-all mb-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.39 0 .004 5.385.004 12.025c0 2.126.552 4.195 1.6 6.01L.067 23.99l6.103-1.601c1.748.951 3.733 1.453 5.86 1.453 6.638 0 12.025-5.385 12.025-12.025S18.669 0 12.031 0zm0 19.957c-1.793 0-3.548-.482-5.088-1.395l-.364-.216-3.778.991.999-3.684-.236-.376c-1.002-1.597-1.531-3.444-1.531-5.341 0-5.548 4.515-10.063 10.063-10.063 5.547 0 10.062 4.515 10.062 10.063 0 5.548-4.515 10.063-10.062 10.063z"/></svg>
                  </div>
                  <span className="font-semibold text-[0.6rem] text-gray-300 group-hover:text-white uppercase tracking-wider">WhatsApp</span>
              </a>
            )}

            {profesional.website && (
              <a href={profesional.website} onClick={(e) => handleLinkClick(e, 'Website', profesional.website)} className="group flex flex-col items-center justify-center w-[30%] min-w-[90px] aspect-square bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-[#425C63] rounded-2xl transition-all shadow-lg hover:-translate-y-1">
                  <div className="w-11 h-11 flex items-center justify-center rounded-full bg-[#425C63]/20 group-hover:bg-[#425C63] text-[#425C63] group-hover:text-white transition-all mb-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="2" x2="22" y1="12" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                  </div>
                  <span className="font-semibold text-[0.6rem] text-gray-300 group-hover:text-white uppercase tracking-wider">Web</span>
              </a>
            )}

            {profesional.facebook && (
              <a href={profesional.facebook} onClick={(e) => handleLinkClick(e, 'Facebook', profesional.facebook)} className="group flex flex-col items-center justify-center w-[30%] min-w-[90px] aspect-square bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-[#1877F2] rounded-2xl transition-all shadow-lg hover:-translate-y-1">
                  <div className="w-11 h-11 flex items-center justify-center rounded-full bg-[#1877F2]/20 group-hover:bg-[#1877F2] text-[#1877F2] group-hover:text-white transition-all mb-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </div>
                  <span className="font-semibold text-[0.6rem] text-gray-300 group-hover:text-white uppercase tracking-wider">Facebook</span>
              </a>
            )}

            {profesional.instagram && (
              <a href={profesional.instagram} onClick={(e) => handleLinkClick(e, 'Instagram', profesional.instagram)} className="group flex flex-col items-center justify-center w-[30%] min-w-[90px] aspect-square bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-[#E1306C] rounded-2xl transition-all shadow-lg hover:-translate-y-1">
                  <div className="w-11 h-11 flex items-center justify-center rounded-full bg-[#E1306C]/20 group-hover:bg-[#E1306C] text-[#E1306C] group-hover:text-white transition-all mb-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><rect width="16" height="16" x="4" y="4" rx="4"></rect><circle cx="12" cy="12" r="3"></circle><line x1="16.5" x2="16.5" y1="7.5" y2="7.5"></line></svg>
                  </div>
                  <span className="font-semibold text-[0.6rem] text-gray-300 group-hover:text-white uppercase tracking-wider">Instagram</span>
              </a>
            )}

            {profesional.tiktok && (
              <a href={profesional.tiktok} onClick={(e) => handleLinkClick(e, 'TikTok', profesional.tiktok)} className="group flex flex-col items-center justify-center w-[30%] min-w-[90px] aspect-square bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white rounded-2xl transition-all shadow-lg hover:-translate-y-1">
                  <div className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 group-hover:bg-white text-gray-300 group-hover:text-[#11181A] transition-all mb-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                  </div>
                  <span className="font-semibold text-[0.6rem] text-gray-300 group-hover:text-white uppercase tracking-wider">TikTok</span>
              </a>
            )}

            {profesional.linkedin && (
              <a href={profesional.linkedin} onClick={(e) => handleLinkClick(e, 'LinkedIn', profesional.linkedin)} className="group flex flex-col items-center justify-center w-[30%] min-w-[90px] aspect-square bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-[#0A66C2] rounded-2xl transition-all shadow-lg hover:-translate-y-1">
                  <div className="w-11 h-11 flex items-center justify-center rounded-full bg-[#0A66C2]/20 group-hover:bg-[#0A66C2] text-[#0A66C2] group-hover:text-white transition-all mb-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  </div>
                  <span className="font-semibold text-[0.6rem] text-gray-300 group-hover:text-white uppercase tracking-wider">LinkedIn</span>
              </a>
            )}

            {profesional.github && (
              <a href={profesional.github} onClick={(e) => handleLinkClick(e, 'GitHub', profesional.github)} className="group flex flex-col items-center justify-center w-[30%] min-w-[90px] aspect-square bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-[#425C63] rounded-2xl transition-all shadow-lg hover:-translate-y-1">
                  <div className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 group-hover:bg-white text-gray-300 group-hover:text-[#11181A] transition-all mb-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.24c3-.34 6-1.53 6-6.76a5.5 5.5 0 0 0-1.5-3.82 5.2 5.2 0 0 0-.15-3.78s-1.2-.38-3.9 1.45a13.4 13.4 0 0 0-7 0c-2.7-1.83-3.9-1.45-3.9-1.45a5.2 5.2 0 0 0-.15 3.78A5.5 5.5 0 0 0 3 8.2c0 5.22 3 6.42 6 6.76a4.8 4.8 0 0 0-1 3.24v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
                  </div>
                  <span className="font-semibold text-[0.6rem] text-gray-300 group-hover:text-white uppercase tracking-wider">GitHub</span>
              </a>
            )}

            {profesional.ubicacion_url && (
              <a href={profesional.ubicacion_url} onClick={(e) => handleLinkClick(e, 'Ubicación', profesional.ubicacion_url)} className="group flex flex-col items-center justify-center w-[30%] min-w-[90px] aspect-square bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-[#C8A721] rounded-2xl transition-all shadow-lg hover:-translate-y-1">
                  <div className="w-11 h-11 flex items-center justify-center rounded-full bg-[#C8A721]/20 group-hover:bg-[#C8A721] text-[#C8A721] group-hover:text-[#11181A] transition-all mb-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z"></path></svg>
                  </div>
                  <span className="font-semibold text-[0.6rem] text-gray-300 group-hover:text-white uppercase tracking-wider">Ubicación</span>
              </a>
            )}
        </div>
        
        {/* FOOTER */}
        <div className="mt-12 mb-4 text-center flex flex-col items-center justify-center w-full">
            <a href="https://spingamma.github.io/spingamma-landing/" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
              <span className="text-[0.60rem] text-gray-400 font-medium tracking-wide">Tecnología desarrollada por</span>
              <span className="text-[0.70rem] font-extrabold text-white tracking-[0.2em] group-hover:text-[#C8A721] transition-colors">SPINGAMMA</span>
            </a>
        </div>
      </div>

      {/* --- PANEL DE CALIFICACIÓN --- */}
      {mostrarCalificacion && isLoggedIn && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#11181A]/95 backdrop-blur-xl border-t border-[#425C63]/30 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] z-50 animate-in slide-in-from-bottom-10 duration-300 font-montserrat">
              <div className="max-w-[420px] mx-auto flex items-center justify-between gap-4">
                  <div className="flex-1">
                      <p className="text-sm font-bold text-white">¿Qué te pareció mi perfil?</p>
                      <p className="text-xs text-gray-400 font-light hidden sm:block">Tu opinión ayuda a otros.</p>
                  </div>
                  <button onClick={handleCalificarClick} className="px-5 py-2.5 rounded-2xl bg-[#C8A721] hover:bg-[#e0bb2a] text-[#11181A] font-bold text-xs shadow-lg transition-all hover:-translate-y-0.5 whitespace-nowrap flex items-center gap-1.5 uppercase tracking-wider">
                      <Star size={14} className="fill-[#11181A]" /> Calificar
                  </button>
                  <button onClick={handleCerrarPanelCalificacion} className="p-2 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-white/10 rounded-full transition-colors" title="Cerrar">
                      <X size={18} />
                  </button>
              </div>
          </div>
      )}

      {/* --- MODAL QR --- */}
      {mostrarQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#11181A]/90 backdrop-blur-md transition-opacity">
            <div className="relative bg-gradient-to-b from-[#1A2629] to-[#11181A] border border-[#425C63]/30 p-8 rounded-[2rem] flex flex-col items-center z-10 font-montserrat shadow-2xl animate-in fade-in zoom-in duration-300">
                <button onClick={toggleQR} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 p-2 rounded-full transition-colors hover:bg-[#425C63]">
                    <X size={20} />
                </button>
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 border border-[#C8A721]/50 shadow-inner">
                  <QrCode size={24} className="text-[#C8A721]" />
                </div>
                <p className="text-[#C8A721] text-[0.65rem] uppercase tracking-[0.25em] mb-6 font-bold">Código QR</p>
                <div className="bg-white p-3 rounded-2xl shadow-inner border-[3px] border-[#425C63]">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.href)}&color=11181A&bgcolor=FFFFFF`} 
                      alt="Código QR del Perfil" 
                      className="w-48 h-48 md:w-56 md:h-56 object-contain" 
                    />
                </div>
                <p className="text-gray-400 text-xs mt-6 text-center max-w-[200px] font-light">Escanea para ver el perfil de {profesional.name}</p>
            </div>
        </div>
      )}

      {/* --- MODAL DE CALIFICACIÓN --- */}
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