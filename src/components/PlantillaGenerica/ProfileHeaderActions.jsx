// src/components/PlantillaGenerica/ProfileHeaderActions.jsx

import React from 'react';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';

/**
 * Floating action bar shown when the profile is in edit mode.
 * All interactive buttons include required `data-testid` attributes.
 */
export default function ProfileHeaderActions({
  isEditing,
  isSavingEdit,
  cancelEdit,
  handleSaveEdit,
  saveError,
  dataTestIds = {},
}) {
  if (!isEditing) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-white border-t border-gray-200 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-[80] animate-in slide-in-from-bottom-10 flex flex-col justify-center items-center gap-2">
      {saveError && (
        <div className="text-red-500 text-xs font-bold text-center animate-in fade-in slide-in-from-bottom-2">
          {saveError}
        </div>
      )}
      <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
          <span>Borrador guardado automáticamente en tu navegador</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={cancelEdit}
            disabled={isSavingEdit}
            data-testid={dataTestIds.cancelEdit || "cancel-edit-btn"}
            className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#757778] font-bold text-sm transition-all shadow-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveEdit}
            disabled={isSavingEdit}
            data-testid={dataTestIds.saveEdit || "save-edit-btn"}
            className="px-8 py-3 rounded-xl bg-[#F9842C] hover:bg-[#e06516] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 min-w-[160px]"
          >
            {isSavingEdit ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSavingEdit ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
