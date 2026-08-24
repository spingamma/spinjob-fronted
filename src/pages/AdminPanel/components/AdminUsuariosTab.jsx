import { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle, Search, Loader2, Trash2, ShieldAlert
} from 'lucide-react';
import fetchAuth from '../../../utils/fetchAuth';

export default function AdminUsuariosTab({ API_URL }) {
  const [users, setUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
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
  }, [userSearchTerm, API_URL]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <h2 className="text-xl font-extrabold text-primary">Gestión de Usuarios</h2>
          
          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
            {/* Input Búsqueda */}
            <div className="relative w-full sm:w-64">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar usuario..." 
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 pl-11 pr-4 py-2.5 rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 transition-all text-sm font-medium"
              />
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {isLoadingUsers ? (
            <div className="py-20 flex flex-col items-center">
              <Loader2 size={40} className="animate-spin text-secondary mb-2" />
              <p className="text-gray-400 font-bold">Buscando...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle size={48} className="mx-auto mb-4 text-primary opacity-20" />
              <p className="text-gray-400 font-bold">No se encontraron usuarios.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map(user => (
                <div key={user.id} className="group bg-gray-50/50 rounded-2xl border border-gray-100 p-5 hover:border-secondary/30 transition-all hover:bg-white hover:shadow-md flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-primary leading-tight truncate" title={user.name}>{user.name}</h3>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{user.email || 'Sin correo'}</p>
                      {user.phone ? (
                        <p className="text-[10px] bg-gray-100 inline-block px-1.5 py-0.5 rounded mt-1 font-mono text-gray-500">{user.phone}</p>
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
                      data-testid={`delete-user-btn-${user.id}`}
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
                <h4 className="font-extrabold text-primary mt-1 text-base">{deleteConfirmUser.name}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{deleteConfirmUser.email || 'Sin correo'}</p>
                <p className="text-xs font-mono text-gray-500 mt-0.5">{deleteConfirmUser.phone || 'Sin teléfono'}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-bold text-primary">Se eliminará definitivamente de la base de datos:</p>
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
                className="flex-1 font-bold py-3 rounded-xl bg-white hover:bg-gray-100 text-gray-500 border border-gray-200 text-sm transition-all focus:outline-none"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteUser(deleteConfirmUser)}
                disabled={isDeletingUser === deleteConfirmUser.id}
                data-testid={`confirm-delete-button-${deleteConfirmUser.id}`}
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
