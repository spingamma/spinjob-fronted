import React from 'react';
import { Layers } from 'lucide-react';

export default function HeroInfoView({
  profesional,
  isOwner,
  isStaff,
  onOpenCatalogModal
}) {
  return (
    <>
      <h1 className="text-3xl font-extrabold text-primary leading-tight mb-1 flex items-center gap-1.5 flex-wrap">
        <span>{profesional.name}</span>
        {isStaff && (
          <span
            data-testid="staff-badge"
            className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200"
          >
            Colaborador
          </span>
        )}
      </h1>

      {isOwner && (
        <div className="mt-2.5 flex items-center gap-2 flex-wrap">
          {onOpenCatalogModal && (
            <button
              type="button"
              data-testid="open-inventory-btn"
              onClick={onOpenCatalogModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/90 text-white text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
              title="Edita tu menú aquí"
            >
              <Layers size={16} />
              Edita tu menú aquí
            </button>
          )}
        </div>
      )}
    </>
  );
}
