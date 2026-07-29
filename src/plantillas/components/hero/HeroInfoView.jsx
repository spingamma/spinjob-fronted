import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function HeroInfoView({ profesional }) {
  return (
    <>
      <h1 className="text-3xl font-extrabold text-[#1A535C] leading-tight mb-1 flex items-center gap-1.5 flex-wrap">
        <span>{profesional.name}</span>
        {profesional.premium && (
          <CheckCircle2 size={22} className="text-[#F9842C] fill-[#F9842C]/10 shrink-0" title="Negocio Premium Verificado" />
        )}
      </h1>
      <p className="text-[#6A431F] text-sm font-bold uppercase tracking-widest mb-1">{profesional.title}</p>
    </>
  );
}
