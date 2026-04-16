// Archivo: src/plantillas/PlantillaGenerica.jsx
import { 
  ArrowLeft, Share2, QrCode, MapPin, Phone, MessageCircle, 
  Facebook, Instagram, Linkedin, Globe, Github, X, CheckCircle2, Star, LogOut, UserPlus, Bookmark
} from 'lucide-react';

import useAccionesPerfil from '../hooks/useAccionesPerfil';
import ReviewModal from '../components/ReviewModal';

export default function PlantillaGenerica({ profesional, volverAtras, onProtectedAction }) {
  
  // 🚀 EXTRAÍDO AL HOOK: Lógica centralizada
  const {
    mostrarQR, toggleQR, mostrarCalificacion, isLoggedIn, userName, handleLogout,
    handleShare, handleLinkClick, handleCalificarClick, handleCerrarPanelCalificacion,
    mostrarModalCalificando, setMostrarModalCalificando, calificacionPrevia, isSubmittingReview, handleSubmitReview,
    isSaved, isSaving, toggleSaveCard
  } = useAccionesPerfil(profesional, onProtectedAction);


  // 🧹 LIMPIEZA Y FORMATEO DE ENLACES
  const cleanPhone = profesional?.phone?.replace(/[^0-9]/g, '');
  const cleanWa = profesional?.whatsapp?.replace(/[^0-9]/g, '');
  
  const links = {
    phone: cleanPhone ? `tel:${cleanPhone}` : null,
    whatsapp: cleanWa ? `https://wa.me/${cleanWa}` : null,
    facebook: profesional?.facebook,
    instagram: profesional?.instagram,
    linkedin: profesional?.linkedin,
    website: profesional?.website,
    github: profesional?.github,
    tiktok: profesional?.tiktok,
    ubicacion: profesional?.ubicacion_url
  };

  const SocialButton = ({ icon: Icon, label, url, colorClass }) => {
    if (!url) return null;

    return (
      <button 
        onClick={(e) => handleLinkClick(e, label, url)}
        aria-label={`Ir a ${label}`}
        className={`flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-2xl transition-all group shadow-sm hover:shadow-md hover:border-[#B95221]/30 hover:-translate-y-1 ${colorClass}`}
      >
        <Icon size={28} className="mb-2 transition-transform group-hover:scale-110" />
        <span className="text-xs font-semibold text-gray-500 group-hover:text-gray-800">{label}</span>
      </button>
    );
  };

  if (!profesional) return null;

  const ubicacionTexto = [profesional.neighborhood, profesional.state, profesional.country].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E3D51] pb-24 font-sans antialiased selection:bg-[#B95221] selection:text-white relative">
      
      {/* 🖼️ HEADER Y FOTO DE PORTADA */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-br from-[#1E3D51] to-[#32698F] overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay"></div>
        
        {/* Barra de Navegación Superior */}
        <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-start z-10">
          <button 
            onClick={volverAtras}
            aria-label="Volver al directorio"
            className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white text-[#1E3D51] border border-gray-200 transition-all shadow-md shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex flex-col items-end gap-3">
            {/* 🚀 BOTÓN LOGOUT TIPO PILL EN LA ESQUINA SUPERIOR */}
            {isLoggedIn ? (
               <button 
                 onClick={handleLogout} 
                 aria-label="Cerrar sesión"
                 className="flex items-center gap-2 bg-white/90 backdrop-blur-md border border-gray-200 p-1 pr-3 rounded-full hover:bg-white transition-all shadow-md group"
                 title="Cerrar sesión"
               >
                 <div className="w-8 h-8 rounded-full bg-[#B95221] flex items-center justify-center text-white font-bold text-sm font-sans">
                   {userName ? userName.charAt(0).toUpperCase() : 'U'}
                 </div>
                 <LogOut size={16} className="text-gray-500 group-hover:text-red-500 transition-colors" />
               </button>
            ) : (
               <button 
                 onClick={() => onProtectedAction(null)} 
                 aria-label="Ingresar para ver más detalles"
                 className="h-10 px-4 bg-white/90 backdrop-blur-md border border-gray-200 rounded-full flex items-center justify-center hover:bg-white transition-all text-xs font-bold uppercase text-[#1E3D51] tracking-widest gap-2 shadow-md"
               >
                 <UserPlus size={16} className="text-[#B95221]"/> Ingresar
               </button>
            )}

            {/* 🚀 BOTONES DE ACCIÓN: GUARDAR, QR Y COMPARTIR */}
            <div className="flex gap-2 sm:gap-3">
              <button 
                onClick={toggleSaveCard}
                disabled={isSaving}
                aria-label={isSaved ? "Quitar tarjeta del tarjetero" : "Guardar tarjeta en el tarjetero"}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md backdrop-blur-md ${isSaved ? 'bg-[#1D565D] text-white border-transparent hover:bg-[#154045]' : 'bg-white/80 hover:bg-white text-[#1E3D51] border border-gray-200'} ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <Bookmark size={18} className={isSaved ? 'fill-white' : ''} />
              </button>
              <button 
                onClick={toggleQR}
                aria-label="Mostrar código QR de este perfil"
                className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white text-[#1E3D51] border border-gray-200 transition-all shadow-md"
              >
                <QrCode size={18} />
              </button>

              <button 
                onClick={handleShare}
                aria-label="Compartir este perfil"
                className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white text-[#1E3D51] border border-gray-200 transition-all shadow-md"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🧑‍💼 INFO PRINCIPAL DEL PERFIL */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-20">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6">
          <div className="relative -mt-16 sm:-mt-20 shrink-0">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white overflow-hidden bg-white shadow-xl">
              <img 
                src={profesional.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profesional.name)}&background=F8F9FA&color=1E3D51&size=256`} 
                onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profesional.name)}&background=F8F9FA&color=1E3D51&size=256`; }}
                alt={`Foto de perfil de ${profesional.name}, ${profesional.title}`} 
                className="w-full h-full object-cover"
              />
            </div>
            {profesional.verified && (
              <div className="absolute bottom-2 right-2 bg-white rounded-full p-0.5 shadow-md border border-gray-100">
                <CheckCircle2 size={24} className="text-[#B95221] fill-white" />
              </div>
            )}
          </div>
          
          <div className="text-center sm:text-left flex-1 pb-2 mt-4 sm:mt-20">
            <h1 className="text-3xl font-extrabold text-[#1E3D51] leading-tight mb-1">{profesional.name}</h1>
            <h2 className="text-gray-500 text-lg font-medium">{profesional.title}</h2>
          </div>
        </div>

        {/* 🌟 ESTADÍSTICAS Y UBICACIÓN */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-3 mb-8">
          {profesional.reviews_count > 0 && (
            <div className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
              <Star size={18} className="text-[#B95221] fill-[#B95221]" />
              <span className="font-bold text-[#1E3D51]">{profesional.rating}</span>
              <span className="text-sm text-gray-500">({profesional.reviews_count} reseñas)</span>
            </div>
          )}
          {ubicacionTexto && (
            <div className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-gray-600">
              <MapPin size={18} className="text-[#B95221]" />
              <span className="text-sm font-medium">{ubicacionTexto}</span>
            </div>
          )}
          {profesional.category && (
            <div className="flex items-center gap-1.5 bg-orange-50 px-4 py-2 rounded-xl border border-[#B95221]/20 shadow-sm text-[#B95221]">
               <span className="text-sm font-bold">{profesional.category}</span>
            </div>
          )}
        </div>

        {/* 📝 ACERCA DE */}
        {profesional.description && (
          <div className="bg-white rounded-3xl p-6 mb-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#1E3D51] mb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#B95221] rounded-full"></span> Acerca de mí
            </h3>
            {/* 🚀 WHITESPACE-PRE-LINE para respetar saltos de línea de la BD */}
            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm sm:text-base">
              {profesional.description}
            </p>
          </div>
        )}

        {/* 📱 REDES DE CONTACTO */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-[#1E3D51] mb-4 ml-2">Contactar y Redes Sociales</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <SocialButton icon={MessageCircle} label="WhatsApp" url={links.whatsapp} colorClass="text-green-500 hover:bg-green-50" />
            <SocialButton icon={Phone} label="Llamar" url={links.phone} colorClass="text-blue-500 hover:bg-blue-50" />
            <SocialButton icon={MapPin} label="Ubicación" url={links.ubicacion} colorClass="text-red-500 hover:bg-red-50" />
            <SocialButton icon={Globe} label="Sitio Web" url={links.website} colorClass="text-purple-500 hover:bg-purple-50" />
            <SocialButton icon={Facebook} label="Facebook" url={links.facebook} colorClass="text-blue-600 hover:bg-blue-50" />
            <SocialButton icon={Instagram} label="Instagram" url={links.instagram} colorClass="text-pink-600 hover:bg-pink-50" />
            <SocialButton icon={Linkedin} label="LinkedIn" url={links.linkedin} colorClass="text-sky-600 hover:bg-sky-50" />
            <SocialButton icon={Github} label="GitHub" url={links.github} colorClass="text-gray-700 hover:bg-gray-100" />
          </div>
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
              <span className="text-xs text-gray-500 font-medium">Tecnología desarrollada por</span>
              <span className="text-sm font-extrabold text-[#1E3D51] tracking-wider group-hover:text-[#B95221] transition-colors">SPINGAMMA</span>
            </a>
        </div>

      </div>

      {/* ==========================================
          MODAL DE CÓDIGO QR
          ========================================== */}
      {mostrarQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1E3D51]/50 backdrop-blur-sm transition-opacity" onClick={toggleQR}>
          <div className="bg-white border border-gray-200 rounded-3xl shadow-2xl max-w-sm w-full p-8 relative animate-in zoom-in duration-300 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={toggleQR}
              aria-label="Cerrar modal de código QR"
              className="absolute top-4 right-4 text-gray-400 hover:text-[#1E3D51] transition-colors p-2 bg-gray-100 rounded-full hover:bg-gray-200"
            >
              <X size={20} />
            </button>
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-4">
              <QrCode size={24} className="text-[#B95221]" />
            </div>
            <h3 className="text-xl font-bold text-[#1E3D51] mb-1 text-center">Compartir Perfil</h3>
            <p className="text-gray-500 text-sm mb-6 text-center">Escanea este código para ver mi tarjeta digital en cualquier dispositivo.</p>
            
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.href)}&color=1E3D51`} 
                alt={`Código QR para el perfil de ${profesional.name}`} 
                className="w-48 h-48"
              />
            </div>
            
            <button 
              onClick={handleShare}
              aria-label="Compartir enlace de perfil"
              className="mt-8 w-full bg-[#B95221] hover:bg-[#9A4219] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Share2 size={18} /> Enviar enlace en su lugar
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          PANEL DE CALIFICACIÓN FLOTANTE
          ========================================== */}
      {mostrarCalificacion && localStorage.getItem('spingamma_user') && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.1)] z-50 animate-in slide-in-from-bottom-10 duration-300">
              <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                  <div className="flex-1">
                      <p className="text-sm font-bold text-[#1E3D51]">¿Qué te pareció mi perfil?</p>
                      <p className="text-xs text-gray-500 font-medium hidden sm:block">Tu opinión ayuda a otros profesionales.</p>
                  </div>
                  <button
                      onClick={handleCalificarClick}
                      aria-label="Calificar perfil de este profesional"
                      className="px-6 py-2.5 rounded-full bg-[#B95221] hover:bg-[#9A4219] text-white font-bold text-sm shadow-md transition-all hover:-translate-y-0.5 whitespace-nowrap flex items-center gap-1.5"
                  >
                      <Star size={16} className="fill-white" /> Calificar
                  </button>
                  <button
                      onClick={handleCerrarPanelCalificacion}
                      aria-label="Cerrar panel de calificación"
                      className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-full transition-colors"
                      title="Cerrar"
                  >
                      <X size={18} />
                  </button>
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
    </div>
  );
}