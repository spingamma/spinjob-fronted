// Archivo: src/MisNegocios.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, XCircle, PlusCircle, Building, Eye, FileText, X, Trash2, Loader2, ShoppingBag, Edit3, BarChart2 } from 'lucide-react';
import BottomNavbar from '../../components/BottomNavbar';
import Header from '../../components/Header';
import fetchAuth from '../../utils/fetchAuth';
import PremiumModal from '../../components/PremiumModal';
import { API_URL } from '../../config/api';
import { useAuth } from '../../hooks/useAuth';
import OwnerPushBanner from '../../components/OwnerPushBanner';
import BusinessListItem from './components/BusinessListItem';

export default function MisNegocios() {
  const { isLoggedIn, isAdmin, user, logout } = useAuth();
  const [negocios, setNegocios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [premiumModalData, setPremiumModalData] = useState({ isOpen: false, featureName: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [togglingSlug, setTogglingSlug] = useState(null);

  useEffect(() => {
    const fetchMisNegocios = async () => {
      const token = localStorage.getItem('spingamma_token');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const res = await fetchAuth(`${API_URL}/usuarios/mis-negocios`);

        if (!res.ok) throw new Error("Error al cargar tus negocios");

        const data = await res.json();
        setNegocios(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    fetchMisNegocios();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCleanFilters = () => {
    navigate('/');
  };

  const handleEliminarNegocio = async (slug) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta solicitud? Esta acción es permanente.")) {
      return;
    }

    setIsDeleting(slug);
    try {
      const res = await fetchAuth(`${API_URL}/businesses/${slug}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al eliminar el negocio");
      }

      setNegocios(previousNegocios => previousNegocios.filter(negocio => negocio.slug !== slug));
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleOpen = async (slug) => {
    setTogglingSlug(slug);
    try {
      const res = await fetchAuth(`${API_URL}/businesses/${slug}/toggle-open`, {
        method: 'PATCH'
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error al cambiar estado");
      }
      const updated = await res.json();
      setNegocios(prev => prev.map(n => n.slug === slug ? { ...n, is_open: updated.is_open } : n));
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setTogglingSlug(null);
    }
  };

  const handleNuevoNegocioClick = (e) => {
    if (!isAdmin && negocios.length >= 1) {
      e.preventDefault();
      alert("Límite alcanzado: Los usuarios estándar solo pueden registrar un negocio como máximo.");
    }
  };

  if (cargando) return <div className="text-center py-20 text-primary font-bold">Cargando tus negocios...</div>;

  return (
    <div className="min-h-screen bg-brand-bg font-sans pb-20">
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userName={user?.nombre || ''}
        isUserMenuOpen={isUserMenuOpen}
        setIsUserMenuOpen={setIsUserMenuOpen}
        handleLogout={handleLogout}
        setAuthModalOpen={() => navigate('/')}
        onHomeClick={handleCleanFilters}
        isMobile={window.innerWidth < 768}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        <button onClick={() => navigate(-1)} className="flex items-center text-accent hover:text-secondary font-bold mb-6 transition-colors group">
          <ArrowLeft size={20} className="mr-2 transition-transform group-hover:-translate-x-1" /> Volver
        </button>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-primary flex items-center gap-3">
            <Building className="text-secondary" /> Mis Negocios
          </h1>
          <Link to="/crear-negocio" onClick={handleNuevoNegocioClick} className="bg-btn-cta hover:bg-btn-cta/90 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-transform hover:-translate-y-0.5">
            <PlusCircle size={18} /> Nuevo
          </Link>
        </div>

        {negocios.length > 0 && <OwnerPushBanner />}

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div>}

        {negocios.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
            <p className="text-gray-500 mb-4">Aún no has registrado ningún negocio.</p>
            <Link to="/crear-negocio" className="text-secondary font-bold underline">Crea tu primer perfil profesional</Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {negocios.map(neg => (
              <BusinessListItem
                key={neg.slug}
                negocio={neg}
                isAdmin={isAdmin}
                isDeleting={isDeleting}
                togglingSlug={togglingSlug}
                onToggleOpen={handleToggleOpen}
                onDelete={handleEliminarNegocio}
                onOpenPremiumModal={(featureName) => setPremiumModalData({ isOpen: true, featureName })}
              />
            ))}
          </div>
        )}


      </div>

      {/* Spacer explícito para el BottomNavbar en móviles */}
      <div className="h-28 md:h-12 w-full shrink-0"></div>

      <BottomNavbar
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        onHomeClick={() => navigate('/')}
      />

      <PremiumModal
        isOpen={premiumModalData.isOpen}
        onClose={() => setPremiumModalData({ isOpen: false, featureName: '' })}
        featureName={premiumModalData.featureName}
      />
    </div>
  );
}