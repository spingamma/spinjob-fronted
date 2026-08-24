import React from 'react';
import { Edit2, Trash2, Globe, MapPin, Save, X, Plus, Loader2 } from 'lucide-react';

export default function CountryCard({
  c,
  editingCountry,
  setEditingCountry,
  editCountryName,
  setEditCountryName,
  handleUpdateCountry,
  handleDeleteCountry,
  editingDept,
  setEditingDept,
  editDeptName,
  setEditDeptName,
  handleUpdateDepartment,
  handleDeleteDepartment,
  addingDeptToCountry,
  setAddingDeptToCountry,
  newDeptName,
  setNewDeptName,
  handleAddDepartment,
  submitting
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden flex flex-col">
      {/* Country Header */}
      <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex-1 mr-4">
          {editingCountry === c.country ? (
            <div className="flex items-center gap-2 w-full">
              <input
                type="text"
                value={editCountryName}
                onChange={(e) => setEditCountryName(e.target.value)}
                className="text-base font-bold text-primary bg-white border border-gray-200 px-2 py-1 rounded-lg outline-none focus:border-secondary w-full"
              />
              <button
                onClick={() => handleUpdateCountry(c.country)}
                disabled={submitting}
                className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary/90"
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
            <h3 className="font-extrabold text-primary text-lg flex items-center gap-2">
              <Globe size={18} className="text-primary/60" />
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
              className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-xl transition-all"
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 text-primary font-bold text-xs rounded-full transition-all"
              >
                {editingDept?.id === dept.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editDeptName}
                      onChange={(e) => setEditDeptName(e.target.value)}
                      className="bg-white border border-gray-200 px-1 py-0.5 rounded outline-none w-24 text-xs font-bold text-primary"
                    />
                    <button
                      onClick={() => handleUpdateDepartment(dept.id)}
                      disabled={submitting}
                      className="text-primary hover:text-secondary"
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
                    <MapPin size={10} className="text-secondary" />
                    <span>{dept.name}</span>
                    <button
                      onClick={() => {
                        setEditingDept(dept);
                        setEditDeptName(dept.name);
                      }}
                      className="ml-1 text-gray-400 hover:text-primary transition-all"
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
                className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-secondary transition-all"
              />
              <button
                onClick={() => handleAddDepartment(c.country)}
                disabled={submitting || !newDeptName.trim()}
                className="bg-primary hover:bg-primary/90 text-white p-2.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all"
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
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-dashed border-gray-200 text-gray-400 hover:text-primary hover:border-primary rounded-xl text-xs font-bold transition-all"
            >
              <Plus size={14} />
              <span>Agregar Departamento</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
