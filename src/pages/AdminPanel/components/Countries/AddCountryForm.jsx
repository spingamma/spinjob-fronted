import React from 'react';
import { X, Loader2, Save } from 'lucide-react';

export default function AddCountryForm({
  newCountryName,
  setNewCountryName,
  newCountryDept,
  setNewCountryDept,
  handleCreateCountry,
  submitting,
  setIsAddingCountry
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-primary">Nuevo País</h3>
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
            className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-secondary transition-all"
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
            className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-secondary transition-all"
            required
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-secondary hover:bg-secondary/90 text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all"
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
  );
}
