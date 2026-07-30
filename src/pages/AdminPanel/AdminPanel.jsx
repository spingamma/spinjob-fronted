import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShieldAlert, 
  Users, Building, ShieldCheck,
  BarChart2, Bookmark, Store, Globe
} from 'lucide-react';
import BottomNavbar from '../../components/BottomNavbar';

import AdminAnalyticsTab from './components/AdminAnalyticsTab';
import AdminSpecialtiesTab from './components/AdminSpecialtiesTab';
import AdminVendedorTab from './components/AdminVendedorTab';
import AdminCountriesTab from './components/AdminCountriesTab';
import AdminNegociosTab from './components/AdminNegociosTab';
import AdminUsuariosTab from './components/AdminUsuariosTab';
import { API_URL } from '../../config/api';

export default function AdminPanel() {
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  const [activeTab, setActiveTab] = useState(() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try { 
        const parsed = JSON.parse(stored);
        if (!parsed.is_admin && parsed.is_vendedor) return 'vendedor';
      } catch { /* ignore */ }
    }
    return 'negocios';
  });

  // Estados de Auth para la navegación
  // eslint-disable-next-line no-unused-vars
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('spingamma_user') !== null);
  // eslint-disable-next-line no-unused-vars
  const [isAdmin, setIsAdmin] = useState(() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try { return JSON.parse(stored).is_admin === true; } catch { return false; }
    }
    return false;
  });
  // eslint-disable-next-line no-unused-vars
  const [isVendedor, setIsVendedor] = useState(() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try { return JSON.parse(stored).is_vendedor === true; } catch { return false; }
    }
    return false;
  });

  const token = localStorage.getItem('spingamma_token');

  useEffect(() => {
    if (!token) {
      navigate('/');
    }
  }, [navigate, token]);

  if (!token) return <div className="text-center py-20 text-[#1A535C] font-bold">Verificando credenciales...</div>;

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
       <div className="bg-red-50 text-red-600 p-8 rounded-2xl max-w-md text-center border border-red-200">
         <ShieldAlert size={48} className="mx-auto mb-4" />
         <h2 className="font-bold text-xl mb-2">Acceso Denegado</h2>
         <p>{error}</p>
         <button onClick={() => navigate('/')} className="mt-6 bg-red-600 text-white px-6 py-2 rounded-xl font-bold">Volver al Inicio</button>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header Dashboard */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="bg-[#1A535C] p-8 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="text-white">
              <h1 className="text-3xl font-extrabold flex items-center gap-3">
                <ShieldCheck size={32} /> Panel de Control
              </h1>
              <p className="text-[#E6E2DF] mt-1">Administración central de Tarjetoso</p>
            </div>
            <button 
              onClick={() => navigate('/')} 
              className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold border border-white/20 transition-all flex items-center gap-2"
            >
              <ArrowLeft size={18} /> Volver
            </button>
          </div>

          {/* Selector de TABS con diseño Premium */}
          {isAdmin && (
            <div className="flex border-b border-gray-100 p-2 bg-gray-50/50 overflow-x-auto hide-scrollbar">
              <button
                onClick={() => setActiveTab('negocios')}
                className={`flex-none flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold transition-all text-sm whitespace-nowrap
                  ${activeTab === 'negocios' 
                    ? 'bg-white shadow-sm text-[#F9842C] ring-1 ring-gray-200/50' 
                    : 'text-gray-400 hover:text-[#757778] hover:bg-gray-100/50'}
                `}
              >
                <Building size={18} />
                Negocios
                {pendingCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex-none flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold transition-all text-sm whitespace-nowrap
                  ${activeTab === 'analytics' 
                    ? 'bg-white shadow-sm text-[#F9842C] ring-1 ring-gray-200/50' 
                    : 'text-gray-400 hover:text-[#757778] hover:bg-gray-100/50'}
                `}
              >
                <BarChart2 size={18} />
                Analíticas
              </button>
              <button
                onClick={() => setActiveTab('especialidades')}
                className={`flex-none flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold transition-all text-sm whitespace-nowrap
                  ${activeTab === 'especialidades' 
                    ? 'bg-white shadow-sm text-[#F9842C] ring-1 ring-gray-200/50' 
                    : 'text-gray-400 hover:text-[#757778] hover:bg-gray-100/50'}
                `}
              >
                <Bookmark size={18} />
                Especialidades
              </button>
              <button
                onClick={() => setActiveTab('vendedor')}
                className={`flex-none flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold transition-all text-sm whitespace-nowrap
                  ${activeTab === 'vendedor' 
                    ? 'bg-white shadow-sm text-[#F9842C] ring-1 ring-gray-200/50' 
                    : 'text-gray-400 hover:text-[#757778] hover:bg-gray-100/50'}
                `}
              >
                <Store size={18} />
                Vendedores
              </button>
              <button
                onClick={() => setActiveTab('usuarios')}
                className={`flex-none flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold transition-all text-sm whitespace-nowrap
                  ${activeTab === 'usuarios' 
                    ? 'bg-white shadow-sm text-[#F9842C] ring-1 ring-gray-200/50' 
                    : 'text-gray-400 hover:text-[#757778] hover:bg-gray-100/50'}
                `}
              >
                <Users size={18} />
                Usuarios
              </button>
              <button
                onClick={() => setActiveTab('paises')}
                className={`flex-none flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold transition-all text-sm whitespace-nowrap
                  ${activeTab === 'paises' 
                    ? 'bg-white shadow-sm text-[#F9842C] ring-1 ring-gray-200/50' 
                    : 'text-gray-400 hover:text-[#757778] hover:bg-gray-100/50'}
                `}
              >
                <Globe size={18} />
                Países y Dptos.
              </button>
            </div>
          )}
        </div>

        {/* CONTENIDO DE PESTAÑA: NEGOCIOS */}
        {activeTab === 'negocios' && (
          <AdminNegociosTab 
            API_URL={API_URL} 
            onUpdatePendingCount={setPendingCount} 
          />
        )}

        {/* CONTENIDO DE PESTAÑA: USUARIOS */}
        {activeTab === 'usuarios' && (
          <AdminUsuariosTab 
            API_URL={API_URL} 
          />
        )}

        {/* CONTENIDO DE PESTAÑA: ANALÍTICAS */}
        {activeTab === 'analytics' && <AdminAnalyticsTab API_URL={API_URL} />}

        {/* CONTENIDO DE PESTAÑA: ESPECIALIDADES */}
        {activeTab === 'especialidades' && <AdminSpecialtiesTab API_URL={API_URL} />}

        {/* CONTENIDO DE PESTAÑA: VENDEDORES */}
        {activeTab === 'vendedor' && <AdminVendedorTab API_URL={API_URL} />}

        {/* CONTENIDO DE PESTAÑA: PAÍSES Y DEPARTAMENTOS */}
        {activeTab === 'paises' && <AdminCountriesTab />}
      </div>
      
      <BottomNavbar 
        isLoggedIn={isLoggedIn} 
        isAdmin={isAdmin || isVendedor} 
        onHomeClick={() => navigate('/')} 
      />
    </div>
  );
}