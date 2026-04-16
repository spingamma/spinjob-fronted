// Archivo: src/AdminPanel.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';
import BottomNavbar from './components/BottomNavbar';

export default function AdminPanel() {
  const [pendientes, setPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Estados de Auth para la navegación
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('spingamma_user') !== null);
  const [isAdmin, setIsAdmin] = useState(() => {
    const stored = localStorage.getItem('spingamma_user');
    if (stored) {
      try { return JSON.parse(stored).is_admin === true; } catch(e) { return false; }
    }
    return false;
  });

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

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
           <div>
             <h1 className="text-2xl font-extrabold text-gray-900">Panel de Administración</h1>
             <p className="text-gray-500 text-sm">Gestiona las solicitudes de nuevos negocios</p>
           </div>
           <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-800">Volver</button>
        </div>

        {pendientes.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl text-gray-500">No hay negocios pendientes de revisión.</div>
        ) : (
          <div className="space-y-4">
            {pendientes.map(neg => (
              <div key={neg.slug} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-xl text-[#1E3D51]">{neg.name}</h3>
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-bold uppercase">{neg.status}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Especialidad: {neg.title} | {neg.category}</p>
                  <p className="text-sm text-gray-500 mb-3">Sede: {[neg.neighborhood, neg.state, neg.country].filter(Boolean).join(', ')} | Cel: {neg.whatsapp || 'N/A'}</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">{neg.description}</p>
                </div>
                
                <div className="flex lg:flex-col gap-3 min-w-[140px]">
                  <button 
                    onClick={() => handleAccion(neg.slug, 'aprobar')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle size={18} /> Aprobar
                  </button>
                  <button 
                    onClick={() => handleAccion(neg.slug, 'rechazar')}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <XCircle size={18} /> Rechazar
                  </button>
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