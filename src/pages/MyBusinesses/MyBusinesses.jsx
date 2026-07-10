// Archivo: src/MisNegocios.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, XCircle, PlusCircle, Building, Eye, FileText, X, Trash2, Loader2, ShoppingBag, Edit3, BarChart2 } from 'lucide-react';
import BottomNavbar from '../../components/BottomNavbar';
import Header from '../../components/Header';
import fetchAuth from '../../utils/fetchAuth';
import PremiumModal from '../../components/PremiumModal';

export default function MisNegocios() {
  const [negocios, setNegocios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [premiumModalData, setPremiumModalData] = useState({ isOpen: false, featureName: '' });


  const [searchTerm, setSearchTerm] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Estados de Auth para la navegación
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('spingamma_user') !== null);
  const [isAdmin, setIsAdmin] = useState(() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try { 
        const parsed = JSON.parse(stored);
        return parsed.is_admin === true || parsed.is_vendedor === true; 
      } catch (e) { return false; }
    }
    return false;
  });
  const [isDeleting, setIsDeleting] = useState(null); // Slug del negocio que se está eliminando

  useEffect(() => {
    const fetchMisNegocios = async () => {
      const token = localStorage.getItem('spingamma_token');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
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
    localStorage.removeItem('spingamma_user');
    localStorage.removeItem('spingamma_token');
    setIsLoggedIn(false);
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
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const res = await fetchAuth(`${API_URL}/businesses/${slug}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al eliminar el negocio");
      }

      setNegocios(prev => prev.filter(n => n.slug !== slug));
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleNuevoNegocioClick = (e) => {
    if (!isAdmin && negocios.length >= 1) {
      e.preventDefault();
      alert("Límite alcanzado: Los usuarios estándar solo pueden registrar un negocio como máximo.");
    }
  };

  if (cargando) return <div className="text-center py-20 text-[#1A535C] font-bold">Cargando tus negocios...</div>;

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
        <button onClick={() => navigate(-1)} className="flex items-center text-[#6A431F] hover:text-[#F9842C] font-bold mb-6 transition-colors group">
          <ArrowLeft size={20} className="mr-2 transition-transform group-hover:-translate-x-1" /> Volver
        </button>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#1A535C] flex items-center gap-3">
            <Building className="text-[#F9842C]" /> Mis Negocios
          </h1>
          <Link to="/crear-negocio" onClick={handleNuevoNegocioClick} className="bg-[#F9842C] hover:bg-[#e06516] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-transform hover:-translate-y-0.5">
            <PlusCircle size={18} /> Nuevo
          </Link>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div>}

        {negocios.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
            <p className="text-[#757778] mb-4">Aún no has registrado ningún negocio.</p>
            <Link to="/crear-negocio" className="text-[#F9842C] font-bold underline">Crea tu primer perfil profesional</Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {negocios.map(neg => (
              <div key={neg.slug} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4 transition-all hover:shadow-md">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-xl text-[#1A535C]">{neg.name}</h3>
                    <p className="text-[#757778] text-sm">{neg.title} • {neg.category}</p>
                  </div>

                  <div className="flex flex-col items-end">
                    {neg.status === 'aprobado' && (
                      <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full font-bold text-sm">
                        <CheckCircle2 size={16} /> Aprobado
                      </div>
                    )}
                    {neg.status === 'pendiente' && (
                      <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-3 py-1 rounded-full font-bold text-sm">
                        <Clock size={16} /> En Revisión
                      </div>
                    )}
                    {neg.status === 'rechazado' && (
                      <>
                        <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1 rounded-full font-bold text-sm mb-2">
                          <XCircle size={16} /> Rechazado
                        </div>
                        <p className="text-xs text-red-500 max-w-xs text-right bg-red-50/50 p-2 rounded-lg border border-red-100">
                          <strong>Motivo:</strong> {neg.rejection_reason || "No cumple las políticas."}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="pt-4 border-t border-gray-100 flex flex-wrap justify-end gap-4">

                  {neg.status === 'aprobado' && (
                    <Link
                      to={`/perfil/${neg.slug}`}
                      className="flex items-center gap-2 text-sm font-bold text-[#32698F] hover:text-[#F9842C] transition-colors"
                    >
                      <Eye size={18} /> Ver Tarjeta Pública
                    </Link>
                  )}

                  {/* Botón Ver Métricas - Solo para negocios aprobados */}
                  {neg.status === 'aprobado' && (
                    neg.premium ? (
                      <Link
                        to={`/metricas/${neg.slug}`}
                        className="flex items-center justify-between w-full sm:w-auto gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50/50 hover:bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100"
                      >
                        <span className="flex items-center gap-1.5">
                          <BarChart2 size={16} /> Métricas
                        </span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => setPremiumModalData({ isOpen: true, featureName: 'Métricas' })}
                        className="flex items-center justify-between w-full sm:w-auto gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50/50 hover:bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 text-left"
                      >
                        <span className="flex items-center gap-1.5">
                          <BarChart2 size={16} /> Métricas
                        </span>
                        <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md font-extrabold flex items-center gap-0.5" title="Característica Premium">
                          🔒 Premium
                        </span>
                      </button>
                    )
                  )}

                  {/* Botón Ver Pedidos - Solo para negocios aprobados */}
                  {neg.status === 'aprobado' && (
                    neg.premium ? (
                      <Link
                        to={`/mis-pedidos/${neg.slug}`}
                        className="flex items-center justify-between w-full sm:w-auto gap-2 text-sm font-bold text-teal-600 hover:text-teal-800 transition-colors bg-teal-50/50 hover:bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-100"
                      >
                        <span className="flex items-center gap-1.5">
                          <ShoppingBag size={16} /> Pedidos
                        </span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => setPremiumModalData({ isOpen: true, featureName: 'Pedidos' })}
                        className="flex items-center justify-between w-full sm:w-auto gap-2 text-sm font-bold text-teal-600 hover:text-teal-800 transition-colors bg-teal-50/50 hover:bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-100 text-left"
                      >
                        <span className="flex items-center gap-1.5">
                          <ShoppingBag size={16} /> Pedidos
                        </span>
                        <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md font-extrabold flex items-center gap-0.5" title="Característica Premium">
                          🔒 Premium
                        </span>
                      </button>
                    )
                  )}

                  {/* Botón de eliminar (para pendientes, rechazados o admin) */}
                  {(neg.status === 'pendiente' || neg.status === 'rechazado' || isAdmin) && (
                    <button
                      onClick={() => handleEliminarNegocio(neg.slug)}
                      disabled={isDeleting === neg.slug}
                      className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                    >
                      {isDeleting === neg.slug ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                      Eliminar Solicitud
                    </button>
                  )}
                </div>

              </div>
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