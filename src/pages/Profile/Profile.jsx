import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import useSEO from '../../hooks/useSEO';
import AuthModal from '../../components/AuthModal';

// ==========================================
// 📥 IMPORTACIÓN DE PLANTILLAS
// ==========================================
import PlantillaGenerica from '../../plantillas/PlantillaGenerica';
import PlantillaInmobiliaria from '../../plantillas/PlantillaInmobiliaria';
import PlantillaAbogado from '../../plantillas/PlantillaAbogado';

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
        const res = await fetch(`${API_URL}/businesses/${slug}`);
        
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
  // 👁️ REGISTRO AUTOMÁTICO DE VISITA
  // ==========================================
  const registrarVisitaPerfil = async (slug, token) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${API_URL}/businesses/${slug}/interaccion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Obligatorio para evitar error 401
        },
        body: JSON.stringify({ platform: "Visita Perfil" })
      });
      if (!response.ok) {
        throw new Error(`Error registrando visita: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al registrar interacción en el perfil:", error);
    }
  };

  useEffect(() => {
    if (profesional && isLoggedIn) {
      const token = localStorage.getItem('spingamma_token');
      if (token && profesional.slug) {
        registrarVisitaPerfil(profesional.slug, token);
      }
    }
  }, [profesional, isLoggedIn]);

  // ==========================================
  // 🔍 SEO DINÁMICO Y STRUCTURED DATA (JSON-LD)
  // ==========================================
  const jsonLdData = useMemo(() => {
    if (!profesional) return null;
    const schema = {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "name": profesional.name,
      "description": profesional.description || `${profesional.name}, ${profesional.title}`,
      "url": `https://tarjetoso.com/perfil/${profesional.slug}`,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": profesional.neighborhood,
        "addressRegion": profesional.state,
        "addressCountry": profesional.country || "Bolivia"
      },
      "sameAs": [profesional.facebook, profesional.instagram, profesional.linkedin, profesional.website, profesional.tiktok, profesional.github].filter(Boolean)
    };
    if (profesional.image) schema.image = profesional.image;
    if (profesional.phone) schema.telephone = profesional.phone;
    if (profesional.reviews_count > 0) {
      schema.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": profesional.rating,
        "reviewCount": profesional.reviews_count,
        "bestRating": 5,
        "worstRating": 1
      };
    }
    return schema;
  }, [profesional]);

  useSEO({
    title: profesional ? `${profesional.name} - ${profesional.title} | Tarjetoso` : 'Tarjetoso | Directorio Profesional',
    description: profesional ? (profesional.description || `${profesional.name}, ${profesional.title} en ${profesional.category}`).slice(0, 160) : 'Directorio de tarjetas digitales profesionales de Bolivia.',
    url: profesional ? `https://tarjetoso.com/perfil/${profesional.slug}` : null,
    image: profesional?.image || null,
    type: 'profile',
    jsonLd: jsonLdData
  });

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

  // Lógica para determinar la plantilla automáticamente
  const normalizeText = (text) => text ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';
  const esPremium = profesional?.premium === true;
  
  let tipoPlantilla = 'generica';
  if (esPremium) {
    const cat = normalizeText(profesional.category || '');
    if (cat.includes('abogad') || cat.includes('legal') || cat.includes('derecho')) {
      tipoPlantilla = 'abogado';
    } else if (cat.includes('inmo') || cat.includes('casa') || cat.includes('propied')) {
      tipoPlantilla = 'inmobiliaria';
    }
  }

  return (
    <>
      {/* RENDERIZADO DE PLANTILLAS */}
      {tipoPlantilla === 'inmobiliaria' ? (
        <PlantillaInmobiliaria 
          profesional={profesional} 
          volverAtras={volverAtras} 
          onProtectedAction={handleProtectedAction} 
        />
      ) : tipoPlantilla === 'abogado' ? (
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