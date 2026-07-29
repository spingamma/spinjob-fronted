import { useState, useEffect, useCallback } from 'react';
import { Bookmark, Plus, Edit3, Trash2, Loader2, Search } from 'lucide-react';
import fetchAuth from '../../../utils/fetchAuth';
import SpecialtyModal from './SpecialtyModal';

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

  const fetchSpecialties = useCallback(async () => {
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
  }, [API_URL]);

  useEffect(() => {
    fetchSpecialties();
  }, [fetchSpecialties]);

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
    } catch {
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
          <h2 className="text-xl font-extrabold text-[#1A535C] flex items-center gap-2">
            <Bookmark size={24} className="text-[#F9842C]" />
            Catálogo de Especialidades
          </h2>
          <p className="text-sm text-[#757778] mt-1">Gestiona las categorías y profesiones disponibles.</p>
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 pl-11 pr-4 py-2.5 rounded-xl outline-none focus:border-[#F9842C] focus:ring-1 focus:ring-[#F9842C]/30 text-sm font-medium"
            />
          </div>
          <button 
            onClick={openCreateModal}
            data-testid="create-specialty-btn"
            className="bg-[#1A535C] hover:bg-[#152b39] text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0"
          >
            <Plus size={18} /> Nuevo
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 size={40} className="animate-spin text-[#F9842C]" />
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="py-20 text-center text-gray-400 font-bold">No se encontraron resultados.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredGroups.map(group => (
              <div key={group.category} className="p-6 hover:bg-gray-50/50 transition-colors">
                <h3 className="font-black text-lg text-[#1A535C] mb-4">{group.category}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.subcategories.filter(s => s.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === '').map(sub => (
                    <div key={sub.id} className="bg-white border border-gray-200 rounded-xl p-3 flex justify-between items-center group/item hover:border-[#F9842C]/30 transition-all">
                      <span className="font-medium text-[#6A431F] text-sm">{sub.subcategory}</span>
                      <div className="flex items-center gap-1 transition-opacity">
                        <button 
                          onClick={() => openEditModal(sub)}
                          data-testid={`edit-specialty-${sub.id}`}
                          className="p-1.5 text-gray-400 hover:text-[#1A535C] hover:bg-gray-100 rounded-lg transition-all"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(sub)}
                          data-testid={`delete-specialty-${sub.id}`}
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

      <SpecialtyModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        modalMode={modalMode}
        selectedSpec={selectedSpec}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isLoadingDeps={isLoadingDeps}
        dependencies={dependencies}
      />

    </div>
  );
}
