// Archivo: src/pages/Directory/Directory.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import AuthModal from '../../components/AuthModal';
import InstallPrompt from '../../components/InstallPrompt';
import BottomNavbar from '../../components/BottomNavbar';
import DirectoryFilterBar from '../../components/DirectoryFilterBar';
import ProfessionalCard from '../../components/ProfessionalCard';
import { useDirectoryFilters } from '../../hooks/useDirectoryFilters';

export default function Directory() {
  const [profesionales, setProfesionales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensajeCarga, setMensajeCarga] = useState("Cargando directorio Tarjetoso...");
  const navigate = useNavigate();

  // Estados de Autenticación
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('spingamma_user') !== null);
  const [userName, setUserName] = useState(() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try { return JSON.parse(stored).nombre; } catch(e) { return ''; }
    }
    return '';
  });
  
  const [isAdmin, setIsAdmin] = useState(() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try { return JSON.parse(stored).is_admin === true; } catch(e) { return false; }
    }
    return false;
  });
  
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingSlug, setPendingSlug] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Hook para detectar Mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

    const cargarDirectorio = async (intentos = 0) => {
      try {
        const res = await fetch(`${API_URL}/businesses/`);
        if (!res.ok) throw new Error("Error en red");
        
        const data = await res.json();
        if (isMounted) {
          setProfesionales(data);
          setCargando(false);
        }
      } catch (err) {
        if (intentos < 12 && isMounted) {
          if (intentos === 2) setMensajeCarga("Despertando conexión segura...");
          setTimeout(() => cargarDirectorio(intentos + 1), 4000);
        } else if (isMounted) {
          setProfesionales([]);
          setCargando(false);
        }
      }
    };
    cargarDirectorio();
    return () => { isMounted = false; };
  }, []);

  const filterHook = useDirectoryFilters(profesionales);

  const handleLogout = () => {
    localStorage.removeItem('spingamma_user');
    setIsLoggedIn(false);
    setUserName('');
    setIsAdmin(false);
  };

  const handleRegisterSuccess = (formData) => {
    localStorage.setItem('spingamma_user', JSON.stringify(formData));
    setIsLoggedIn(true);
    setUserName(formData.nombre);
    setIsAdmin(formData.is_admin === true);
    setAuthModalOpen(false);
    if (pendingSlug) {
      navigate(`/perfil/${pendingSlug}`);
      setPendingSlug(null);
    }
  };

  const handleCardClick = (slug) => {
    setPendingSlug(slug);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E3D51] font-sans pb-12 antialiased selection:bg-[#B95221] selection:text-white relative">
      
      {/* HEADER GLOBAL */}
      <Header 
        searchTerm={filterHook.states.searchTerm}
        setSearchTerm={filterHook.setters.setSearchTerm}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userName={userName}
        isUserMenuOpen={isUserMenuOpen}
        setIsUserMenuOpen={setIsUserMenuOpen}
        handleLogout={handleLogout}
        setAuthModalOpen={setAuthModalOpen}
        onHomeClick={filterHook.actions.handleCleanFilters}
        isMobile={isMobile}
      />

      {/* BARRA DE FILTROS PREMIUM CUSTOM */}
      <DirectoryFilterBar 
        isMobile={isMobile}
        states={filterHook.states}
        setters={filterHook.setters}
        computed={filterHook.computed}
        actions={filterHook.actions}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {cargando ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#B95221] mb-4"></div>
            <p className="text-[#1E3D51] font-bold text-lg mb-2">{mensajeCarga}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5">
            {filterHook.computed.filteredProfessionals.map((prof) => (
              <ProfessionalCard 
                key={prof.slug}
                professional={prof}
                isLoggedIn={isLoggedIn}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
        )}
      </main>

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onSuccess={handleRegisterSuccess} 
      />
      
      <InstallPrompt />
      
      {/* BARRA DE NAVEGACIÓN MOBILE */}
      <BottomNavbar 
        isLoggedIn={isLoggedIn} 
        isAdmin={isAdmin} 
        onHomeClick={filterHook.actions.handleCleanFilters} 
      />
    </div>
  );
}
