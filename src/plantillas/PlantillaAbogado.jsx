import React, { useEffect, useState } from 'react';
import { LogOut, UserPlus, X, Share2, QrCode, Star, ArrowLeft } from 'lucide-react';

function PlantillaAbogado({ profesional, volverAtras }) {
  const [loaded, setLoaded] = useState(false);
  const [mostrarQR, setMostrarQR] = useState(false);

  // 💾 PERSISTENCIA Y MÉTRICAS: Claves para el almacenamiento local
  const pendingRateKey = `spingamma_pending_rate_${profesional?.slug}`;
  const hasRatedKey = `spingamma_has_rated_${profesional?.slug}`;
  const pendingInteractionKey = `spingamma_pending_interaction_${profesional?.slug}`;

  const [mostrarCalificacion, setMostrarCalificacion] = useState(() => {
    if (!profesional) return false;
    const isPending = localStorage.getItem(pendingRateKey) === 'true';
    const hasRated = localStorage.getItem(hasRatedKey) === 'true';
    return isPending && !hasRated;
  });

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
  const [pendingUrl, setPendingUrl] = useState(null);

  // Simulador del Loader
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

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

  // 📊 MÉTRICAS: Registrar clic silenciosamente en la DB
  const registrarInteraccionBackend = (platformName) => {
    const userStr = localStorage.getItem('spingamma_user');
    if (!userStr || !profesional) return;

    try {
        const userObj = JSON.parse(userStr);
        const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

        fetch(`${API_URL}/profesionales/${profesional.slug}/interaccion`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_phone: userObj.celular,
                user_name: userObj.nombre,
                platform: platformName
            })
        }).catch(err => console.error("Error silencioso registrando métrica:", err));
    } catch (error) {}
  };

  // 🔗 INTERCEPTOR DE CLICS EN REDES (Lógica idéntica a las otras plantillas)
  const handleLinkClick = (e, platformName, url) => {
    e.preventDefault(); 
    
    const isLogged = localStorage.getItem('spingamma_user');

    if (isLogged) {
      registrarInteraccionBackend(platformName);
      
      if (localStorage.getItem(hasRatedKey) !== 'true') {
        localStorage.setItem(pendingRateKey, 'true');
        setMostrarCalificacion(true);
      }

      if (url.startsWith('tel:') || url.startsWith('mailto:')) {
        window.location.href = url;
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } else {
      localStorage.setItem(pendingInteractionKey, platformName);
      setPendingUrl(url);
      setAuthModalOpen(true);
    }
  };

  const handleCalificarClick = () => {
    const spingammaWhatsapp = "59175266095"; 
    const mensaje = `Hola SpinGamma, soy ${userName || 'un usuario'}. Quiero calificar el perfil profesional de ${profesional.name}.`;
    const url = `https://wa.me/${spingammaWhatsapp}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
    
    localStorage.setItem(hasRatedKey, 'true');
    localStorage.removeItem(pendingRateKey);
    setMostrarCalificacion(false);
  };

  const handleCerrarPanelCalificacion = () => {
    localStorage.removeItem(pendingRateKey);
    setMostrarCalificacion(false);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (formData.nombre.trim() && formData.celular.trim()) {
      localStorage.setItem('spingamma_user', JSON.stringify(formData));
      setIsLoggedIn(true);
      setUserName(formData.nombre);
      setAuthModalOpen(false);

      const pendingPlatform = localStorage.getItem(pendingInteractionKey);
      if (pendingPlatform) {
        registrarInteraccionBackend(pendingPlatform);
        localStorage.removeItem(pendingInteractionKey);

        if (localStorage.getItem(hasRatedKey) !== 'true') {
          localStorage.setItem(pendingRateKey, 'true');
          setMostrarCalificacion(true);
        }
      }

      if (pendingUrl) {
        if (pendingUrl.startsWith('tel:') || pendingUrl.startsWith('mailto:')) {
          window.location.href = pendingUrl;
        } else {
          window.open(pendingUrl, '_blank', 'noopener,noreferrer');
        }
        setPendingUrl(null);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('spingamma_user');
    setIsLoggedIn(false);
    setUserName('');
    setFormData({ nombre: '', celular: '' });
  };

  if (!profesional) return null;

  return (
    <div className="h-[100dvh] flex items-center justify-center p-4 relative overflow-hidden bg-[#121212] text-white">
      
      {/* --- ESTILOS INYECTADOS --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&display=swap');
        .font-cinzel { font-family: 'Cinzel', serif; }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(233, 206, 63, 0.1);
            border-top: 3px solid #E9CE3F;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        .btn-social {
            background: linear-gradient(145deg, #1a1a1a, #0d0d0d);
            border: 1px solid rgba(233, 206, 63, 0.2);
            box-shadow: 4px 4px 8px #080808, -2px -2px 6px #1c1c1c;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }
        .btn-social:active {
            box-shadow: inset 2px 2px 5px #080808, inset -2px -2px 5px #1c1c1c;
            transform: scale(0.95);
        }
        .btn-social svg { filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.5)); }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* --- LOADER --- */}
      {!loaded && (
        <div className="fixed inset-0 bg-[#121212] flex flex-col items-center justify-center z-[1000]">
          <div className="spinner mb-4"></div>
          <p className="text-[#E9CE3F] text-[0.6rem] tracking-[0.3em] uppercase font-cinzel">Sincronizando Perfil...</p>
        </div>
      )}

      {/* --- TARJETA PRINCIPAL --- */}
      <div className={`relative z-10 w-full max-w-sm h-full max-h-[850px] bg-transparent p-6 flex flex-col items-center overflow-y-auto no-scrollbar font-cinzel transition-all duration-700 pb-28 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* ENCABEZADO SUPERIOR: VOLVER Y LOGIN */}
        <div className="absolute top-4 left-4 flex gap-3 z-20">
          <button onClick={volverAtras} className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#E9CE3F]/20 flex items-center justify-center text-[#E9CE3F]/60 hover:text-[#E9CE3F] transition-colors shadow-lg">
            <ArrowLeft size={16} />
          </button>
          {isLoggedIn ? (
              <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#E9CE3F]/20 py-1 px-2.5 rounded-full shadow-md">
                <div className="w-5 h-5 rounded-full bg-[#E9CE3F] flex items-center justify-center">
                  <span className="text-[#121212] font-bold text-[0.6rem] font-sans">
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <button onClick={handleLogout} className="text-[#E9CE3F]/60 hover:text-[#E9CE3F] transition-colors">
                  <LogOut size={12} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { setPendingUrl(null); setAuthModalOpen(true); }} 
                className="text-[0.55rem] uppercase tracking-wider font-bold flex items-center gap-1.5 bg-[#1a1a1a] border border-[#E9CE3F]/30 hover:border-[#E9CE3F] text-[#E9CE3F] py-1 px-3 rounded-full transition-all shadow-md"
              >
                <UserPlus size={12} /> Ingresar
              </button>
          )}
        </div>

        {/* ENCABEZADO SUPERIOR: QR Y COMPARTIR */}
        <div className="absolute top-4 right-4 flex gap-3 z-20">
            <button onClick={toggleQR} className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#E9CE3F]/20 flex items-center justify-center text-[#E9CE3F]/60 hover:text-[#E9CE3F] transition-colors shadow-lg">
                <QrCode size={16} />
            </button>
            <button onClick={handleShare} className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#E9CE3F]/20 flex items-center justify-center text-[#E9CE3F]/60 hover:text-[#E9CE3F] transition-colors shadow-lg">
                <Share2 size={16} />
            </button>
        </div>

        {/* LOGO GEOMÉTRICO ORO */}
        <div className="mt-6 mb-4">
            <svg className="w-20 h-20 text-[#E9CE3F]" viewBox="0 0 100 100" fill="currentColor">
                <path d="M 30 88 L 70 88 L 73 94 L 27 94 Z" /><path d="M 35 82 L 65 82 L 68 88 L 32 88 Z" /><path d="M 42 76 L 58 76 L 61 82 L 39 82 Z" /><rect x="47" y="20" width="6" height="56" /><polygon points="50,8 43,20 57,20" /><rect x="15" y="22" width="70" height="3" rx="1.5" />
                <line x1="17" y1="24" x2="5" y2="55" stroke="currentColor" strokeWidth="1.5" /><line x1="17" y1="24" x2="17" y2="55" stroke="currentColor" strokeWidth="1.5" /><line x1="17" y1="24" x2="29" y2="55" stroke="currentColor" strokeWidth="1.5" /><path d="M 3 55 Q 17 68 31 55 Z" />
                <line x1="83" y1="24" x2="71" y2="55" stroke="currentColor" strokeWidth="1.5" /><line x1="83" y1="24" x2="83" y2="55" stroke="currentColor" strokeWidth="1.5" /><line x1="83" y1="24" x2="95" y2="55" stroke="currentColor" strokeWidth="1.5" /><path d="M 69 55 Q 83 68 97 55 Z" />
            </svg>
        </div>

        {/* INFO PRINCIPAL */}
        <div className="text-center w-full z-10">
            <h1 className="text-xl sm:text-2xl font-bold tracking-wider text-[#E9CE3F] uppercase mb-1">{profesional.name}</h1>
            <p className="text-[0.65rem] tracking-[0.3em] text-[#E9CE3F]/80 uppercase font-medium border-b border-[#E9CE3F]/20 pb-4 inline-block px-6">{profesional.title}</p>
            <p className="text-gray-400 font-sans text-[0.7rem] mt-5 whitespace-pre-line leading-relaxed px-2">{profesional.description}</p> 
        </div>

        {/* FOTO DE PERFIL */}
        <div className="relative flex-shrink-0 mt-8 mb-8">
            <div className="w-40 h-40 rounded-full p-[3px] bg-gradient-to-tr from-[#B59B27] via-[#E9CE3F] to-[#B59B27] shadow-[0_0_25px_rgba(233,206,63,0.15)] z-10 relative">
                <div className="w-full h-full rounded-full overflow-hidden border-[4px] border-[#121212] bg-[#121212]">
                    <img 
                      src={profesional.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profesional.name)}&background=121212&color=E9CE3F&size=256`} 
                      onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profesional.name)}&background=121212&color=E9CE3F&size=256`; }}
                      alt={profesional.name} 
                      className="w-full h-full object-cover grayscale-[20%]" 
                    />
                </div>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[125%] h-[125%] border border-white/[0.03] rounded-full"></div>
        </div>

        {/* REDES SOCIALES (GRID 3 COLUMNAS IDÉNTICO AL DISEÑO PROPORCIONADO) */}
        <div className="grid grid-cols-3 gap-6 w-fit mx-auto z-10 mb-10">
            {profesional.phone && (
              <a href={`tel:${profesional.phone}`} onClick={(e) => handleLinkClick(e, 'Llamar', `tel:${profesional.phone}`)} className="btn-social w-14 h-14 rounded-full text-[#E9CE3F]">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.005 15.304c-.392-.315-2.28-1.05-2.633-1.168-.352-.12-.607-.175-.862.197-.254.372-1.002 1.168-1.228 1.408-.225.24-.45.27-.843.075-3.033-1.503-4.832-3.15-6.195-5.46-.196-.334.205-.308.58-.98.118-.21.06-.394-.03-.584-.09-.19-.86-2.072-1.18-2.838-.31-.747-.625-.646-.86-.658-.226-.01-.484-.012-.74-.012-.254 0-.668.095-1.018.475C4.1 6.556 3 7.818 3 10.3c0 2.484 2.152 4.887 2.45 5.285.297.397 3.52 5.518 8.653 7.606 3.036 1.233 4.295 1.05 5.092.905.908-.166 2.28-.934 2.6-1.838.32-.904.32-1.68.225-1.838-.095-.157-.35-.252-.743-.448z"/></svg>
              </a>
            )}
            {profesional.whatsapp && (
              <a href={`https://wa.me/${profesional.whatsapp.replace(/[^0-9]/g, '')}`} onClick={(e) => handleLinkClick(e, 'WhatsApp', `https://wa.me/${profesional.whatsapp.replace(/[^0-9]/g, '')}`)} className="btn-social w-14 h-14 rounded-full text-[#E9CE3F]">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.39 0 .004 5.385.004 12.025c0 2.126.552 4.195 1.6 6.01L.067 23.99l6.103-1.601c1.748.951 3.733 1.453 5.86 1.453 6.638 0 12.025-5.385 12.025-12.025S18.669 0 12.031 0zm0 19.957c-1.793 0-3.548-.482-5.088-1.395l-.364-.216-3.778.991.999-3.684-.236-.376c-1.002-1.597-1.531-3.444-1.531-5.341 0-5.548 4.515-10.063 10.063-10.063 5.547 0 10.062 4.515 10.062 10.063 0 5.548-4.515 10.063-10.062 10.063zm5.525-7.555c-.303-.152-1.794-.886-2.072-.988-.278-.102-.482-.152-.685.152-.204.303-.785.988-.962 1.19-.178.203-.355.228-.659.076-.303-.152-1.282-.473-2.44-1.512-.903-.81-1.511-1.812-1.689-2.116-.178-.304-.019-.468.133-.62.137-.137.303-.356.455-.534.152-.178.203-.304.304-.507.102-.203.051-.38-.025-.533-.076-.152-.685-1.65-.938-2.261-.247-.594-.496-.513-.685-.523-.178-.009-.381-.01-.584-.01s-.532.076-.811.38c-.279.304-1.064 1.04-1.064 2.535 0 1.495 1.089 2.94 1.241 3.143.152.203 2.144 3.275 5.196 4.593.726.314 1.292.502 1.734.643.728.232 1.391.199 1.916.12.585-.088 1.794-.733 2.047-1.442.253-.71.253-1.318.178-1.443-.076-.126-.279-.202-.584-.354z"/></svg>
              </a>
            )}
            {profesional.ubicacion_url && (
              <a href={profesional.ubicacion_url} onClick={(e) => handleLinkClick(e, 'Ubicación', profesional.ubicacion_url)} className="btn-social w-14 h-14 rounded-full text-[#E9CE3F]">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              </a>
            )}
            {profesional.facebook && (
              <a href={profesional.facebook} onClick={(e) => handleLinkClick(e, 'Facebook', profesional.facebook)} className="btn-social w-14 h-14 rounded-full text-[#E9CE3F]">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            )}
            {profesional.instagram && (
              <a href={profesional.instagram} onClick={(e) => handleLinkClick(e, 'Instagram', profesional.instagram)} className="btn-social w-14 h-14 rounded-full text-[#E9CE3F]">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            )}
            {profesional.tiktok && (
              <a href={profesional.tiktok} onClick={(e) => handleLinkClick(e, 'TikTok', profesional.tiktok)} className="btn-social w-14 h-14 rounded-full text-[#E9CE3F]">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
              </a>
            )}
            {/* Si agregas Linkedin o Github a la DB, también usa iconos lucide o SVG similares aquí */}
        </div>

        {/* CTA DE AGENDAR */}
        {profesional.whatsapp && (
            <a 
              href={`https://wa.me/${profesional.whatsapp.replace(/[^0-9]/g, '')}`} 
              onClick={(e) => handleLinkClick(e, 'WhatsApp Agendar', `https://wa.me/${profesional.whatsapp.replace(/[^0-9]/g, '')}`)}
              className="w-[90%] block mt-auto text-center border-2 border-[#E9CE3F] rounded-xl py-4 px-4 bg-[#121212] hover:bg-[#E9CE3F] text-[#E9CE3F] hover:text-[#121212] transition-all font-bold tracking-widest text-[0.65rem] uppercase shadow-lg z-10"
            >
                Agendar Consulta Profesional
            </a>
        )}

        <a href="https://spingamma.github.io/spingamma-landing/" target="_blank" rel="noopener noreferrer" className="block text-[0.55rem] tracking-[0.25em] font-medium uppercase text-gray-600 hover:text-[#E9CE3F] mt-10 pb-2 text-center w-full transition-colors">
            Tecnología desarrollada por SPINGAMMA
        </a>
      </div>

      {/* --- MODAL DE REGISTRO (TEMA DARK/GOLD) --- */}
      {authModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity">
          <div className="bg-[#1a1a1a] border border-[#E9CE3F]/30 rounded-3xl shadow-[0_0_50px_rgba(233,206,63,0.1)] max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-300 font-cinzel">
            <button 
              onClick={() => { 
                setAuthModalOpen(false); 
                localStorage.removeItem(pendingInteractionKey); 
              }} 
              className="absolute top-5 right-5 text-gray-500 hover:text-[#E9CE3F] transition-colors p-2 bg-[#121212] rounded-full"
            >
              <X size={20} />
            </button>
            <div className="text-center mb-6 mt-2">
              <div className="w-16 h-16 bg-[#121212] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#E9CE3F]/50 shadow-inner"><UserPlus size={28} className="text-[#E9CE3F]" /></div>
              <h2 className="text-xl font-bold text-white mb-2 tracking-wide uppercase">Acceso Seguro</h2>
              <p className="text-gray-400 text-xs px-2 font-sans">Para garantizar interacciones reales y profesionales, regístrate en segundos.</p>
            </div>
            <form onSubmit={handleRegister} className="space-y-4 font-sans">
              <div>
                <label className="block text-[0.60rem] font-bold text-[#E9CE3F] uppercase tracking-[0.1em] mb-1.5 ml-1">Nombre Completo</label>
                <input required type="text" placeholder="Ej. Ana Pérez" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full bg-[#121212] border border-[#333] text-white px-4 py-3 rounded-xl outline-none focus:border-[#E9CE3F] focus:ring-1 focus:ring-[#E9CE3F] placeholder-gray-600 transition-all font-light text-sm"/>
              </div>
              <div>
                <label className="block text-[0.60rem] font-bold text-[#E9CE3F] uppercase tracking-[0.1em] mb-1.5 ml-1">Celular / WhatsApp</label>
                <input required type="tel" placeholder="Ej. 71234567" value={formData.celular} onChange={(e) => setFormData({...formData, celular: e.target.value})} className="w-full bg-[#121212] border border-[#333] text-white px-4 py-3 rounded-xl outline-none focus:border-[#E9CE3F] focus:ring-1 focus:ring-[#E9CE3F] placeholder-gray-600 transition-all font-light text-sm"/>
              </div>
              <button type="submit" className="w-full bg-[#E9CE3F] hover:bg-[#B59B27] text-[#121212] font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg hover:-translate-y-0.5 mt-6 uppercase tracking-wider text-xs font-cinzel">Registrarme</button>
            </form>
          </div>
        </div>
      )}

      {/* --- PANEL DE CALIFICACIÓN FLOTANTE (DARK THEME) --- */}
      {mostrarCalificacion && isLoggedIn && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#121212]/95 backdrop-blur-xl border-t border-[#E9CE3F]/20 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] z-50 animate-in slide-in-from-bottom-10 duration-300 font-sans">
              <div className="max-w-[420px] mx-auto flex items-center justify-between gap-4">
                  <div className="flex-1">
                      <p className="text-sm font-bold text-[#E9CE3F] font-cinzel">¿Qué te pareció el perfil?</p>
                      <p className="text-xs text-gray-400 font-light hidden sm:block">Tu opinión ayuda a mantener la excelencia.</p>
                  </div>
                  <button
                      onClick={handleCalificarClick}
                      className="px-5 py-2.5 rounded-xl bg-[#E9CE3F] hover:bg-[#B59B27] text-[#121212] font-bold text-xs shadow-lg transition-all hover:-translate-y-0.5 whitespace-nowrap flex items-center gap-1.5 uppercase tracking-wider font-cinzel"
                  >
                      <Star size={14} className="fill-[#121212]" /> Calificar
                  </button>
                  <button
                      onClick={handleCerrarPanelCalificacion}
                      className="p-2 text-gray-500 hover:text-red-400 bg-[#1a1a1a] hover:bg-[#222] rounded-full transition-colors"
                  >
                      <X size={18} />
                  </button>
              </div>
          </div>
      )}

      {/* --- MODAL QR --- */}
      {mostrarQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm transition-opacity" onClick={toggleQR}>
            <div className="relative bg-[#1a1a1a] border border-[#E9CE3F]/30 p-8 rounded-3xl flex flex-col items-center z-10 shadow-2xl animate-in fade-in zoom-in duration-300 font-cinzel" onClick={(e) => e.stopPropagation()}>
                <p className="text-[#E9CE3F] text-[0.6rem] uppercase tracking-widest mb-6 font-bold">Código QR Profesional</p>
                <div className="bg-white p-3 rounded-xl shadow-inner border-2 border-[#121212]">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.href)}&color=121212&bgcolor=FFFFFF`} 
                      alt="Código QR" 
                      className="w-48 h-48 md:w-52 md:h-52 object-contain" 
                    />
                </div>
                <button onClick={toggleQR} className="mt-6 text-gray-500 hover:text-[#E9CE3F] text-[0.6rem] uppercase tracking-widest transition-colors">Cerrar</button>
            </div>
        </div>
      )}

    </div>
  );
}

export default PlantillaAbogado;