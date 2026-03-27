import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { UserPlus, X } from 'lucide-react';

// ==========================================
// 📥 IMPORTACIÓN DE PLANTILLAS
// ==========================================
import PlantillaGenerica from './plantillas/PlantillaGenerica';
import PlantillaInmobiliaria from './plantillas/PlantillaInmobiliaria';
import PlantillaAbogado from './plantillas/PlantillaAbogado';

function Perfil() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [profesional, setProfesional] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensajeCarga, setMensajeCarga] = useState("Cargando perfil...");

  // ==========================================
  // 🔒 ESTADO DE AUTENTICACIÓN Y MODAL
  // ==========================================
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('spingamma_user') !== null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', celular: '' });

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    let isMounted = true;

    const obtenerPerfil = async (intentos = 0) => {
      try {
        const res = await fetch(`${API_URL}/profesionales/${slug}`);
        
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setProfesional(data);
            setCargando(false);
          }
        } else if (res.status === 404 || res.status === 403) {
          if (isMounted) {
            setProfesional(null);
            setCargando(false);
          }
        } else {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
      } catch (err) {
        console.warn(`Intento ${intentos + 1} fallido. El servidor backend podría estar despertando...`, err);
        
        if (intentos < 10 && isMounted) {
          if (intentos === 1) setMensajeCarga("Conectando al servidor seguro, por favor espera...");
          if (intentos === 3) setMensajeCarga("Preparando la tarjeta digital...");
          if (intentos === 6) setMensajeCarga("Casi listo, el servidor está iniciando...");
          
          setTimeout(() => obtenerPerfil(intentos + 1), 3500);
        } else if (isMounted) {
          console.error("Error definitivo cargando perfil:", err);
          setCargando(false);
        }
      }
    };

    obtenerPerfil();

    return () => {
      isMounted = false;
    };
  }, [slug, API_URL]);

  // ==========================================
  // 🛡️ MANEJADOR DE ENLACES PROTEGIDOS
  // ==========================================
  const handleProtectedAction = (url) => {
    if (!url) return;
    
    if (isLoggedIn) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      setPendingUrl(url);
      setAuthModalOpen(true);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (formData.nombre.trim() && formData.celular.trim()) {
      localStorage.setItem('spingamma_user', JSON.stringify(formData));
      setIsLoggedIn(true);
      setAuthModalOpen(false);
      
      if (pendingUrl) {
        window.open(pendingUrl, '_blank', 'noopener,noreferrer');
        setPendingUrl(null);
      }
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#1E3D51] flex flex-col items-center justify-center px-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#F67927] mb-6 shadow-lg"></div>
        <p className="text-white font-bold text-lg mb-2">{mensajeCarga}</p>
        <p className="text-[#E6E2DF] text-sm animate-pulse">Asegurando la mejor experiencia...</p>
      </div>
    );
  }

  if (!profesional) {
    return (
      <div className="min-h-screen bg-[#1E3D51] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-[#32698F] rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#F67927] shadow-inner text-4xl">
          🔍
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Perfil no encontrado o inactivo</h2>
        <p className="text-[#E6E2DF] mb-8 max-w-md">El profesional que buscas no existe en nuestra base de datos o su plan de suscripción ha expirado.</p>
        <button 
          onClick={() => navigate("/")} 
          className="bg-[#F67927] hover:bg-[#e06516] text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg hover:-translate-y-1"
        >
          Explorar Directorio
        </button>
      </div>
    );
  }

  const volverAtras = () => navigate("/");

  return (
    <>
      {/* RENDERIZADO DE PLANTILLAS */}
      {slug === 'inmobiliaria-san-luis' ? (
        <PlantillaInmobiliaria 
          profesional={profesional} 
          volverAtras={volverAtras} 
          onProtectedAction={handleProtectedAction} 
        />
      ) : slug === 'juan-pablo-jurado-morales' ? (
        <PlantillaAbogado 
          profesional={profesional} 
          volverAtras={volverAtras} 
          onProtectedAction={handleProtectedAction} 
        />
      ) : (
        <PlantillaGenerica 
          profesional={profesional} 
          volverAtras={volverAtras} 
          onProtectedAction={handleProtectedAction} 
        />
      )}

      {/* ==========================================
          MODAL DE REGISTRO INTERNO
          ========================================== */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#152a38]/90 backdrop-blur-sm transition-opacity">
          <div className="bg-[#1E3D51] border border-[#32698F] rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setAuthModalOpen(false)} 
              className="absolute top-5 right-5 text-[#E6E2DF] hover:text-white transition-colors p-2 bg-[#32698F] rounded-full hover:bg-[#F67927]"
            >
              <X size={20} />
            </button>
            <div className="text-center mb-6 mt-2">
              <div className="w-20 h-20 bg-[#32698F] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#F67927] shadow-inner">
                <UserPlus size={36} className="text-[#F67927]" />
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-2">Comunidad Segura</h2>
              <p className="text-[#E6E2DF] text-sm px-2">Para contactar al profesional y evitar spam, regístrate gratis en 10 segundos.</p>
            </div>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#F67927] uppercase tracking-wide mb-1">Nombre Completo</label>
                <input 
                  required 
                  type="text" 
                  placeholder="Ej. Ana Pérez" 
                  value={formData.nombre} 
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
                  className="w-full bg-[#32698F] border border-[#32698F] text-white px-4 py-3 rounded-xl outline-none focus:border-[#F67927] focus:ring-1 focus:ring-[#F67927] placeholder-[#E6E2DF]/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#F67927] uppercase tracking-wide mb-1">Celular / WhatsApp</label>
                <input 
                  required 
                  type="tel" 
                  placeholder="Ej. 71234567" 
                  value={formData.celular} 
                  onChange={(e) => setFormData({...formData, celular: e.target.value})} 
                  className="w-full bg-[#32698F] border border-[#32698F] text-white px-4 py-3 rounded-xl outline-none focus:border-[#F67927] focus:ring-1 focus:ring-[#F67927] placeholder-[#E6E2DF]/50 transition-all"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-[#F67927] hover:bg-[#e06516] text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg hover:-translate-y-0.5 mt-4"
              >
                Continuar y Contactar
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Perfil;