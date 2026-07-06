import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Globe, MapPin, Loader2, Save, X, RefreshCw } from 'lucide-react';

export default function AdminCountriesTab() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for adding / editing modals or inline forms
  const [isAddingCountry, setIsAddingCountry] = useState(false);
  const [newCountryName, setNewCountryName] = useState('');
  const [newCountryDept, setNewCountryDept] = useState('');

  const [editingCountry, setEditingCountry] = useState(null); // name of country being edited
  const [editCountryName, setEditCountryName] = useState('');

  const [addingDeptToCountry, setAddingDeptToCountry] = useState(null); // country name
  const [newDeptName, setNewDeptName] = useState('');

  const [editingDept, setEditingDept] = useState(null); // { id, name, country }
  const [editDeptName, setEditDeptName] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const fetchCountries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/countries/`);
      if (!res.ok) throw new Error("Error al cargar localizaciones");
      const data = await res.json();
      setCountries(data);
    } catch (err) {
      console.error(err);
      setError("Error al cargar localizaciones. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const getHeaders = () => {
    const token = localStorage.getItem('spingamma_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const handleCreateCountry = async (e) => {
    e.preventDefault();
    if (!newCountryName.trim() || !newCountryDept.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/admin/countries`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          country: newCountryName.trim(),
          state: newCountryDept.trim()
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error al crear país");
      }

      setNewCountryName('');
      setNewCountryDept('');
      setIsAddingCountry(false);
      await fetchCountries();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCountry = async (oldName) => {
    if (!editCountryName.trim() || editCountryName.trim() === oldName) {
      setEditingCountry(null);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/admin/countries/${encodeURIComponent(oldName)}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ name: editCountryName.trim() })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error al actualizar país");
      }

      setEditingCountry(null);
      await fetchCountries();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCountry = async (name) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el país "${name}" y todos sus departamentos? Esta acción no se puede deshacer.`)) return;

    try {
      const res = await fetch(`${API_URL}/admin/countries/${encodeURIComponent(name)}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!res.ok) throw new Error("Error al eliminar país");
      await fetchCountries();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddDepartment = async (countryName) => {
    if (!newDeptName.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/admin/countries/${encodeURIComponent(countryName)}/departments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name: newDeptName.trim() })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error al agregar departamento");
      }

      setNewDeptName('');
      setAddingDeptToCountry(null);
      await fetchCountries();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateDepartment = async (id) => {
    if (!editDeptName.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/admin/departments/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ name: editDeptName.trim() })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error al actualizar departamento");
      }

      setEditingDept(null);
      await fetchCountries();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDepartment = async (id, deptName) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el departamento "${deptName}"?`)) return;

    try {
      const res = await fetch(`${API_URL}/admin/departments/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!res.ok) throw new Error("Error al eliminar departamento");
      await fetchCountries();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading && countries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#F9842C] mb-4" size={40} />
        <p className="text-gray-500 font-medium">Cargando países y departamentos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur border border-gray-100 rounded-3xl p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#1A535C] flex items-center gap-2">
            <Globe size={22} className="text-[#F9842C]" />
            Gestión de Localizaciones
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Administra los países de operación y sus departamentos correspondientes.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={fetchCountries}
            className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl transition-all"
            title="Refrescar datos"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => setIsAddingCountry(true)}
            className="flex-1 sm:flex-initial bg-[#1A535C] hover:bg-[#133d44] text-white px-5 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]"
          >
            <Plus size={18} />
            <span>Agregar País</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Form: Add New Country */}
      {isAddingCountry && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-[#1A535C]">Nuevo País</h3>
            <button onClick={() => setIsAddingCountry(false)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleCreateCountry} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Nombre del País</label>
              <input
                type="text"
                value={newCountryName}
                onChange={(e) => setNewCountryName(e.target.value)}
                placeholder="Ej. Colombia"
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-[#F9842C] transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Primer Departamento</label>
              <input
                type="text"
                value={newCountryDept}
                onChange={(e) => setNewCountryDept(e.target.value)}
                placeholder="Ej. Antioquia"
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-[#F9842C] transition-all"
                required
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-[#F9842C] hover:bg-[#e06d1c] text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all"
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Guardar País
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCountry(false)}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold text-sm transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Countries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {countries.map((c) => (
          <div key={c.country} className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden flex flex-col">
            
            {/* Country Header */}
            <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex-1 mr-4">
                {editingCountry === c.country ? (
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="text"
                      value={editCountryName}
                      onChange={(e) => setEditCountryName(e.target.value)}
                      className="text-base font-bold text-[#1A535C] bg-white border border-gray-200 px-2 py-1 rounded-lg outline-none focus:border-[#F9842C] w-full"
                    />
                    <button
                      onClick={() => handleUpdateCountry(c.country)}
                      disabled={submitting}
                      className="p-1.5 bg-[#1A535C] text-white rounded-lg hover:bg-[#133d44]"
                    >
                      <Save size={14} />
                    </button>
                    <button
                      onClick={() => setEditingCountry(null)}
                      className="p-1.5 bg-gray-100 text-gray-400 rounded-lg hover:bg-gray-200"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <h3 className="font-extrabold text-[#1A535C] text-lg flex items-center gap-2">
                    <Globe size={18} className="text-[#1A535C]/60" />
                    {c.country}
                  </h3>
                )}
              </div>

              {editingCountry !== c.country && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditingCountry(c.country);
                      setEditCountryName(c.country);
                    }}
                    className="p-2 text-gray-400 hover:text-[#1A535C] hover:bg-gray-100 rounded-xl transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteCountry(c.country)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Departments Content */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Departamentos / Estados ({c.departments.length})
                </div>
                
                {/* Departments List */}
                <div className="flex flex-wrap gap-2">
                  {c.departments.map((dept) => (
                    <div
                      key={dept.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 text-[#1A535C] font-bold text-xs rounded-full transition-all"
                    >
                      {editingDept?.id === dept.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editDeptName}
                            onChange={(e) => setEditDeptName(e.target.value)}
                            className="bg-white border border-gray-200 px-1 py-0.5 rounded outline-none w-24 text-xs font-bold text-[#1A535C]"
                          />
                          <button
                            onClick={() => handleUpdateDepartment(dept.id)}
                            disabled={submitting}
                            className="text-[#1A535C] hover:text-[#F9842C]"
                          >
                            <Save size={12} />
                          </button>
                          <button
                            onClick={() => setEditingDept(null)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <MapPin size={10} className="text-[#F9842C]" />
                          <span>{dept.name}</span>
                          <button
                            onClick={() => {
                              setEditingDept(dept);
                              setEditDeptName(dept.name);
                            }}
                            className="ml-1 text-gray-400 hover:text-[#1A535C] transition-all"
                          >
                            <Edit2 size={10} />
                          </button>
                          <button
                            onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                            className="text-gray-400 hover:text-red-500 transition-all"
                          >
                            <Trash2 size={10} />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Department inline trigger */}
              <div className="pt-4 border-t border-gray-50">
                {addingDeptToCountry === c.country ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      placeholder="Nuevo dpto..."
                      className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-[#F9842C] transition-all"
                    />
                    <button
                      onClick={() => handleAddDepartment(c.country)}
                      disabled={submitting || !newDeptName.trim()}
                      className="bg-[#1A535C] hover:bg-[#133d44] text-white p-2.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      {submitting ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                    </button>
                    <button
                      onClick={() => {
                        setAddingDeptToCountry(null);
                        setNewDeptName('');
                      }}
                      className="px-2.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-xl text-xs transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingDeptToCountry(c.country)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-dashed border-gray-200 text-gray-400 hover:text-[#1A535C] hover:border-[#1A535C] rounded-xl text-xs font-bold transition-all"
                  >
                    <Plus size={14} />
                    <span>Agregar Departamento</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
