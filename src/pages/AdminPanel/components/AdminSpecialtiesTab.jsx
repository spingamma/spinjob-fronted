import { useState, useEffect } from 'react';
import { Bookmark, Plus, Edit3, Trash2, Loader2, Search, AlertTriangle, ShieldCheck } from 'lucide-react';
import fetchAuth from '../../../utils/fetchAuth';

export default function AdminSpecialtiesTab({ API_URL }) {
  const [specialtiesGrouped, setSpecialtiesGrouped] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'delete'
  const [selectedSpec, setSelectedSpec] = useState(null); // { id, category, subcategory }
  const [formData, setFormData] = useState({ category: '', subcategory: '' });
  
  const [dependencies, setDependencies] = useState(null);
  const [isLoadingDeps, setIsLoadingDeps] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSpecialties = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAuth(`${API_URL}/specialties/`);
      if (res.ok) {
        const data = await res.json();
        
        // Agrupar localmente para mostrar
        const grouped = {};
        data.forEach(s => {
          if (!grouped[s.category]) grouped[s.category] = [];
          grouped[s.category].push(s);
        });
        
        const arr = Object.keys(grouped).map(k => ({
          category: k,
          subcategories: grouped[k]
        })).sort((a,b) => a.category.localeCompare(b.category));
        
        setSpecialtiesGrouped(arr);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialties();
  }, [API_URL]);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ category: '', subcategory: '' });
    setSelectedSpec(null);
    setDependencies(null);
    setIsModalOpen(true);
  };

  const openEditModal = async (spec) => {
    setModalMode('edit');
    setSelectedSpec(spec);
    setFormData({ category: spec.category, subcategory: spec.subcategory });
    setIsModalOpen(true);
    await checkDependencies(spec.id);
  };

  const openDeleteModal = async (spec) => {
    setModalMode('delete');
    setSelectedSpec(spec);
    setIsModalOpen(true);
    await checkDependencies(spec.id);
  };

  const checkDependencies = async (id) => {
    setIsLoadingDeps(true);
    try {
      const res = await fetchAuth(`${API_URL}/specialties/admin/${id}/dependencies`);
      if (res.ok) {
        setDependencies(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDeps(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);
    
    try {
      let res;
      if (modalMode === 'create') {
        res = await fetchAuth(`${API_URL}/specialties/admin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else if (modalMode === 'edit') {
        res = await fetchAuth(`${API_URL}/specialties/admin/${selectedSpec.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else if (modalMode === 'delete') {
        res = await fetchAuth(`${API_URL}/specialties/admin/${selectedSpec.id}`, {
          method: 'DELETE'
        });
      }

      if (res.ok) {
        setIsModalOpen(false);
        fetchSpecialties();
      } else {
        const errData = await res.json();
        alert(errData.detail || "Ocurrió un error");
      }
    } catch (err) {
      alert("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredGroups = specialtiesGrouped.filter(g => 
    g.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.subcategories.some(s => s.subcategory.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      
      {/* Header y Buscador */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1E3D51] flex items-center gap-2">
            <Bookmark size={24} className="text-[#F67927]" />
            Catálogo de Especialidades
          </h2>
          <p className="text-sm text-gray-500 mt-1">Gestiona las categorías y profesiones disponibles.</p>
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 pl-11 pr-4 py-2.5 rounded-xl outline-none focus:border-[#F67927] focus:ring-1 focus:ring-[#F67927]/30 text-sm font-medium"
            />
          </div>
          <button 
            onClick={openCreateModal}
            className="bg-[#1E3D51] hover:bg-[#152b39] text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0"
          >
            <Plus size={18} /> Nuevo
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 size={40} className="animate-spin text-[#F67927]" />
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="py-20 text-center text-gray-400 font-bold">No se encontraron resultados.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredGroups.map(group => (
              <div key={group.category} className="p-6 hover:bg-gray-50/50 transition-colors">
                <h3 className="font-black text-lg text-[#1E3D51] mb-4">{group.category}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.subcategories.filter(s => s.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === '').map(sub => (
                    <div key={sub.id} className="bg-white border border-gray-200 rounded-xl p-3 flex justify-between items-center group/item hover:border-[#F67927]/30 transition-all">
                      <span className="font-medium text-gray-700 text-sm">{sub.subcategory}</span>
                      <div className="flex items-center gap-1 transition-opacity">
                        <button 
                          onClick={() => openEditModal(sub)}
                          className="p-1.5 text-gray-400 hover:text-[#1E3D51] hover:bg-gray-100 rounded-lg transition-all"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(sub)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`p-6 text-white flex justify-between items-center ${modalMode === 'delete' ? 'bg-red-600' : 'bg-[#1E3D51]'}`}>
              <h3 className="font-extrabold text-xl">
                {modalMode === 'create' ? 'Nueva Especialidad' : modalMode === 'edit' ? 'Editar Especialidad' : 'Eliminar Especialidad'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              {/* ALERTA DE DEPENDENCIAS PARA EDIT/DELETE */}
              {['edit', 'delete'].includes(modalMode) && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex gap-3 text-orange-800">
                  <AlertTriangle className="shrink-0 text-orange-500 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-bold text-sm">Advertencia de Impacto</h4>
                    {isLoadingDeps ? (
                      <p className="text-xs mt-1 flex items-center gap-1 opacity-70"><Loader2 size={12} className="animate-spin"/> Verificando negocios afectados...</p>
                    ) : dependencies && dependencies.count > 0 ? (
                      <p className="text-xs mt-1 leading-relaxed">
                        {modalMode === 'delete' ? (
                          <>Si confirmas esta acción, <strong>{dependencies.count} negocios</strong> pasarán automáticamente a estado <span className="uppercase font-bold">Pendiente</span> y perderán su insignia de verificación hasta que se les asigne una categoría válida.</>
                        ) : (
                          <>Si confirmas, <strong>{dependencies.count} negocios</strong> se actualizarán automáticamente para reflejar el nuevo nombre sin afectar su estado ni verificación.</>
                        )}
                      </p>
                    ) : (
                      <p className="text-xs mt-1 text-green-700 font-medium">Ningún negocio se verá afectado por esta acción.</p>
                    )}
                  </div>
                </div>
              )}

              {modalMode === 'delete' ? (
                <p className="text-gray-600">
                  ¿Estás seguro de que deseas eliminar permanentemente <strong>{selectedSpec?.category} - {selectedSpec?.subcategory}</strong>? Esta acción no se puede deshacer.
                </p>
              ) : (
                <form id="spec-form" onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Categoría Principal</label>
                    <input 
                      type="text" 
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      placeholder="Ej. Salud, Tecnología..."
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-[#F67927] transition-colors font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Subcategoría / Profesión</label>
                    <input 
                      type="text" 
                      required
                      value={formData.subcategory}
                      onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                      placeholder="Ej. Dentista, Programador..."
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-[#F67927] transition-colors font-medium"
                    />
                  </div>
                </form>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type={modalMode === 'delete' ? 'button' : 'submit'}
                form={modalMode === 'delete' ? undefined : 'spec-form'}
                onClick={modalMode === 'delete' ? handleSubmit : undefined}
                disabled={isSubmitting || isLoadingDeps}
                className={`flex-1 px-4 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50
                  ${modalMode === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#F67927] hover:bg-[#a1451a]'}
                `}
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 
                  modalMode === 'delete' ? 'Eliminar' : 'Guardar'
                }
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
