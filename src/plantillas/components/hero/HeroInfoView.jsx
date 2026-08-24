import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function HeroInfoView({ profesional }) {
  return (
    <>
      <h1 className="text-3xl font-extrabold text-primary leading-tight mb-1 flex items-center gap-1.5 flex-wrap">
        <span>{profesional.name}</span>
        {profesional.premium && (
          <CheckCircle2 size={22} className="text-secondary fill-secondary/10 shrink-0" title="Negocio Premium Verificado" />
        )}
      </h1>
      <p className="text-accent text-sm font-bold uppercase tracking-widest mb-1">{profesional.title}</p>
    </>
  );
}
