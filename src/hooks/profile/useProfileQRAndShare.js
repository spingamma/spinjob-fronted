import { useState, useCallback } from 'react';

export default function useProfileQRAndShare(profesional) {
  const [mostrarQR, setMostrarQR] = useState(false);

  const toggleQR = useCallback(() => setMostrarQR(prev => !prev), []);

  const handleDownloadQR = useCallback(async (colorHex = '1A535C', bgColorHex = 'FFFFFF') => {
    if (!profesional) return;
    try {
      const canvas = document.getElementById('qr-canvas');
      if (canvas) {
        const url = canvas.toDataURL("image/png");
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `QR_${profesional.name.replace(/\\s+/g, '_')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(window.location.href)}&color=${colorHex}&bgcolor=${bgColorHex}`;
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `QR_${profesional.name.replace(/\\s+/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error al descargar el QR', err);
      window.open(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(window.location.href)}&color=${colorHex}&bgcolor=${bgColorHex}`, '_blank');
    }
  }, [profesional]);

  const handleShare = useCallback(async () => {
    if (!profesional) return;
    const shareData = {
      title: `Perfil de ${profesional.name}`,
      text: `Conoce el perfil profesional de ${profesional.name} - ${profesional.title} en Tarjetoso.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error al compartir", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Enlace copiado al portapapeles");
    }
  }, [profesional]);

  return { mostrarQR, toggleQR, handleDownloadQR, handleShare };
}
