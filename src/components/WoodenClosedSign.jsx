import React from 'react';
import { DoorClosed } from 'lucide-react';

export default function WoodenClosedSign({ compact = false, className = '' }) {
  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#38200B] bg-[linear-gradient(to_bottom,#4A2C11,#2A1606)] text-[#EAD8B8] border border-[#221104] shadow-sm text-[10px] font-black tracking-wider uppercase select-none ${className}`}
      >
        <DoorClosed size={11} className="text-[#D8BE96] shrink-0" />
        <span>Cerrado</span>
      </div>
    );
  }

  return (
    <div
      className={`h-9 sm:h-10 px-3.5 sm:px-4 rounded-sm bg-[#361E0A] bg-[linear-gradient(to_bottom,#4E2D12_0%,#38200C_50%,#261405_100%)] text-[#F3E5D0] border-2 border-[#1F0F03] shadow-[0_4px_10px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.12),inset_0_-2px_3px_rgba(0,0,0,0.7)] backdrop-blur-sm flex items-center gap-2 select-none relative overflow-hidden ${className}`}
    >
      {/* Marco interior tallado en madera vieja */}
      <div className="absolute inset-0.5 rounded-[1px] border border-[#6B3F1B]/40 pointer-events-none" />

      {/* Vetas horizontales sutiles de madera */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.15)_2px,rgba(0,0,0,0.15)_3px)] pointer-events-none opacity-60" />

      {/* Pequeños remaches/clavos rústicos en las esquinas */}
      <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-[#180B02] border border-[#522E10] shadow-inner" />
      <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-[#180B02] border border-[#522E10] shadow-inner" />
      <div className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-[#180B02] border border-[#522E10] shadow-inner" />
      <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-[#180B02] border border-[#522E10] shadow-inner" />

      <DoorClosed size={15} className="text-[#E2CCA9] shrink-0 relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
      <span className="text-xs sm:text-sm font-black tracking-widest uppercase text-[#F5E8D4] relative z-10 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)]">
        Cerrado
      </span>
    </div>
  );
}
