import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AuthModal from './components/AuthModal';

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
    if (isLoggedIn) {
      if (!url) return;
      if (url.startsWith('tel:') || url.startsWith('mailto:')) {
        window.location.href = url;
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } else {
      setPendingUrl(url || null);
      setAuthModalOpen(true);
    }
  };

  const handleRegisterSuccess = (formData) => {
    localStorage.setItem('spingamma_user', JSON.stringify(formData));
    setIsLoggedIn(true);
    setAuthModalOpen(false);
    
    if (pendingUrl) {
      if (pendingUrl.startsWith('tel:') || pendingUrl.startsWith('mailto:')) {
        window.location.href = pendingUrl;
      } else {
        window.open(pendingUrl, '_blank', 'noopener,noreferrer');
      }
      setPendingUrl(null);
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
          MODAL DE REGISTRO REUTILIZABLE (TEMA OSCURO)
          ========================================== */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onSuccess={handleRegisterSuccess} 
        isDarkTheme={true} 
      />
    </>
  );
}

export default Perfil;