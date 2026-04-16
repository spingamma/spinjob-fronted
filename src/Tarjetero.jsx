import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookmarkMinus, Eye, Bookmark as BookmarkIcon, Search } from 'lucide-react';
import BottomNavbar from './components/BottomNavbar';
import Header from './components/Header';

export default function Tarjetero() {
  const [tarjetas, setTarjetas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('spingamma_user') !== null);
  const [isAdmin, setIsAdmin] = useState(() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try { return JSON.parse(stored).is_admin === true; } catch(e) { return false; }
    }
    return false;
  });

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

  const handleLogout = () => {
    localStorage.removeItem('spingamma_user');
    localStorage.removeItem('spingamma_token');
    setIsLoggedIn(false);
    navigate('/');
  };

  const handleCleanFilters = () => {
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

  if (cargando) return <div className="text-center py-20 text-[#1E3D51] font-bold">Cargando tu tarjetero...</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans pb-20">
      <Header 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userName={JSON.parse(localStorage.getItem('spingamma_user') || '{}').nombre || ''}
        isUserMenuOpen={isUserMenuOpen}
        setIsUserMenuOpen={setIsUserMenuOpen}
        handleLogout={handleLogout}
        setAuthModalOpen={() => navigate('/')}
        onHomeClick={handleCleanFilters}
        isMobile={window.innerWidth < 768}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        <button onClick={() => navigate(-1)} className="flex items-center text-[#32698F] hover:text-[#1D565D] font-medium mb-6 transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Volver
        </button>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#1E3D51] flex items-center gap-3">
            <div className="p-2 bg-[#1D565D]/10 rounded-xl">
               <BookmarkIcon className="text-[#1D565D]" size={28} />
            </div>
            Mi Tarjetero
          </h1>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div>}

        {tarjetas.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100 flex flex-col items-center">
            <BookmarkIcon size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4 text-lg">Aún no has guardado ninguna tarjeta.</p>
            <p className="text-gray-400 text-sm mb-6 max-w-sm">Explora el directorio y guarda los perfiles de los profesionales que te interesen para tenerlos a mano.</p>
            <Link to="/" className="bg-[#1D565D] hover:bg-[#154045] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-transform hover:-translate-y-0.5">
              <Search size={18} /> Explorar Profesionales
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {tarjetas.map(neg => (
              <div key={neg.slug} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4 transition-all hover:shadow-md relative overflow-hidden group">
                
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                    <img 
                      src={neg.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(neg.name)}&background=1D565D&color=fff`} 
                      alt={neg.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#1E3D51] leading-tight">{neg.name}</h3>
                    <p className="text-[#32698F] text-sm font-medium">{neg.title}</p>
                    <p className="text-gray-400 text-xs mt-1">{neg.category}</p>
                  </div>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center gap-4 mt-auto">
                  <button 
                    onClick={() => handleQuitarTarjeta(neg.slug)}
                    className="flex flex-col items-center justify-center gap-1 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors p-2 -ml-2 rounded-lg hover:bg-red-50"
                    title="Quitar tarjeta"
                  >
                    <BookmarkMinus size={20} />
                    <span>Quitar</span>
                  </button>

                  <Link 
                    to={`/perfil/${neg.slug}`} 
                    className="flex items-center gap-2 text-sm font-bold text-white bg-[#1D565D] hover:bg-[#154045] px-4 py-2 rounded-xl transition-all shadow-sm"
                  >
                    <Eye size={16} /> Ver Perfil
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
        onHomeClick={() => navigate('/')} 
      />
    </div>
  );
}
