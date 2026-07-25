import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, XCircle, ShieldAlert, 
  Users, Building, Search, Clock, ShieldCheck, Loader2,
  FileText, X, Eye, BarChart2, Bookmark, Store, Globe, Trash2
} from 'lucide-react';
import BottomNavbar from '../../components/BottomNavbar';
import BusinessDetailsModal from '../../components/BusinessDetailsModal';
import fetchAuth from '../../utils/fetchAuth';
import AdminAnalyticsTab from './components/AdminAnalyticsTab';
import AdminSpecialtiesTab from './components/AdminSpecialtiesTab';
import AdminVendedorTab from './components/AdminVendedorTab';
import AdminCountriesTab from './components/AdminCountriesTab';
import AdminDisputasTab from './components/AdminDisputasTab';

export default function AdminPanel() {
  const [negocios, setNegocios] = useState([]);
  const [searchNegocios, setSearchNegocios] = useState('');
  const [negocioStatusFilter, setNegocioStatusFilter] = useState('pendientes');
  const [pendingCount, setPendingCount] = useState(0);
  
  const [editingPlanSlug, setEditingPlanSlug] = useState(null);
  const [editPremium, setEditPremium] = useState(false);
  const [editExpirationDate, setEditExpirationDate] = useState('');
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Estados para la pestaña de Usuarios
  const [activeTab, setActiveTab] = useState(() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try { 
        const parsed = JSON.parse(stored);
        if (!parsed.is_admin && parsed.is_vendedor) return 'vendedor';
      } catch(e) {}
    }
    return 'negocios';
  });
  const [users, setUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('todos');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isVerifyingUser, setIsVerifyingUser] = useState(null);
  const [isDeletingUser, setIsDeletingUser] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);

  // Estado para ver detalles de un negocio
  const [negocioSeleccionado, setNegocioSeleccionado] = useState(null);

  // Estados de Auth para la navegación
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('spingamma_user') !== null);
  const [isAdmin, setIsAdmin] = useState(() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try { return JSON.parse(stored).is_admin === true; } catch(e) { return false; }
    }
    return false;
  });
  const [isVendedor, setIsVendedor] = useState(() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try { return JSON.parse(stored).is_vendedor === true; } catch(e) { return false; }
    }
    return false;
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const cargarNegocios = async () => {
    const token = localStorage.getItem('spingamma_token');
    if (!token) return navigate('/');

    try {
      const queryParams = `?status=${negocioStatusFilter}${searchNegocios ? `&search=${encodeURIComponent(searchNegocios)}` : ''}`;
      const res = await fetchAuth(`${API_URL}/admin/businesses${queryParams}`);
      
      if (res.status === 403) throw new Error("No tienes permisos suficientes.");
      if (!res.ok) throw new Error("Error al cargar negocios.");
      
      const data = await res.json();
      setNegocios(data);
      if (negocioStatusFilter === 'pendientes' && !searchNegocios) {
        setPendingCount(data.length);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const cargarPendingCount = async () => {
    try {
      const res = await fetchAuth(`${API_URL}/admin/businesses?status=pendientes`);
      if (res.ok) {
        const data = await res.json();
        setPendingCount(data.length);
      }
    } catch (err) {
      console.error("Error loading pending count:", err);
    }
  };

  const startEditingPlan = (neg) => {
    setEditingPlanSlug(neg.slug);
    setEditPremium(neg.premium);
    const rawDate = neg.expiration_date || '';
    const dateOnly = rawDate.split(' ')[0] || '';
    setEditExpirationDate(dateOnly);
  };

  const savePlanChanges = async (slug) => {
    setIsSavingPlan(true);
    try {
      const res = await fetchAuth(`${API_URL}/admin/businesses/${slug}/plan`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          premium: editPremium,
          expiration_date: editExpirationDate || null
        })
      });
      
      if (!res.ok) throw new Error("Error al guardar cambios de plan");
      
      const updatedBusiness = await res.json();
      setNegocios(negocios.map(n => n.slug === slug ? updatedBusiness : n));
      setEditingPlanSlug(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSavingPlan(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'negocios' && isAdmin) {
      cargarNegocios();
      if (negocioStatusFilter !== 'pendientes') {
        cargarPendingCount();
      }
    } else {
      setCargando(false);
    }
  }, [navigate, searchNegocios, negocioStatusFilter, activeTab, isAdmin]);

  // Efecto para cargar usuarios cuando la pestaña cambia o se busca
  useEffect(() => {
    if (activeTab === 'usuarios') {
      fetchUsers();
    }
  }, [activeTab, userSearchTerm]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const token = localStorage.getItem('spingamma_token');
      const url = userSearchTerm 
        ? `${API_URL}/admin/users?search=${encodeURIComponent(userSearchTerm)}` 
        : `${API_URL}/admin/users`;
        
      const res = await fetchAuth(url);
      
      if (!res.ok) throw new Error("Error obteniendo usuarios");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const deleteUser = async (user) => {
    const identifier = user.phone || user.id;
    setIsDeletingUser(user.id);
    try {
      const res = await fetchAuth(`${API_URL}/users/${encodeURIComponent(identifier)}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al eliminar al usuario.");
      }
      setUsers(users.filter(u => u.id !== user.id));
      setDeleteConfirmUser(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeletingUser(null);
    }
  };

  const handleAccion = async (slug, accion) => {
    let razon = "";
    if (accion === 'rechazar') {
      razon = prompt("Escribe el motivo del rechazo para que el usuario lo vea:");
      if (razon === null) return; // Canceló el prompt
    }

    const token = localStorage.getItem('spingamma_token');
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    
    try {
      // Asumiendo endpoint: @app.put("/admin/businesses/{slug}/status")
      const res = await fetchAuth(`${API_URL}/admin/businesses/${slug}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: accion === 'aprobar' ? 'aprobado' : 'rechazado',
          rejection_reason: razon
        })
      });

      if (!res.ok) throw new Error("Error al procesar la solicitud.");
      
      // Recargar la lista si fue exitoso
      await cargarNegocios();
      await cargarPendingCount();
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    }
  };

  if (cargando) return <div className="text-center py-20 text-[#1A535C] font-bold">Verificando credenciales...</div>;

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

  return (    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans">
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
              <button
                onClick={() => setActiveTab('disputas')}
                data-testid="admin-tab-disputas"
                className={`flex-none flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold transition-all text-sm whitespace-nowrap
                  ${activeTab === 'disputas' 
                    ? 'bg-white shadow-sm text-red-500 ring-1 ring-gray-200/50' 
                    : 'text-gray-400 hover:text-[#757778] hover:bg-gray-100/50'}
                `}
              >
                <ShieldAlert size={18} />
                Disputas
              </button>
            </div>
          )}
        </div>

        {/* CONTENIDO DE PESTAÑA: DISPUTAS */}
        {activeTab === 'disputas' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AdminDisputasTab />
          </div>
        )}

        {/* CONTENIDO DE PESTAÑA: NEGOCIOS */}
        {activeTab === 'negocios' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 px-2">
              <h2 className="text-xl font-extrabold text-[#1A535C]">
                {negocioStatusFilter === 'pendientes' && 'Revisiones Pendientes'}
                {negocioStatusFilter === 'premium' && 'Negocios Premium'}
                {negocioStatusFilter === 'basico' && 'Negocios Plan Básico'}
                {negocioStatusFilter === 'todos' && 'Todos los Negocios'}
              </h2>
              
              <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
                {/* Select Filtro Negocios */}
                <select 
                  value={negocioStatusFilter}
                  onChange={(e) => setNegocioStatusFilter(e.target.value)}
                  className="bg-white border border-gray-200 px-4 py-2.5 rounded-xl outline-none focus:border-[#F9842C] focus:ring-1 focus:ring-[#F9842C]/30 text-sm font-bold text-[#1A535C]"
                >
                  <option value="pendientes">Pendientes</option>
                  <option value="premium">Premium</option>
                  <option value="basico">Básico</option>
                  <option value="todos">Todos los Negocios</option>
                </select>

                {/* Input Búsqueda */}
                <div className="relative w-full sm:w-72">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar por nombre o categoría..." 
                    value={searchNegocios}
                    onChange={(e) => setSearchNegocios(e.target.value)}
                    className="w-full bg-white border border-gray-200 pl-11 pr-4 py-2.5 rounded-xl outline-none focus:border-[#F9842C] focus:ring-1 focus:ring-[#F9842C]/30 transition-all text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            {negocios.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
                <CheckCircle size={48} className="mx-auto mb-4 text-green-400 opacity-20" />
                <p className="text-gray-400 font-bold text-lg">
                  {negocioStatusFilter === 'pendientes' ? '¡Todo al día! No hay negocios pendientes.' : 'No se encontraron negocios.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {negocios.map(neg => (
                  <div key={neg.slug} className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col lg:flex-row justify-between gap-4 lg:gap-8 transition-all hover:shadow-md">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2.5">
                        <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                          <img 
                            src={neg.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(neg.name)}&background=F8F9FA&color=1E3D51`} 
                            alt={neg.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-2xl text-[#1A535C]">{neg.name}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="bg-[#F9842C]/10 text-[#F9842C] text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border border-[#F9842C]/20">
                              {neg.status}
                            </span>
                            {neg.status === 'aprobado' && (
                              <a
                                href={`/perfil/${neg.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-gray-50 hover:bg-gray-100 text-[#757778] text-[10px] px-2 py-1 rounded-full font-bold border border-gray-200 flex items-center gap-1 transition-all"
                              >
                                <Eye size={12} className="text-gray-500" /> Ver Tarjeta
                              </a>
                            )}
                            {neg.referred_by_name && (
                              <span className="bg-purple-100 text-purple-700 text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border border-purple-200">
                                🎟️ Vendedor: {neg.referred_by_name} · 3 meses prueba
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                          <ShieldCheck size={16} className="text-[#1A535C]" />
                          {neg.title} • {neg.category}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                          <Clock size={16} className="text-[#1A535C]" />
                          {[neg.neighborhood, neg.state].filter(Boolean).join(', ')}
                        </div>
                      </div>


                      {/* Sección de Gestión de Plan para Negocios */}
                      {neg.status === 'aprobado' && (
                        <div className="mt-2.5 pt-2.5 border-t border-gray-100">
                          {editingPlanSlug === neg.slug ? (
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4">
                              <h4 className="font-bold text-sm text-[#1A535C]">Editar Plan del Negocio</h4>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Plan</label>
                                  <select 
                                    value={editPremium ? 'premium' : 'basico'}
                                    onChange={(e) => setEditPremium(e.target.value === 'premium')}
                                    className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-sm font-semibold outline-none focus:border-[#F9842C] text-[#1A535C]"
                                  >
                                    <option value="basico">Plan Básico</option>
                                    <option value="premium">Plan Premium</option>
                                  </select>
                                </div>
                                
                                <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha de Vencimiento</label>
                                  <input 
                                    type="date"
                                    value={editExpirationDate}
                                    onChange={(e) => setEditExpirationDate(e.target.value)}
                                    className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-sm font-semibold outline-none focus:border-[#F9842C] text-[#1A535C]"
                                  />
                                </div>
                              </div>
                              
                              <div className="flex justify-end gap-2 pt-2">
                                <button
                                  onClick={() => setEditingPlanSlug(null)}
                                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                                  disabled={isSavingPlan}
                                >
                                  Cancelar
                                </button>
                                <button
                                  onClick={() => savePlanChanges(neg.slug)}
                                  className="px-4 py-2 bg-[#F9842C] hover:bg-[#e06516] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                                  disabled={isSavingPlan}
                                >
                                  {isSavingPlan && <Loader2 size={12} className="animate-spin" />}
                                  Guardar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-50">
                              <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-[#757778]">Plan:</span>
                                  {neg.premium ? (
                                    <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-black uppercase border border-amber-200/50 flex items-center gap-1">
                                      ⭐ Premium
                                    </span>
                                  ) : (
                                    <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-black uppercase border border-blue-200/50">
                                      Plan Básico
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-[#757778]">Vencimiento:</span>
                                  <span className="text-xs font-bold text-[#1A535C]">
                                    {neg.expiration_date ? neg.expiration_date : 'Sin vencimiento registrado'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto lg:min-w-[160px] justify-center lg:mt-0">
                      {neg.status === 'pendiente' && (
                        <>
                          <button 
                            onClick={() => handleAccion(neg.slug, 'aprobar')}
                            className="flex-1 bg-[#1A535C] hover:bg-[#133d44] text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:-translate-y-0.5 cursor-pointer"
                          >
                            <CheckCircle size={20} /> Aprobar
                          </button>
                          <button 
                            onClick={() => {
                              setNegocioSeleccionado(neg);
                              setEditPremium(neg.premium);
                              const rawDate = neg.expiration_date || '';
                              const dateOnly = rawDate.split(' ')[0] || '';
                              setEditExpirationDate(dateOnly);
                            }}
                            className="bg-gray-50 hover:bg-gray-100 text-[#757778] py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer self-center lg:self-stretch"
                          >
                            <Eye size={16} /> Ver Datos
                          </button>
                          <button 
                            onClick={() => handleAccion(neg.slug, 'rechazar')}
                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                          >
                            <XCircle size={20} /> Rechazar
                          </button>
                        </>
                      )}

                      {neg.status === 'aprobado' && (
                        <button
                          onClick={() => startEditingPlan(neg)}
                          className="bg-gray-50 hover:bg-gray-100 text-[#F9842C] py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer self-center lg:self-stretch"
                        >
                          Gestionar Plan
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONTENIDO DE PESTAÑA: USUARIOS */}
        {activeTab === 'usuarios' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <h2 className="text-xl font-extrabold text-[#1A535C]">Gestión de Usuarios</h2>
                
                <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
                  {/* Input Búsqueda */}
                  <div className="relative w-full sm:w-64">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar usuario..." 
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 pl-11 pr-4 py-2.5 rounded-xl outline-none focus:border-[#F9842C] focus:ring-1 focus:ring-[#F9842C]/30 transition-all text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {isLoadingUsers ? (
                  <div className="py-20 flex flex-col items-center">
                    <Loader2 size={40} className="animate-spin text-[#F9842C] mb-2" />
                    <p className="text-gray-400 font-bold">Buscando...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-16">
                    <CheckCircle size={48} className="mx-auto mb-4 text-[#1A535C] opacity-20" />
                    <p className="text-gray-400 font-bold">No se encontraron usuarios.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map(user => (
                      <div key={user.id} className="group bg-gray-50/50 rounded-2xl border border-gray-100 p-5 hover:border-[#F9842C]/30 transition-all hover:bg-white hover:shadow-md flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-[#1A535C] leading-tight truncate" title={user.name}>{user.name}</h3>
                            <p className="text-xs text-[#757778] truncate mt-0.5">{user.email || 'Sin correo'}</p>
                            {user.phone ? (
                              <p className="text-[10px] bg-gray-100 inline-block px-1.5 py-0.5 rounded mt-1 font-mono text-[#757778]">{user.phone}</p>
                            ) : (
                              <p className="text-[10px] bg-gray-100 inline-block px-1.5 py-0.5 rounded mt-1 font-sans italic text-gray-400">Sin teléfono</p>
                            )}

                            {/* Actividad */}
                            <div className="mt-2.5 flex items-center gap-1.5">
                              {user.months_inactive === null ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                  Sin actividad registrada
                                </span>
                              ) : user.months_inactive === 0 ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                                  Activo este mes
                                </span>
                              ) : (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  user.months_inactive >= 3 
                                    ? 'bg-red-50 text-red-600 border-red-100' 
                                    : 'bg-orange-50 text-orange-600 border-orange-100'
                                }`}>
                                  Inactivo hace {user.months_inactive} {user.months_inactive === 1 ? 'mes' : 'meses'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-auto pt-4 border-t border-gray-100">
                          <button 
                            onClick={() => setDeleteConfirmUser(user)}
                            disabled={isDeletingUser === user.id}
                            data-testid="delete-user-button"
                            className="w-full font-bold py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 border border-red-100/50"
                          >
                            {isDeletingUser === user.id ? (
                              <Loader2 size={14} className="animate-spin"/>
                            ) : (
                              <Trash2 size={14} />
                            )}
                            Eliminar Usuario
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
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

      {/* MODAL DE DETALLES DEL NEGOCIO REFACTORIZADO */}
      <BusinessDetailsModal 
        business={negocioSeleccionado}
        onClose={() => setNegocioSeleccionado(null)}
        banner={
          negocioSeleccionado?.status === 'pendiente' ? {
            type: 'info',
            content: 'Modo Revisión: Estos son los datos enviados por el usuario. Revisa cuidadosamente antes de aprobar o rechazar.'
          } : null
        }
        actions={
          negocioSeleccionado?.status === 'pendiente' ? (
            <>
              <button 
                onClick={async () => {
                  const success = await handleAccion(negocioSeleccionado.slug, 'aprobar');
                  if (success) {
                    setNegocioSeleccionado(null);
                  }
                }}
                className="flex-1 bg-[#1A535C] hover:bg-[#133d44] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <CheckCircle size={18} /> Aprobar Ahora
              </button>
              <button 
                onClick={async () => {
                  const success = await handleAccion(negocioSeleccionado.slug, 'rechazar');
                  if (success) {
                    setNegocioSeleccionado(null);
                  }
                }}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <XCircle size={18} /> Rechazar
              </button>
            </>
          ) : null
        }
      />

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN TOTAL */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="bg-red-50 p-6 flex items-center gap-4 border-b border-red-100/50">
              <div className="bg-red-100 text-red-600 p-2.5 rounded-2xl">
                <ShieldAlert size={28} />
              </div>
              <div>
                <h3 className="text-lg font-black text-red-700">¿Eliminar completamente?</h3>
                <p className="text-xs text-red-600 font-semibold mt-0.5">Esta acción es destructiva e irreversible.</p>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Usuario a eliminar</p>
                <h4 className="font-extrabold text-[#1A535C] mt-1 text-base">{deleteConfirmUser.name}</h4>
                <p className="text-xs text-[#757778] mt-0.5">{deleteConfirmUser.email || 'Sin correo'}</p>
                <p className="text-xs font-mono text-[#757778] mt-0.5">{deleteConfirmUser.phone || 'Sin teléfono'}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-bold text-[#1A535C]">Se eliminará definitivamente de la base de datos:</p>
                <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-5 font-medium">
                  <li>Todos los <strong>negocios y tarjetas digitales</strong> propiedad del usuario.</li>
                  <li>Todos los <strong>productos e inventario</strong> de dichos negocios.</li>
                  <li>Todos los <strong>pedidos y compras</strong> recibidas o realizadas por el usuario.</li>
                  <li>Todas las <strong>reseñas y calificaciones</strong> hechas a o por el usuario.</li>
                  <li>Historial de <strong>interacciones y métricas</strong> de clics.</li>
                  <li>Tarjetas guardadas en su tarjetero.</li>
                </ul>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                data-testid="cancel-delete-button"
                className="flex-1 font-bold py-3 rounded-xl bg-white hover:bg-gray-100 text-[#757778] border border-gray-200 text-sm transition-all focus:outline-none"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteUser(deleteConfirmUser)}
                disabled={isDeletingUser === deleteConfirmUser.id}
                data-testid="confirm-delete-button"
                className="flex-1 font-bold py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md shadow-red-200"
              >
                {isDeletingUser === deleteConfirmUser.id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                Sí, eliminar todo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}