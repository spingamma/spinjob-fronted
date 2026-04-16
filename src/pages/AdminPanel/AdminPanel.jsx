import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, XCircle, ShieldAlert, 
  Users, Building, Search, Clock, ShieldCheck, Loader2 
} from 'lucide-react';
import BottomNavbar from '../../components/BottomNavbar';

export default function AdminPanel() {
  const [pendientes, setPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Estados para la pestaña de Usuarios
  const [activeTab, setActiveTab] = useState('negocios'); // 'negocios' o 'usuarios'
  const [users, setUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isVerifyingUser, setIsVerifyingUser] = useState(null);

  // Estados de Auth para la navegación
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('spingamma_user') !== null);
  const [isAdmin, setIsAdmin] = useState(() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try { return JSON.parse(stored).is_admin === true; } catch(e) { return false; }
    }
    return false;
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const cargarPendientes = async () => {
    const token = localStorage.getItem('spingamma_token');
    if (!token) return navigate('/');

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      // Asumiendo endpoint: @app.get("/admin/pendientes")
      const res = await fetch(`${API_URL}/admin/pendientes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.status === 403) throw new Error("No tienes permisos de administrador.");
      if (!res.ok) throw new Error("Error al cargar solicitudes.");
      
      const data = await res.json();
      setPendientes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPendientes();
  }, [navigate]);

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
        
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Error obteniendo usuarios");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const verifyUserManually = async (phone) => {
    if (!window.confirm("¿Estás seguro de que deseas verificar este usuario manualmente?")) return;
    setIsVerifyingUser(phone);
    try {
      const token = localStorage.getItem('spingamma_token');
      const res = await fetch(`${API_URL}/users/${phone}/verificar`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Error al verificar al usuario.");
      setUsers(users.map(u => u.phone === phone ? { ...u, is_verified: true } : u));
    } catch (err) {
      alert(err.message);
    } finally {
      setIsVerifyingUser(null);
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
      const res = await fetch(`${API_URL}/admin/businesses/${slug}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: accion === 'aprobar' ? 'aprobado' : 'rechazado',
          rejection_reason: razon
        })
      });

      if (!res.ok) throw new Error("Error al procesar la solicitud.");
      
      // Recargar la lista si fue exitoso
      cargarPendientes();
    } catch (err) {
      alert(err.message);
    }
  };

  if (cargando) return <div className="text-center py-20 text-[#1E3D51] font-bold">Verificando credenciales...</div>;

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
          <div className="bg-gradient-to-r from-[#1E3D51] to-[#32698F] p-8 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="text-white">
              <h1 className="text-3xl font-extrabold flex items-center gap-3">
                <ShieldCheck size={32} /> Panel de Control
              </h1>
              <p className="text-[#E6E2DF] mt-1">Administración central de SpinJob</p>
            </div>
            <button 
              onClick={() => navigate('/')} 
              className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold border border-white/20 transition-all flex items-center gap-2"
            >
              <ArrowLeft size={18} /> Volver
            </button>
          </div>

          {/* Selector de TABS con diseño Premium */}
          <div className="flex border-b border-gray-100 p-2 bg-gray-50/50">
            <button
              onClick={() => setActiveTab('negocios')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-2xl font-bold transition-all
                ${activeTab === 'negocios' 
                  ? 'bg-white shadow-sm text-[#B95221] ring-1 ring-gray-200/50' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'}
              `}
            >
              <Building size={20} />
              Solicitudes de Negocios
              {pendientes.length > 0 && (
                <span className="ml-1 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                  {pendientes.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('usuarios')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-2xl font-bold transition-all
                ${activeTab === 'usuarios' 
                  ? 'bg-white shadow-sm text-[#B95221] ring-1 ring-gray-200/50' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'}
              `}
            >
              <Users size={20} />
              Usuarios Pendientes
            </button>
          </div>
        </div>

        {/* CONTENIDO DE PESTAÑA: NEGOCIOS */}
        {activeTab === 'negocios' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-extrabold text-[#1E3D51]">Revisiones Pendientes</h2>
              <span className="text-sm text-gray-500 font-medium">{pendientes.length} por aprobar</span>
            </div>

            {pendientes.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
                <CheckCircle size={48} className="mx-auto mb-4 text-green-400 opacity-20" />
                <p className="text-gray-400 font-bold text-lg">¡Todo al día! No hay negocios pendientes.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {pendientes.map(neg => (
                  <div key={neg.slug} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col lg:flex-row justify-between gap-8 transition-all hover:shadow-md">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                          <img 
                            src={neg.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(neg.name)}&background=F8F9FA&color=1E3D51`} 
                            alt={neg.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-2xl text-[#1E3D51]">{neg.name}</h3>
                          <span className="bg-[#B95221]/10 text-[#B95221] text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border border-[#B95221]/20">
                            {neg.status}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                        <p className="text-gray-600 font-medium flex items-center gap-2">
                          <ShieldCheck size={16} className="text-[#32698F]" />
                          {neg.title} • {neg.category}
                        </p>
                        <p className="text-gray-500 flex items-center gap-2">
                          <Clock size={16} className="text-[#32698F]" />
                          {[neg.neighborhood, neg.state].filter(Boolean).join(', ')}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 bg-gray-50/80 p-4 rounded-2xl border border-gray-100 leading-relaxed italic">
                        "{neg.description}"
                      </p>
                    </div>
                    
                    <div className="flex lg:flex-col gap-3 min-w-[160px] justify-center">
                      <button 
                        onClick={() => handleAccion(neg.slug, 'aprobar')}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:-translate-y-0.5"
                      >
                        <CheckCircle size={20} /> Aprobar
                      </button>
                      <button 
                        onClick={() => handleAccion(neg.slug, 'rechazar')}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <XCircle size={20} /> Rechazar
                      </button>
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
              <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-extrabold text-[#1E3D51]">Gestión de Verificaciones</h2>
                <div className="relative w-full sm:w-72">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar usuario..." 
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 pl-11 pr-4 py-2.5 rounded-xl outline-none focus:border-[#B95221] focus:ring-1 focus:ring-[#B95221]/30 transition-all text-sm font-medium"
                  />
                </div>
              </div>
              
              <div className="p-6">
                {isLoadingUsers ? (
                  <div className="py-20 flex flex-col items-center">
                    <Loader2 size={40} className="animate-spin text-[#B95221] mb-2" />
                    <p className="text-gray-400 font-bold">Buscando...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="py-20 text-center">
                    <Users size={48} className="mx-auto mb-4 text-gray-200" />
                    <p className="text-gray-400 font-bold">No se encontraron usuarios.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map(user => (
                      <div key={user.id} className="group bg-gray-50/50 rounded-2xl border border-gray-100 p-5 hover:border-[#F67927]/30 transition-all hover:bg-white hover:shadow-md flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-[#1E3D51] leading-tight truncate" title={user.name}>{user.name}</h3>
                            <p className="text-xs text-gray-500 truncate mt-0.5">{user.email || 'Sin correo'}</p>
                            <p className="text-[10px] bg-gray-100 inline-block px-1.5 py-0.5 rounded mt-1 font-mono text-gray-600">{user.phone}</p>
                          </div>
                          {user.is_verified ? (
                            <div className="bg-green-100 text-green-700 p-1.5 rounded-full" title="Verificado">
                              <CheckCircle size={18} />
                            </div>
                          ) : (
                            <div className="bg-orange-100 text-[#B95221] p-1.5 rounded-full" title="Pendiente">
                              <Clock size={18} />
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-auto pt-4 border-t border-gray-100">
                          {!user.is_verified ? (
                            <button 
                              onClick={() => verifyUserManually(user.phone)}
                              disabled={isVerifyingUser === user.phone}
                              className="w-full font-bold py-2 rounded-xl bg-[#F67927] hover:bg-[#e06516] text-white text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                              {isVerifyingUser === user.phone ? <Loader2 size={14} className="animate-spin"/> : <ShieldCheck size={14} />}
                              Verificar Ahora
                            </button>
                          ) : (
                            <div className="w-full font-bold py-2 rounded-xl bg-gray-200/50 text-gray-400 text-xs flex items-center justify-center gap-2 cursor-default">
                              <CheckCircle size={14} /> Listo
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
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