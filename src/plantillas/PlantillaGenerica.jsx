// Archivo: src/plantillas/PlantillaGenerica.jsx
import React, { useState, useEffect } from 'react';
import { LogOut, UserPlus, X, Share2, QrCode } from 'lucide-react';

// Sub-componente de Botón Circular
const BotonCircularAccion = ({ icon, label, url, onContact }) => {
  if (!url) return null;

  return (
    <a 
      href={url} 
      target="_blank" rel="noreferrer" 
      onClick={onContact}
      className="group flex flex-col items-center justify-center p-2 text-center transition hover:-translate-y-1 w-[85px]"
    >
      <div className="flex h-[72px] w-[72px] md:h-20 md:w-20 items-center justify-center rounded-full bg-[#32698F] border border-[#32698F] group-hover:border-[#F67927]/50 text-white shadow-lg shadow-[#152a38]/50 transition duration-300 group-hover:scale-105">
        {icon}
      </div>
      <span className="mt-3 block font-medium text-[11px] md:text-xs text-[#E6E2DF] group-hover:text-white transition line-clamp-1">
        {label}
      </span>
    </a>
  );
};

function PlantillaGenerica({ profesional, volverAtras }) {
  const [mostrarCalificar, setMostrarCalificar] = useState(false);
  const [mostrarQR, setMostrarQR] = useState(false);

  // Estados de Autenticación
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('spingamma_user') !== null);
  const [userName, setUserName] = useState(() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try { return JSON.parse(stored).nombre; } catch(e) { return ''; }
    }
    return '';
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', celular: '' });

  // EFECTO PARA FORZAR LOGIN SI ENTRA POR QR O URL DIRECTA
  useEffect(() => {
    if (!isLoggedIn) {
      setAuthModalOpen(true);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (profesional) {
      const historial = JSON.parse(localStorage.getItem('spingamma_historial') || '{}');
      if (historial[profesional.slug] === 'pendiente') {
        setMostrarCalificar(true);
      }
    }
  }, [profesional]);

  const registrarContacto = () => {
    setMostrarCalificar(true);
    const historial = JSON.parse(localStorage.getItem('spingamma_historial') || '{}');
    historial[profesional.slug] = 'pendiente';
    localStorage.setItem('spingamma_historial', JSON.stringify(historial));
  };

  const procesarCalificacion = () => {
    setMostrarCalificar(false);
    const historial = JSON.parse(localStorage.getItem('spingamma_historial') || '{}');
    historial[profesional.slug] = 'calificado';
    localStorage.setItem('spingamma_historial', JSON.stringify(historial));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (formData.nombre.trim() && formData.celular.trim()) {
      localStorage.setItem('spingamma_user', JSON.stringify(formData));
      setIsLoggedIn(true);
      setUserName(formData.nombre);
      setAuthModalOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('spingamma_user');
    setIsLoggedIn(false);
    setUserName('');
    setFormData({ nombre: '', celular: '' });
  };

  const toggleQR = () => setMostrarQR(!mostrarQR);

  const handleShare = async () => {
    const shareData = {
      title: `Perfil de ${profesional.name}`,
      text: `Conoce el perfil profesional de ${profesional.name} - ${profesional.title} en SpinGamma.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error al compartir", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Enlace copiado al portapapeles");
    }
  };

  if (!profesional) return null;

  const imgFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(profesional.name)}&background=1E3D51&color=FFFFFF&size=256`;

  const icons = {
    call: <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>,
    whatsapp: <svg className="h-9 w-9" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.39 0 .004 5.385.004 12.025c0 2.126.552 4.195 1.6 6.01L.067 23.99l6.103-1.601c1.748.951 3.733 1.453 5.86 1.453 6.638 0 12.025-5.385 12.025-12.025S18.669 0 12.031 0zm0 19.957c-1.793 0-3.548-.482-5.088-1.395l-.364-.216-3.778.991.999-3.684-.236-.376c-1.002-1.597-1.531-3.444-1.531-5.341 0-5.548 4.515-10.063 10.063-10.063 5.547 0 10.062 4.515 10.062 10.063 0 5.548-4.515 10.063-10.062 10.063zm5.525-7.555c-.303-.152-1.794-.886-2.072-.988-.278-.102-.482-.152-.685.152-.204.303-.785.988-.962 1.19-.178.203-.355.228-.659.076-.303-.152-1.282-.473-2.44-1.512-.903-.81-1.511-1.812-1.689-2.116-.178-.304-.019-.468.133-.62.137-.137.303-.356.455-.534.152-.178.203-.304.304-.507.102-.203.051-.38-.025-.533-.076-.152-.685-1.65-.938-2.261-.247-.594-.496-.513-.685-.523-.178-.009-.381-.01-.584-.01s-.532.076-.811.38c-.279.304-1.064 1.04-1.064 2.535 0 1.495 1.089 2.94 1.241 3.143.152.203 2.144 3.275 5.196 4.593.726.314 1.292.502 1.734.643.728.232 1.391.199 1.916.12.585-.088 1.794-.733 2.047-1.442.253-.71.253-1.318.178-1.443-.076-.126-.279-.202-.584-.354z"/></svg>,
    map: <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>,
    facebook: <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    instagram: <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><rect width="16" height="16" x="4" y="4" rx="4"></rect><circle cx="12" cy="12" r="3"></circle><line x1="16.5" x2="16.5" y1="7.5" y2="7.5"></line></svg>,
    linkedin: <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>,
    tiktok: <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>,
    github: <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.24c3-.34 6-1.53 6-6.76a5.5 5.5 0 0 0-1.5-3.82 5.2 5.2 0 0 0-.15-3.78s-1.2-.38-3.9 1.45a13.4 13.4 0 0 0-7 0c-2.7-1.83-3.9-1.45-3.9-1.45a5.2 5.2 0 0 0-.15 3.78A5.5 5.5 0 0 0 3 8.2c0 5.22 3 6.42 6 6.76a4.8 4.8 0 0 0-1 3.24v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>,
    website: <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="2" x2="22" y1="12" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path></svg>
  };

  const cleanWhatsapp = profesional.whatsapp ? profesional.whatsapp.replace(/[^0-9]/g, '') : null;
  const wspSpingamma = "59164016676";
  
  // MENSAJE DE WHATSAPP ACTUALIZADO CON EL NOMBRE DEL USUARIO
  const msjCalificar = encodeURIComponent(`¡Hola! Soy ${userName || 'un usuario'}, quiero calificar al profesional ${profesional.name}.`);
  const linkCalificar = `https://wa.me/${wspSpingamma}?text=${msjCalificar}`;

  return (
    <div className="min-h-screen bg-[#1E3D51] font-sans flex flex-col items-center py-6 px-4 antialiased selection:bg-[#F67927] selection:text-white relative">
      
      {/* HEADER: Volver y Autenticación */}
      <header className="w-full max-w-lg mx-auto flex items-center justify-between mb-4 mt-2 px-2 z-20">
        <button onClick={volverAtras} className="font-medium text-sm text-[#E6E2DF] flex items-center gap-2 hover:text-[#F67927] transition p-2">
          ← <span className="hidden sm:inline">Volver</span><span className="sm:hidden">Volver</span>
        </button>

        <div className="flex items-center flex-shrink-0">
          {isLoggedIn ? (
            <div className="flex items-center gap-3 bg-[#152a38] border border-[#32698F]/50 py-1.5 px-3 rounded-full shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#F67927] flex items-center justify-center shadow-inner">
                  <span className="text-white font-bold text-xs">
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <span className="text-sm text-[#E6E2DF] hidden md:block">
                  Hola, <strong className="text-white font-semibold">{userName.split(' ')[0]}</strong>
                </span>
              </div>
              <div className="w-[1px] h-4 bg-[#32698F]"></div>
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-1.5 text-sm text-[#E6E2DF] hover:text-[#F67927] transition-colors"
                title="Cerrar sesión"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setAuthModalOpen(true)} 
              className="text-sm font-semibold bg-[#32698F] hover:bg-[#F67927] text-white py-1.5 px-4 rounded-full transition-colors shadow-md flex items-center gap-2"
            >
              <UserPlus size={16} /> Ingresar
            </button>
          )}
        </div>
      </header>

      <main className="w-full max-w-lg flex flex-col items-center flex-1 relative pt-2">
        
        {/* BOTONES FLOTANTES: Compartir y QR (Orden: Share, QR) */}
        <div className="absolute top-0 right-2 flex items-center gap-2.5 z-10">
          <button 
            onClick={handleShare} 
            className="flex items-center justify-center text-[#E6E2DF] hover:text-white transition-colors p-2.5 bg-[#152a38] border border-[#32698F]/50 rounded-full shadow-md hover:border-[#F67927]/50 hover:bg-[#F67927]"
            title="Compartir"
          >
            <Share2 size={18} />
          </button>
          <button 
            onClick={toggleQR} 
            className="flex items-center justify-center text-[#E6E2DF] hover:text-white transition-colors p-2.5 bg-[#152a38] border border-[#32698F]/50 rounded-full shadow-md hover:border-[#F67927]/50 hover:bg-[#F67927]"
            title="Mostrar Código QR"
          >
            <QrCode size={18} />
          </button>
        </div>

        {/* FOTO DE PERFIL */}
        <div className="relative flex-shrink-0 mb-6 mt-8">
          <div className="w-32 h-32 md:w-36 md:h-36 rounded-full p-[3px] bg-[#1E3D51] border border-[#32698F] flex items-center justify-center shadow-lg shadow-[#152a38]/50 mx-auto">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#32698F] border-[2px] border-[#1E3D51]">
              <img 
                src={profesional.image || imgFallback} 
                onError={(e) => { e.target.onerror = null; e.target.src = imgFallback; }}
                alt={profesional.name} 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </div>

        <div className="text-center w-full mb-10 px-2">
          <h1 className="text-2xl md:text-3xl font-serif font-bold uppercase tracking-widest mb-2 text-white">
            {profesional.name}
          </h1>
          
          <div className="flex items-center justify-center gap-1.5 mb-2">
            {profesional.reviews_count > 0 ? (
              <div className="flex items-center bg-[#32698F] px-3 py-1 rounded-full border border-[#32698F]/50 shadow-sm">
                <span className="text-lg text-yellow-400">⭐</span>
                <span className="font-bold text-white ml-1">{profesional.rating}</span>
                <span className="text-xs text-[#E6E2DF] font-medium ml-1">({profesional.reviews_count} reseñas)</span>
              </div>
            ) : (
              <span className="text-xs font-bold bg-[#F67927]/20 text-[#F67927] px-3 py-1 rounded-full border border-[#F67927]/30 uppercase tracking-wider">
                Perfil Nuevo
              </span>
            )}
          </div>

          <h2 className="text-sm md:text-base font-semibold text-[#F67927] mb-6">
            {profesional.title}
          </h2>
          <p className="text-[#E6E2DF]/90 text-sm leading-relaxed whitespace-pre-line max-w-sm mx-auto">
            {profesional.description}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-6 w-full max-w-xs md:max-w-md mx-auto mb-10">
          {profesional.phone && <BotonCircularAccion icon={icons.call} label="Llamada" url={`tel:${profesional.phone}`} onContact={registrarContacto} />}
          {profesional.whatsapp && <BotonCircularAccion icon={icons.whatsapp} label="WhatsApp" url={`https://wa.me/${cleanWhatsapp}`} onContact={registrarContacto} />}
          {profesional.website && <BotonCircularAccion icon={icons.website} label="Página Web" url={profesional.website} onContact={registrarContacto} />}
          {profesional.facebook && <BotonCircularAccion icon={icons.facebook} label="Facebook" url={profesional.facebook} onContact={registrarContacto} />}
          {profesional.instagram && <BotonCircularAccion icon={icons.instagram} label="Instagram" url={profesional.instagram} onContact={registrarContacto} />}
          {profesional.tiktok && <BotonCircularAccion icon={icons.tiktok} label="TikTok" url={profesional.tiktok} onContact={registrarContacto} />}
          {profesional.linkedin && <BotonCircularAccion icon={icons.linkedin} label="LinkedIn" url={profesional.linkedin} onContact={registrarContacto} />}
          {profesional.github && <BotonCircularAccion icon={icons.github} label="GitHub" url={profesional.github} onContact={registrarContacto} />}
          {profesional.ubicacion_url && <BotonCircularAccion icon={icons.map} label="Ubicación" url={profesional.ubicacion_url} onContact={registrarContacto} />}
        </div>

        {mostrarCalificar && (
          <div className="w-full max-w-[280px] animate-in slide-in-from-bottom-5 fade-in duration-500 mb-10">
            <div className="bg-[#152a38] p-4 rounded-2xl border border-[#32698F] text-center shadow-lg">
              <p className="text-xs text-[#E6E2DF] mb-3 font-medium">¿Te comunicaste exitosamente?</p>
              <a 
                href={linkCalificar}
                target="_blank" rel="noreferrer"
                onClick={procesarCalificacion}
                className="flex items-center justify-center gap-2 w-full bg-[#F67927] hover:bg-[#e06516] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:-translate-y-0.5"
              >
                <span className="text-lg">⭐</span> Calificar Profesional
              </a>
            </div>
          </div>
        )}

      </main>

      <footer className="w-full text-center py-6 mt-auto">
        <p className="text-[0.65rem] font-serif text-[#E6E2DF]/70 font-medium tracking-widest uppercase">
          Powered by SPINGAMMA
        </p>
      </footer>

      {/* Modal de Registro Compartido */}
      {authModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#152a38]/90 backdrop-blur-sm transition-opacity">
          <div className="bg-[#1E3D51] border border-[#32698F] rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-300">
            {/* Si rechazan iniciar sesión, regresan al directorio */}
            <button onClick={() => { setAuthModalOpen(false); volverAtras(); }} className="absolute top-5 right-5 text-[#E6E2DF] hover:text-white transition-colors p-2 bg-[#32698F] rounded-full hover:bg-[#F67927]"><X size={20} /></button>
            <div className="text-center mb-6 mt-2">
              <div className="w-20 h-20 bg-[#32698F] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#F67927] shadow-inner"><UserPlus size={36} className="text-[#F67927]" /></div>
              <h2 className="text-2xl font-extrabold text-white mb-2">Comunidad Segura</h2>
              <p className="text-[#E6E2DF] text-sm px-2">Para ver perfiles y garantizar valoraciones reales, regístrate gratis en 10 segundos.</p>
            </div>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#F67927] uppercase tracking-wide mb-1">Nombre Completo</label>
                <input required type="text" placeholder="Ej. Ana Pérez" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full bg-[#32698F] border border-[#32698F] text-white px-4 py-3 rounded-xl outline-none focus:border-[#F67927] focus:ring-1 focus:ring-[#F67927] placeholder-[#E6E2DF]/50 transition-all"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#F67927] uppercase tracking-wide mb-1">Celular / WhatsApp</label>
                <input required type="tel" placeholder="Ej. 71234567" value={formData.celular} onChange={(e) => setFormData({...formData, celular: e.target.value})} className="w-full bg-[#32698F] border border-[#32698F] text-white px-4 py-3 rounded-xl outline-none focus:border-[#F67927] focus:ring-1 focus:ring-[#F67927] placeholder-[#E6E2DF]/50 transition-all"/>
              </div>
              <button type="submit" className="w-full bg-[#F67927] hover:bg-[#e06516] text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg hover:-translate-y-0.5 mt-4">Registrarme</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal del Código QR */}
      {mostrarQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#152a38]/90 backdrop-blur-sm transition-opacity">
            <div className="relative bg-[#1E3D51] border border-[#32698F] p-8 rounded-[2rem] flex flex-col items-center z-10 shadow-2xl animate-in fade-in zoom-in duration-300">
                <button onClick={toggleQR} className="absolute top-4 right-4 text-[#E6E2DF] hover:text-white bg-[#32698F] p-2 rounded-full transition-colors hover:bg-[#F67927]">
                    <X size={20} />
                </button>
                <div className="w-12 h-12 bg-[#32698F] rounded-full flex items-center justify-center mx-auto mb-3 border border-[#F67927] shadow-inner">
                  <QrCode size={24} className="text-[#F67927]" />
                </div>
                <p className="text-[#F67927] text-sm uppercase tracking-widest mb-6 font-bold">Código QR</p>
                <div className="bg-white p-4 rounded-2xl shadow-inner border-[3px] border-[#32698F]">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.href)}&color=1E3D51&bgcolor=FFFFFF`} 
                      alt="Código QR del Perfil" 
                      className="w-48 h-48 md:w-56 md:h-56 object-contain" 
                    />
                </div>
                <p className="text-[#E6E2DF] text-xs mt-6 text-center max-w-[200px]">Escanea para ver el perfil de {profesional.name}</p>
            </div>
        </div>
      )}
    </div>
  );
}

export default PlantillaGenerica;