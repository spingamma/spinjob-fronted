import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SeoMeta from '../../components/SeoMeta';
import AuthModal from '../../components/AuthModal';
import fetchAuth from '../../utils/fetchAuth';

// ==========================================
// 📥 IMPORTACIÓN DE PLANTILLAS
// ==========================================
import PlantillaGenerica from '../../plantillas/PlantillaGenerica';
import { API_URL } from '../../config/api';

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
  const userObj = (() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try { return JSON.parse(stored); } catch { return null; }
    }
    return null;
  })();
  const isAdmin = userObj?.is_admin === true;
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState(null);


  useEffect(() => {
    let isMounted = true;

    async function obtenerPerfil(intentos = 0) {
      try {
        const targetSlug = slug?.toLowerCase() === 'tarjetoso' ? 'spingamma' : slug;
        const response = await fetchAuth(`${API_URL}/businesses/${targetSlug}`);

        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setProfesional(data);
            setCargando(false);
          }
        } else if (response.status === 404 || response.status === 403) {
          if (isMounted) {
            setProfesional(null);
            setCargando(false);
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        if (error.message === 'SESSION_EXPIRED') {
          return;
        }
        console.warn(`Intento ${intentos + 1} fallido. El servidor backend podría estar despertando...`, error);

        if (intentos < 10 && isMounted) {
          if (intentos === 1) setMensajeCarga("Conectando al servidor seguro, por favor espera...");
          if (intentos === 3) setMensajeCarga("Preparando la tarjeta digital...");
          if (intentos === 6) setMensajeCarga("Casi listo, el servidor está iniciando...");

          setTimeout(() => obtenerPerfil(intentos + 1), 3500);
        } else if (isMounted) {
          console.error("Error definitivo cargando perfil:", error);
          setCargando(false);
        }
      }
    }

    obtenerPerfil();

    return () => {
      isMounted = false;
    };
  }, [slug, API_URL]);

  // ==========================================
  // 👁️ REGISTRO AUTOMÁTICO DE VISITA
  // ==========================================
  const registrarVisitaPerfil = async (slug) => {
    try {
      const response = await fetchAuth(`${API_URL}/businesses/${slug}/interaccion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ platform: "Visita Perfil" })
      });
      if (!response.ok) {
        throw new Error(`Error registrando visita: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      if (error.message !== 'SESSION_EXPIRED') {
        console.error("Error al registrar interacción en el perfil:", error);
      }
    }
  };

  useEffect(() => {
    if (profesional && isLoggedIn && !isAdmin) {
      if (profesional.slug) {
        registrarVisitaPerfil(profesional.slug);
      }
    }
  }, [profesional, isLoggedIn, isAdmin]);

  // ==========================================
  // 🔍 SEO DINÁMICO Y STRUCTURED DATA (JSON-LD)
  // ==========================================
  // El backend ahora envía `json_ld` y `canonical_url` listos para usar
  const jsonLdData = profesional?.json_ld || null;

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
      <div className="min-h-screen bg-[#1A535C] flex flex-col items-center justify-center px-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#F9842C] mb-6 shadow-lg"></div>
        <p className="text-white font-bold text-lg mb-2">{mensajeCarga}</p>
        <p className="text-[#E6E2DF] text-sm animate-pulse">Asegurando la mejor experiencia...</p>
      </div>
    );
  }

  if (!profesional) {
    return (
      <div className="min-h-screen bg-[#1A535C] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-[#32698F] rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#F9842C] shadow-inner text-4xl">
          🔍
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Perfil no encontrado o inactivo</h2>
        <p className="text-[#E6E2DF] mb-8 max-w-md">El profesional que buscas no existe en nuestra base de datos o su plan de suscripción ha expirado.</p>
        <button
          onClick={() => navigate("/")}
          className="bg-[#F9842C] hover:bg-[#e06516] text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg hover:-translate-y-1"
        >
          Explorar Directorio
        </button>
      </div>
    );
  }

  const volverAtras = () => navigate("/");

  // ==========================================
  // 🔄 REFRESH DEL PERFIL (LUEGO DE EDITAR)
  // ==========================================
  const handleUpdate = () => {
    // Para recargar los datos

    const targetSlug = slug?.toLowerCase() === 'tarjetoso' ? 'spingamma' : slug;
    fetchAuth(`${API_URL}/businesses/${targetSlug}`)
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (data) setProfesional(data);
      })
      .catch(error => {
        if (error.message !== 'SESSION_EXPIRED') {
          console.error("Error refreshing profile", error);
        }
      });
  };

  return (
    <>
      {profesional && (
        <SeoMeta 
          title={`${profesional.name} - ${profesional.title || profesional.category || 'Servicios'}${profesional.state ? ` en ${profesional.state}` : ''}`}
          description={(profesional.description || `${profesional.name}, ${profesional.title || 'profesional'} en ${profesional.category || 'Bolivia'}. Contacta directamente en Tarjetoso.`).slice(0, 160)}
          url={profesional.canonical_url || `https://tarjetoso.com/perfil/${profesional.slug}`}
          canonical={profesional.canonical_url || `https://tarjetoso.com/perfil/${profesional.slug}`}
          image={profesional.image || 'https://tarjetoso.com/icon-512.png'}
          type="profile"
          jsonLd={jsonLdData}
        />
      )}
      
      {/* RENDERIZADO DE PLANTILLAS */}
      <PlantillaGenerica
        profesional={profesional}
        volverAtras={volverAtras}
        onProtectedAction={handleProtectedAction}
        onUpdate={handleUpdate}
      />

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