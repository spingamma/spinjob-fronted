import React, { useState } from 'react';
import { X, Users, Search, Trash2, CheckCircle2, Shield, AlertCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useTeamManagement } from '../hooks/useTeamManagement';

export default function TeamManagementModal({ isOpen, onClose, slug, businessName }) {
  const {
    staffList,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    isSearching,
    candidates,
    setCandidates,
    candidateUser,
    setCandidateUser,
    isAdding,
    removingId,
    updatingId,
    handleSearchUser,
    handleAddStaff,
    handleTogglePermission,
    handleRemoveStaff,
  } = useTeamManagement(slug, isOpen);

  const [expandedStaffId, setExpandedStaffId] = useState(null);

  if (!isOpen) return null;

  const isLimitReached = staffList.length >= 2;

  const permissionLabels = [
    { key: 'can_manage_orders', label: 'Gestionar pedidos (Aceptar / Rechazar)' },
    { key: 'can_receive_payment_notifications', label: 'Notificaciones push de pago' },
    { key: 'can_direct_sale', label: 'Registrar ventas directas' },
    { key: 'can_toggle_open', label: 'Cambiar estado Abierto / Cerrado' },
    { key: 'can_edit_catalog', label: 'Editar catálogo de productos' },
    { key: 'can_edit_card', label: 'Editar tarjeta del negocio' },
    { key: 'can_view_metrics', label: 'Ver estadísticas y métricas' },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm transition-opacity"
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        onClose();
      }}
    >
      <div
        className="bg-white border border-gray-100 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col relative animate-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Users size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-primary">Gestionar Equipo</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-secondary/15 text-secondary">
                  {staffList.length} / 2
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium">
                {businessName || 'Tu Negocio'} • Vendedores autorizados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            data-testid="close-team-modal-btn"
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-primary flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs font-medium">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section: Add Staff */}
          <div className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Agregar Colaborador
            </h4>
            {isLimitReached ? (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-xl font-medium">
                Has alcanzado el límite máximo de 2 colaboradores para este negocio. Para agregar a alguien más, remueve a uno existente.
              </p>
            ) : (
              <form onSubmit={handleSearchUser} className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      data-testid="staff-search-input"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (candidates.length > 0) setCandidates([]);
                        if (candidateUser) setCandidateUser(null);
                      }}
                      placeholder="Buscar por nombre, usuario o teléfono..."
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-primary"
                    />
                    <Search size={15} className="absolute left-3 top-3 text-gray-400" />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearching || !searchQuery.trim()}
                    data-testid="staff-search-btn"
                    className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                    Buscar
                  </button>
                </div>

                {candidates && candidates.length > 0 && (
                  <div className="space-y-2 animate-in fade-in">
                    <p className="text-[11px] font-semibold text-gray-500">
                      {candidates.length === 1 ? '1 resultado más cercano:' : `${candidates.length} resultados más cercanos:`}
                    </p>
                    <div className="space-y-2">
                      {candidates.map((c, idx) => (
                        <div
                          key={c.id || idx}
                          className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 animate-in fade-in"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 truncate">
                              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                              <span className="truncate">{c.name}</span>
                            </p>
                            <p className="text-[11px] text-emerald-700 truncate">
                              {c.email || c.phone}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddStaff(c)}
                            disabled={isAdding}
                            data-testid="confirm-add-staff-btn"
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 shrink-0"
                          >
                            {isAdding ? <Loader2 size={12} className="animate-spin" /> : null}
                            Confirmar y Agregar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Section: Staff List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              Equipo Actual ({staffList.length})
            </h4>

            {loading ? (
              <div className="flex flex-col items-center py-8 text-gray-400">
                <Loader2 size={24} className="animate-spin text-secondary mb-2" />
                <p className="text-xs font-medium">Cargando equipo...</p>
              </div>
            ) : staffList.length === 0 ? (
              <div className="p-6 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <Users size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-bold text-gray-600 mb-1">Aún no tienes colaboradores</p>
                <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                  Agrega hasta 2 vendedores con su cuenta de Tarjetoso para que gestionen pedidos y reciban avisos de pago.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {staffList.map((staff) => {
                  const isExpanded = expandedStaffId === staff.id;
                  return (
                    <div
                      key={staff.id}
                      data-testid={`staff-item-${staff.id}`}
                      className="border border-gray-200 rounded-2xl p-4 bg-white shadow-xs transition-all"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-bold text-sm shrink-0">
                            {staff.user_name ? staff.user_name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-primary truncate">
                              {staff.user_name}
                            </h5>
                            <p className="text-[11px] text-gray-400 truncate">
                              {staff.user_email || staff.user_phone || 'Sin contacto'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setExpandedStaffId(isExpanded ? null : staff.id)}
                            className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            title="Ver o editar permisos"
                            data-testid={`toggle-permissions-${staff.id}`}
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveStaff(staff.id)}
                            disabled={removingId === staff.id}
                            data-testid={`remove-staff-${staff.id}`}
                            className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                            title="Remover colaborador"
                          >
                            {removingId === staff.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Granular Permissions Section */}
                      {isExpanded && (
                        <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 animate-in fade-in">
                          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Shield size={12} className="text-primary" /> Permisos asignados
                          </p>
                          {permissionLabels.map(({ key, label }) => {
                            const isAllowed = Boolean(staff[key]);
                            return (
                              <label
                                key={key}
                                className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                              >
                                <span className={isAllowed ? 'text-primary font-medium' : 'text-gray-400'}>
                                  {label}
                                </span>
                                <input
                                  type="checkbox"
                                  checked={isAllowed}
                                  disabled={updatingId === staff.id}
                                  onChange={() => handleTogglePermission(staff.id, key, isAllowed)}
                                  data-testid={`perm-${key}-${staff.id}`}
                                  className="rounded border-gray-300 text-secondary focus:ring-secondary/20 cursor-pointer"
                                />
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
