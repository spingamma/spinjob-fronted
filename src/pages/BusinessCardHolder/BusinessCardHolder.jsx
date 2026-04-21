// Archivo: src/pages/BusinessCardHolder/BusinessCardHolder.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookmarkMinus, Eye, Bookmark as BookmarkIcon, Search } from 'lucide-react';
import BottomNavbar from '../../components/BottomNavbar';
import Header from '../../components/Header';
import DirectoryFilterBar from '../../components/DirectoryFilterBar';
import { useDirectoryFilters } from '../../hooks/useDirectoryFilters';

export default function Tarjetero() {
  const [tarjetas, setTarjetas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('spingamma_user') !== null);
  const [isAdmin, setIsAdmin] = useState(() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try { return JSON.parse(stored).is_admin === true; } catch(e) { return false; }
    }
    return false;
  });

  // Hook para detectar Mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchTarjetero = async () => {
    const token = localStorage.getItem('spingamma_token');
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${API_URL}/tarjetero`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Error al cargar tu tarjetero");
      
      const data = await res.json();
      setTarjetas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchTarjetero();
  }, [navigate]);

  const filterHook = useDirectoryFilters(tarjetas);

  const handleLogout = () => {
    localStorage.removeItem('spingamma_user');
    localStorage.removeItem('spingamma_token');
    setIsLoggedIn(false);
    navigate('/');
  };

  const handleQuitarTarjeta = async (slug) => {
    const token = localStorage.getItem('spingamma_token');
    if (!token) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${API_URL}/tarjetero/${slug}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setTarjetas(prev => prev.filter(t => t.slug !== slug));
      }
    } catch (err) {
      console.error("Error quitando tarjeta", err);
    }
  };

  if (cargando) return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#B95221] mb-4"></div>
      <p className="text-[#1E3D51] font-bold text-lg">Cargando tu tarjetero...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans pb-20 antialiased selection:bg-[#B95221] selection:text-white">
      <Header 
        searchTerm={filterHook.states.searchTerm}
        setSearchTerm={filterHook.setters.setSearchTerm}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userName={JSON.parse(localStorage.getItem('spingamma_user') || '{}').nombre || ''}
        isUserMenuOpen={isUserMenuOpen}
        setIsUserMenuOpen={setIsUserMenuOpen}
        handleLogout={handleLogout}
        setAuthModalOpen={() => navigate('/')}
        onHomeClick={filterHook.actions.handleCleanFilters}
        isMobile={isMobile}
      />

      <DirectoryFilterBar 
        isMobile={isMobile}
        states={filterHook.states}
        setters={filterHook.setters}
        computed={filterHook.computed}
        actions={filterHook.actions}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <button onClick={() => navigate(-1)} className="flex items-center text-[#32698F] hover:text-[#B95221] font-bold mb-6 transition-colors group">
          <ArrowLeft size={20} className="mr-2 transition-transform group-hover:-translate-x-1" /> Volver
        </button>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#1E3D51] flex items-center gap-3">
            <div className="p-2.5 bg-[#B95221]/10 rounded-2xl shadow-sm">
               <BookmarkIcon className="text-[#B95221]" size={28} />
            </div>
            Mi Tarjetero
          </h1>
          <span className="bg-white px-4 py-2 rounded-full text-xs font-bold text-[#1E3D51] border border-gray-100 shadow-sm">
            {filterHook.computed.filteredProfessionals.length} {filterHook.computed.filteredProfessionals.length === 1 ? 'Tarjeta' : 'Tarjetas'}
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-8 flex items-center gap-3">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            {error}
          </div>
        )}

        {tarjetas.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <BookmarkIcon size={40} className="text-gray-200" />
            </div>
            <p className="text-[#1E3D51] font-extrabold mb-3 text-xl">Tu tarjetero está vacío</p>
            <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
              Explora el directorio y guarda los perfiles de los profesionales que te interesen para tenerlos siempre a mano.
            </p>
            <Link to="/" className="bg-[#B95221] hover:bg-[#a3481d] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-[#B95221]/20">
              <Search size={20} /> Explorar Directorio
            </Link>
          </div>
        ) : filterHook.computed.filteredProfessionals.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Search size={32} className="text-gray-200" />
            </div>
            <p className="text-[#1E3D51] font-bold mb-2">No encontramos coincidencias</p>
            <p className="text-gray-400 text-sm mb-6">Intenta con otros filtros o términos de búsqueda.</p>
            <button 
              onClick={filterHook.actions.handleCleanFilters}
              className="text-[#B95221] font-bold hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filterHook.computed.filteredProfessionals.map(neg => (
              <div key={neg.slug} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4 transition-all hover:shadow-xl hover:border-[#B95221]/20 relative group">
                
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                    <img 
                      src={neg.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(neg.name)}&background=F8F9FA&color=1E3D51&size=256`} 
                      alt={neg.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(neg.name)}&background=F8F9FA&color=1E3D51&size=256`;
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-[#1E3D51] leading-tight truncate">{neg.name}</h3>
                    <p className="text-[#B95221] text-sm font-bold truncate mt-0.5">{neg.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-50 text-gray-500 border border-gray-100 uppercase tracking-tighter">
                        {neg.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="pt-4 border-t border-gray-50 flex justify-between items-center gap-3 mt-auto">
                  <button 
                    onClick={() => handleQuitarTarjeta(neg.slug)}
                    className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors py-2 px-3 rounded-xl hover:bg-red-50"
                  >
                    <BookmarkMinus size={18} />
                    <span>Quitar</span>
                  </button>

                  <Link 
                    to={`/perfil/${neg.slug}`} 
                    className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-white bg-[#1E3D51] hover:bg-[#32698F] py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    <Eye size={18} /> Ver Perfil
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <BottomNavbar 
        isLoggedIn={isLoggedIn} 
        isAdmin={isAdmin} 
        onHomeClick={filterHook.actions.handleCleanFilters} 
      />
    </div>
  );
}
