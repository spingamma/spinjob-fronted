import React from 'react';

// Sub-componente de Botón Circular (Estilo Minimalista)
const BotonCircularAccion = ({ icon, label, url }) => {
  if (!url) return null;

  return (
    <a 
      href={url} 
      target="_blank" rel="noreferrer" 
      className="group flex flex-col items-center justify-center p-2 text-center transition hover:-translate-y-1 w-[90px]"
    >
      {/* Círculos siempre oscuros/negros para mantener la elegancia de las referencias */}
      <div 
        className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-full bg-[#1A1A1A] text-white shadow-lg transition duration-300 group-hover:scale-105"
      >
        {icon}
      </div>
      <span className="mt-4 block font-medium text-xs md:text-sm text-gray-900 font-serif group-hover:opacity-70 transition">
        {label}
      </span>
    </a>
  );
};

function PlantillaGenerica({ profesional, volverAtras }) {
  if (!profesional) return null;

  // ==========================================
  // 🧠 LÓGICA INTELIGENTE DE GÉNERO Y COLOR
  // ==========================================
  
  // 1. Detectar el género (Asume 'hombre' si la BD no lo especifica aún)
  const genero = profesional.genero ? profesional.genero.toLowerCase() : 'hombre';

  // 2. Colores por defecto súper elegantes
  const colorDama = '#9B4F69'; // Un rosa viejo / burdeos (Estilo Ana Luisa)
  const colorCaballero = '#1E3A8A'; // Azul marino profundo (Estilo Alejandro)

  // 3. Decisión de color: Usa el de la BD, o el del género si no hay BD
  const colorTema = profesional.color_principal || (genero === 'mujer' ? colorDama : colorCaballero);

  // 4. Placeholder Inteligente (Por si el link de Cloudinary está roto, como el de Ronald)
  const colorFondoAvatar = genero === 'mujer' ? 'fbcfe8' : 'bfdbfe'; // Fondo rosita o celestito
  const colorTextoAvatar = genero === 'mujer' ? '9d174d' : '1e3a8a';
  const imgFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(profesional.name)}&background=${colorFondoAvatar}&color=${colorTextoAvatar}&size=256`;

  // Iconos
  const icons = {
    call: <svg className="h-9 w-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>,
    whatsapp: <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.39 0 .004 5.385.004 12.025c0 2.126.552 4.195 1.6 6.01L.067 23.99l6.103-1.601c1.748.951 3.733 1.453 5.86 1.453 6.638 0 12.025-5.385 12.025-12.025S18.669 0 12.031 0zm0 19.957c-1.793 0-3.548-.482-5.088-1.395l-.364-.216-3.778.991.999-3.684-.236-.376c-1.002-1.597-1.531-3.444-1.531-5.341 0-5.548 4.515-10.063 10.063-10.063 5.547 0 10.062 4.515 10.062 10.063 0 5.548-4.515 10.063-10.062 10.063zm5.525-7.555c-.303-.152-1.794-.886-2.072-.988-.278-.102-.482-.152-.685.152-.204.303-.785.988-.962 1.19-.178.203-.355.228-.659.076-.303-.152-1.282-.473-2.44-1.512-.903-.81-1.511-1.812-1.689-2.116-.178-.304-.019-.468.133-.62.137-.137.303-.356.455-.534.152-.178.203-.304.304-.507.102-.203.051-.38-.025-.533-.076-.152-.685-1.65-.938-2.261-.247-.594-.496-.513-.685-.523-.178-.009-.381-.01-.584-.01s-.532.076-.811.38c-.279.304-1.064 1.04-1.064 2.535 0 1.495 1.089 2.94 1.241 3.143.152.203 2.144 3.275 5.196 4.593.726.314 1.292.502 1.734.643.728.232 1.391.199 1.916.12.585-.088 1.794-.733 2.047-1.442.253-.71.253-1.318.178-1.443-.076-.126-.279-.202-.584-.354z"/></svg>,
    map: <svg className="h-9 w-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>,
    facebook: <svg className="h-9 w-9" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
  };

  const cleanWhatsapp = profesional.whatsapp ? profesional.whatsapp.replace(/[^0-9]/g, '') : null;

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col items-center py-6 px-4 antialiased selection:bg-gray-200">
      
      {/* Header */}
      <header className="w-full max-w-lg mx-auto flex items-center justify-start mb-10">
        <button onClick={volverAtras} className="font-medium text-sm text-gray-500 flex items-center gap-2 hover:opacity-70 transition p-2">
          ← Volver
        </button>
      </header>

      <main className="w-full max-w-lg flex flex-col items-center">
        
        {/* FOTO DE PERFIL (Con Fallback si Cloudinary falla) */}
        <div className="relative flex-shrink-0 mb-8">
          <div className="w-32 h-32 md:w-36 md:h-36 rounded-full p-[3px] bg-white border border-gray-200 flex items-center justify-center shadow-md mx-auto">
            <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 border-[2px] border-white">
              {/* onError cambia la imagen rota por las iniciales del profesional automáticamente */}
              <img 
                src={profesional.image || imgFallback} 
                onError={(e) => { e.target.onerror = null; e.target.src = imgFallback; }}
                alt={profesional.name} 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </div>

        {/* TEXTOS (Nombre con color Dinámico) */}
        <div className="text-center w-full mb-12 px-2">
          <h1 
            style={{ color: colorTema }} // 🎨 APLICA EL COLOR (Azul o Rosa)
            className="text-2xl md:text-3xl font-serif font-bold uppercase tracking-widest mb-2"
          >
            {profesional.name}
          </h1>
          <h2 className="text-sm md:text-base font-medium text-gray-600 mb-6">
            {profesional.title}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line max-w-sm mx-auto">
            {profesional.description}
          </p>
        </div>

        {/* CUADRÍCULA DE BOTONES (Iconos Negros Elegantes) */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-8 w-full max-w-[280px] mx-auto mb-16">
          {profesional.phone && <BotonCircularAccion icon={icons.call} label="Llamada" url={`tel:${profesional.phone}`} />}
          {profesional.whatsapp && <BotonCircularAccion icon={icons.whatsapp} label="WhatsApp" url={`https://wa.me/${cleanWhatsapp}`} />}
          {profesional.facebook && <BotonCircularAccion icon={icons.facebook} label="Facebook" url={profesional.facebook} />}
          {profesional.ubicacion_url && <BotonCircularAccion icon={icons.map} label="Ubicación" url={profesional.ubicacion_url} />}
        </div>

        {/* FOOTER */}
        <footer className="w-full text-center py-6 mt-auto">
          <p className="text-[0.65rem] font-serif text-gray-800 font-medium tracking-widest uppercase">
            Powered by Spin Gamma
          </p>
        </footer>

      </main>
    </div>
  );
}

export default PlantillaGenerica;