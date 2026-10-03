import React from 'react';
import { CheckCircle2, Layers, Users } from 'lucide-react';

export default function HeroInfoView({
  profesional,
  isOwner,
  isStaff,
  onOpenCatalogModal,
  onOpenTeamModal
}) {
  return (
    <>
      <h1 className="text-3xl font-extrabold text-primary leading-tight mb-1 flex items-center gap-1.5 flex-wrap">
        <span>{profesional.name}</span>
        {profesional.premium && (
          <CheckCircle2 size={22} className="text-secondary fill-secondary/10 shrink-0" title="Negocio Premium Verificado" />
        )}
        {isStaff && (
          <span
            data-testid="staff-badge"
            className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200"
          >
            Colaborador
          </span>
        )}
      </h1>
      <p className="text-accent text-sm font-bold uppercase tracking-widest mb-1">{profesional.title}</p>

      {isOwner && (
        <div className="mt-2.5 flex items-center gap-2 flex-wrap">
          {onOpenCatalogModal && (
            <button
              type="button"
              data-testid="open-inventory-btn"
              onClick={onOpenCatalogModal}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs sm:text-sm font-bold transition-all border border-secondary/20 active:scale-95 cursor-pointer shadow-xs"
              title="Edita tu catálogo"
            >
              <Layers size={16} />
              Edita tu catálogo
            </button>
          )}

          {profesional.premium && onOpenTeamModal && (
            <button
              type="button"
              data-testid="open-team-modal-btn"
              onClick={onOpenTeamModal}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs sm:text-sm font-bold transition-all border border-primary/20 active:scale-95 cursor-pointer shadow-xs"
              title="Gestionar equipo"
            >
              <Users size={16} />
              Gestionar equipo
            </button>
          )}
        </div>
      )}
    </>
  );
}
