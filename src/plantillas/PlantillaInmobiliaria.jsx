// src/plantillas/PlantillaInmobiliaria.jsx
import React, { useEffect, useState } from 'react';

function PlantillaInmobiliaria({ profesional, volverAtras }) {
  const [loaded, setLoaded] = useState(false);
  const [mostrarQR, setMostrarQR] = useState(false);

  // Simulador del Loader
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const toggleQR = () => setMostrarQR(!mostrarQR);

  // Asegúrate de que los datos existen antes de renderizar
  if (!profesional) return null;

  return (
    // Agregué h-screen para asegurar que ocupe todo el alto
    <div className="h-screen w-full flex items-center justify-center p-3 sm:p-4 relative overflow-hidden bg-[#11181A] font-sans text-white">
      
      {/* --- ESTILOS INYECTADOS (Los keyframes y animaciones específicas de esta plantilla) --- */}
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
        
        /* Animaciones */
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
      <div className={`relative z-10 w-full max-w-[420px] h-[95vh] sm:h-full max-h-[850px] glass-panel-dark rounded-[2.5rem] p-6 sm:p-8 flex flex-col items-center overflow-y-auto hide-scroll font-montserrat transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
        
        {/* BOTON ATRÁS (Añadido para navegación en React) */}
        <button onClick={volverAtras} className="absolute top-6 left-6 flex items-center justify-center bg-white/5 border border-white/10 hover:bg-[#425C63] rounded-full p-2 transition-all text-gray-300 hover:text-white z-20">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>

        {/* Botones Superiores (QR, Compartir) */}
        <div className="absolute top-6 right-6 flex gap-3 z-20">
            <button onClick={toggleQR} className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 hover:bg-[#425C63] rounded-full transition-all text-gray-300 hover:text-white backdrop-blur-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
            </button>
        </div>

        {/* FOTO DE PERFIL */}
        <div className="relative flex-shrink-0 mt-14 mb-6">
            <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full p-[2px] bg-gradient-to-br from-[#425C63] via-[#C8A721]/50 to-[#425C63] flex items-center justify-center shadow-[0_0_30px_rgba(66,92,99,0.5)]">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#11181A] border-[4px] border-[#1A2629]">
                    <img src={profesional.image || '/default-avatar.png'} alt={profesional.name} className="w-full h-full object-cover" />
                </div>
            </div>
        </div>

        {/* TEXTOS (Conectados a la BD) */}
        <div className="text-center w-full mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-md">{profesional.name}</h1>
            <p className="text-[0.7rem] font-bold tracking-[0.25em] text-[#C8A721] mt-3 uppercase">{profesional.title}</p>
            <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-[#425C63] to-transparent mx-auto mt-4 mb-4 opacity-70"></div>
            <p className="text-gray-300 text-[0.85rem] mt-3 leading-relaxed whitespace-pre-line px-2 font-light">{profesional.description}</p>
        </div>

        {/* BOTONES REDES (Conditional Rendering) */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 w-full mt-2">
            
            {profesional.phone && (
              <a href={`tel:${profesional.phone}`} className="group flex flex-col items-center justify-center w-[30%] min-w-[90px] aspect-square bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-[#425C63] rounded-2xl transition-all shadow-lg hover:-translate-y-1">
                  <div className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 group-hover:bg-[#425C63] text-gray-200 group-hover:text-white transition-all mb-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  </div>
                  <span className="font-semibold text-[0.6rem] text-gray-300 group-hover:text-white uppercase tracking-wider">Llamar</span>
              </a>
            )}

            {profesional.whatsapp && (
              <a href={`https://wa.me/${profesional.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="group flex flex-col items-center justify-center w-[30%] min-w-[90px] aspect-square bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-[#25D366] rounded-2xl transition-all shadow-lg hover:-translate-y-1">
                  <div className="w-11 h-11 flex items-center justify-center rounded-full bg-[#25D366]/20 group-hover:bg-[#25D366] text-[#25D366] group-hover:text-white transition-all mb-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.39 0 .004 5.385.004 12.025c0 2.126.552 4.195 1.6 6.01L.067 23.99l6.103-1.601c1.748.951 3.733 1.453 5.86 1.453 6.638 0 12.025-5.385 12.025-12.025S18.669 0 12.031 0zm0 19.957c-1.793 0-3.548-.482-5.088-1.395l-.364-.216-3.778.991.999-3.684-.236-.376c-1.002-1.597-1.531-3.444-1.531-5.341 0-5.548 4.515-10.063 10.063-10.063 5.547 0 10.062 4.515 10.062 10.063 0 5.548-4.515 10.063-10.062 10.063z"/></svg>
                  </div>
                  <span className="font-semibold text-[0.6rem] text-gray-300 group-hover:text-white uppercase tracking-wider">WhatsApp</span>
              </a>
            )}

            {profesional.ubicacion_url && (
              <a href={profesional.ubicacion_url} target="_blank" rel="noreferrer" className="group flex flex-col items-center justify-center w-[30%] min-w-[90px] aspect-square bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-[#C8A721] rounded-2xl transition-all shadow-lg hover:-translate-y-1">
                  <div className="w-11 h-11 flex items-center justify-center rounded-full bg-[#C8A721]/20 group-hover:bg-[#C8A721] text-[#C8A721] group-hover:text-[#11181A] transition-all mb-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z"></path></svg>
                  </div>
                  <span className="font-semibold text-[0.6rem] text-gray-300 group-hover:text-white uppercase tracking-wider">Ubicación</span>
              </a>
            )}
            
        </div>
        
        <p className="block text-[0.60rem] tracking-[0.25em] font-medium uppercase text-gray-500 mt-10 pb-2 text-center w-full">
            © 2026 SPINGAMMA
        </p>
      </div>

      {/* --- MODAL QR --- */}
      {mostrarQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-[#11181A]/90 backdrop-blur-md" onClick={toggleQR}></div>
            <div className="relative bg-gradient-to-b from-[#1A2629] to-[#11181A] border border-[#425C63]/30 p-8 rounded-[2rem] flex flex-col items-center z-10">
                <button onClick={toggleQR} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 p-2 rounded-full">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <p className="text-[#C8A721] text-[0.65rem] uppercase tracking-[0.25em] mb-6 font-bold">Código QR</p>
                <div className="bg-white p-3 rounded-2xl">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.href)}&color=11181A&bgcolor=FFFFFF`} alt="QR" className="w-48 h-48" />
                </div>
            </div>
        </div>
      )}

    </div>
  );
}

export default PlantillaInmobiliaria;