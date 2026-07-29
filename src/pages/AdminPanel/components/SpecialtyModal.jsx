import { AlertTriangle, Loader2 } from 'lucide-react';

export default function SpecialtyModal({
  isOpen,
  setIsOpen,
  modalMode,
  selectedSpec,
  formData,
  setFormData,
  handleSubmit,
  isSubmitting,
  isLoadingDeps,
  dependencies
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className={`p-6 text-white flex justify-between items-center ${modalMode === 'delete' ? 'bg-red-600' : 'bg-[#1A535C]'}`}>
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
                  <p className="text-xs mt-1 text-[#1A535C] font-medium">Ningún negocio se verá afectado por esta acción.</p>
                )}
              </div>
            </div>
          )}

          {modalMode === 'delete' ? (
            <p className="text-[#757778]">
              ¿Estás seguro de que deseas eliminar permanentemente <strong>{selectedSpec?.category} - {selectedSpec?.subcategory}</strong>? Esta acción no se puede deshacer.
            </p>
          ) : (
            <form id="spec-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#757778] mb-1">Categoría Principal</label>
                <input 
                  type="text" 
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="Ej. Salud, Tecnología..."
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-[#F9842C] transition-colors font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#757778] mb-1">Subcategoría / Profesión</label>
                <input 
                  type="text" 
                  required
                  value={formData.subcategory}
                  onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                  placeholder="Ej. Dentista, Programador..."
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-[#F9842C] transition-colors font-medium"
                />
              </div>
            </form>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
          <button 
            type="button"
            onClick={() => setIsOpen(false)}
            data-testid="cancel-specialty-btn"
            className="flex-1 px-4 py-3 rounded-xl font-bold text-[#757778] bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type={modalMode === 'delete' ? 'button' : 'submit'}
            form={modalMode === 'delete' ? undefined : 'spec-form'}
            onClick={modalMode === 'delete' ? handleSubmit : undefined}
            disabled={isSubmitting || isLoadingDeps}
            data-testid="submit-specialty-btn"
            className={`flex-1 px-4 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50
              ${modalMode === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#F9842C] hover:bg-[#a1451a]'}
            `}
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 
              modalMode === 'delete' ? 'Eliminar' : 'Guardar'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
