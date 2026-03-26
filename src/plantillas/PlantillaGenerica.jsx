import { useState } from 'react';
import { 
  ArrowLeft, Share2, QrCode, MapPin, Phone, MessageCircle, 
  Facebook, Instagram, Linkedin, Globe, Github, X, CheckCircle2, Star
} from 'lucide-react';

export default function PlantillaGenerica({ profesional, volverAtras, onProtectedAction }) {
  const [showQR, setShowQR] = useState(false);

  // 🧹 LIMPIEZA Y FORMATEO DE ENLACES
  const cleanPhone = profesional.phone?.replace(/[^0-9]/g, '');
  const cleanWa = profesional.whatsapp?.replace(/[^0-9]/g, '');
  
  const links = {
    phone: cleanPhone ? `tel:${cleanPhone}` : null,
    whatsapp: cleanWa ? `https://wa.me/${cleanWa}` : null,
    facebook: profesional.facebook,
    instagram: profesional.instagram,
    linkedin: profesional.linkedin,
    website: profesional.website,
    github: profesional.github,
    tiktok: profesional.tiktok,
    ubicacion: profesional.ubicacion_url
  };

  // 🚀 COMPARTIR NATIVO (NO REQUIERE LOGIN)
  const handleShare = async () => {
    const shareData = {
      title: `${profesional.name} - ${profesional.title}`,
      text: `Conoce el perfil profesional de ${profesional.name} en SpinGamma.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Enlace copiado al portapapeles');
      }
    } catch (err) {
      console.error('Error al compartir:', err);
    }
  };

  // 🔗 COMPONENTE DE BOTÓN SOCIAL PROTEGIDO
  const SocialButton = ({ icon: Icon, label, url, colorClass }) => {
    if (!url) return null;
    return (
      <button 
        onClick={() => onProtectedAction(url)}
        className={`flex flex-col items-center justify-center p-4 bg-[#1A3345] border border-[#32698F]/50 rounded-2xl hover:border-[#F67927] transition-all group shadow-sm hover:shadow-md hover:-translate-y-1 ${colorClass}`}
      >
        <Icon size={28} className="mb-2 transition-transform group-hover:scale-110" />
        <span className="text-xs font-semibold text-[#E6E2DF] group-hover:text-white">{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#1E3D51] text-white pb-20 font-sans antialiased selection:bg-[#F67927] selection:text-white relative">
      
      {/* 🖼️ HEADER Y FOTO DE PORTADA */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-br from-[#152a38] to-[#32698F] overflow-hidden">
        {/* Patrón de fondo sutil */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay"></div>
        
        {/* Barra superior de controles */}
        <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-center z-10">
          <button 
            onClick={volverAtras} 
            className="w-10 h-10 bg-[#1A3345]/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-[#F67927] border border-white/10 transition-colors shadow-lg"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowQR(true)} 
              className="w-10 h-10 bg-[#1A3345]/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-[#F67927] border border-white/10 transition-colors shadow-lg"
            >
              <QrCode size={18} className="text-white" />
            </button>
            <button 
              onClick={handleShare} 
              className="w-10 h-10 bg-[#1A3345]/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-[#F67927] border border-white/10 transition-colors shadow-lg"
            >
              <Share2 size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* 🧑‍💼 INFO PRINCIPAL DEL PERFIL */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-16 relative z-20">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 mb-6">
          <div className="relative">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-[#1E3D51] overflow-hidden bg-[#152a38] shadow-2xl">
              <img 
                src={profesional.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profesional.name)}&background=152a38&color=FFFFFF&size=256`} 
                onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profesional.name)}&background=152a38&color=FFFFFF&size=256`; }}
                alt={profesional.name} 
                className="w-full h-full object-cover"
              />
            </div>
            {profesional.verified && (
              <div className="absolute bottom-2 right-2 bg-white rounded-full p-0.5 shadow-lg border-2 border-[#1E3D51]">
                <CheckCircle2 size={24} className="text-[#F67927] fill-white" />
              </div>
            )}
          </div>
          
          <div className="text-center sm:text-left flex-1 pb-2">
            <div className="inline-block bg-[#F67927]/20 text-[#F67927] px-3 py-1 rounded-full text-xs font-bold mb-2 border border-[#F67927]/30">
              {profesional.category}
            </div>
            <h1 className="text-3xl font-extrabold text-white leading-tight mb-1">{profesional.name}</h1>
            <h2 className="text-[#E6E2DF] text-lg font-medium">{profesional.title}</h2>
          </div>
        </div>

        {/* 🌟 ESTADÍSTICAS Y UBICACIÓN */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-3 mb-8">
          {profesional.reviews_count > 0 && (
            <div className="flex items-center gap-1.5 bg-[#1A3345] px-4 py-2 rounded-xl border border-[#32698F]/50">
              <Star size={18} className="text-[#F67927] fill-[#F67927]" />
              <span className="font-bold text-white">{profesional.rating}</span>
              <span className="text-sm text-[#E6E2DF]">({profesional.reviews_count} reseñas)</span>
            </div>
          )}
          {profesional.location && (
            <div className="flex items-center gap-1.5 bg-[#1A3345] px-4 py-2 rounded-xl border border-[#32698F]/50 text-[#E6E2DF]">
              <MapPin size={18} className="text-[#F67927]" />
              <span className="text-sm font-medium">{profesional.location}</span>
            </div>
          )}
        </div>

        {/* 📝 ACERCA DE */}
        {profesional.description && (
          <div className="bg-[#1A3345] rounded-3xl p-6 mb-8 border border-[#32698F]/30 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#F67927] rounded-full"></span> Acerca de mí
            </h3>
            <p className="text-[#E6E2DF] leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
              {profesional.description}
            </p>
          </div>
        )}

        {/* 📱 REDES DE CONTACTO */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-white mb-4 ml-2">Contactar y Redes Sociales</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <SocialButton icon={MessageCircle} label="WhatsApp" url={links.whatsapp} colorClass="text-green-400" />
            <SocialButton icon={Phone} label="Llamar" url={links.phone} colorClass="text-blue-400" />
            <SocialButton icon={MapPin} label="Ubicación" url={links.ubicacion} colorClass="text-red-400" />
            <SocialButton icon={Globe} label="Sitio Web" url={links.website} colorClass="text-purple-400" />
            <SocialButton icon={Facebook} label="Facebook" url={links.facebook} colorClass="text-blue-500" />
            <SocialButton icon={Instagram} label="Instagram" url={links.instagram} colorClass="text-pink-500" />
            <SocialButton icon={Linkedin} label="LinkedIn" url={links.linkedin} colorClass="text-sky-500" />
            <SocialButton icon={Github} label="GitHub" url={links.github} colorClass="text-gray-300" />
          </div>
        </div>

      </div>

      {/* ==========================================
          MODAL DE CÓDIGO QR (NO PROTEGIDO)
          ========================================== */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#152a38]/90 backdrop-blur-sm transition-opacity">
          <div className="bg-[#1E3D51] border border-[#32698F] rounded-3xl shadow-2xl max-w-sm w-full p-8 relative animate-in zoom-in duration-300 flex flex-col items-center">
            <button 
              onClick={() => setShowQR(false)} 
              className="absolute top-4 right-4 text-[#E6E2DF] hover:text-white transition-colors p-2 bg-[#32698F] rounded-full hover:bg-[#F67927]"
            >
              <X size={20} />
            </button>
            <div className="w-12 h-12 bg-[#F67927]/20 rounded-full flex items-center justify-center mb-4">
              <QrCode size={24} className="text-[#F67927]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1 text-center">Compartir Perfil</h3>
            <p className="text-[#E6E2DF] text-sm mb-6 text-center">Escanea este código para ver mi tarjeta digital en cualquier dispositivo.</p>
            
            <div className="bg-white p-4 rounded-2xl shadow-inner border-4 border-[#32698F]">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.href)}&color=152a38`} 
                alt="QR Code" 
                className="w-48 h-48"
              />
            </div>
            
            <button 
              onClick={handleShare}
              className="mt-8 w-full bg-[#32698F] hover:bg-[#F67927] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Share2 size={18} /> Enviar enlace en su lugar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}