// Archivo: src/hooks/useAccionesPerfil.js
import useProfileAuth from './profile/useProfileAuth';
import useProfileQRAndShare from './profile/useProfileQRAndShare';
import useProfileTarjetero from './profile/useProfileTarjetero';
import useProfileInteraction from './profile/useProfileInteraction';
import useProfileReview from './profile/useProfileReview';

export default function useAccionesPerfil(profesional, onProtectedAction) {
  // 1. Auth & User Status
  const { userObj, isLoggedIn, userName, isAdmin, handleLogout } = useProfileAuth();

  // 2. QR and Share
  const { mostrarQR, toggleQR, handleDownloadQR, handleShare } = useProfileQRAndShare(profesional);

  // 3. Mi Tarjetero (Guardar/Eliminar)
  const { isSaved, isSaving, toggleSaveCard } = useProfileTarjetero(profesional, isLoggedIn, onProtectedAction);

  // 4. Interacciones Backend (Redes sociales, links)
  const { handleLinkClick } = useProfileInteraction(profesional, isLoggedIn, isAdmin, onProtectedAction);

  // 5. Reseñas y Calificaciones
  const {
    mostrarModalCalificando,
    setMostrarModalCalificando,
    mostrarModalVerificacion,
    setMostrarModalVerificacion,
    calificacionPrevia,
    isSubmittingReview,
    handleCalificarClick,
    handleSubmitReview
  } = useProfileReview(profesional, userObj);

  return {
    mostrarQR,
    toggleQR,
    handleDownloadQR,
    isLoggedIn,
    userName,
    handleShare,
    handleLinkClick,
    handleCalificarClick,
    handleLogout,
    // Propiedades nuevas para Modal:
    mostrarModalCalificando,
    setMostrarModalCalificando,
    mostrarModalVerificacion,
    setMostrarModalVerificacion,
    calificacionPrevia,
    isSubmittingReview,
    handleSubmitReview,
    // Propiedades para Mi Tarjetero:
    isSaved,
    isSaving,
    toggleSaveCard
  };
}