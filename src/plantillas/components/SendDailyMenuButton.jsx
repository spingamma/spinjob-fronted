import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { WhatsappIcon } from './ProfileIcons';
import { formatDailyMenuMessage } from '../utils/formatDailyMenu';
import { API_URL } from '../../config/api';
import fetchAuth from '../../utils/fetchAuth';

export default function SendDailyMenuButton({ profesional, products = [] }) {
  const [isSharing, setIsSharing] = useState(false);

  if (!profesional) return null;

  const handleShareMenu = async () => {
    try {
      setIsSharing(true);
      let activeProducts = products;

      // Si la lista de productos aún no está en memoria, hacer un fetch rápido
      if ((!activeProducts || activeProducts.length === 0) && profesional.slug) {
        try {
          const res = await fetchAuth(`${API_URL}/businesses/${profesional.slug}/products`);
          if (res.ok) {
            const data = await res.json();
            activeProducts = data;
          }
        } catch (fetchErr) {
          console.error("Error cargando productos para menú del día:", fetchErr);
        }
      }

      const visible = (activeProducts || []).filter(p => p.is_visible !== false);
      if (visible.length === 0) {
        alert("Aún no tienes platos o productos activos en tu catálogo para compartir.");
        setIsSharing(false);
        return;
      }

      const profileUrl = `${window.location.origin}/perfil/${profesional.slug}`;
      const currency = profesional.currency || '$';
      const message = formatDailyMenuMessage(profesional.name, activeProducts, profileUrl, currency);

      // Web Share API nativa (dispositivos móviles: abre hoja nativa con WhatsApp como opción predeterminada)
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Menú del día - ${profesional.name}`,
            text: message,
          });
          return;
        } catch (shareErr) {
          // Si el usuario canceló el diálogo nativo, simplemente salimos
          if (shareErr.name === 'AbortError') return;
          console.warn("Fallo navigator.share, usando fallback directo a WhatsApp:", shareErr);
        }
      }

      // Fallback: abrir directamente WhatsApp con el texto pre-cargado
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error("Error al compartir menú del día:", err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="w-full my-4 flex justify-center px-4">
      <button
        type="button"
        data-testid="send-daily-menu-btn"
        onClick={handleShareMenu}
        disabled={isSharing}
        className="w-full sm:w-auto min-w-[280px] max-w-md px-6 py-3.5 rounded-2xl bg-green-600 hover:bg-green-500 active:scale-95 text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 border border-green-500/30 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSharing ? (
          <Loader2 size={20} className="animate-spin text-white" />
        ) : (
          <WhatsappIcon size={22} className="text-white fill-current" />
        )}
        <span>Enviar el menú del día</span>
      </button>
    </div>
  );
}
